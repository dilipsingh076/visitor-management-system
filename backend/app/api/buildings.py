"""
Buildings API: list by society, create (admin of society).
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user, get_current_admin
from app.models.society import Society, Building
from app.models.user import User

router = APIRouter()


class CreateBuildingRequest(BaseModel):
    society_id: str
    name: str = Field(..., min_length=1)
    code: str | None = None
    sort_order: int | None = 0


@router.get("/")
async def list_buildings(
    society_id: str = Query(..., alias="society_id"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List buildings for a society. User must belong to that society (or be super_admin).
    """
    try:
        sid = UUID(society_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid society_id")
    user_society = current_user.get("society_id")
    if user_society and str(sid) != user_society:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to list buildings of another society")
    result = await db.execute(
        select(Building).where(Building.society_id == sid, Building.is_active == True).order_by(Building.sort_order, Building.name)
    )
    buildings = result.scalars().all()
    return JSONResponse(
        content=[
            {
                "id": str(b.id),
                "society_id": str(b.society_id),
                "code": b.code,
                "name": b.name,
                "sort_order": b.sort_order,
                "is_active": b.is_active,
            }
            for b in buildings
        ]
    )


@router.post("/")
async def create_building(
    body: CreateBuildingRequest,
    current_user: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a building in a society. Admin of that society (or super_admin).
    """
    try:
        sid = UUID(body.society_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid society_id")
    user_society = current_user.get("society_id")
    if user_society and str(sid) != user_society:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to add building to another society")
    result = await db.execute(select(Society).where(Society.id == sid))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Society not found")
    building = Building(
        society_id=sid,
        name=body.name.strip(),
        code=body.code.strip() if body.code else None,
        sort_order=body.sort_order if body.sort_order is not None else 0,
        is_active=True,
    )
    db.add(building)
    await db.flush()
    return JSONResponse(
        content={
            "id": str(building.id),
            "society_id": str(building.society_id),
            "code": building.code,
            "name": building.name,
            "sort_order": building.sort_order,
            "is_active": building.is_active,
        },
        status_code=status.HTTP_201_CREATED,
    )
