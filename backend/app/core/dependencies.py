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
from app.core.roles import ALL_ADMIN_ROLES
from app.core.security import verify_token

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
    """Optional auth. Returns None when not authenticated."""

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
    """Get current user from Bearer token."""

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
    Require society-admin or platform-admin role (Chairman, Secretary, Treasurer, or Platform Admin).
    """
    roles = current_user.get("realm_access", {}).get("roles", [])
    if not any(r in roles for r in ALL_ADMIN_ROLES):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Committee or platform admin access required",
        )
    return current_user


async def get_current_guard(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Require guard or committee/platform admin role.
    """
    roles = current_user.get("realm_access", {}).get("roles", [])
    if "guard" not in roles and not any(r in roles for r in ALL_ADMIN_ROLES):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guard or committee access required",
        )
    return current_user


async def get_current_user_id(
    current_user: dict = Depends(get_current_user),
) -> UUID:
    """Return current user's UUID for DB filtering."""
    uid = current_user.get("user_id")
    if uid:
        try:
            return UUID(uid)
        except (ValueError, TypeError):
            pass
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found")


async def get_current_resident(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Require resident or committee/platform admin role.
    """
    roles = current_user.get("realm_access", {}).get("roles", [])
    if "resident" not in roles and not any(r in roles for r in ALL_ADMIN_ROLES):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Resident or committee access required",
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
