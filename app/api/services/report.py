from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.models.movie import Movie
from app.api.models.reservation import Reservation
from app.api.models.reserve_seat import ReservationSeat
from app.api.models.showtime import Showtime
from app.api.schemas.report import MovieReport, ReservationReport


class ReportService:

    def __init__(self, db: Session):
        self.db = db

    def get_reservation_summary(self) -> ReservationReport:
        total = self.db.scalar(
            select(func.count(Reservation.id))
        ) or 0

        confirmed = self.db.scalar(
            select(func.count(Reservation.id)).where(Reservation.status == "confirmed")
        ) or 0

        cancelled = self.db.scalar(
            select(func.count(Reservation.id)).where(Reservation.status == "cancelled")
        ) or 0

        return ReservationReport(
            total_reservations=total,
            confirmed_reservations=confirmed,
            cancelled_reservations=cancelled
        )

    def get_movie_reports(self) -> list[MovieReport]:
        statement = (
            select(
                Movie.title.label("movie_title"),
                func.count(func.distinct(Reservation.id)).label("total_reservations"),
                func.count(ReservationSeat.id).label("total_seats_reserved")
            )
            .join(Showtime, Showtime.movie_id == Movie.id)
            .join(Reservation, Reservation.showtime_id == Showtime.id)
            .outerjoin(ReservationSeat, ReservationSeat.reservation_id == Reservation.id)
            .where(Reservation.status == "confirmed")
            .group_by(Movie.id, Movie.title)
        )

        results = self.db.execute(statement).all()

        reports = []
        for row in results:
            reports.append(
                MovieReport(
                    movie_title=row.movie_title,
                    total_reservations=row.total_reservations,
                    total_seats_reserved=row.total_seats_reserved
                )
            )

        return reports
