"""
Users API: list and create users in current user's society (admin only).
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user, get_current_admin, get_current_user_id
from app.core.roles import SOCIETY_ADMIN_ROLES, JOIN_SOCIETY_ROLES
from app.models.user import User
from app.core.security import hash_password

router = APIRouter()

# Committee can assign only these; resident/guard are assigned via signup only
COMMITTEE_ASSIGNABLE_ROLES = frozenset(SOCIETY_ADMIN_ROLES)


def _user_roles(u: User) -> list[str]:
    """Return list of roles for user; supports legacy single role."""
    if u.roles and isinstance(u.roles, list) and len(u.roles) > 0:
        return [str(r) for r in u.roles]
    return [u.role] if u.role else []


class CreateUserRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1)
    role: str = Field(..., pattern="^(chairman|secretary|treasurer|guard|resident)$")
    password: str = Field(..., min_length=6)
    phone: str | None = None
    flat_number: str | None = None


class UpdateUserRequest(BaseModel):
    """Committee can update roles (committee roles only) and profile. Resident/guard only via signup."""
    roles: list[str] | None = None  # committee can set chairman/secretary/treasurer; resident/guard preserved from existing
    full_name: str | None = Field(None, min_length=1)
    phone: str | None = None
    flat_number: str | None = None


@router.get("/")
async def list_users(
    role: str | None = Query(None),
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    List users in current user's society. Admin only.
    If token has no society_id, resolve it from the current user's DB record.
    """
    society_id = current_user.get("society_id")
    if not society_id:
        user_id_raw = current_user.get("user_id") or current_user.get("sub")
        if user_id_raw:
            try:
                uid = UUID(user_id_raw)
                result = await db.execute(select(User).where(User.id == uid))
                db_user = result.scalar_one_or_none()
                if db_user and db_user.society_id:
                    society_id = str(db_user.society_id)
            except (ValueError, TypeError):
                pass
    if not society_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No society context. Try logging in again.")
    try:
        sid = UUID(society_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid society context")
    q = select(User).where(User.society_id == sid, User.is_active == True).order_by(User.full_name)
    result = await db.execute(q)
    users = result.scalars().all()
    # Filter by role if requested (match any of user's roles)
    if role and role.strip():
        r = role.strip()
        users = [u for u in users if r in _user_roles(u)]
    return JSONResponse(
        content=[
            {
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "username": u.full_name,
                "role": _user_roles(u)[0] if _user_roles(u) else u.role,
                "roles": _user_roles(u),
                "phone": u.phone,
                "flat_number": u.flat_number,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "last_login": u.last_login.isoformat() if u.last_login else None,
            }
            for u in users
        ]
    )


@router.post("/")
async def create_user(
    body: CreateUserRequest,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a user (admin, guard, or resident) in current user's society. Admin only.
    """
    society_id = current_user.get("society_id")
    if not society_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No society context")
    try:
        sid = UUID(society_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid society context")
    result = await db.execute(select(User).where(User.email == body.email.strip().lower()))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(
        email=body.email.strip().lower(),
        full_name=body.full_name.strip(),
        phone=body.phone.strip() if body.phone else None,
        flat_number=body.flat_number.strip() if body.flat_number else None,
        role=body.role,
        roles=[body.role],
        is_active=True,
        password_hash=hash_password(body.password),
        society_id=sid,
        keycloak_id=None,
    )
    db.add(user)
    await db.flush()
    roles = _user_roles(user)
    return JSONResponse(
        content={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "username": user.full_name,
            "role": roles[0] if roles else user.role,
            "roles": roles,
            "phone": user.phone,
            "flat_number": user.flat_number,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        },
        status_code=status.HTTP_201_CREATED,
    )


@router.patch("/{user_id}")
async def update_user(
    user_id: str,
    body: UpdateUserRequest,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Update a user in current user's society (role, name, phone, flat).
    Committee only. Target user must belong to the same society.
    """
    society_id = current_user.get("society_id")
    if not society_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No society context")
    try:
        sid = UUID(society_id)
        uid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user or society id")
    result = await db.execute(select(User).where(User.id == uid, User.society_id == sid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found in your society")
    if body.roles is not None:
        # Committee can only assign chairman/secretary/treasurer; resident/guard stay from existing (signup-only)
        allowed = COMMITTEE_ASSIGNABLE_ROLES | set(JOIN_SOCIETY_ROLES)
        valid_roles = [r for r in body.roles if r in allowed]
        existing = _user_roles(user)
        signup_roles = [r for r in existing if r in JOIN_SOCIETY_ROLES]
        committee_roles = [r for r in valid_roles if r in COMMITTEE_ASSIGNABLE_ROLES]
        new_roles = list(dict.fromkeys(committee_roles + signup_roles))
        if not new_roles:
            new_roles = [existing[0]] if existing else [user.role]
        user.roles = new_roles
        user.role = new_roles[0]
    if body.full_name is not None:
        user.full_name = body.full_name.strip()
    if body.phone is not None:
        user.phone = body.phone.strip() or None
    if body.flat_number is not None:
        user.flat_number = body.flat_number.strip() or None
    db.add(user)
    await db.flush()
    roles = _user_roles(user)
    return JSONResponse(
        content={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "username": user.full_name,
            "role": roles[0] if roles else user.role,
            "roles": roles,
            "phone": user.phone,
            "flat_number": user.flat_number,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
        }
    )
