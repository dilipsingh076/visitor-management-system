"""Database types compatible with SQLite and PostgreSQL."""
import uuid
from sqlalchemy import TypeDecorator, String


class GUID(TypeDecorator):
    """Stores UUID as string - works with SQLite and PostgreSQL."""
    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(uuid.UUID(value))

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(value)
