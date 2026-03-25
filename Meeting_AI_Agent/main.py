from contextlib import asynccontextmanager

from fastapi import FastAPI

from db.database import init_db
from rag.embeddings import vector_store
from api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    vector_store.load()
    yield


app = FastAPI(
    title="Meeting AI Agent",
    description="AI-powered meeting assistant for creating, summarizing, and querying meetings.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(router)
