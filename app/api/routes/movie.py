from datetime import datetime, date
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.api.core.dep import get_db, get_current_user, require_role
from app.api.models.user import User
from app.api.schemas.movies import (
    MovieCreate,
    MovieResponse,
    MovieUpdate,
)
from app.api.services.movie import MovieService


router = APIRouter(
    prefix="/movie",
    tags=["movie"]
)


def get_movie_service(
    db: Session = Depends(get_db)
) -> MovieService:
    return MovieService(db)


# ==================================================
# CREATE MOVIE (FORM / MULTIPART) - ADMIN / ALL USERS
# ==================================================

@router.post(
    "/",
    response_model=MovieResponse,
    status_code=status.HTTP_201_CREATED
)
def create_movie(
    title: str = Form(...),
    description: str | None = Form(None),
    duration_minutes: int = Form(...),
    price: float | None = Form(10.0),
    release_date: str | None = Form(None),
    generic_id: UUID | None = Form(None),
    genre_name: str | None = Form(None),
    thumbnail_url: str | None = Form(None),
    thumbnail: UploadFile | None = File(None),
    current_user: User = Depends(require_role("admin")),
    service: MovieService = Depends(get_movie_service),
):
    try:
        parsed_release_date = None
        if release_date:
            try:
                parsed_release_date = datetime.strptime(release_date, "%Y-%m-%d")
            except Exception:
                try:
                    parsed_release_date = datetime.fromisoformat(release_date)
                except Exception:
                    parsed_release_date = datetime.utcnow()

        movie_data = MovieCreate(
            title=title,
            description=description,
            duration_minutes=duration_minutes,
            price=price,
            release_date=parsed_release_date,
            generic_id=generic_id,
            genre_name=genre_name,
            thumbnail_url=thumbnail_url
        )

        return service.create_movie(
            movie_data,
            thumbnail
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post(
    "/create-json",
    response_model=MovieResponse,
    status_code=status.HTTP_201_CREATED
)
def create_movie_json(
    movie_data: MovieCreate,
    current_user: User = Depends(require_role("admin")),
    service: MovieService = Depends(get_movie_service),
):
    try:
        return service.create_movie(movie_data, None)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )



# ==================================================
# GET MOVIE - PUBLIC
# ==================================================

@router.get(
    "/{movie_id}",
    response_model=MovieResponse
)
def get_movie(
    movie_id: UUID,
    service: MovieService = Depends(get_movie_service),
):
    return service.get_movie(movie_id)


# ==================================================
# GET ALL MOVIES - PUBLIC
# ==================================================

@router.get(
    "/",
    response_model=list[MovieResponse]
)
def get_movies(
    service: MovieService = Depends(get_movie_service),
):
    return service.get_movies()


# ==================================================
# UPDATE MOVIE (JSON) - ADMIN ONLY
# ==================================================

@router.put(
    "/{movie_id}",
    response_model=MovieResponse
)
def update_movie(
    movie_id: UUID,
    movie_data: MovieUpdate,
    current_user: User = Depends(require_role("admin")),
    service: MovieService = Depends(get_movie_service),
):
    return service.update_movie(
        movie_id,
        movie_data
    )


# ==================================================
# UPDATE MOVIE (FORM / MULTIPART) - ADMIN ONLY
# ==================================================

@router.post(
    "/{movie_id}/update",
    response_model=MovieResponse
)
def update_movie_form(
    movie_id: UUID,
    title: str | None = Form(None),
    description: str | None = Form(None),
    duration_minutes: int | None = Form(None),
    price: float | None = Form(None),
    release_date: str | None = Form(None),
    genre_name: str | None = Form(None),
    thumbnail_url: str | None = Form(None),
    thumbnail: UploadFile | None = File(None),
    current_user: User = Depends(require_role("admin")),
    service: MovieService = Depends(get_movie_service),
):
    parsed_release_date = None
    if release_date:
        try:
            parsed_release_date = datetime.strptime(release_date, "%Y-%m-%d")
        except Exception:
            try:
                parsed_release_date = datetime.fromisoformat(release_date)
            except Exception:
                parsed_release_date = None

    # Build MovieUpdate with only provided fields
    update_fields = {}
    if title is not None:
        update_fields["title"] = title
    if description is not None:
        update_fields["description"] = description
    if duration_minutes is not None:
        update_fields["duration_minutes"] = duration_minutes
    if price is not None:
        update_fields["price"] = price
    if parsed_release_date is not None:
        update_fields["release_date"] = parsed_release_date
    if genre_name is not None:
        update_fields["genre_name"] = genre_name
    if thumbnail_url is not None:
        update_fields["thumbnail_url"] = thumbnail_url

    movie_data = MovieUpdate(**update_fields)
    return service.update_movie(movie_id, movie_data, thumbnail)


# ==================================================
# DELETE MOVIE - ADMIN ONLY
# ==================================================

@router.delete(
    "/{movie_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_movie(
    movie_id: UUID,
    current_user: User = Depends(get_current_user),
    service: MovieService = Depends(get_movie_service),
):
    service.delete_movie(movie_id)