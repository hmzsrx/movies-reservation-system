from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.core.dep import get_db, require_role
from app.api.models.user import User
from app.api.services.showtime import ShowtimeService
from app.api.schemas.showtime import (
    ShowtimeCreate,
    ShowtimeUpdate,
    ShowtimeResponse
)


router = APIRouter(
    prefix="/showtime",
    tags=["showtime"]
)


def get_showtime_service(
    db: Session = Depends(get_db)
) -> ShowtimeService:
    return ShowtimeService(db)


# Admin only
@router.post(
    "/",
    response_model=ShowtimeResponse,
    status_code=status.HTTP_201_CREATED
)
def create_showtime(
    showtime_data: ShowtimeCreate,
    current_user: User = Depends(require_role("admin")),
    service: ShowtimeService = Depends(get_showtime_service),
):
    return service.create_showtime(showtime_data)


# Public
@router.get(
    "/{showtime_id}",
    response_model=ShowtimeResponse
)
def get_showtime(
    showtime_id: UUID,
    service: ShowtimeService = Depends(get_showtime_service),
):
    return service.get_showtime(showtime_id)


# Public
@router.get(
    "/",
    response_model=list[ShowtimeResponse]
)
def get_showtimes(
    service: ShowtimeService = Depends(get_showtime_service),
):
    return service.get_showtimes()


# Public
@router.get(
    "/movie/{movie_id}",
    response_model=list[ShowtimeResponse]
)
def get_showtimes_by_movie(
    movie_id: UUID,
    service: ShowtimeService = Depends(get_showtime_service),
):
    return service.get_by_movie(movie_id)


# Public
@router.get(
    "/screen/{screen_id}",
    response_model=list[ShowtimeResponse]
)
def get_showtimes_by_screen(
    screen_id: UUID,
    service: ShowtimeService = Depends(get_showtime_service),
):
    return service.get_by_screen(screen_id)


# Admin only
@router.put(
    "/{showtime_id}",
    response_model=ShowtimeResponse
)
def update_showtime(
    showtime_id: UUID,
    showtime_data: ShowtimeUpdate,
    current_user: User = Depends(require_role("admin")),
    service: ShowtimeService = Depends(get_showtime_service),
):
    return service.update_showtime(showtime_id, showtime_data)


# Admin only
@router.delete(
    "/{showtime_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_showtime(
    showtime_id: UUID,
    current_user: User = Depends(require_role("admin")),
    service: ShowtimeService = Depends(get_showtime_service),
):
    service.delete_showtime(showtime_id)