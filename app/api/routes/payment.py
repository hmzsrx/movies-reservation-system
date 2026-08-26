import uuid
import stripe

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.core.dep import get_db, get_current_user, require_role
from app.api.models.user import User
from app.api.schemas.payment import (
    CheckoutResponse,
    PaymentCreate,
    PaymentResponse,
)
from app.api.services.payments import PaymentService


router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


# ==================================================
# CREATE CHECKOUT - AUTHENTICATED USER / CUSTOMER
# ==================================================

@router.post(
    "/checkout",
    response_model=CheckoutResponse
)
def create_checkout(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PaymentService(db)

    payment, checkout_url = service.create_checkout_session(data)

    return CheckoutResponse(
        payment_id=payment.id,
        checkout_url=checkout_url
    )


# ==================================================
# GET SINGLE PAYMENT - AUTHENTICATED USER
# ==================================================

@router.get(
    "/{payment_id}",
    response_model=PaymentResponse
)
def get_payment(
    payment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PaymentService(db)

    return service.get_payment(payment_id)


# ==================================================
# GET ALL PAYMENTS - ADMIN ONLY
# ==================================================

@router.get(
    "/",
    response_model=list[PaymentResponse]
)
def get_all_payments(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    service = PaymentService(db)

    return service.repository.get_all()