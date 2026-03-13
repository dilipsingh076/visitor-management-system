"""
Platform Admin Settings & Announcements API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from app.core.dependencies import get_db, get_current_user_id
from app.core.rbac import log_admin_action
from app.api.admin import require_platform_admin
from app.models import Society, User
from app.models.platform import PlatformAnnouncement, SystemSetting
from app.schemas.platform import (
    AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse,
    SystemSettingUpdate, SystemSettingResponse, SystemSettingBulkUpdate,
)

router = APIRouter()


# ============== Announcements ==============

@router.get("/announcements", response_model=List[AnnouncementResponse])
async def list_announcements(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    include_inactive: bool = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """List all platform announcements."""
    query = select(PlatformAnnouncement)
    if not include_inactive:
        query = query.where(PlatformAnnouncement.is_active == True)

    offset = (page - 1) * page_size
    query = query.order_by(desc(PlatformAnnouncement.created_at)).offset(offset).limit(page_size)
    result = await db.execute(query)
    announcements = result.scalars().all()

    # Get society names
    society_ids = set(a.target_society_id for a in announcements if a.target_society_id)
    society_map = {}
    if society_ids:
        soc_result = await db.execute(select(Society).where(Society.id.in_(society_ids)))
        for s in soc_result.scalars().all():
            society_map[s.id] = s.name

    items = []
    for a in announcements:
        item = AnnouncementResponse(
            id=a.id,
            title=a.title,
            content=a.content,
            type=a.type,
            target_audience=a.target_audience,
            target_society_id=a.target_society_id,
            is_active=a.is_active,
            show_from=a.show_from,
            show_until=a.show_until,
            created_by=a.created_by,
            created_at=a.created_at,
            updated_at=a.updated_at,
            target_society_name=society_map.get(a.target_society_id) if a.target_society_id else None,
        )
        items.append(item)

    return items


@router.post("/announcements", response_model=AnnouncementResponse)
async def create_announcement(
    announcement: AnnouncementCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Create a new platform announcement."""
    new_announcement = PlatformAnnouncement(
        **announcement.model_dump(),
        created_by=current_user_id,
    )
    db.add(new_announcement)
    await db.commit()
    await db.refresh(new_announcement)

    await log_admin_action(
        db, current_user_id, current_user,
        "create_announcement", request.url.path, request.method,
        {"announcement_id": str(new_announcement.id), "title": new_announcement.title},
    )

    return AnnouncementResponse(
        id=new_announcement.id,
        title=new_announcement.title,
        content=new_announcement.content,
        type=new_announcement.type,
        target_audience=new_announcement.target_audience,
        target_society_id=new_announcement.target_society_id,
        is_active=new_announcement.is_active,
        show_from=new_announcement.show_from,
        show_until=new_announcement.show_until,
        created_by=new_announcement.created_by,
        created_at=new_announcement.created_at,
        updated_at=new_announcement.updated_at,
    )


@router.get("/announcements/{announcement_id}", response_model=AnnouncementResponse)
async def get_announcement(
    announcement_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
):
    """Get an announcement by ID."""
    result = await db.execute(
        select(PlatformAnnouncement).where(PlatformAnnouncement.id == announcement_id)
    )
    announcement = result.scalar_one_or_none()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    society_name = None
    if announcement.target_society_id:
        soc = await db.execute(select(Society).where(Society.id == announcement.target_society_id))
        society = soc.scalar_one_or_none()
        if society:
            society_name = society.name

    return AnnouncementResponse(
        id=announcement.id,
        title=announcement.title,
        content=announcement.content,
        type=announcement.type,
        target_audience=announcement.target_audience,
        target_society_id=announcement.target_society_id,
        is_active=announcement.is_active,
        show_from=announcement.show_from,
        show_until=announcement.show_until,
        created_by=announcement.created_by,
        created_at=announcement.created_at,
        updated_at=announcement.updated_at,
        target_society_name=society_name,
    )


@router.patch("/announcements/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: UUID,
    update: AnnouncementUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Update an announcement."""
    result = await db.execute(
        select(PlatformAnnouncement).where(PlatformAnnouncement.id == announcement_id)
    )
    announcement = result.scalar_one_or_none()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(announcement, key, value)
    announcement.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(announcement)

    await log_admin_action(
        db, current_user_id, current_user,
        "update_announcement", request.url.path, request.method,
        {"announcement_id": str(announcement_id), "updates": update_data},
    )

    return await get_announcement(announcement_id, db, current_user)


@router.delete("/announcements/{announcement_id}")
async def delete_announcement(
    announcement_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Delete (deactivate) an announcement."""
    result = await db.execute(
        select(PlatformAnnouncement).where(PlatformAnnouncement.id == announcement_id)
    )
    announcement = result.scalar_one_or_none()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")

    announcement.is_active = False
    announcement.updated_at = datetime.utcnow()
    await db.commit()

    await log_admin_action(
        db, current_user_id, current_user,
        "delete_announcement", request.url.path, request.method,
        {"announcement_id": str(announcement_id)},
    )

    return {"message": "Announcement deleted", "announcement_id": str(announcement_id)}


# ============== System Settings ==============

@router.get("/settings", response_model=List[SystemSettingResponse])
async def list_system_settings(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    category: Optional[str] = None,
):
    """List all system settings."""
    query = select(SystemSetting).order_by(SystemSetting.category, SystemSetting.key)
    if category:
        query = query.where(SystemSetting.category == category)

    result = await db.execute(query)
    settings = result.scalars().all()

    return [SystemSettingResponse.model_validate(s) for s in settings]


@router.get("/settings/{key}", response_model=SystemSettingResponse)
async def get_system_setting(
    key: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
):
    """Get a system setting by key."""
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")

    return SystemSettingResponse.model_validate(setting)


@router.put("/settings/{key}", response_model=SystemSettingResponse)
async def update_system_setting(
    key: str,
    update: SystemSettingUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Update or create a system setting."""
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
    setting = result.scalar_one_or_none()

    if setting:
        setting.value = update.value
        if update.description:
            setting.description = update.description
        setting.updated_by = current_user_id
        setting.updated_at = datetime.utcnow()
    else:
        setting = SystemSetting(
            key=key,
            value=update.value,
            description=update.description,
            updated_by=current_user_id,
        )
        db.add(setting)

    await db.commit()
    await db.refresh(setting)

    await log_admin_action(
        db, current_user_id, current_user,
        "update_system_setting", request.url.path, request.method,
        {"key": key, "value": update.value},
    )

    return SystemSettingResponse.model_validate(setting)


@router.post("/settings/bulk", response_model=List[SystemSettingResponse])
async def bulk_update_settings(
    bulk: SystemSettingBulkUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Bulk update system settings."""
    updated_settings = []

    for item in bulk.settings:
        key = item.get("key")
        value = item.get("value")
        if not key:
            continue

        result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
        setting = result.scalar_one_or_none()

        if setting:
            setting.value = value
            setting.updated_by = current_user_id
            setting.updated_at = datetime.utcnow()
        else:
            setting = SystemSetting(
                key=key,
                value=value,
                updated_by=current_user_id,
            )
            db.add(setting)

        await db.flush()
        updated_settings.append(setting)

    await db.commit()

    await log_admin_action(
        db, current_user_id, current_user,
        "bulk_update_settings", request.url.path, request.method,
        {"count": len(bulk.settings)},
    )

    # Refresh all settings
    for s in updated_settings:
        await db.refresh(s)

    return [SystemSettingResponse.model_validate(s) for s in updated_settings]


@router.delete("/settings/{key}")
async def delete_system_setting(
    key: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_platform_admin),
    current_user_id: UUID = Depends(get_current_user_id),
):
    """Delete a system setting."""
    result = await db.execute(select(SystemSetting).where(SystemSetting.key == key))
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")

    await db.delete(setting)
    await db.commit()

    await log_admin_action(
        db, current_user_id, current_user,
        "delete_system_setting", request.url.path, request.method,
        {"key": key},
    )

    return {"message": "Setting deleted", "key": key}
