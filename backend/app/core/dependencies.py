"""
FastAPI dependencies for database, authentication, etc.
"""
from typing import AsyncGenerator, Optional
from uuid import UUID
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from app.core.config import settings
from app.core.database import get_db_session
from app.core.security import verify_token
from app.db.seed import DEMO_USER_ID

logger = structlog.get_logger()
security = HTTPBearer(auto_error=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Database session dependency.
    """
    async for session in get_db_session():
        yield session


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[dict]:
    """Optional auth - returns demo user when in demo mode."""
    from app.core.config import settings

    if settings.AUTH_DEMO_MODE:
        return {"sub": "demo-user", "email": "demo@vms.local", "preferred_username": "demo"}

    if not credentials:
        return None

    token = credentials.credentials
    try:
        return await verify_token(token)
    except Exception:
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict:
    """Get current user - uses demo user when AUTH_DEMO_MODE."""
    from app.core.config import settings

    if settings.AUTH_DEMO_MODE:
        return {
            "sub": "demo-user",
            "email": "demo@vms.local",
            "preferred_username": "demo",
            "user_id": str(DEMO_USER_ID),
            "realm_access": {"roles": ["resident", "guard", "admin"]},
        }

    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        return await verify_token(credentials.credentials)
    except Exception as e:
        logger.error("Token validation failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_admin(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Require admin role.
    """
    roles = current_user.get("realm_access", {}).get("roles", [])
    if "admin" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


async def get_current_guard(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Require guard or admin role.
    """
    roles = current_user.get("realm_access", {}).get("roles", [])
    if "guard" not in roles and "admin" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guard or admin access required",
        )
    return current_user


async def get_current_user_id(
    current_user: dict = Depends(get_current_user),
) -> UUID:
    """Return current user's UUID for DB filtering. In demo mode returns DEMO_USER_ID."""
    uid = current_user.get("user_id")
    if uid:
        try:
            return UUID(uid)
        except (ValueError, TypeError):
            pass
    sub = current_user.get("sub")
    if settings.AUTH_DEMO_MODE and sub == "demo-user":
        return DEMO_USER_ID
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found")


async def get_current_resident(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Require resident or admin role.
    """
    roles = current_user.get("realm_access", {}).get("roles", [])
    if "resident" not in roles and "admin" not in roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Resident or admin access required",
        )
    return current_user


# Explicit names for RBAC (same behavior as above)
get_current_resident_or_admin = get_current_resident
get_current_guard_or_admin = get_current_guard


async def get_current_any_role(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Any authenticated user. Use sparingly; prefer role-specific dependencies.
    """
    return current_user
