import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.api.models.base import Base


if TYPE_CHECKING:
    from app.api.models.movie import Movie
    from app.api.models.screen import Screen
    from app.api.models.reservation import Reservation


class Showtime(Base):
    __tablename__ = "showtimes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    movie_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("movies.id"),
        nullable=False
    )

    screen_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("screens.id"),
        nullable=False
    )

    start_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    end_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    movie: Mapped["Movie"] = relationship(
        "Movie",
        back_populates="showtimes"
    )

    screen: Mapped["Screen"] = relationship(
        "Screen",
        back_populates="showtimes"
    )

    reservations: Mapped[list["Reservation"]] = relationship(
        "Reservation",
        back_populates="showtime",
        cascade="all, delete-orphan"
    )