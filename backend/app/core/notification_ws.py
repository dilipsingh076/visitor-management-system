"""
WebSocket connection manager for real-time notifications.
Stores connections per user_id and broadcasts notification payloads to connected clients.
"""
import asyncio
import json
from uuid import UUID
from typing import Optional
from starlette.websockets import WebSocket

# In-memory: user_id -> list of WebSocket connections
_connections: dict[UUID, list[WebSocket]] = {}
# Track user metadata for scoped broadcasts
_user_society: dict[UUID, UUID] = {}
_user_role: dict[UUID, str] = {}
_lock = asyncio.Lock()

STAFF_ROLES = {"guard", "admin", "chairman", "secretary", "treasurer", "committee", "super_admin"}


async def register(
    websocket: WebSocket,
    user_id: UUID,
    society_id: Optional[UUID] = None,
    role: Optional[str] = None,
) -> None:
    """Register a WebSocket for the given user."""
    async with _lock:
        if user_id not in _connections:
            _connections[user_id] = []
        _connections[user_id].append(websocket)
        if society_id:
            _user_society[user_id] = society_id
        if role:
            _user_role[user_id] = role


async def unregister(websocket: WebSocket, user_id: UUID) -> None:
    """Remove a WebSocket for the given user."""
    async with _lock:
        if user_id in _connections:
            _connections[user_id] = [ws for ws in _connections[user_id] if ws != websocket]
            if not _connections[user_id]:
                del _connections[user_id]
                _user_society.pop(user_id, None)
                _user_role.pop(user_id, None)


async def broadcast_to_user(user_id: UUID, payload: dict) -> None:
    """Send a JSON message to all WebSockets connected for this user."""
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
                _user_society.pop(user_id, None)
                _user_role.pop(user_id, None)


async def broadcast_to_society(society_id: UUID, payload: dict) -> None:
    """Broadcast to all connected users in a society (all roles)."""
    await _broadcast_filtered(society_id, payload, staff_only=False)


async def broadcast_to_society_staff(society_id: UUID, payload: dict) -> None:
    """Broadcast to guards, admins, and committee in a society (not residents)."""
    await _broadcast_filtered(society_id, payload, staff_only=True)


async def broadcast_visit_event(society_id: UUID, host_id: UUID, payload: dict) -> None:
    """
    Broadcast a visit event to:
    - The specific host (resident being visited)
    - All guards/admins/committee in the society
    Other residents are NOT notified.
    """
    async with _lock:
        targets = []
        for uid, socks in _connections.items():
            if _user_society.get(uid) != society_id:
                continue
            # Include the specific host
            if uid == host_id:
                targets.append((uid, list(socks)))
                continue
            # Include staff (guards, admins, committee)
            if _user_role.get(uid, "") in STAFF_ROLES:
                targets.append((uid, list(socks)))
    if not targets:
        return
    text = json.dumps(payload)
    for uid, sockets in targets:
        dead = []
        for ws in sockets:
            try:
                await ws.send_text(text)
            except Exception:
                dead.append(ws)
        if dead:
            async with _lock:
                if uid in _connections:
                    _connections[uid] = [w for w in _connections[uid] if w not in dead]
                    if not _connections[uid]:
                        del _connections[uid]
                        _user_society.pop(uid, None)
                        _user_role.pop(uid, None)


async def _broadcast_filtered(society_id: UUID, payload: dict, staff_only: bool) -> None:
    """Internal: broadcast to society members, optionally staff-only."""
    async with _lock:
        targets = []
        for uid, socks in _connections.items():
            if _user_society.get(uid) != society_id:
                continue
            if staff_only and _user_role.get(uid, "") not in STAFF_ROLES:
                continue
            targets.append((uid, list(socks)))
    if not targets:
        return
    text = json.dumps(payload)
    for uid, sockets in targets:
        dead = []
        for ws in sockets:
            try:
                await ws.send_text(text)
            except Exception:
                dead.append(ws)
        if dead:
            async with _lock:
                if uid in _connections:
                    _connections[uid] = [w for w in _connections[uid] if w not in dead]
                    if not _connections[uid]:
                        del _connections[uid]
                        _user_society.pop(uid, None)
                        _user_role.pop(uid, None)
