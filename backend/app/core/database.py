"""
Database configuration and session management.
"""
from typing import AsyncGenerator
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import StaticPool
import structlog

from app.core.config import settings

logger = structlog.get_logger()

# Columns added to societies in a later schema (for migration)
SOCIETIES_EXTRA_COLUMNS = [
    ("registration_number", "VARCHAR(100)"),
    ("society_type", "VARCHAR(100)"),
    ("registration_year", "VARCHAR(10)"),
    ("documents_note", "VARCHAR(500)"),
]

# Columns added to users in a later schema (for migration)
USERS_EXTRA_COLUMNS = [
    ("password_hash", "VARCHAR(255)"),
    ("society_id", "VARCHAR(36)"),
    ("building_id", "VARCHAR(36)"),
    ("is_verified", "BOOLEAN"),
]

# PostgreSQL (Supabase): add missing columns with IF NOT EXISTS
SOCIETIES_EXTRA_PG = [
    ("registration_number", "VARCHAR(100)"),
    ("society_type", "VARCHAR(100)"),
    ("registration_year", "VARCHAR(10)"),
    ("documents_note", "VARCHAR(500)"),
]
USERS_EXTRA_PG = [
    ("password_hash", "VARCHAR(255)"),
    ("society_id", "UUID"),
    ("building_id", "UUID"),
    ("is_verified", "BOOLEAN DEFAULT FALSE"),
]

# SQLite needs StaticPool; PostgreSQL uses default pool
_is_sqlite = settings.DATABASE_URL.startswith("sqlite")
_engine_kw = {
    "echo": settings.DB_ECHO,
    "future": True,
}
if _is_sqlite:
    _engine_kw["connect_args"] = {"check_same_thread": False}
    _engine_kw["poolclass"] = StaticPool
else:
    _engine_kw["pool_size"] = settings.DB_POOL_SIZE
    _engine_kw["max_overflow"] = settings.DB_MAX_OVERFLOW

engine = create_async_engine(settings.DATABASE_URL, **_engine_kw)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Get database session.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def _migrate_societies_columns_sync(connection):
    """Add missing columns to societies table (SQLite). Idempotent."""
    try:
        result = connection.execute(text("PRAGMA table_info(societies)"))
        rows = result.fetchall()
    except Exception:
        return
    existing = {str(row[1]).lower() for row in rows}
    for col_name, col_type in SOCIETIES_EXTRA_COLUMNS:
        if col_name.lower() not in existing:
            connection.execute(text(f"ALTER TABLE societies ADD COLUMN {col_name} {col_type}"))
            logger.info("Added column to societies", column=col_name)


def _migrate_users_columns_sync(connection):
    """Add missing columns to users table (SQLite). Idempotent."""
    try:
        result = connection.execute(text("PRAGMA table_info(users)"))
        rows = result.fetchall()
    except Exception:
        return
    existing = {str(row[1]).lower() for row in rows}
    for col_name, col_type in USERS_EXTRA_COLUMNS:
        if col_name.lower() not in existing:
            connection.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
            logger.info("Added column to users", column=col_name)


def _migrate_postgres_columns_sync(connection):
    """Add missing columns to societies and users (PostgreSQL/Supabase). Idempotent."""
    for col_name, col_type in SOCIETIES_EXTRA_PG:
        try:
            connection.execute(text(
                f"ALTER TABLE societies ADD COLUMN IF NOT EXISTS {col_name} {col_type}"
            ))
            logger.info("Added column to societies (pg)", column=col_name)
        except Exception as e:
            logger.debug("societies column may exist", column=col_name, error=str(e))
    for col_name, col_type in USERS_EXTRA_PG:
        try:
            connection.execute(text(
                f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type}"
            ))
            logger.info("Added column to users (pg)", column=col_name)
        except Exception as e:
            logger.debug("users column may exist", column=col_name, error=str(e))
    # visits.status: store as VARCHAR to avoid PostgreSQL ENUM type mismatch (visitstatus)
    try:
        connection.execute(text(
            "ALTER TABLE visits ALTER COLUMN status TYPE VARCHAR(20) USING status::text"
        ))
        logger.info("Migrated visits.status to VARCHAR (pg)")
    except Exception as e:
        logger.debug("visits.status migration skipped (may already be varchar)", error=str(e))


async def init_db():
    """
    Initialize database (create tables) and add any missing columns to existing tables.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created")
    # Migrate existing tables: add missing columns (SQLite or PostgreSQL/Supabase)
    async with engine.begin() as conn:
        if _is_sqlite:
            await conn.run_sync(_migrate_societies_columns_sync)
            await conn.run_sync(_migrate_users_columns_sync)
        else:
            await conn.run_sync(_migrate_postgres_columns_sync)


async def close_db():
    """
    Close database connections.
    """
    await engine.dispose()
    logger.info("Database connections closed")
