from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.core.security import hash_password
from app.api.models.user import User
from app.api.repositories.user import UserRepository
from app.api.schemas.user import create_user as UserCreate, UserUpdate


class UserService:
    def __init__(self, db: Session):
            self.user_repository = UserRepository(db)

    def create_user(self, user_data: UserCreate) -> User:

        email = user_data.email.strip().lower()

        existing_user = self.user_repository.find_by_email(email)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        hashed_pwd = hash_password(user_data.password)

        user = User(
            name=user_data.name,
            email=email,
            password=hashed_pwd,
            role="user"
        )

        return self.user_repository.create_user(user)

    def get_user(self, user_id: UUID) -> User:
            user = self.user_repository.find_by_id(user_id)

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )

            return user

    def get_users(self) -> list[User]:
            return self.user_repository.find_all()

    def update_role(self, user_id: UUID, role: str):

        user = self.repository.find_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        user.role = role

        self.db.commit()
        self.db.refresh(user)

        return user

    def update_user(self, user_id: UUID, user_data: UserUpdate) -> User:
            user = self.get_user(user_id)

            update_dict = user_data.model_dump(exclude_unset=True)
            for key, value in update_dict.items():
                setattr(user, key, value)

            return self.user_repository.update_user(user)

    def delete_user(self, user_id: UUID) -> None:
            user = self.get_user(user_id)
            self.user_repository.delete_user(user)