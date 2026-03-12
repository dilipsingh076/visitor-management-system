"""
WebSocket connection manager for real-time notifications.
Stores connections per user_id and broadcasts notification payloads to connected clients.
"""
import asyncio
import json
from uuid import UUID
from starlette.websockets import WebSocket

# In-memory: user_id -> list of WebSocket connections
_connections: dict[UUID, list[WebSocket]] = {}
_lock = asyncio.Lock()


async def register(websocket: WebSocket, user_id: UUID) -> None:
    """Register a WebSocket for the given user."""
    async with _lock:
        if user_id not in _connections:
            _connections[user_id] = []
        _connections[user_id].append(websocket)


async def unregister(websocket: WebSocket, user_id: UUID) -> None:
    """Remove a WebSocket for the given user."""
    async with _lock:
        if user_id in _connections:
            _connections[user_id] = [ws for ws in _connections[user_id] if ws != websocket]
            if not _connections[user_id]:
                del _connections[user_id]


async def broadcast_to_user(user_id: UUID, payload: dict) -> None:
    """
    Send a JSON message to all WebSockets connected for this user.
    Used when a new notification is created for the user.
    """
    async with _lock:
        sockets = list(_connections.get(user_id) or [])
    if not sockets:
        return
    text = json.dumps(payload)
    dead = []
    for ws in sockets:
        try:
            await ws.send_text(text)
        except Exception:
            dead.append(ws)
    if dead:
        async with _lock:
            for ws in dead:
                if user_id in _connections:
                    _connections[user_id] = [w for w in _connections[user_id] if w != ws]
            if user_id in _connections and not _connections[user_id]:
                del _connections[user_id]
