"""
Authentication endpoints: login, signup, register-society, me, logout.
"""
import hashlib
import structlog
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.society import Society
from app.schemas.auth import LoginRequest, SignupRequest, RegisterSocietyRequest, RefreshTokenRequest
from app.services.auth_service import (
    login as auth_login,
    signup as auth_signup,
    register_society as auth_register_society,
    _user_to_response,
)
from app.services.refresh_token_service import rotate_refresh_token, revoke_all_for_user
from app.core.security import create_access_token

router = APIRouter()


def _primary_role(roles: list) -> str:
    """Return single assigned/primary role for display. Order: platform_admin > chairman > secretary > treasurer > guard > resident. 'admin' mapped to chairman for backward compat."""
    if not roles:
        return "resident"
    for r in ("platform_admin", "chairman", "secretary", "treasurer", "guard", "resident"):
        if r in roles:
            return r
    if "admin" in roles:
        return "chairman"  # backward compat: old admin → chairman for display
    return roles[0] if roles else "resident"


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email and password. Returns user, society, access_token, refresh_token."""
    try:
        user, society, token, refresh_token = await auth_login(db, body.email, body.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    user_data = _user_to_response(user, society)
    return JSONResponse(
        content={
            "user": user_data,
            "society": {"id": str(society.id), "slug": society.slug, "name": society.name} if society else None,
            "access_token": token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
    )


@router.post("/signup")
async def signup(body: SignupRequest, db: AsyncSession = Depends(get_db)):
    """Sign up as guard or resident in an existing society (by society code/slug)."""
    try:
        user, society, token, refresh_token = await auth_signup(
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
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
    )


@router.get("/register-society/check")
async def register_society_check():
    """Debug: GET to verify API is reachable (e.g. from frontend at localhost:3000). Returns 200."""
    return JSONResponse(content={"ok": True, "message": "Register-society API is reachable"})

@router.post("/register-society")
async def register_society(body: RegisterSocietyRequest, db: AsyncSession = Depends(get_db)):
    """
    Register a new society and create the first admin user.
    Flow: validate buildings -> auth_register_society (society + buildings + admin user) -> return user + token.
    Errors: 400 (validation, duplicate slug/email), 500 (DB/server). All responses include JSON body with 'detail' on error.
    """
    log = structlog.get_logger()
    log.info("register_society: request received", society_name=body.society_name, email=body.email)
    buildings = [{"name": b.name, "code": b.code} for b in (body.buildings or [])]
    if not buildings or not any((b.get("name") or "").strip() for b in buildings):
        log.warning("register_society: validation failed", reason="no_buildings")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one building (name) is required. Add a building in step 4.",
        )
    log.info("register_society: calling auth_register_society", buildings_count=len(buildings))
    try:
        user, society, token, refresh_token = await auth_register_society(
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
            buildings=buildings,
            admin_building_index=body.admin_building_index if body.admin_building_index is not None else 0,
            email=body.email,
            password=body.password,
            full_name=body.full_name,
            phone=body.phone,
            flat_number=body.flat_number,
        )
    except ValueError as e:
        log.warning("register_society: ValueError", detail=str(e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        log.error(
            "register_society: exception",
            error=str(e),
            error_type=type(e).__name__,
            exc_info=True,
        )
        from sqlalchemy.exc import IntegrityError, OperationalError
        if isinstance(e, IntegrityError):
            msg = str(getattr(e, "orig", e)).lower()
            if "societies.slug" in msg or "slug" in msg:
                detail = "A society with this name (or code) already exists. Try a different society name."
            elif "users.email" in msg or "email" in msg:
                detail = "This email is already registered. Use a different email or log in."
            else:
                detail = "Email or society code already in use. Try a different email or society code."
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
        if isinstance(e, OperationalError):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}",
            )
        detail_msg = str(e)
        log.error("register_society: returning 500", detail=detail_msg)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail_msg,
        )
    log.info("register_society: success", society_id=str(society.id), user_id=str(user.id))
    user_data = _user_to_response(user, society)
    return JSONResponse(
        status_code=200,
        content={
            "user": user_data,
            "society": {"id": str(society.id), "slug": society.slug, "name": society.name},
            "access_token": token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        },
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
    # Load society and user details from DB when available (use DB role as primary)
    if user_id and society_id:
        from uuid import UUID
        try:
            result = await db.execute(select(User).where(User.id == UUID(user_id)))
            user = result.scalar_one_or_none()
            if user:
                # Use DB roles (supports multiple roles); primary = first
                from app.api.users import _user_roles
                roles = _user_roles(user)
                payload["roles"] = roles
                payload["role"] = "chairman" if user.role == "admin" else (roles[0] if roles else user.role)
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
async def logout(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """
    Logout endpoint (client should discard token).
    """
    # Revoke all refresh tokens for this user (local-auth only).
    user_id = current_user.get("sub") or current_user.get("user_id")
    if user_id:
        from uuid import UUID
        try:
            result = await db.execute(select(User).where(User.id == UUID(user_id)))
            user = result.scalar_one_or_none()
            if user:
                await revoke_all_for_user(db, user)
        except Exception:
            # Best-effort; do not fail logout on DB issues
            pass
    return JSONResponse(content={"message": "Logged out successfully"})


@router.post("/refresh")
async def refresh_token(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db), request: Request = None):
    """
    Exchange a refresh token for a new access token (and rotated refresh token).
    """
    token = (body.refresh_token or "").strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="refresh_token is required")

    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    user_agent = request.headers.get("user-agent") if request else None
    ip_address = request.client.host if request and request.client else None

    user, new_refresh = await rotate_refresh_token(
        db,
        token_hash,
        user_agent=user_agent,
        ip_address=ip_address,
    )
    if not user or not new_refresh:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    # New access token based on current user roles/society
    roles = _user_to_response(user).get("roles", [])
    access = create_access_token(
        user_id=str(user.id),
        email=user.email,
        roles=roles,
        society_id=str(user.society_id) if user.society_id else None,
        building_id=str(user.building_id) if user.building_id else None,
        full_name=user.full_name,
    )
    return JSONResponse(
        content={
            "access_token": access,
            "refresh_token": new_refresh,
            "token_type": "bearer",
        }
    )
