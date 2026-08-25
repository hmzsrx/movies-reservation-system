from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.models.screen import Screen


class ScreenRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(self, screen: Screen) -> Screen:
        self.db.add(screen)
        self.db.commit()
        self.db.refresh(screen)

        return screen

    def get_by_id(self, screen_id: UUID) -> Screen | None:
        statement = select(Screen).where(
            Screen.id == screen_id
        )

        return self.db.scalar(statement)

    def get_all(self) -> list[Screen]:
        statement = select(Screen)

        return list(self.db.scalars(statement).all())

    def update(self, screen: Screen) -> Screen:
        self.db.commit()
        self.db.refresh(screen)

        return screen

    def delete(self, screen: Screen) -> None:
        self.db.delete(screen)
        self.db.commit()