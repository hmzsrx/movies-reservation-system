from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.models.showtime import Showtime


class ShowtimeRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, showtime: Showtime) -> Showtime:
        self.db.add(showtime)
        self.db.commit()
        self.db.refresh(showtime)

        return showtime

    def get_by_id(
        self,
        showtime_id: UUID
    ) -> Showtime | None:

        statement = select(Showtime).where(
            Showtime.id == showtime_id
        )

        return self.db.scalar(statement)

    def get_all(self) -> list[Showtime]:
        statement = select(Showtime)

        return list(self.db.scalars(statement).all())

    def get_by_movie(
        self,
        movie_id: UUID
    ) -> list[Showtime]:

        statement = select(Showtime).where(
            Showtime.movie_id == movie_id
        )

        return list(self.db.scalars(statement).all())

    def get_by_screen(
        self,
        screen_id: UUID
    ) -> list[Showtime]:

        statement = select(Showtime).where(
            Showtime.screen_id == screen_id
        )

        return list(self.db.scalars(statement).all())

    def update(self, showtime: Showtime) -> Showtime:
        self.db.commit()
        self.db.refresh(showtime)

        return showtime

    def has_overlap(
        self,
        screen_id: UUID,
        start_time,
        end_time,
        exclude_showtime_id: UUID | None = None
    ) -> bool:

        query = select(Showtime).where(
            Showtime.screen_id == screen_id,

            # Overlap condition
            Showtime.start_time < end_time,
            Showtime.end_time > start_time
        )
        if exclude_showtime_id is not None:
            query = query.where(
                Showtime.id != exclude_showtime_id
            )

        existing_showtime = self.db.execute(
            query
        ).scalar_one_or_none()

        return existing_showtime is not None

    def delete(self, showtime: Showtime) -> None:
        self.db.delete(showtime)
        self.db.commit()