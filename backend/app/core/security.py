"""
Security utilities: password hashing, JWT (local + Keycloak).
"""
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
from jose import jwt, JWTError
from jose.constants import ALGORITHMS
import httpx
import structlog
import bcrypt

from app.core.config import settings

logger = structlog.get_logger()

# Local JWT issuer so we can distinguish from Keycloak
LOCAL_JWT_ISSUER = "vms"


def _digest_for_bcrypt(plain: str) -> bytes:
    """Full password → SHA-256 digest (32 bytes). Bcrypt then hashes that; no truncation."""
    raw = (plain or "").encode("utf-8")
    return hashlib.sha256(raw).digest()


def hash_password(plain: str) -> str:
    digest = _digest_for_bcrypt(plain)
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(digest, salt).decode("ascii")


def verify_password(plain: str, hashed: str) -> bool:
    digest = _digest_for_bcrypt(plain)
    try:
        if bcrypt.checkpw(digest, hashed.encode("ascii")):
            return True
        # Backward compat: old hashes were bcrypt(plain); try that once
        raw = (plain or "").encode("utf-8")
        if len(raw) <= 72:
            return bcrypt.checkpw(raw, hashed.encode("ascii"))
    except Exception:
        pass
    return False


def create_access_token(
    user_id: str,
    email: str,
    roles: list[str],
    *,
    society_id: Optional[str] = None,
    building_id: Optional[str] = None,
    full_name: Optional[str] = None,
) -> str:
    """Create a JWT for local auth (login/signup/register-society)."""
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "user_id": str(user_id),
        "email": email,
        "preferred_username": full_name or email.split("@")[0],
        "realm_access": {"roles": roles},
        "iss": LOCAL_JWT_ISSUER,
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    if society_id:
        payload["society_id"] = str(society_id)
    if building_id:
        payload["building_id"] = str(building_id)
    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm="HS256",
    )


async def get_keycloak_public_key() -> str:
    """
    Fetch Keycloak realm public key for JWT verification.
    """
    global _keycloak_public_key
    if _keycloak_public_key:
        return _keycloak_public_key

    try:
        url = f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_REALM}"
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{url}/.well-known/openid-configuration")
            response.raise_for_status()
            config = response.json()
            jwks_url = config["jwks_uri"]

            jwks_response = await client.get(jwks_url)
            jwks_response.raise_for_status()
            jwks = jwks_response.json()

            # Extract public key from JWKS (simplified - use jose for full JWKS support)
            # For production, use python-jose's JWKS support
            _keycloak_public_key = jwks["keys"][0]["x5c"][0] if jwks.get("keys") else None

            if not _keycloak_public_key:
                raise ValueError("Could not extract public key from Keycloak")

            return _keycloak_public_key
    except Exception as e:
        logger.error("Failed to fetch Keycloak public key", error=str(e))
        raise


async def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify JWT: if our local issuer (vms), decode with SECRET_KEY; else Keycloak.
    """
    try:
        unverified = jwt.get_unverified_header(token)
        # Try local JWT first (HS256)
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            if payload.get("iss") == LOCAL_JWT_ISSUER:
                # Normalize for dependencies: sub, user_id, realm_access.roles, society_id
                if "user_id" not in payload and "sub" in payload:
                    payload["user_id"] = payload["sub"]
                return payload
        except JWTError:
            pass
        # Keycloak / external JWT (existing behavior)
        payload = jwt.decode(
            token,
            key="",
            options={"verify_signature": False},
            audience=settings.JWT_AUDIENCE,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError as e:
        logger.error("JWT verification failed", error=str(e))
        raise ValueError(f"Invalid token: {str(e)}")
