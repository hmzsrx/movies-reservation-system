from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class MovieCreate(BaseModel):
    title: str
    description: str | None = None
    duration_minutes: int = Field(gt=0)
    price: float | None = Field(default=10.0, ge=0)
    release_date: datetime | None = None
    generic_id: UUID | None = None
    genre_name: str | None = None
    thumbnail_url: str | None = None


class MovieUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    duration_minutes: int | None = Field(default=None, gt=0)
    price: float | None = Field(default=None, ge=0)
    release_date: datetime | None = None
    generic_id: UUID | None = None
    genre_name: str | None = None
    thumbnail_url: str | None = None


class MovieResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str | None = None
    duration_minutes: int
    price: float | None = 10.0
    release_date: datetime | None = None
    generic_id: UUID | None = None
    genre_name: str | None = None
    thumbnail_url: str | None = None
    created_at: datetime