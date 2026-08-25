from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ScreenCreate(BaseModel):
    name: str
    capacity: int


class ScreenUpdate(BaseModel):
    name: str | None = None
    capacity: int | None = None


class ScreenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    capacity: int