from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.core.dep import get_db, require_role
from app.api.models.user import User
from app.api.services.report import ReportService
from app.api.schemas.report import (
    MovieReport,
    ReservationReport
)


router = APIRouter(
    prefix="/report",
    tags=["report"]
)


def get_report_service(
    db: Session = Depends(get_db)
) -> ReportService:
    return ReportService(db)


# Admin only
@router.get(
    "/reservations",
    response_model=ReservationReport
)
def get_reservation_summary(
    current_user: User = Depends(
        require_role("admin")
    ),
    service: ReportService = Depends(get_report_service),
):
    return service.get_reservation_summary()


# Admin only
@router.get(
    "/movies",
    response_model=list[MovieReport]
)
def get_movie_reports(
    current_user: User = Depends(
        require_role("admin")
    ),
    service: ReportService = Depends(get_report_service),
):
    return service.get_movie_reports()