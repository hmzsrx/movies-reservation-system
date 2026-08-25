from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ReservationCreate(BaseModel):
    showtime_id: UUID
    seat_ids: list[UUID]


class ReservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    showtime_id: UUID
    status: str
    reserved_at: datetime