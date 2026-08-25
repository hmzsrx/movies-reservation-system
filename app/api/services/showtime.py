from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.api.models.showtime import Showtime
from app.api.schemas.showtime import (
    ShowtimeCreate,
    ShowtimeUpdate
)

from app.api.repositories.showtime import ShowtimeRepository
from app.api.repositories.movie import MovieRepository
from app.api.repositories.screen import ScreenRepository


class ShowtimeService:

    def __init__(self, db: Session):

        self.showtime_repository = ShowtimeRepository(db)
        self.movie_repository = MovieRepository(db)
        self.screen_repository = ScreenRepository(db)

    def create_showtime(
        self,
        showtime_data: ShowtimeCreate
    ) -> Showtime:

        # --------------------------------
        # 1. Validate movie
        # --------------------------------

        movie = self.movie_repository.get_by_id(
            showtime_data.movie_id
        )

        if not movie:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Movie not found"
            )

        # --------------------------------
        # 2. Validate screen
        # --------------------------------

        screen = self.screen_repository.get_by_id(
            showtime_data.screen_id
        )

        if not screen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Screen not found"
            )

        # --------------------------------
        # 3. Validate time
        # --------------------------------

        if showtime_data.start_time >= showtime_data.end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start time must be before end time"
            )

        # --------------------------------
        # 4. Check screen overlap
        # --------------------------------

        has_overlap = self.showtime_repository.has_overlap(
            screen_id=showtime_data.screen_id,
            start_time=showtime_data.start_time,
            end_time=showtime_data.end_time
        )

        if has_overlap:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Showtime overlaps with an existing showtime on this screen"
            )

        # --------------------------------
        # 5. Create showtime
        # --------------------------------

        showtime = Showtime(
            movie_id=showtime_data.movie_id,
            screen_id=showtime_data.screen_id,
            start_time=showtime_data.start_time,
            end_time=showtime_data.end_time
        )

        return self.showtime_repository.create(showtime)

    # ====================================
    # GET SHOWTIME BY ID
    # ====================================

    def get_showtime(
        self,
        showtime_id: UUID
    ) -> Showtime:

        showtime = self.showtime_repository.get_by_id(
            showtime_id
        )

        if not showtime:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Showtime not found"
            )

        return showtime

    # ====================================
    # GET ALL SHOWTIMES
    # ====================================

    def get_showtimes(self) -> list[Showtime]:

        return self.showtime_repository.get_all()

    # ====================================
    # GET SHOWTIMES BY MOVIE
    # ====================================

    def get_by_movie(
        self,
        movie_id: UUID
    ) -> list[Showtime]:

        return self.showtime_repository.get_by_movie(
            movie_id
        )

    # ====================================
    # GET SHOWTIMES BY SCREEN
    # ====================================

    def get_by_screen(
        self,
        screen_id: UUID
    ) -> list[Showtime]:

        return self.showtime_repository.get_by_screen(
            screen_id
        )

    # ====================================
    # UPDATE SHOWTIME
    # ====================================

    def update_showtime(
        self,
        showtime_id: UUID,
        showtime_data: ShowtimeUpdate
    ) -> Showtime:

        # --------------------------------
        # 1. Get existing showtime
        # --------------------------------

        showtime = self.get_showtime(showtime_id)

        # --------------------------------
        # 2. Validate movie if provided
        # --------------------------------

        if showtime_data.movie_id is not None:

            movie = self.movie_repository.get_by_id(
                showtime_data.movie_id
            )

            if not movie:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Movie not found"
                )

        # --------------------------------
        # 3. Validate screen if provided
        # --------------------------------

        if showtime_data.screen_id is not None:

            screen = self.screen_repository.get_by_id(
                showtime_data.screen_id
            )

            if not screen:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Screen not found"
                )

        # --------------------------------
        # 4. Get final values
        # --------------------------------
        #
        # Agar update mein koi field nahi aayi
        # to existing value use hogi.
        #

        new_screen_id = (
            showtime_data.screen_id
            if showtime_data.screen_id is not None
            else showtime.screen_id
        )

        new_start_time = (
            showtime_data.start_time
            if showtime_data.start_time is not None
            else showtime.start_time
        )

        new_end_time = (
            showtime_data.end_time
            if showtime_data.end_time is not None
            else showtime.end_time
        )

        # --------------------------------
        # 5. Validate time
        # --------------------------------

        if new_start_time >= new_end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start time must be before end time"
            )

        # --------------------------------
        # 6. Check overlap
        # --------------------------------

        has_overlap = self.showtime_repository.has_overlap(
            screen_id=new_screen_id,
            start_time=new_start_time,
            end_time=new_end_time,
            exclude_showtime_id=showtime.id
        )

        if has_overlap:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Showtime overlaps with an existing showtime on this screen"
            )

        # --------------------------------
        # 7. Update fields
        # --------------------------------

        update_dict = showtime_data.model_dump(
            exclude_unset=True
        )

        for key, value in update_dict.items():
            setattr(showtime, key, value)

        # --------------------------------
        # 8. Save update
        # --------------------------------

        return self.showtime_repository.update(
            showtime
        )

    # ====================================
    # DELETE SHOWTIME
    # ====================================

    def delete_showtime(
        self,
        showtime_id: UUID
    ) -> None:

        showtime = self.get_showtime(
            showtime_id
        )

        self.showtime_repository.delete(
            showtime
        )