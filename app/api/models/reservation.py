import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.api.models.base import Base


if TYPE_CHECKING:
    from app.api.models.user import User
    from app.api.models.showtime import Showtime
    from app.api.models.reserve_seat import ReservationSeat


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    showtime_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("showtimes.id"),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="confirmed",
        nullable=False
    )

    reserved_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="reservations"
    )

    showtime: Mapped["Showtime"] = relationship(
        "Showtime",
        back_populates="reservations"
    )

    reservation_seats: Mapped[list["ReservationSeat"]] = relationship(
        "ReservationSeat",
        back_populates="reservation",
        cascade="all, delete-orphan"
    )