"""
Script to add platform_admin role to a user.
Usage: python -m scripts.add_platform_admin <email>
"""
import asyncio
import sys
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

sys.path.insert(0, ".")

from app.core.database import AsyncSessionLocal
from app.models import User


async def add_platform_admin(email: str):
    async with AsyncSessionLocal() as session:
        # Find user
        result = await session.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"User with email '{email}' not found")
            return False
        
        # Get current roles
        current_roles = user.roles or [user.role] if user.role else []
        
        if "platform_admin" in current_roles:
            print(f"User '{email}' already has platform_admin role")
            return True
        
        # Add platform_admin role
        new_roles = list(set(current_roles + ["platform_admin"]))
        user.roles = new_roles
        
        await session.commit()
        print(f"Successfully added platform_admin role to '{email}'")
        print(f"User roles are now: {new_roles}")
        return True


async def list_users():
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User.id, User.email, User.full_name, User.role, User.roles).limit(20)
        )
        users = result.all()
        
        print("\nExisting users:")
        print("-" * 80)
        for user in users:
            print(f"  Email: {user.email}, Name: {user.full_name}, Role: {user.role}, Roles: {user.roles}")
        print("-" * 80)


async def reset_password(email: str, new_password: str):
    from app.core.security import hash_password
    
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"User with email '{email}' not found")
            return False
        
        user.password_hash = hash_password(new_password)
        await session.commit()
        print(f"Password reset successfully for '{email}'")
        return True


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python -m scripts.add_platform_admin <email>                    - Add platform_admin role")
        print("  python -m scripts.add_platform_admin <email> --reset <password> - Reset password")
        print("\nListing existing users...")
        asyncio.run(list_users())
        sys.exit(1)
    
    email = sys.argv[1]
    
    if len(sys.argv) >= 4 and sys.argv[2] == "--reset":
        new_password = sys.argv[3]
        asyncio.run(reset_password(email, new_password))
    else:
        asyncio.run(add_platform_admin(email))
