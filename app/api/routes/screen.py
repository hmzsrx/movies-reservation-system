from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.core.dep import get_db, require_role
from app.api.models.user import User
from app.api.services.screen import ScreenService
from app.api.schemas.screen import (
    ScreenCreate,
    ScreenUpdate,
    ScreenResponse
)


router = APIRouter(
    prefix="/screen",
    tags=["screen"]
)


def get_screen_service(
    db: Session = Depends(get_db)
) -> ScreenService:
    return ScreenService(db)


# Admin only
@router.post(
    "/",
    response_model=ScreenResponse,
    status_code=status.HTTP_201_CREATED
)
def create_screen(
    screen_data: ScreenCreate,
    current_user: User = Depends(require_role("admin")),
    service: ScreenService = Depends(get_screen_service),
):
    return service.create_screen(screen_data)


# Public
@router.get(
    "/{screen_id}",
    response_model=ScreenResponse
)
def get_screen(
    screen_id: UUID,
    service: ScreenService = Depends(get_screen_service),
):
    return service.get_screen(screen_id)


# Public
@router.get(
    "/",
    response_model=list[ScreenResponse]
)
def get_screens(
    service: ScreenService = Depends(get_screen_service),
):
    return service.get_screens()


# Admin only
@router.put(
    "/{screen_id}",
    response_model=ScreenResponse
)
def update_screen(
    screen_id: UUID,
    screen_data: ScreenUpdate,
    current_user: User = Depends(require_role("admin")),
    service: ScreenService = Depends(get_screen_service),
):
    return service.update_screen(screen_id, screen_data)


# Admin only
@router.delete(
    "/{screen_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_screen(
    screen_id: UUID,
    current_user: User = Depends(require_role("admin")),
    service: ScreenService = Depends(get_screen_service),
):
    service.delete_screen(screen_id)