import uuid
from decimal import Decimal

import stripe
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.models.payments import Payment
from app.api.repositories.payment import PaymentRepository
from app.api.schemas.payment import PaymentCreate

import stripe
from app.api.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentService:

    def __init__(self, db: Session):
        self.db = db
        self.repository = PaymentRepository(db)

    def create_checkout_session(
        self,
        data: PaymentCreate
    ):

        existing_payment = self.repository.get_by_reservation_id(
            data.reservation_id
        )

        if existing_payment:
            if existing_payment.status == "paid":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This reservation has already been paid."
                )

            if existing_payment.stripe_session_id:
                try:
                    session = stripe.checkout.Session.retrieve(
                        existing_payment.stripe_session_id
                    )

                    if session.url:
                        return existing_payment, session.url

                except stripe.error.StripeError:
                    pass

        payment = existing_payment

        if not payment:
            payment = Payment(
                reservation_id=data.reservation_id,
                amount=data.amount,
                currency=data.currency.lower(),
                status="pending"
            )

            payment = self.repository.create(payment)

        amount_in_smallest_unit = int(
            Decimal(str(data.amount)) * 100
        )

        try:
            session = stripe.checkout.Session.create(
                mode="payment",

                line_items=[
                    {
                        "price_data": {
                            "currency": data.currency.lower(),
                            "product_data": {
                                "name": "Movie Reservation"
                            },
                            "unit_amount": amount_in_smallest_unit,
                        },
                        "quantity": 1,
                    }
                ],

                metadata={
                    "payment_id": str(payment.id),
                    "reservation_id": str(data.reservation_id)
                },

                success_url=(
                    "http://localhost:3000/payment/success"
                    "?session_id={CHECKOUT_SESSION_ID}"
                ),

                cancel_url=(
                    f"http://localhost:3000/payment/cancel?reservation_id={data.reservation_id}"
                )
            )

        except stripe.error.StripeError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe error: {str(exc)}"
            )

        payment.stripe_session_id = session.id

        self.repository.update(payment)

        return payment, session.url

    def get_payment(
        self,
        payment_id: uuid.UUID
    ) -> Payment:

        payment = self.repository.get_by_id(payment_id)

        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found."
            )

        return payment