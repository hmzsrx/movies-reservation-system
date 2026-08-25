from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.models.screen import Screen
from app.api.repositories.screen import ScreenRepository
from app.api.schemas.screen import ScreenCreate, ScreenUpdate


class ScreenService:

    def __init__(self, db: Session):
        self.screen_repository = ScreenRepository(db)

    def create_screen(self, screen_data: ScreenCreate) -> Screen:
        screen = Screen(
            name=screen_data.name,
            capacity=screen_data.capacity
        )
        return self.screen_repository.create(screen)

    def get_screen(self, screen_id: UUID) -> Screen:
        screen = self.screen_repository.get_by_id(screen_id)

        if not screen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Screen not found"
            )

        return screen

    def get_screens(self) -> list[Screen]:
        return self.screen_repository.get_all()

    def update_screen(
        self,
        screen_id: UUID,
        screen_data: ScreenUpdate
    ) -> Screen:
        screen = self.get_screen(screen_id)

        update_dict = screen_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(screen, key, value)

        return self.screen_repository.update(screen)

    def delete_screen(self, screen_id: UUID) -> None:
        screen = self.get_screen(screen_id)
        self.screen_repository.delete(screen)
