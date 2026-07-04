# backend/app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FinTrack API"
    API_V1_STR: str = "/api/v1"
    
    # Docker Compose'da tanımladığımız bilgilerle eşleşen asenkron bağlantı URL'i
    DATABASE_URL: str = "postgresql+asyncpg://fintrack_user:fintrack_password_123@localhost:5442/fintrack_db"

    class Config:
        case_sensitive = True

settings = Settings()