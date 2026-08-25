from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.core.database import get_db

from app.api.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    VerifyEmailRequest
)

from app.api.services.auth import AuthService


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    service = AuthService(db)

    user = service.register(data)

    return user

@router.post("/verify-email")
def verify_email(
    data: VerifyEmailRequest,
    db: Session = Depends(get_db)
):
    service = AuthService(db)

    return service.verify_email(data)

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    service = AuthService(db)

    return service.login(data)