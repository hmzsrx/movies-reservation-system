from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.core.dep import get_db, require_role
from app.api.models.user import User
from app.api.services.seat import SeatService
from app.api.schemas.seat import (
    SeatCreate,
    SeatUpdate,
    SeatResponse
)


router = APIRouter(
    prefix="/seat",
    tags=["seat"]
)


def get_seat_service(
    db: Session = Depends(get_db)
) -> SeatService:
    return SeatService(db)


# Admin only
@router.post(
    "/",
    response_model=SeatResponse,
    status_code=status.HTTP_201_CREATED
)
def create_seat(
    seat_data: SeatCreate,
    current_user: User = Depends(require_role("admin")),
    service: SeatService = Depends(get_seat_service),
):
    return service.create_seat(seat_data)


# Public
@router.get(
    "/{seat_id}",
    response_model=SeatResponse
)
def get_seat(
    seat_id: UUID,
    service: SeatService = Depends(get_seat_service),
):
    return service.get_seat(seat_id)


# Public
@router.get(
    "/",
    response_model=list[SeatResponse]
)
def get_seats(
    service: SeatService = Depends(get_seat_service),
):
    return service.get_seats()


# Public
@router.get(
    "/screen/{screen_id}",
    response_model=list[SeatResponse]
)
def get_seats_by_screen(
    screen_id: UUID,
    service: SeatService = Depends(get_seat_service),
):
    return service.get_seats_by_screen(screen_id)


# Admin only
@router.put(
    "/{seat_id}",
    response_model=SeatResponse
)
def update_seat(
    seat_id: UUID,
    seat_data: SeatUpdate,
    current_user: User = Depends(require_role("admin")),
    service: SeatService = Depends(get_seat_service),
):
    return service.update_seat(seat_id, seat_data)


# Admin only
@router.delete(
    "/{seat_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_seat(
    seat_id: UUID,
    current_user: User = Depends(require_role("admin")),
    service: SeatService = Depends(get_seat_service),
):
    service.delete_seat(seat_id)