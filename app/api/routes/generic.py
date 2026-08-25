from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.core.dep import get_db, require_role
from app.api.models.user import User
from app.api.services.generic import GenericService
from app.api.schemas.generic import (
    GenericCreate,
    GenericUpdate,
    GenericResponse
)


router = APIRouter(
    prefix="/generic",
    tags=["generic"]
)


def get_generic_service(
    db: Session = Depends(get_db)
) -> GenericService:
    return GenericService(db)


# Admin only
@router.post(
    "/",
    response_model=GenericResponse,
    status_code=status.HTTP_201_CREATED
)
def create_generic(
    generic_data: GenericCreate,
    current_user: User = Depends(
        require_role("admin")
    ),
    service: GenericService = Depends(get_generic_service),
):
    return service.create_generic(generic_data)


# Public
@router.get(
    "/{generic_id}",
    response_model=GenericResponse
)
def get_generic(
    generic_id: UUID,
    service: GenericService = Depends(get_generic_service),
):
    return service.get_generic(generic_id)


# Public
@router.get(
    "/",
    response_model=list[GenericResponse]
)
def get_generics(
    service: GenericService = Depends(get_generic_service),
):
    return service.get_generics()


# Admin only
@router.put(
    "/{generic_id}",
    response_model=GenericResponse
)
def update_generic(
    generic_id: UUID,
    generic_data: GenericUpdate,
    current_user: User = Depends(
        require_role("admin")
    ),
    service: GenericService = Depends(get_generic_service),
):
    return service.update_generic(
        generic_id,
        generic_data
    )


# Admin only
@router.delete(
    "/{generic_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_generic(
    generic_id: UUID,
    current_user: User = Depends(
        require_role("admin")
    ),
    service: GenericService = Depends(get_generic_service),
):
    service.delete_generic(generic_id)