"""
Societies API: by-slug (public for signup), list (authenticated), create (platform/super_admin).
"""
import re
import uuid as uuid_mod
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.models.society import Society, Building

router = APIRouter()


def _slugify(text: str) -> str:
    text = (text or "").strip().lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text).strip("-")
    return text or str(uuid_mod.uuid4())[:8]


class CreateSocietyRequest(BaseModel):
    name: str = Field(..., min_length=1)
    slug: str = Field(..., min_length=1)
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    country: str | None = "India"
    contact_email: EmailStr
    contact_phone: str | None = None


@router.get("/by-slug/{slug}")
async def get_society_by_slug(
    slug: str,
    include_buildings: bool = Query(False, alias="include_buildings"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get society by slug (public). Used for signup flow to resolve society code.
    """
    result = await db.execute(select(Society).where(Society.slug == slug.strip(), Society.is_active == True))
    society = result.scalar_one_or_none()
    if not society:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Society not found")
    out = {"id": str(society.id), "slug": society.slug, "name": society.name}
    if include_buildings:
        result = await db.execute(
            select(Building).where(Building.society_id == society.id, Building.is_active == True).order_by(Building.sort_order, Building.name)
        )
        buildings = result.scalars().all()
        out["buildings"] = [
            {"id": str(b.id), "code": b.code, "name": b.name}
            for b in buildings
        ]
    return JSONResponse(content=out)


@router.get("/")
async def list_societies(
    q: str | None = Query(None, alias="q"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List societies. If user has society_id, return only that society; else return all (super_admin).
    """
    result = await db.execute(select(Society).where(Society.is_active == True).order_by(Society.name))
    societies = result.scalars().all()
    society_id = current_user.get("society_id")
    if society_id:
        try:
            uid = UUID(society_id)
            societies = [s for s in societies if s.id == uid]
        except ValueError:
            societies = []
    if q and q.strip():
        ql = q.strip().lower()
        societies = [s for s in societies if ql in (s.name or "").lower() or ql in (s.slug or "").lower()]
    return JSONResponse(
        content=[
            {
                "id": str(s.id),
                "slug": s.slug,
                "name": s.name,
                "address": s.address,
                "city": s.city,
                "contact_email": s.contact_email,
                "plan": s.plan or "basic",
                "status": s.status or "active",
                "is_active": s.is_active,
            }
            for s in societies
        ]
    )


@router.post("/")
async def create_society(
    body: CreateSocietyRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a society (platform / super_admin only). Use when user has no society_id.
    Does not create first admin; use Register Society flow for that.
    """
    if current_user.get("society_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only platform admin can create societies from here. Use Register Society to create a society with first admin.",
        )
    slug = (body.slug or "").strip().lower().replace(" ", "-") or _slugify(body.name)
    slug = re.sub(r"[^a-z0-9-]", "", slug).strip("-") or "society"
    result = await db.execute(select(Society).where(Society.slug == slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Society with this slug already exists")
    society = Society(
        name=body.name.strip(),
        slug=slug,
        address=body.address.strip() if body.address else None,
        city=body.city.strip() if body.city else None,
        state=body.state.strip() if body.state else None,
        pincode=body.pincode.strip() if body.pincode else None,
        country=(body.country or "India").strip(),
        contact_email=body.contact_email.strip(),
        contact_phone=body.contact_phone.strip() if body.contact_phone else None,
        plan="basic",
        status="active",
        is_active=True,
    )
    db.add(society)
    await db.flush()
    return JSONResponse(
        content={
            "id": str(society.id),
            "slug": society.slug,
            "name": society.name,
            "address": society.address,
            "city": society.city,
            "contact_email": society.contact_email,
            "plan": society.plan or "basic",
            "status": society.status or "active",
            "is_active": society.is_active,
        },
        status_code=status.HTTP_201_CREATED,
    )
