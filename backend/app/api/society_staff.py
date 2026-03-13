"""Society-level Maintenance Staff API for committee members."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.dependencies import get_db, get_current_user_id
from app.core.rbac import require_committee
from app.models import User, MaintenanceStaff, Building
from app.schemas.maintenance_staff import (
    MaintenanceStaffCreate,
    MaintenanceStaffUpdate,
    MaintenanceStaffResponse,
)

router = APIRouter()


async def get_user_society_id(user_id: UUID, db: AsyncSession):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    return user.society_id if user else None


@router.get("", response_model=list[MaintenanceStaffResponse])
async def list_staff(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
    role: str | None = None,
):
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    query = select(MaintenanceStaff).where(
        MaintenanceStaff.society_id == society_id,
        MaintenanceStaff.is_active == True,
    )
    if role:
        query = query.where(MaintenanceStaff.role == role)
    query = query.order_by(MaintenanceStaff.role, MaintenanceStaff.full_name)
    result = await db.execute(query)
    staff_list = result.scalars().all()

    # Resolve building names
    building_ids = {s.building_id for s in staff_list if s.building_id}
    building_map = {}
    if building_ids:
        b_result = await db.execute(select(Building).where(Building.id.in_(building_ids)))
        for b in b_result.scalars().all():
            building_map[b.id] = b.name

    out = []
    for s in staff_list:
        r = MaintenanceStaffResponse.model_validate(s)
        r.building_name = building_map.get(s.building_id) if s.building_id else None
        out.append(r)
    return out


@router.post("", response_model=MaintenanceStaffResponse, status_code=201)
async def create_staff(
    body: MaintenanceStaffCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
):
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    staff = MaintenanceStaff(
        society_id=society_id,
        full_name=body.full_name.strip(),
        role=body.role.strip(),
        phone=body.phone.strip() if body.phone else None,
        email=body.email.strip() if body.email else None,
        building_id=body.building_id,
        notes=body.notes.strip() if body.notes else None,
        is_active=True,
    )
    db.add(staff)
    await db.commit()
    await db.refresh(staff)

    resp = MaintenanceStaffResponse.model_validate(staff)
    if staff.building_id:
        b_result = await db.execute(select(Building).where(Building.id == staff.building_id))
        b = b_result.scalar_one_or_none()
        resp.building_name = b.name if b else None
    return resp


@router.get("/{staff_id}", response_model=MaintenanceStaffResponse)
async def get_staff(
    staff_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
):
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    result = await db.execute(
        select(MaintenanceStaff).where(
            MaintenanceStaff.id == staff_id,
            MaintenanceStaff.society_id == society_id,
        )
    )
    staff = result.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    resp = MaintenanceStaffResponse.model_validate(staff)
    if staff.building_id:
        b_result = await db.execute(select(Building).where(Building.id == staff.building_id))
        b = b_result.scalar_one_or_none()
        resp.building_name = b.name if b else None
    return resp


@router.patch("/{staff_id}", response_model=MaintenanceStaffResponse)
async def update_staff(
    staff_id: UUID,
    body: MaintenanceStaffUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
):
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    result = await db.execute(
        select(MaintenanceStaff).where(
            MaintenanceStaff.id == staff_id,
            MaintenanceStaff.society_id == society_id,
        )
    )
    staff = result.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(staff, key, value)

    await db.commit()
    await db.refresh(staff)

    resp = MaintenanceStaffResponse.model_validate(staff)
    if staff.building_id:
        b_result = await db.execute(select(Building).where(Building.id == staff.building_id))
        b = b_result.scalar_one_or_none()
        resp.building_name = b.name if b else None
    return resp


@router.delete("/{staff_id}", status_code=204)
async def delete_staff(
    staff_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_committee),
    current_user_id: UUID = Depends(get_current_user_id),
):
    society_id = await get_user_society_id(current_user_id, db)
    if not society_id:
        raise HTTPException(status_code=400, detail="User not associated with a society")

    result = await db.execute(
        select(MaintenanceStaff).where(
            MaintenanceStaff.id == staff_id,
            MaintenanceStaff.society_id == society_id,
        )
    )
    staff = result.scalar_one_or_none()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    staff.is_active = False
    await db.commit()
    return None
