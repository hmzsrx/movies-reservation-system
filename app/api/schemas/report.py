from pydantic import BaseModel


class ReservationReport(BaseModel):
    total_reservations: int
    confirmed_reservations: int
    cancelled_reservations: int


class MovieReport(BaseModel):
    movie_title: str
    total_reservations: int
    total_seats_reserved: int