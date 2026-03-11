"""
Users API: list and create users in current user's society (admin only).
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from app.core.dependencies import get_db, get_current_admin
from app.core.roles import SOCIETY_ADMIN_ROLES, JOIN_SOCIETY_ROLES
from app.models.user import User
from app.core.security import hash_password

log = structlog.get_logger()

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
    role: str | None = Query(None, description="Filter by role"),
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    List all users in the current user's society (including chairman).
    Requires committee role (chairman, secretary, treasurer) or platform_admin.
    Society is taken from the JWT (society_id) or from the current user's DB row.
    """
    # 1. Get society_id from token (set at login/register) or from current user's DB row
    sid_str = current_user.get("society_id")
    if sid_str is not None:
        sid_str = str(sid_str).strip() or None
    if not sid_str:
        user_id_raw = current_user.get("user_id") or current_user.get("sub")
        if user_id_raw:
            try:
                row = await db.execute(select(User).where(User.id == UUID(str(user_id_raw))))
                u = row.scalar_one_or_none()
                if u and u.society_id is not None:
                    sid_str = str(u.society_id)
            except (ValueError, TypeError):
                pass
    if not sid_str:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No society. Log in again or ensure your account is linked to a society.",
        )
    sid_str = sid_str.lower()
    try:
        sid = UUID(sid_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid society context")

    # 2. List all active users in this society (raw SQL so society_id filter always works)
    # Postgres: society_id::text; SQLite: society_id is string. Rollback on error so session stays valid.
    rows = []
    try:
        raw_sql = text("""
            SELECT id, email, full_name, phone, flat_number, is_active, role, roles, created_at, last_login
            FROM users
            WHERE society_id::text = :sid AND is_active = true
            ORDER BY full_name
        """)
        result = await db.execute(raw_sql, {"sid": sid_str})
        rows = result.mappings().fetchall()
    except Exception:
        await db.rollback()
        raw_sql = text("""
            SELECT id, email, full_name, phone, flat_number, is_active, role, roles, created_at, last_login
            FROM users
            WHERE society_id = :sid AND is_active = 1
            ORDER BY full_name
        """)
        result = await db.execute(raw_sql, {"sid": sid_str})
        rows = result.mappings().fetchall()

    def _roles_from_row(row) -> list:
        r = row.get("roles")
        if r is not None and isinstance(r, list) and r:
            return [str(x) for x in r]
        role_val = row.get("role")
        return [role_val] if role_val else []

    # 3. Optional role filter
    if role and role.strip():
        r = role.strip().lower()
        rows = [row for row in rows if r in _roles_from_row(row)]

    log.info("list_users", society_id=sid_str, count=len(rows))

    return JSONResponse(
        content=[
            {
                "id": str(row["id"]),
                "email": row["email"],
                "full_name": row["full_name"],
                "username": row["full_name"],
                "role": (_roles_from_row(row)[0] if _roles_from_row(row) else row.get("role") or "resident"),
                "roles": _roles_from_row(row),
                "phone": row.get("phone"),
                "flat_number": row.get("flat_number"),
                "is_active": bool(row.get("is_active", True)),
                "created_at": row["created_at"].isoformat() if row.get("created_at") else None,
                "last_login": row["last_login"].isoformat() if row.get("last_login") else None,
            }
            for row in rows
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
