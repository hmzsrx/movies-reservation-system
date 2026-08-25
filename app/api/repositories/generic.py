from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.models.generic import Generic


class GenericRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, generic: Generic) -> Generic:
        self.db.add(generic)
        self.db.commit()
        self.db.refresh(generic)

        return generic

    def get_by_id(self, generic_id: UUID) -> Generic | None:
        statement = select(Generic).where(
            Generic.id == generic_id
        )

        return self.db.scalar(statement)

    def get_by_name(self, name: str) -> Generic | None:
        statement = select(Generic).where(
            Generic.name == name
        )

        return self.db.scalar(statement)

    def get_all(self) -> list[Generic]:
        statement = select(Generic)

        return list(self.db.scalars(statement).all())

    def update(self, generic: Generic) -> Generic:
        self.db.commit()
        self.db.refresh(generic)

        return generic

    def delete(self, generic: Generic) -> None:
        self.db.delete(generic)
        self.db.commit()