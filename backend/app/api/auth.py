"""
Authentication endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from app.core.dependencies import get_current_user

router = APIRouter()


def _primary_role(roles: list) -> str:
    """Return single assigned/primary role for display. Order: admin > guard > resident."""
    if not roles:
        return "resident"
    if "admin" in roles:
        return "admin"
    if "guard" in roles:
        return "guard"
    if "resident" in roles:
        return "resident"
    return roles[0] if roles else "resident"


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information.
    roles: list of all roles from token/DB.
    role: single primary role for display (admin > guard > resident).
    """
    roles = current_user.get("realm_access", {}).get("roles", [])
    return JSONResponse(
        content={
            "user_id": current_user.get("sub") or current_user.get("user_id"),
            "id": current_user.get("sub") or current_user.get("user_id"),
            "email": current_user.get("email"),
            "roles": roles,
            "role": _primary_role(roles),
            "username": current_user.get("preferred_username"),
        }
    )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout endpoint (client should discard token).
    """
    return JSONResponse(content={"message": "Logged out successfully"})
