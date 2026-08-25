from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.core.config import settings
from collections.abc import Generator
from sqlalchemy.orm import Session


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

engine = create_engine(
    settings.DATABASE_URL
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)