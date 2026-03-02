"""
Dev-only endpoints to seed or test the database.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.services.auth_service import register_society as auth_register_society, _user_to_response

router = APIRouter()


@router.post("/seed-society")
async def seed_society(db: AsyncSession = Depends(get_db)):
    """
    Insert one society, one building, and one admin user into the database.
    POST with no body. Change email in code if you get "Email already registered".
    """
    try:
        user, society, token = await auth_register_society(
            db,
            society_name="Test Society",
            society_slug="test-society",
            address="123 Test Road",
            city="Bharatpur",
            state="Rajasthan",
            pincode="321001",
            country="India",
            contact_email="society@test.com",
            contact_phone="7665135229",
            registration_number=None,
            society_type="cooperative_housing",
            registration_year="2011",
            buildings=[{"name": "Tower A", "code": "TA"}],
            admin_building_index=0,
            email="admin@test.com",
            password="TestPass123!",
            full_name="Test Admin",
            phone="7665135229",
            flat_number="A-101",
        )
        user_data = _user_to_response(user, society)
        return JSONResponse(
            content={
                "message": "Data added to database",
                "user": user_data,
                "society": {"id": str(society.id), "slug": society.slug, "name": society.name},
                "access_token": token,
                "token_type": "bearer",
            },
        )
    except ValueError as e:
        return JSONResponse(status_code=400, content={"detail": str(e)})
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)},
        )
