"""
RBAC helpers: role checks and admin audit logging.
Centralizes authorization logic; use with FastAPI dependencies.
"""
from typing import List, Optional
from uuid import UUID
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.models.audit import AuditLog


def get_roles(current_user: dict) -> List[str]:
    """Extract roles from JWT/demo payload."""
    return current_user.get("realm_access", {}).get("roles", [])


def is_admin(current_user: dict) -> bool:
    return "admin" in get_roles(current_user)


def is_guard_or_admin(current_user: dict) -> bool:
    roles = get_roles(current_user)
    return "guard" in roles or "admin" in roles


def is_resident_or_admin(current_user: dict) -> bool:
    roles = get_roles(current_user)
    return "resident" in roles or "admin" in roles


def require_roles(allowed_roles: List[str]):
    """
    Factory: returns a dependency that requires at least one of the given roles.
    Use: current_user: dict = Depends(require_roles(["guard", "admin"]))
    """

    async def _require_roles(
        current_user: dict = Depends(get_current_user),
    ) -> dict:
        roles = get_roles(current_user)
        if not any(r in roles for r in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not authorized. Required role: one of {allowed_roles}",
            )
        return current_user

    return _require_roles


async def log_admin_action(
    db: AsyncSession,
    user_id: UUID,
    current_user: dict,
    action: str,
    endpoint: str,
    request_method: Optional[str] = None,
    details: Optional[dict] = None,
) -> None:
    """
    Log to audit_logs only when the acting user has admin role.
    Call after successful sensitive operations.
    """
    if not is_admin(current_user):
        return
    entry = AuditLog(
        user_id=user_id,
        action=action,
        endpoint=endpoint,
        request_method=request_method,
        details=details or {},
    )
    db.add(entry)
    await db.flush()
