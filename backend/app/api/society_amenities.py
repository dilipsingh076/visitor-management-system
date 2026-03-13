"""Society-level Amenities API for committee members."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.dependencies import get_db, get_current_user_id
from app.core.rbac import require_committee
from app.models import User, Amenity
from app.schemas.amenity import AmenityCreate, AmenityUpdate, AmenityResponse

router = APIRouter()


async def get_user_society_id(user_id: UUID, db: AsyncSession):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    return user.society_id if user else None


@router.get("", response_model=list[AmenityResponse])
async def list_amenities(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
    status: str | None = None,
):
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    query = select(Amenity).where(Amenity.society_id == society_id, Amenity.is_active == True)
    if status:
        query = query.where(Amenity.status == status)
    query = query.order_by(Amenity.sort_order, Amenity.name)
    result = await db.execute(query)
    amenities = result.scalars().all()
    return [AmenityResponse.model_validate(a) for a in amenities]


@router.post("", response_model=AmenityResponse, status_code=201)
async def create_amenity(
    body: AmenityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
):
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    amenity = Amenity(
        society_id=society_id,
        name=body.name.strip(),
        code=body.code.strip() if body.code else None,
        description=body.description.strip() if body.description else None,
        status=body.status or "operational",
        sort_order=body.sort_order or 0,
        is_active=True,
    )
    db.add(amenity)
    await db.commit()
    await db.refresh(amenity)
    return AmenityResponse.model_validate(amenity)


@router.get("/{amenity_id}", response_model=AmenityResponse)
async def get_amenity(
    amenity_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
):
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    result = await db.execute(
        select(Amenity).where(Amenity.id == amenity_id, Amenity.society_id == society_id)
    )
    amenity = result.scalar_one_or_none()
    if not amenity:
        raise HTTPException(status_code=404, detail="Amenity not found")
    return AmenityResponse.model_validate(amenity)


@router.patch("/{amenity_id}", response_model=AmenityResponse)
async def update_amenity(
    amenity_id: UUID,
    body: AmenityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
):
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    result = await db.execute(
        select(Amenity).where(Amenity.id == amenity_id, Amenity.society_id == society_id)
    )
    amenity = result.scalar_one_or_none()
    if not amenity:
        raise HTTPException(status_code=404, detail="Amenity not found")

    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(amenity, key, value)

    await db.commit()
    await db.refresh(amenity)
    return AmenityResponse.model_validate(amenity)


@router.delete("/{amenity_id}", status_code=204)
async def delete_amenity(
    amenity_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
):
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    result = await db.execute(
        select(Amenity).where(Amenity.id == amenity_id, Amenity.society_id == society_id)
    )
    amenity = result.scalar_one_or_none()
    if not amenity:
        raise HTTPException(status_code=404, detail="Amenity not found")

    amenity.is_active = False
    await db.commit()
    return None
