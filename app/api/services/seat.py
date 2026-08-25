from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.models.seat import Seat
from app.api.repositories.seat import SeatRepository
from app.api.schemas.seat import SeatCreate, SeatUpdate


class SeatService:

    def __init__(self, db: Session):
        self.seat_repository = SeatRepository(db)

    def create_seat(self, seat_data: SeatCreate) -> Seat:
        seat = Seat(
            screen_id=seat_data.screen_id,
            row_number=seat_data.row_number,
            seat_number=seat_data.seat_number
        )
        return self.seat_repository.create(seat)

    def get_seat(self, seat_id: UUID) -> Seat:
        seat = self.seat_repository.get_by_id(seat_id)

        if not seat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Seat not found"
            )

        return seat

    def get_seats(self) -> list[Seat]:
        return self.seat_repository.get_all()

    def get_seats_by_screen(self, screen_id: UUID) -> list[Seat]:
        return self.seat_repository.get_by_screen(screen_id)

    def update_seat(self, seat_id: UUID, seat_data: SeatUpdate) -> Seat:
        seat = self.get_seat(seat_id)

        update_dict = seat_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(seat, key, value)

        return self.seat_repository.update(seat)

    def delete_seat(self, seat_id: UUID) -> None:
        seat = self.get_seat(seat_id)
        self.seat_repository.delete(seat)