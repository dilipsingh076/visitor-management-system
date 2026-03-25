from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from config import settings

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)


def init_db():
    from db.models import Base
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
