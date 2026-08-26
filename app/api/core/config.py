from pydantic_settings import BaseSettings, SettingsConfigDict


class settings(BaseSettings):

    DATABASE_URL: str

    SECRET_KEY: str

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    STRIPE_SECRET_KEY: str

    STRIPE_WEBHOOK_SECRET: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = settings()