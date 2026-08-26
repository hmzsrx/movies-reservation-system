import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.models.payments import Payment


class PaymentRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, payment: Payment) -> Payment:
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)

        return payment

    def get_by_id(self, payment_id: uuid.UUID) -> Payment | None:
        statement = select(Payment).where(
            Payment.id == payment_id
        )

        return self.db.scalar(statement)

    def get_all(self) -> list[Payment]:
        statement = select(Payment)

        return list(self.db.scalars(statement).all())

    def get_by_reservation_id(
        self,
        reservation_id: uuid.UUID
    ) -> Payment | None:

        statement = select(Payment).where(
            Payment.reservation_id == reservation_id
        )

        return self.db.scalar(statement)

    def get_by_stripe_session_id(
        self,
        session_id: str
    ) -> Payment | None:

        statement = select(Payment).where(
            Payment.stripe_session_id == session_id
        )

        return self.db.scalar(statement)

    def update(self, payment: Payment) -> Payment:
        self.db.commit()
        self.db.refresh(payment)

        return payment