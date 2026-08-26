import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PaymentCreate(BaseModel):
    reservation_id: uuid.UUID
    amount: Decimal = Field(gt=0)
    currency: str = "usd"


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    reservation_id: uuid.UUID
    amount: Decimal
    currency: str
    stripe_session_id: str | None
    stripe_payment_intent_id: str | None
    status: str


class CheckoutResponse(BaseModel):
    payment_id: uuid.UUID
    checkout_url: str