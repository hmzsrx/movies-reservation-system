from fastapi import FastAPI

from app.api.routes.user import router as user_router
from app.api.routes.auth import router as auth_router
from app.api.routes.movie import router as movie_router
from app.api.routes.screen import router as screen_router 
from app.api.routes.showtime import router as showtime_router
from app.api.routes.reservation import router as reservation_router
from app.api.routes.report import router as report_router
from app.api.routes.seat import router as seat_router
from app.api.routes.generic import router as generic_router
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

app = FastAPI()

load_dotenv()

app.mount(
    "/uploads",
    StaticFiles(directory="app/uploads"),
    name="uploads"
)

app.include_router(user_router)
app.include_router(auth_router)
app.include_router(movie_router)
app.include_router(screen_router)
app.include_router(showtime_router)
app.include_router(reservation_router)
app.include_router(report_router)
app.include_router(seat_router)
app.include_router(generic_router)