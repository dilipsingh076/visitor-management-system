"""
Health check endpoints.
"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime
import pytz

from app.core.database import engine
from sqlalchemy import text

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    ist = pytz.timezone("Asia/Kolkata")
    return JSONResponse(
        content={
            "status": "healthy",
            "timestamp": datetime.now(ist).isoformat(),
            "timezone": "Asia/Kolkata",
        }
    )


@router.get("/health/db")
async def health_db():
    """
    Check database connectivity.
    """
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return JSONResponse(
            content={"status": "ok", "database": "connected"},
        )
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "database": "disconnected", "detail": str(e)},
        )
