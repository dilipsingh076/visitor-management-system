"""Pydantic schemas for auth endpoints."""
from typing import Annotated
from pydantic import BaseModel, EmailStr, Field, field_validator


def _coerce_optional_str(v):
    """Coerce int/float to str; treat empty string as None for optional fields."""
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return str(v).strip() or None
    s = (v or "").strip()
    return s if s else None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1)
    role: str = Field(..., pattern="^(guard|resident)$")
    society_slug: str = Field(..., min_length=1)
    building_id: str | None = None
    phone: str | None = None
    flat_number: str | None = None


class RegisterSocietyBuilding(BaseModel):
    name: str = Field(..., min_length=1)
    code: str | None = None


class RegisterSocietyRequest(BaseModel):
    society_name: str = Field(..., min_length=1)
    society_slug: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    country: str | None = "India"
    contact_email: EmailStr
    contact_phone: str | None = None
    # Official / document-related (optional; helps verify society)
    registration_number: str | None = None
    society_type: str | None = None
    registration_year: str | None = None
    buildings: list[RegisterSocietyBuilding] | None = None
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1)
    phone: str | None = None
    flat_number: str | None = None  # First admin's flat (e.g. "1201")

    @field_validator(
        "society_slug", "address", "city", "state", "pincode", "country",
        "contact_phone", "registration_number", "society_type", "registration_year", "phone", "flat_number",
        mode="before",
    )
    @classmethod
    def optional_str_to_none(cls, v):
        return _coerce_optional_str(v)
