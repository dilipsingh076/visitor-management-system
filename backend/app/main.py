"""
FastAPI main application entry point.
"""
import traceback
from starlette.types import ASGIApp, Receive, Scope, Send
from starlette.responses import Response
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import structlog

from app.core.config import settings
from app.api import auth, visitors, checkin, health, dashboard, residents, blacklist, notifications, societies, buildings, users

# Configure structured logging
logger = structlog.get_logger()

# Allowed origins: all localhost variants + allow any (reflect request origin for credentials)
CORS_ALLOW_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
]


# With credentials, wildcard Access-Control-Allow-Headers is not allowed; list or reflect.
CORS_ALLOW_HEADERS_DEFAULT = "content-type, authorization, accept, accept-language"

def _cors_headers_for_origin(origin: str | None, allow_headers: str | None = None) -> dict:
    """CORS headers: reflect origin for credentialed requests; allow_headers must be explicit (no *)."""
    allow_origin = origin if origin else "*"
    return {
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": allow_headers or CORS_ALLOW_HEADERS_DEFAULT,
        "Access-Control-Expose-Headers": "*",
    }


class AddCORSMiddleware:
    """ASGI middleware: CORS for all origins (reflect request Origin), OPTIONS, 500 handling."""

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers_list = list(scope.get("headers") or [])
        origin = next((v.decode() for k, v in headers_list if k.lower() == b"origin"), None)
        # Reflect preflight Access-Control-Request-Headers so content-type etc. are allowed (no * with credentials)
        request_headers = next((v.decode() for k, v in headers_list if k.lower() == b"access-control-request-headers"), None)
        allow_headers = request_headers.strip() if request_headers and request_headers.strip() else None

        if scope["method"] == "OPTIONS":
            cors = _cors_headers_for_origin(origin, allow_headers)
            await self._send_response(send, 200, b"", cors)
            return

        headers_sent = False
        cors_headers = _cors_headers_for_origin(origin, allow_headers)

        async def send_wrapper(message):
            nonlocal headers_sent
            if message["type"] == "http.response.start":
                headers_sent = True
                msg_headers = list(message.get("headers", []))
                for k, v in cors_headers.items():
                    msg_headers.append([k.lower().encode(), v.encode()])
                message["headers"] = msg_headers
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        except Exception as exc:
            if not headers_sent:
                logger.error("Unhandled exception", path=scope.get("path"), error=str(exc), traceback=traceback.format_exc())
                body = b'{"detail":"' + str(exc).replace('"', '\\"').encode() + b'","type":"' + type(exc).__name__.encode() + b'"}'
                await self._send_response(send, 500, body, {"content-type": "application/json", **cors_headers})
            else:
                raise

    async def _send_response(self, send: Send, status: int, body: bytes, extra_headers: dict):
        headers = [[k.encode(), v.encode()] if isinstance(v, str) else [k.encode(), v] for k, v in extra_headers.items()]
        await send({"type": "http.response.start", "status": status, "headers": headers})
        await send({"type": "http.response.body", "body": body})


app = FastAPI(
    title="Visitor Management System API",
    description="India-Optimized VMS API with DPDP compliance",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS: single middleware that reflects request Origin (allows any origin + credentials)
app.add_middleware(AddCORSMiddleware)


def _cors_headers(request: Request) -> dict:
    origin = request.headers.get("origin")
    return _cors_headers_for_origin(origin)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return 422 with a readable validation message and CORS headers."""
    errors = exc.errors()
    parts = []
    for e in errors:
        loc = ".".join(str(x) for x in (e.get("loc") or []) if x != "body")
        msg = e.get("msg", "Invalid value")
        if loc:
            parts.append(f"{loc}: {msg}")
        else:
            parts.append(msg)
    detail = "Validation error. " + ("; ".join(parts) if parts else str(exc))
    return JSONResponse(
        status_code=422,
        content={"detail": detail, "errors": errors},
        headers=_cors_headers(request),
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensure 5xx errors return JSON with CORS headers; log full traceback."""
    logger.error("Unhandled exception", path=request.url.path, error=str(exc), traceback=traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__},
        headers=_cors_headers(request),
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
app.include_router(societies.router, prefix="/api/v1/societies", tags=["societies"])
app.include_router(buildings.router, prefix="/api/v1/buildings", tags=["buildings"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])


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
        from app.core.database import init_db, AsyncSessionLocal
        from app.db.seed import ensure_demo_society, ensure_demo_users
        await init_db()
        logger.info("Database initialized")
        if settings.AUTH_DEMO_MODE:
            async with AsyncSessionLocal() as session:
                await ensure_demo_society(session)
                await ensure_demo_users(session)
                await session.commit()
            logger.info("Demo society and users ensured")
    except Exception as e:
        logger.warning("Database init skipped", error=str(e))
    logger.info("Starting VMS API", version="1.0.0")


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler."""
    logger.info("Shutting down VMS API")
