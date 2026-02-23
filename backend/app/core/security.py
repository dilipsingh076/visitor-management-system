"""
Security utilities for JWT validation with Keycloak.
"""
from typing import Dict, Optional
from jose import jwt, JWTError
from jose.constants import ALGORITHMS
import httpx
import structlog

from app.core.config import settings

logger = structlog.get_logger()

# Cache for Keycloak public key
_keycloak_public_key: Optional[str] = None


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


async def verify_token(token: str) -> Dict:
    """
    Verify JWT token from Keycloak.
    """
    try:
        # Decode without verification first to get header
        unverified = jwt.get_unverified_header(token)
        
        # For production, use JWKS endpoint properly
        # For now, decode with options to skip signature verification in dev
        # TODO: Implement proper JWKS verification
        
        payload = jwt.decode(
            token,
            key="",
            options={"verify_signature": False},  # TODO: Enable when Keycloak is running
            audience=settings.JWT_AUDIENCE,
            algorithms=[settings.JWT_ALGORITHM],
        )
        
        return payload
    except JWTError as e:
        logger.error("JWT verification failed", error=str(e))
        raise ValueError(f"Invalid token: {str(e)}")
