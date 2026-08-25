from uuid import UUID
from sqlalchemy import select, func

from sqlalchemy.orm import Session

from app.api.models.user import User, PendingRegistration


class UserRepository:

    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user: User):
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user

    def find_all(self):
        statement = select(User)

        return list(self.db.scalars(statement).all())

    def find_by_id(self, user_id: UUID):
        statement = select(User).where(
            User.id == user_id
        )

        return self.db.scalar(statement)

    def find_by_email(self, email: str):
        statement = select(User).where(
            User.email == email
        )

        return self.db.scalar(statement)

    def update_user(self, user: User):
        self.db.commit()
        self.db.refresh(user)

        return user

    def delete_user(self, user: User):
        self.db.delete(user)
        self.db.commit()

class PendingRegistrationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, pending_reg: PendingRegistration):
        self.db.add(pending_reg)
        self.db.commit()
        self.db.refresh(pending_reg)
        return pending_reg

    def find_by_email(self, email: str) -> PendingRegistration | None:
        email = email.strip().lower()

        statement = select(PendingRegistration).where(
            func.lower(PendingRegistration.email) == email
        )

        return self.db.scalar(statement)

    def delete(self, pending_reg: PendingRegistration):
        self.db.delete(pending_reg)
        self.db.commit()