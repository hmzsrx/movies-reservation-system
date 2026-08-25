from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.models.generic import Generic
from app.api.repositories.generic import GenericRepository
from app.api.schemas.generic import GenericCreate, GenericUpdate


class GenericService:

    def __init__(self, db: Session):
        self.generic_repository = GenericRepository(db)

    def create_generic(self, generic_data: GenericCreate) -> Generic:
        existing = self.generic_repository.get_by_name(generic_data.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Genre with this name already exists"
            )

        generic = Generic(name=generic_data.name)
        return self.generic_repository.create(generic)

    def get_generic(self, generic_id: UUID) -> Generic:
        generic = self.generic_repository.get_by_id(generic_id)

        if not generic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Genre not found"
            )

        return generic

    def get_generics(self) -> list[Generic]:
        return self.generic_repository.get_all()

    def update_generic(self, generic_id: UUID, generic_data: GenericUpdate) -> Generic:
        generic = self.get_generic(generic_id)

        update_dict = generic_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(generic, key, value)

        return self.generic_repository.update(generic)

    def delete_generic(self, generic_id: UUID) -> None:
        generic = self.get_generic(generic_id)
        self.generic_repository.delete(generic)