"""Database types compatible with SQLite and PostgreSQL."""
import uuid
from sqlalchemy import TypeDecorator, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID


class GUID(TypeDecorator):
    """UUID: native UUID on PostgreSQL (Supabase), String(36) on SQLite."""
    impl = String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        u = value if isinstance(value, uuid.UUID) else uuid.UUID(value)
        if dialect.name == "postgresql":
            return u
        return str(u)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(value)
