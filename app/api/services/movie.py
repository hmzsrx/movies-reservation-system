import os
import uuid
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.models.movie import Movie
from app.api.models.generic import Generic
from app.api.repositories.movie import MovieRepository
from app.api.schemas.movies import MovieCreate, MovieUpdate


UPLOAD_DIR = os.path.join("app", "uploads", "movies")

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}


class MovieService:

    def __init__(self, db: Session):
        self.db = db
        self.movie_repository = MovieRepository(db)

    # ==================================================
    # CREATE MOVIE
    # ==================================================

    def create_movie(
        self,
        movie_data: MovieCreate,
        thumbnail: UploadFile | None = None
    ) -> Movie:

        # Resolve Genre (Generic)
        generic_id = movie_data.generic_id
        if not generic_id:
            genre_name_clean = (movie_data.genre_name or "Action").strip()
            generic = self.db.query(Generic).filter(Generic.name.ilike(genre_name_clean)).first()
            if not generic:
                generic = Generic(name=genre_name_clean)
                self.db.add(generic)
                self.db.commit()
                self.db.refresh(generic)
            generic_id = generic.id

        thumbnail_url = movie_data.thumbnail_url

        # SAVE THUMBNAIL FILE IF UPLOADED
        if thumbnail and thumbnail.filename:
            extension = os.path.splitext(thumbnail.filename)[1].lower()
            # Ensure upload directory exists — handle Windows edge cases
            try:
                if os.path.isfile(UPLOAD_DIR):
                    os.remove(UPLOAD_DIR)  # Remove stray file blocking directory creation
                if not os.path.isdir(UPLOAD_DIR):
                    os.makedirs(UPLOAD_DIR)
            except Exception:
                thumbnail = None  # Can't save file; skip thumbnail upload gracefully
            if thumbnail:
                filename = f"{uuid.uuid4()}{extension}"
                file_path = os.path.join(UPLOAD_DIR, filename)

                with open(file_path, "wb") as file:
                    file.write(thumbnail.file.read())

                thumbnail_url = f"http://localhost:8000/uploads/movies/{filename}"

        movie = Movie(
            title=movie_data.title,
            description=movie_data.description,
            duration_minutes=movie_data.duration_minutes,
            price=movie_data.price if movie_data.price is not None else 10.0,
            release_date=movie_data.release_date,
            generic_id=generic_id,
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

        movie = self.movie_repository.get_by_id(movie_id)

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
        movie_data: MovieUpdate,
        thumbnail: UploadFile | None = None
    ) -> Movie:

        movie = self.get_movie(movie_id)
        update_dict = movie_data.model_dump(exclude_unset=True)

        # Handle genre_name -> generic_id resolution (genre_name is a @property, not a column)
        genre_name = update_dict.pop("genre_name", None)
        if genre_name:
            genre_name_clean = genre_name.strip()
            generic = self.db.query(Generic).filter(Generic.name.ilike(genre_name_clean)).first()
            if not generic:
                generic = Generic(name=genre_name_clean)
                self.db.add(generic)
                self.db.commit()
                self.db.refresh(generic)
            movie.generic_id = generic.id

        # Handle thumbnail file upload
        if thumbnail and thumbnail.filename:
            extension = os.path.splitext(thumbnail.filename)[1].lower()
            try:
                if os.path.isfile(UPLOAD_DIR):
                    os.remove(UPLOAD_DIR)
                if not os.path.isdir(UPLOAD_DIR):
                    os.makedirs(UPLOAD_DIR)
            except Exception:
                thumbnail = None
            if thumbnail:
                filename = f"{uuid.uuid4()}{extension}"
                file_path = os.path.join(UPLOAD_DIR, filename)
                with open(file_path, "wb") as file:
                    file.write(thumbnail.file.read())
                movie.thumbnail_url = f"http://localhost:8000/uploads/movies/{filename}"
                # Don't overwrite the new URL with the old one from update_dict
                update_dict.pop("thumbnail_url", None)

        for key, value in update_dict.items():
            setattr(movie, key, value)

        return self.movie_repository.update(movie)

    # ==================================================
    # DELETE MOVIE
    # ==================================================

    def delete_movie(
        self,
        movie_id: UUID
    ) -> None:

        movie = self.get_movie(movie_id)
        self.movie_repository.delete(movie)