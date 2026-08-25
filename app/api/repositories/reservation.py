from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.models.reservation import Reservation
from app.api.models.reserve_seat import ReservationSeat


class ReservationRepository:

    def __init__(self, db: Session):
        self.db = db

    # ==================================================
    # CREATE
    # ==================================================

    def create(
        self,
        reservation: Reservation
    ) -> Reservation:

        self.db.add(reservation)

        return reservation

    # ==================================================
    # GET BY ID
    # ==================================================

    def get_by_id(
        self,
        reservation_id: UUID
    ) -> Reservation | None:

        statement = select(Reservation).where(
            Reservation.id == reservation_id
        )

        return self.db.scalar(statement)

    # ==================================================
    # GET BY USER
    # ==================================================

    def get_by_user(
        self,
        user_id: UUID
    ) -> list[Reservation]:

        statement = select(Reservation).where(
            Reservation.user_id == user_id
        )

        return list(
            self.db.scalars(statement).all()
        )

    # ==================================================
    # GET BY SHOWTIME
    # ==================================================

    def get_by_showtime(
        self,
        showtime_id: UUID
    ) -> list[Reservation]:

        statement = select(Reservation).where(
            Reservation.showtime_id == showtime_id
        )

        return list(
            self.db.scalars(statement).all()
        )

    # ==================================================
    # GET ALL
    # ==================================================

    def get_all(self) -> list[Reservation]:

        statement = select(Reservation)

        return list(
            self.db.scalars(statement).all()
        )

    # ==================================================
    # GET RESERVED SEAT IDS
    # ==================================================

    def get_reserved_seat_ids(
        self,
        showtime_id: UUID
    ) -> list[UUID]:

        statement = (
            select(ReservationSeat.seat_id)
            .join(
                Reservation,
                Reservation.id == ReservationSeat.reservation_id
            )
            .where(
                ReservationSeat.showtime_id == showtime_id,
                Reservation.status == "confirmed"
            )
        )

        return list(
            self.db.scalars(statement).all()
        )

    # ==================================================
    # UPDATE
    # ==================================================

    def update(
        self,
        reservation: Reservation
    ) -> Reservation:

        self.db.add(reservation)
        self.db.commit()
        self.db.refresh(reservation)

        return reservation

    # ==================================================
    # DELETE
    # ==================================================

    def delete(
        self,
        reservation: Reservation
    ) -> None:

        self.db.delete(reservation)
        self.db.commit()