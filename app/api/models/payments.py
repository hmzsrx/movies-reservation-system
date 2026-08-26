import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.api.models.base import Base


if TYPE_CHECKING:
    from app.api.models.reservation import Reservation


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    reservation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reservations.id"),
        nullable=False,
        unique=True
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    currency: Mapped[str] = mapped_column(
        String(10),
        default="usd",
        nullable=False
    )

    stripe_session_id: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        nullable=True
    )

    stripe_payment_intent_id: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="pending",
        nullable=False
    )

    reservation: Mapped["Reservation"] = relationship(
        "Reservation",
        back_populates="payment"
    )