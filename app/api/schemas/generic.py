from uuid import UUID

from pydantic import BaseModel, ConfigDict


class GenericCreate(BaseModel):
    name: str


class GenericUpdate(BaseModel):
    name: str | None = None


class GenericResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str