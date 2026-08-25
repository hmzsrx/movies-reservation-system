from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.models.seat import Seat


class SeatRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, seat: Seat) -> Seat:
        self.db.add(seat)
        self.db.commit()
        self.db.refresh(seat)

        return seat

    def get_by_id(self, seat_id: UUID) -> Seat | None:
        statement = select(Seat).where(
            Seat.id == seat_id
        )

        return self.db.scalar(statement)

    def get_all(self) -> list[Seat]:
        statement = select(Seat)

        return list(self.db.scalars(statement).all())

    def get_by_screen(
        self,
        screen_id: UUID
    ) -> list[Seat]:

        statement = select(Seat).where(
            Seat.screen_id == screen_id
        )

        return list(self.db.scalars(statement).all())

    def get_by_ids(
        self,
        seat_ids: list[UUID]
    ) -> list[Seat]:

        statement = select(Seat).where(
            Seat.id.in_(seat_ids)
        )

        return list(self.db.scalars(statement).all())

    def update(self, seat: Seat) -> Seat:
        self.db.commit()
        self.db.refresh(seat)

        return seat

    def delete(self, seat: Seat) -> None:
        self.db.delete(seat)
        self.db.commit()