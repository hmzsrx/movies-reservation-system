import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.api.models.base import Base


if TYPE_CHECKING:
    from app.api.models.reservation import Reservation
    from app.api.models.seat import Seat
    from app.api.models.showtime import Showtime


class ReservationSeat(Base):
    __tablename__ = "reservation_seats"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    reservation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reservations.id"),
        nullable=False
    )

    showtime_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("showtimes.id"),
        nullable=False
    )

    seat_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("seats.id"),
        nullable=False
    )

    reservation: Mapped["Reservation"] = relationship(
        "Reservation",
        back_populates="reservation_seats"
    )

    showtime: Mapped["Showtime"] = relationship(
        "Showtime"
    )

    seat: Mapped["Seat"] = relationship(
        "Seat",
        back_populates="reservation_seats"
    )

    __table_args__ = (
        UniqueConstraint(
            "showtime_id",
            "seat_id",
            name="uq_showtime_seat"
        ),
    )