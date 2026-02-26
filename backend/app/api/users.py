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
from app.models.user import User
from app.core.security import hash_password

router = APIRouter()


class CreateUserRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1)
    role: str = Field(..., pattern="^(admin|guard|resident)$")
    password: str = Field(..., min_length=6)
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
    """
    society_id = current_user.get("society_id")
    if not society_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No society context")
    try:
        sid = UUID(society_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid society context")
    q = select(User).where(User.society_id == sid, User.is_active == True).order_by(User.full_name)
    if role and role.strip():
        q = q.where(User.role == role.strip())
    result = await db.execute(q)
    users = result.scalars().all()
    return JSONResponse(
        content=[
            {
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "username": u.full_name,
                "role": u.role,
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
        is_active=True,
        password_hash=hash_password(body.password),
        society_id=sid,
        keycloak_id=None,
    )
    db.add(user)
    await db.flush()
    return JSONResponse(
        content={
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "username": user.full_name,
            "role": user.role,
            "phone": user.phone,
            "flat_number": user.flat_number,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        },
        status_code=status.HTTP_201_CREATED,
    )
