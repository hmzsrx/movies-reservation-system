from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.models.movie import Movie


class MovieRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, movie: Movie) -> Movie:
        self.db.add(movie)
        self.db.commit()
        self.db.refresh(movie)

        return movie

    def get_by_id(self, movie_id: UUID) -> Movie | None:
        statement = select(Movie).where(
            Movie.id == movie_id
        )

        return self.db.scalar(statement)

    def get_all(self) -> list[Movie]:
        statement = select(Movie)

        return list(self.db.scalars(statement).all())

    def get_by_generic(
        self,
        generic_id: UUID
    ) -> list[Movie]:

        statement = select(Movie).where(
            Movie.generic_id == generic_id
        )

        return list(self.db.scalars(statement).all())

    def update(self, movie: Movie) -> Movie:
        self.db.commit()
        self.db.refresh(movie)

        return movie

    def delete(self, movie: Movie) -> None:
        self.db.delete(movie)
        self.db.commit()