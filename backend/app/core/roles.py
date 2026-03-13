"""
Real-world roles for VMS: Chairman, Secretary, Treasurer, Resident, Guard.
Committee roles (chairman, secretary, treasurer) have society-admin permissions.
"""
from typing import List

# All roles stored in DB / used in API
ROLE_CHAIRMAN = "chairman"
ROLE_SECRETARY = "secretary"
ROLE_TREASURER = "treasurer"
ROLE_RESIDENT = "resident"
ROLE_GUARD = "guard"
ROLE_PLATFORM_ADMIN = "platform_admin"

# Committee = society management (same permissions as former "admin")
SOCIETY_ADMIN_ROLES: tuple[str, ...] = (ROLE_CHAIRMAN, ROLE_SECRETARY, ROLE_TREASURER)
# Platform admin can manage all societies; "admin" kept for backward compatibility (treat as committee)
ALL_ADMIN_ROLES: tuple[str, ...] = (*SOCIETY_ADMIN_ROLES, ROLE_PLATFORM_ADMIN, "admin")

ALL_ROLES: tuple[str, ...] = (
    ROLE_CHAIRMAN,
    ROLE_SECRETARY,
    ROLE_TREASURER,
    ROLE_RESIDENT,
    ROLE_GUARD,
    ROLE_PLATFORM_ADMIN,
)

# Roles that can be assigned when joining a society (signup) — not committee
JOIN_SOCIETY_ROLES: tuple[str, ...] = (ROLE_GUARD, ROLE_RESIDENT)

# Roles that society admins can assign to users (committee + guard + resident)
ASSIGNABLE_BY_SOCIETY_ADMIN: tuple[str, ...] = (
    ROLE_CHAIRMAN,
    ROLE_SECRETARY,
    ROLE_TREASURER,
    ROLE_GUARD,
    ROLE_RESIDENT,
)

# Roles that can act as resident (host for visitors)
RESIDENT_HOST_ROLES: tuple[str, ...] = (ROLE_RESIDENT, *SOCIETY_ADMIN_ROLES)


def is_society_admin(role: str) -> bool:
    """True if role is Chairman, Secretary, or Treasurer."""
    return role in SOCIETY_ADMIN_ROLES


def is_platform_admin(role: str) -> bool:
    return role == ROLE_PLATFORM_ADMIN


def roles_include_platform_admin(roles: List[str]) -> bool:
    """True if any role in the list is platform_admin."""
    return ROLE_PLATFORM_ADMIN in roles


def is_any_admin(role: str) -> bool:
    """True if role has admin-level access (committee or platform)."""
    return role in ALL_ADMIN_ROLES


def roles_include_any_admin(roles: List[str]) -> bool:
    return any(r in ALL_ADMIN_ROLES for r in roles)


def roles_include_guard_or_admin(roles: List[str]) -> bool:
    return ROLE_GUARD in roles or roles_include_any_admin(roles)


def roles_include_resident_or_admin(roles: List[str]) -> bool:
    return ROLE_RESIDENT in roles or roles_include_any_admin(roles)
