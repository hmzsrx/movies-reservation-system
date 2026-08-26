from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.core.dep import (
    get_db,
    get_current_user,
    require_role
)

from app.api.models.user import User
from app.api.services.reservation import ReservationService
from app.api.schemas.reservation import (
    ReservationCreate,
    ReservationResponse
)


router = APIRouter(
    prefix="/reservation",
    tags=["reservation"]
)


def get_reservation_service(
    db: Session = Depends(get_db)
) -> ReservationService:
    return ReservationService(db)


# User + Admin
# Logged-in user reservation create kar sakta hai
@router.post(
    "/",
    response_model=ReservationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_reservation(
    reservation_data: ReservationCreate,
    current_user: User = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    return service.create_reservation(
        current_user.id,
        reservation_data
    )


# User apni reservation dekh sakta hai
# Admin kisi bhi reservation ko dekh sakta hai
@router.get(
    "/{reservation_id}",
    response_model=ReservationResponse
)
def get_reservation(
    reservation_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    reservation = service.get_reservation(reservation_id)

    if (
        reservation.user_id != current_user.id
        and current_user.role != "admin"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this reservation"
        )

    return reservation


# Admin only
@router.get(
    "/",
    response_model=list[ReservationResponse]
)
def get_all_reservations(
    current_user: User = Depends(
        require_role("admin")
    ),
    service: ReservationService = Depends(get_reservation_service),
):
    return service.get_all_reservations()


# User apni reservations dekh sakta hai
# Admin kisi bhi user ki reservations dekh sakta hai
@router.get(
    "/user/{user_id}",
    response_model=list[ReservationResponse]
)
def get_user_reservations(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    if (
        current_user.id != user_id
        and current_user.role != "admin"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these reservations"
        )

    return service.get_user_reservations(user_id)


# Admin only
@router.get(
    "/showtime/{showtime_id}",
    response_model=list[ReservationResponse]
)
def get_showtime_reservations(
    showtime_id: UUID,
    current_user: User = Depends(
        require_role("admin")
    ),
    service: ReservationService = Depends(get_reservation_service),
):
    return service.get_showtime_reservations(showtime_id)


# Public: Get list of reserved seat UUIDs for seat map display
@router.get(
    "/showtime/{showtime_id}/reserved-seats",
    response_model=list[UUID]
)
def get_reserved_seat_ids(
    showtime_id: UUID,
    service: ReservationService = Depends(get_reservation_service),
):
    return service.get_reserved_seat_ids(showtime_id)


# User + Admin
# Service current user's reservation cancel karega
@router.patch(
    "/{reservation_id}/cancel",
    response_model=ReservationResponse
)
def cancel_reservation(
    reservation_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ReservationService = Depends(get_reservation_service),
):
    return service.cancel_reservation(
        reservation_id,
        current_user.id
    )


# Admin only
@router.delete(
    "/{reservation_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_reservation(
    reservation_id: UUID,
    current_user: User = Depends(
        require_role("admin")
    ),
    service: ReservationService = Depends(get_reservation_service),
):
    service.delete_reservation(reservation_id)