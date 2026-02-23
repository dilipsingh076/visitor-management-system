"""
FastAPI main application entry point.
"""
import traceback
from starlette.types import ASGIApp, Receive, Scope, Send
from starlette.responses import Response
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog

from app.core.config import settings
from app.api import auth, visitors, checkin, health, dashboard, residents, blacklist, notifications

# Configure structured logging
logger = structlog.get_logger()

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Expose-Headers": "*",
}


class AddCORSMiddleware:
    """Pure ASGI middleware - adds CORS to all responses, handles OPTIONS, catches 500s."""

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        if scope["method"] == "OPTIONS":
            await self._send_response(send, 200, b"", {})
            return

        headers_sent = False

        async def send_wrapper(message):
            nonlocal headers_sent
            if message["type"] == "http.response.start":
                headers_sent = True
                msg_headers = list(message.get("headers", []))
                for k, v in CORS_HEADERS.items():
                    msg_headers.append([k.lower().encode(), v.encode()])
                message["headers"] = msg_headers
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        except Exception as exc:
            if not headers_sent:
                logger.error("Unhandled exception", path=scope.get("path"), error=str(exc), traceback=traceback.format_exc())
                body = b'{"detail":"' + str(exc).replace('"', '\\"').encode() + b'","type":"' + type(exc).__name__.encode() + b'"}'
                await self._send_response(send, 500, body, {"content-type": "application/json"})
            else:
                raise

    async def _send_response(self, send: Send, status: int, body: bytes, extra_headers: dict):
        headers = [[k.encode(), v.encode()] if isinstance(v, str) else [k.encode(), v] for k, v in CORS_HEADERS.items()]
        for k, v in extra_headers.items():
            headers.append([k.encode(), v.encode()] if isinstance(v, str) else [k.encode(), v])
        await send({"type": "http.response.start", "status": status, "headers": headers})
        await send({"type": "http.response.body", "body": body})


app = FastAPI(
    title="Visitor Management System API",
    description="India-Optimized VMS API with DPDP compliance",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS - pure ASGI middleware (avoids BaseHTTPMiddleware async issues)
app.add_middleware(AddCORSMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensure 5xx errors return JSON with CORS headers; log full traceback."""
    logger.error("Unhandled exception", path=request.url.path, error=str(exc), traceback=traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__},
        headers=CORS_HEADERS,
    )

# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(visitors.router, prefix="/api/v1/visitors", tags=["visitors"])
app.include_router(checkin.router, prefix="/api/v1/checkin", tags=["check-in"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(residents.router, prefix="/api/v1/residents", tags=["residents"])
app.include_router(blacklist.router, prefix="/api/v1/blacklist", tags=["blacklist"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])


@app.get("/")
async def root():
    """Root endpoint."""
    return JSONResponse(
        content={
            "message": "Visitor Management System API",
            "version": "1.0.0",
            "docs": "/docs",
        }
    )


@app.on_event("startup")
async def startup_event():
    """Startup event handler."""
    try:
        import app.models  # noqa: F401 - ensure all models registered
        from app.core.database import init_db
        await init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.warning("Database init skipped", error=str(e))
    logger.info("Starting VMS API", version="1.0.0")


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler."""
    logger.info("Shutting down VMS API")
