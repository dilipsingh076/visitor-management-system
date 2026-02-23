"""
Application configuration using Pydantic Settings.
"""
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List

# Resolve DB path relative to project root (backend/) for consistency
_BASE_DIR = Path(__file__).resolve().parent.parent
_DEFAULT_DB = _BASE_DIR / "vms.db"


class Settings(BaseSettings):
    """Application settings."""

    # App
    APP_NAME: str = "Visitor Management System"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # API
    API_V1_PREFIX: str = "/api/v1"
    AUTH_DEMO_MODE: bool = True  # Skip Keycloak when True

    CORS_ORIGINS: List[str] = ["*"]  # Allow all origins

    # Database (SQLite by default - absolute path for consistent CWD behavior)
    DATABASE_URL: str = f"sqlite+aiosqlite:///{_DEFAULT_DB.as_posix()}"
    DB_ECHO: bool = False
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10

    # Keycloak
    KEYCLOAK_URL: str = "http://localhost:8080"
    KEYCLOAK_REALM: str = "vms"
    KEYCLOAK_CLIENT_ID: str = "vms-backend"
    KEYCLOAK_CLIENT_SECRET: str = ""

    # JWT
    JWT_ALGORITHM: str = "RS256"
    JWT_AUDIENCE: str = "account"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600

    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "vms-files"
    MINIO_SECURE: bool = False

    # WhatsApp (WAHA) - set WAHA_API_URL e.g. http://localhost:3001/api to enable
    WAHA_API_URL: str = ""
    WAHA_API_KEY: str = ""

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""

    # Security
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
