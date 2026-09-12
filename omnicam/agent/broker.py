"""In-memory session broker for OmniCam Agent v1.

A live Director browser registers a session here and receives a bearer
token back. An external Agent process then targets that session with
bounded queries/transactions, which this broker forwards to the exact
browser client id over ComfyUI's existing WebSocket connection
(``PromptServer.instance.send_sync``) and awaits a reply the browser posts
back through ``/reply``.

Nothing here is persisted: a server restart drops every session, and the
browser's heartbeat/re-register loop is expected to recover from that.
"""

from __future__ import annotations

import asyncio
import secrets
import time
import uuid
from dataclasses import dataclass
from typing import Any

from ..comfy_compat.server import PromptServer
from .protocol import (
    AGENT_EVENT,
    AGENT_PROTOCOL,
    AGENT_SCHEMA_VERSION,
    MAX_PENDING_REQUESTS,
    MAX_SESSIONS,
    REQUEST_TIMEOUT_SECONDS,
    SESSION_TTL_SECONDS,
    AgentProtocolError,
)


@dataclass(slots=True)
class AgentSession:
    session_id: str
    token: str
    client_id: str
    node_id: str
    label: str
    director_api: int
    revision: int
    operations: tuple[str, ...]
    queries: tuple[str, ...]
    touched_at: float


@dataclass(slots=True)
class PendingRequest:
    session_id: str
    future: asyncio.Future[dict[str, Any]]


class AgentBroker:
    """Owns every live session and in-flight request. One instance per process."""

    def __init__(self) -> None:
        self._sessions: dict[str, AgentSession] = {}
        self._pending: dict[str, PendingRequest] = {}

    # -- internal ---------------------------------------------------------

    def _prune_expired(self, *, now: float | None = None) -> None:
        now = time.monotonic() if now is None else now
        expired = [sid for sid, session in self._sessions.items() if now - session.touched_at > SESSION_TTL_SECONDS]
        for sid in expired:
            self._drop_session(sid)

    def _drop_session(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)
        stale = [rid for rid, pending in self._pending.items() if pending.session_id == session_id]
        for rid in stale:
            pending = self._pending.pop(rid, None)
            if pending is not None and not pending.future.done():
                pending.future.set_exception(
                    AgentProtocolError("SESSION_CLOSED", "The Director session was closed", 410)
                )

    def require_session(self, session_id: str) -> AgentSession:
        self._prune_expired()
        session = self._sessions.get(session_id)
        if session is None:
            raise AgentProtocolError("UNKNOWN_SESSION", "No such OmniCam Agent session", 404)
        return session

    def verify_token(self, session: AgentSession, token: str) -> None:
        if not secrets.compare_digest(session.token, token):
            raise AgentProtocolError("BAD_SESSION_TOKEN", "Invalid OmniCam Agent session token", 403)

    # -- public API ---------------------------------------------------------

    def register(
        self,
        *,
        client_id: str,
        node_id: str,
        label: str,
        director_api: int,
        revision: int,
        operations: tuple[str, ...],
        queries: tuple[str, ...],
    ) -> AgentSession:
        self._prune_expired()

        # The same browser Director re-registering (a reload, a client id
        # rotation) invalidates whatever session it held before -- there is
        # never more than one live session per (client_id, node_id).
        stale = [
            sid
            for sid, session in self._sessions.items()
            if session.client_id == client_id and session.node_id == node_id
        ]
        for sid in stale:
            self._drop_session(sid)

        if len(self._sessions) >= MAX_SESSIONS:
            raise AgentProtocolError("AGENT_BUSY", "Too many live OmniCam Director sessions", 503)

        session = AgentSession(
            session_id=uuid.uuid4().hex,
            token=secrets.token_hex(32),
            client_id=client_id,
            node_id=node_id,
            label=label,
            director_api=director_api,
            revision=revision,
            operations=operations,
            queries=queries,
            touched_at=time.monotonic(),
        )
        self._sessions[session.session_id] = session
        return session

    def heartbeat(self, session_id: str, token: str, revision: int) -> None:
        session = self.require_session(session_id)
        self.verify_token(session, token)
        session.revision = revision
        session.touched_at = time.monotonic()

    def close(self, session_id: str, token: str) -> None:
        session = self._sessions.get(session_id)
        if session is None:
            return
        self.verify_token(session, token)
        self._drop_session(session_id)

    def list_sessions(self) -> list[dict[str, Any]]:
        self._prune_expired()
        return [
            {
                "session_id": session.session_id,
                "node_id": session.node_id,
                "label": session.label,
                "director_api": session.director_api,
                "revision": session.revision,
                "operations": list(session.operations),
                "queries": list(session.queries),
            }
            for session in self._sessions.values()
        ]

    async def dispatch(self, session_id: str, kind: str, payload: dict[str, Any]) -> dict[str, Any]:
        session = self.require_session(session_id)

        if len(self._pending) >= MAX_PENDING_REQUESTS:
            raise AgentProtocolError("AGENT_BUSY", "Too many OmniCam Agent requests are pending", 503)

        request_id = uuid.uuid4().hex
        loop = asyncio.get_running_loop()
        future: asyncio.Future[dict[str, Any]] = loop.create_future()

        self._pending[request_id] = PendingRequest(session_id=session.session_id, future=future)

        message = {
            "schema_version": AGENT_SCHEMA_VERSION,
            "protocol": AGENT_PROTOCOL,
            "session_id": session.session_id,
            "request_id": request_id,
            "node_id": session.node_id,
            "kind": kind,
            "payload": payload,
        }

        try:
            PromptServer.instance.send_sync(AGENT_EVENT, message, session.client_id)
            return await asyncio.wait_for(future, timeout=REQUEST_TIMEOUT_SECONDS)
        except asyncio.TimeoutError as exc:
            raise AgentProtocolError(
                "AGENT_BROWSER_TIMEOUT", "The live OmniCam Director did not answer in time", 504
            ) from exc
        finally:
            self._pending.pop(request_id, None)

    def reply(self, session_id: str, token: str, request_id: str, result: dict[str, Any]) -> None:
        session = self.require_session(session_id)
        self.verify_token(session, token)

        pending = self._pending.get(request_id)
        if pending is None:
            raise AgentProtocolError("UNKNOWN_REQUEST", "No such pending OmniCam Agent request", 404)
        if pending.session_id != session_id:
            raise AgentProtocolError("REQUEST_SESSION_MISMATCH", "Request does not belong to this Director session", 403)

        if not pending.future.done():
            pending.future.set_result(result)


BROKER = AgentBroker()
