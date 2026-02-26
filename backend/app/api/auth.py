"""
Authentication endpoints: login, signup, register-society, me, logout.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.society import Society
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest, RegisterSocietyRequest
from app.services.auth_service import (
    login as auth_login,
    signup as auth_signup,
    register_society as auth_register_society,
    _user_to_response,
)

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


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email and password. Returns user, society, access_token."""
    try:
        user, society, token = await auth_login(db, body.email, body.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    user_data = _user_to_response(user, society)
    return JSONResponse(
        content={
            "user": user_data,
            "society": {"id": str(society.id), "slug": society.slug, "name": society.name} if society else None,
            "access_token": token,
            "token_type": "bearer",
        }
    )


@router.post("/signup")
async def signup(body: SignupRequest, db: AsyncSession = Depends(get_db)):
    """Sign up as guard or resident in an existing society (by society code/slug)."""
    try:
        user, society, token = await auth_signup(
            db,
            email=body.email,
            password=body.password,
            full_name=body.full_name,
            role=body.role,
            society_slug=body.society_slug,
            building_id=body.building_id,
            phone=body.phone,
            flat_number=body.flat_number,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    user_data = _user_to_response(user, society)
    return JSONResponse(
        content={
            "user": user_data,
            "society": {"id": str(society.id), "slug": society.slug, "name": society.name},
            "access_token": token,
            "token_type": "bearer",
        }
    )


@router.post("/register-society")
async def register_society(body: RegisterSocietyRequest, db: AsyncSession = Depends(get_db)):
    """Register a new society and create the first admin user."""
    buildings = [{"name": b.name, "code": b.code} for b in (body.buildings or [])]
    try:
        user, society, token = await auth_register_society(
            db,
            society_name=body.society_name,
            society_slug=body.society_slug,
            address=body.address,
            city=body.city,
            state=body.state,
            pincode=body.pincode,
            country=body.country or "India",
            contact_email=body.contact_email,
            contact_phone=body.contact_phone,
            registration_number=body.registration_number,
            society_type=body.society_type,
            registration_year=body.registration_year,
            buildings=buildings if buildings else None,
            email=body.email,
            password=body.password,
            full_name=body.full_name,
            phone=body.phone,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        from sqlalchemy.exc import IntegrityError, OperationalError
        if isinstance(e, IntegrityError):
            msg = str(e.orig).lower() if getattr(e, "orig", None) else ""
            if "societies.slug" in msg or "slug" in msg:
                detail = "A society with this name (or code) already exists. Try a different society name."
            elif "users.email" in msg or "email" in msg:
                detail = "This email is already registered. Use a different email or log in."
            else:
                detail = "Email or society code already in use. Try a different email or society code."
            detail += " Data is stored in backend/vms.db unless you set DATABASE_URL to Supabase."
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
        if isinstance(e, OperationalError):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database schema may be outdated. Try deleting vms.db and restarting the server.",
            )
        import structlog
        structlog.get_logger().error("register_society failed", error=str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again or contact support.",
        )
    user_data = _user_to_response(user, society)
    return JSONResponse(
        content={
            "user": user_data,
            "society": {"id": str(society.id), "slug": society.slug, "name": society.name},
            "access_token": token,
            "token_type": "bearer",
        }
    )


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Get current authenticated user information.
    Includes society_id and society when user belongs to a society.
    """
    roles = current_user.get("realm_access", {}).get("roles", [])
    user_id = current_user.get("sub") or current_user.get("user_id")
    society_id = current_user.get("society_id")
    payload = {
        "user_id": user_id,
        "id": user_id,
        "email": current_user.get("email"),
        "roles": roles,
        "role": _primary_role(roles),
        "username": current_user.get("preferred_username"),
        "society_id": society_id,
        "building_id": current_user.get("building_id"),
    }
    # Load society and user details from DB when available
    if user_id and society_id:
        from uuid import UUID
        try:
            result = await db.execute(select(User).where(User.id == UUID(user_id)))
            user = result.scalar_one_or_none()
            if user:
                result = await db.execute(select(Society).where(Society.id == user.society_id))
                society = result.scalar_one_or_none()
                if society:
                    payload["society"] = {"id": str(society.id), "slug": society.slug, "name": society.name}
                payload["flat_number"] = user.flat_number
                payload["phone"] = user.phone
        except (ValueError, TypeError):
            pass
    return JSONResponse(content=payload)


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout endpoint (client should discard token).
    """
    return JSONResponse(content={"message": "Logged out successfully"})
