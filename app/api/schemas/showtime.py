from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict , model_validator


class ShowtimeCreate(BaseModel):
    movie_id: UUID
    screen_id: UUID
    start_time: datetime
    end_time: datetime


    @model_validator(mode = 'after')
    def valid_time(self):
        if self.end_time <= self.start_time:
                raise ValueError("End time must be after start time")

        return self


class ShowtimeUpdate(BaseModel):
    movie_id: UUID | None = None
    screen_id: UUID | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None

    @model_validator(mode="after")
    def validate_time(self):
            if self.start_time is not None and self.end_time is not None:
                if self.end_time <= self.start_time:
                    raise ValueError("End time must be after start time")

            return self


class ShowtimeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    movie_id: UUID
    screen_id: UUID
    start_time: datetime
    end_time: datetime


