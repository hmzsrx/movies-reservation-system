import uuid
from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.api.models.base import Base


if TYPE_CHECKING:
    from app.api.models.seat import Seat
    from app.api.models.showtime import Showtime


class Screen(Base):
    __tablename__ = "screens"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    capacity: Mapped[int] = mapped_column(
        nullable=False
    )

    seats: Mapped[list["Seat"]] = relationship(
        "Seat",
        back_populates="screen",
        cascade="all, delete-orphan"
    )

    showtimes: Mapped[list["Showtime"]] = relationship(
        "Showtime",
        back_populates="screen"
    )