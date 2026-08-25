from datetime import date
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile,
    status
)
from sqlalchemy.orm import Session

from app.api.core.dep import get_db, require_role
from app.api.models.user import User
from app.api.services.movie import MovieService
from app.api.schemas.movies import (
    MovieCreate,
    MovieUpdate,
    MovieResponse
)


router = APIRouter(
    prefix="/movie",
    tags=["movie"]
)


def get_movie_service(
    db: Session = Depends(get_db)
) -> MovieService:

    return MovieService(db)


# ==================================================
# CREATE MOVIE - ADMIN ONLY
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

    release_date: date = Form(...),

    generic_id: UUID | None = Form(None),

    thumbnail: UploadFile | None = File(None),

    current_user: User = Depends(
        require_role("admin")
    ),

    service: MovieService = Depends(
        get_movie_service
    ),
):

    movie_data = MovieCreate(
        title=title,
        description=description,
        duration_minutes=duration_minutes,
        release_date=release_date,
        generic_id=generic_id
    )

    return service.create_movie(
        movie_data,
        thumbnail
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

    service: MovieService = Depends(
        get_movie_service
    ),
):

    return service.get_movie(
        movie_id
    )


# ==================================================
# GET ALL MOVIES - PUBLIC
# ==================================================

@router.get(
    "/",
    response_model=list[MovieResponse]
)
def get_movies(

    service: MovieService = Depends(
        get_movie_service
    ),
):

    return service.get_movies()


# ==================================================
# UPDATE MOVIE - ADMIN ONLY
# ==================================================

@router.put(
    "/{movie_id}",
    response_model=MovieResponse
)
def update_movie(

    movie_id: UUID,

    movie_data: MovieUpdate,

    current_user: User = Depends(
        require_role("admin")
    ),

    service: MovieService = Depends(
        get_movie_service
    ),
):

    return service.update_movie(
        movie_id,
        movie_data
    )


# ==================================================
# DELETE MOVIE - ADMIN ONLY
# ==================================================

@router.delete(
    "/{movie_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_movie(

    movie_id: UUID,

    current_user: User = Depends(
        require_role("admin")
    ),

    service: MovieService = Depends(
        get_movie_service
    ),
):

    service.delete_movie(
        movie_id
    )

    return None