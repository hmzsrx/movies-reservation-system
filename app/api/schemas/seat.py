from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SeatCreate(BaseModel):
    screen_id: UUID
    row_number: str
    seat_number: int


class SeatUpdate(BaseModel):
    row_number: str | None = None
    seat_number: int | None = None


class SeatResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    screen_id: UUID
    row_number: str
    seat_number: int