import secrets
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from app.api.models.user import User, PendingRegistration
from app.api.repositories.user import UserRepository, PendingRegistrationRepository
from app.api.services.email import send_otp_email

from app.api.core.security import (
    hash_password,
    verify_password
)

from app.api.core.jwt import create_access_token

from app.api.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    VerifyEmailRequest
)

class AuthService:

    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)
        self.pending_repository = PendingRegistrationRepository(db)

    def generate_otp(self) -> str:
        return str(secrets.randbelow(900000) + 100000)

    def register(self, data: RegisterRequest):
        email = data.email.strip().lower()

        existing_user = self.user_repository.find_by_email(email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
            
        existing_pending = self.pending_repository.find_by_email(email)
        if existing_pending:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Pending registration already exists"
            )

        hashed_password = hash_password(data.password)
        otp = self.generate_otp()
        otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

        pending_reg = PendingRegistration(
            name=data.name,
            email=email,
            hashed_password=hashed_password,
            otp=otp,
            otp_expires_at=otp_expires_at
        )

        self.pending_repository.create(pending_reg)

        send_otp_email(
            to_email=email,
            otp=otp
        )

        return {"message": "OTP sent to email successfully."}

    def login(self, data: LoginRequest):
        user = self.user_repository.find_by_email(data.email)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        password_valid = verify_password(data.password, user.password)

        if not password_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        access_token = create_access_token(
            data={"sub": str(user.id)}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id
        }

    def verify_email(self, data: VerifyEmailRequest):
        email = data.email.strip().lower()

        pending_reg = self.pending_repository.find_by_email(email)
        if not pending_reg:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pending registration not found"
            )

        if pending_reg.otp != data.otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP"
            )

        if datetime.now(timezone.utc) > pending_reg.otp_expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP expired"
            )

        user = User(
            name=pending_reg.name,
            email=pending_reg.email,
            password=pending_reg.hashed_password,
            role="user",
            email_verified=True
        )

        created_user = self.user_repository.create_user(user)
        self.pending_repository.delete(pending_reg)

        return created_user