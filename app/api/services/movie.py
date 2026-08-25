import os
import uuid
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.models.movie import Movie
from app.api.repositories.movie import MovieRepository
from app.api.schemas.movies import MovieCreate, MovieUpdate


UPLOAD_DIR = "uploads/movies"

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}


class MovieService:

    def __init__(self, db: Session):
        self.movie_repository = MovieRepository(db)

    # ==================================================
    # CREATE MOVIE
    # ==================================================

    def create_movie(
        self,
        movie_data: MovieCreate,
        thumbnail: UploadFile | None = None
    ) -> Movie:

        thumbnail_url = None

        # --------------------------------------------------
        # SAVE THUMBNAIL
        # --------------------------------------------------

        if thumbnail:

            # Get file extension
            extension = os.path.splitext(
                thumbnail.filename
            )[1].lower()

            # Check image type
            if extension not in ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Only JPG, JPEG, PNG and WEBP "
                        "images are allowed"
                    )
                )

            # Create folder if it doesn't exist
            os.makedirs(
                UPLOAD_DIR,
                exist_ok=True
            )

            # Generate unique filename
            filename = f"{uuid.uuid4()}{extension}"

            # Complete file path
            file_path = os.path.join(
                UPLOAD_DIR,
                filename
            )

            # Save image
            with open(file_path, "wb") as file:

                file.write(
                    thumbnail.file.read()
                )

            # URL/path that will be stored in database
            thumbnail_url = f"/uploads/movies/{filename}"

        # --------------------------------------------------
        # CREATE MOVIE
        # --------------------------------------------------

        movie = Movie(
            title=movie_data.title,
            description=movie_data.description,
            duration_minutes=movie_data.duration_minutes,
            release_date=movie_data.release_date,
            generic_id=movie_data.generic_id,
            thumbnail_url=thumbnail_url
        )

        return self.movie_repository.create(movie)

    # ==================================================
    # GET MOVIE
    # ==================================================

    def get_movie(
        self,
        movie_id: UUID
    ) -> Movie:

        movie = self.movie_repository.get_by_id(
            movie_id
        )

        if not movie:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Movie not found"
            )

        return movie

    # ==================================================
    # GET ALL MOVIES
    # ==================================================

    def get_movies(self) -> list[Movie]:

        return self.movie_repository.get_all()

    # ==================================================
    # UPDATE MOVIE
    # ==================================================

    def update_movie(
        self,
        movie_id: UUID,
        movie_data: MovieUpdate
    ) -> Movie:

        movie = self.get_movie(movie_id)

        update_dict = movie_data.model_dump(
            exclude_unset=True
        )

        for key, value in update_dict.items():

            setattr(
                movie,
                key,
                value
            )

        return self.movie_repository.update(
            movie
        )

    # ==================================================
    # DELETE MOVIE
    # ==================================================

    def delete_movie(
        self,
        movie_id: UUID
    ) -> None:

        movie = self.get_movie(
            movie_id
        )

        self.movie_repository.delete(
            movie
        )