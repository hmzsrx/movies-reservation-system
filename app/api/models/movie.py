import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.api.models.base import Base


if TYPE_CHECKING:
    from app.api.models.showtime import Showtime
    from app.api.models.generic import Generic


class Movie(Base):
    __tablename__ = "movies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    duration_minutes: Mapped[int] = mapped_column(
        nullable=False
    )

    price: Mapped[float | None] = mapped_column(
        Float,
        default=10.0,
        nullable=True
    )

    release_date: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    generic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("generics.id"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    thumbnail_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    generic: Mapped["Generic"] = relationship(
        "Generic",
        back_populates="movies"
    )

    showtimes: Mapped[list["Showtime"]] = relationship(
        "Showtime",
        back_populates="movie",
        cascade="all, delete-orphan"
    )

    @property
    def genre_name(self) -> str | None:
        return self.generic.name if self.generic else "Action"