import uuid
from typing import TYPE_CHECKING

from sqlalchemy import String, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.api.models.base import Base


if TYPE_CHECKING:
    from app.api.models.screen import Screen
    from app.api.models.reserve_seat import ReservationSeat


class Seat(Base):
    __tablename__ = "seats"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    screen_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("screens.id"),
        nullable=False
    )

    row_number: Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    seat_number: Mapped[int] = mapped_column(
        nullable=False
    )

    screen: Mapped["Screen"] = relationship(
        "Screen",
        back_populates="seats"
    )

    reservation_seats: Mapped[list["ReservationSeat"]] = relationship(
        "ReservationSeat",
        back_populates="seat",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        UniqueConstraint(
            "screen_id",
            "row_number",
            "seat_number",
            name="uq_screen_seat"
        ),
    )