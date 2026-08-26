from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.models.reservation import Reservation
from app.api.models.reserve_seat import ReservationSeat
from app.api.repositories.reservation import ReservationRepository
from app.api.repositories.seat import SeatRepository
from app.api.repositories.showtime import ShowtimeRepository
from app.api.schemas.reservation import ReservationCreate


class ReservationService:

    def __init__(self, db: Session):
        self.db = db

        self.reservation_repository = ReservationRepository(db)
        self.showtime_repository = ShowtimeRepository(db)
        self.seat_repository = SeatRepository(db)

    # ==================================================
    # CREATE RESERVATION
    # ==================================================

    def create_reservation(
        self,
        user_id: UUID,
        reservation_data: ReservationCreate
    ) -> Reservation:

        try:

            # ------------------------------------------
            # 1. Verify showtime exists
            # ------------------------------------------

            showtime = self.showtime_repository.get_by_id(
                reservation_data.showtime_id
            )

            if not showtime:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Showtime not found"
                )

            # ------------------------------------------
            # 2. Remove duplicate seat IDs
            # ------------------------------------------

            seat_ids = list(set(reservation_data.seat_ids))

            if not seat_ids:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="At least one seat must be selected"
                )

            # ------------------------------------------
            # 3. Verify seats exist
            # ------------------------------------------

            seats = self.seat_repository.get_by_ids(
                seat_ids
            )

            if len(seats) != len(seat_ids):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="One or more invalid seat IDs provided"
                )

            # ------------------------------------------
            # 4. Verify seats belong to showtime screen
            # ------------------------------------------

            for seat in seats:

                if seat.screen_id != showtime.screen_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            f"Seat {seat.seat_number} does not belong "
                            f"to this show's screen"
                        )
                    )

            # ------------------------------------------
            # 5. Check seat availability
            # ------------------------------------------

            reserved_seat_ids = set(
                self.reservation_repository.get_reserved_seat_ids(
                    reservation_data.showtime_id
                )
            )

            conflicting_seats = [
                seat_id
                for seat_id in seat_ids
                if seat_id in reserved_seat_ids
            ]

            if conflicting_seats:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "One or more selected seats are "
                        "already reserved for this showtime"
                    )
                )

            # ------------------------------------------
            # 6. Create reservation
            # ------------------------------------------

            new_reservation = Reservation(
                user_id=user_id,
                showtime_id=reservation_data.showtime_id,
                status="confirmed"
            )

            # ------------------------------------------
            # 7. Add selected seats
            # ------------------------------------------

            for seat_id in seat_ids:

                reservation_seat = ReservationSeat(
                    seat_id=seat_id,
                    showtime_id=reservation_data.showtime_id
                )

                new_reservation.reservation_seats.append(
                    reservation_seat
                )

            # ------------------------------------------
            # 8. Add everything to current transaction
            # ------------------------------------------

            self.db.add(new_reservation)

            # ------------------------------------------
            # 9. Commit atomically
            # ------------------------------------------

            self.db.commit()

            # ------------------------------------------
            # 10. Refresh
            # ------------------------------------------

            self.db.refresh(new_reservation)

            return new_reservation

        except HTTPException:
            self.db.rollback()
            raise

        except IntegrityError:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "One or more selected seats are "
                    "already reserved for this showtime"
                )
            )

        except Exception:
            self.db.rollback()
            raise

    # ==================================================
    # GET RESERVATION
    # ==================================================

    def get_reservation(
        self,
        reservation_id: UUID
    ) -> Reservation:

        reservation = self.reservation_repository.get_by_id(
            reservation_id
        )

        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reservation not found"
            )

        return reservation

    # ==================================================
    # GET USER RESERVATIONS
    # ==================================================

    def get_user_reservations(
        self,
        user_id: UUID
    ) -> list[Reservation]:

        return self.reservation_repository.get_by_user(
            user_id
        )

    # ==================================================
    # GET SHOWTIME RESERVATIONS
    # ==================================================

    def get_showtime_reservations(
        self,
        showtime_id: UUID
    ) -> list[Reservation]:

        return self.reservation_repository.get_by_showtime(
            showtime_id
        )

    def get_reserved_seat_ids(
        self,
        showtime_id: UUID
    ) -> list[UUID]:

        return self.reservation_repository.get_reserved_seat_ids(
            showtime_id
        )

    # ==================================================
    # GET ALL RESERVATIONS
    # ==================================================

    def get_all_reservations(
        self
    ) -> list[Reservation]:

        return self.reservation_repository.get_all()

    # ==================================================
    # CANCEL RESERVATION
    # ==================================================

    def cancel_reservation(
        self,
        reservation_id: UUID,
        user_id: UUID
    ) -> Reservation:

        reservation = self.get_reservation(
            reservation_id
        )

        if reservation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to cancel this reservation"
            )

        if reservation.status == "cancelled":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reservation is already cancelled"
            )

        reservation.status = "cancelled"
        
        # Free up the seats by removing the associations
        reservation.reservation_seats.clear()

        return self.reservation_repository.update(
            reservation
        )

    # ==================================================
    # DELETE RESERVATION
    # ==================================================

    def delete_reservation(
        self,
        reservation_id: UUID
    ) -> None:

        reservation = self.get_reservation(
            reservation_id
        )

        self.reservation_repository.delete(
            reservation
        )