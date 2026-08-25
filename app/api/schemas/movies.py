from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict , Field 


class MovieCreate(BaseModel):
    title: str
    description: str | None = None
    duration_minutes: int = Field(gt=0)
    release_date: datetime | None = None
    generic_id: UUID


class MovieUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    duration_minutes:int | None = Field(default=None, gt=0)
    release_date: datetime | None = None
    generic_id: UUID | None = None


class MovieResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str | None
    duration_minutes: int
    release_date: datetime | None
    generic_id: UUID
    created_at: datetime