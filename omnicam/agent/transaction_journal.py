"""Bounded, process-local idempotency and outcome recovery for Agent writes.

Never evict an unexpired intent to admit a new one: rejecting capacity is
safer than allowing a retry to apply twice. Restart invalidates the session.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import time
from dataclasses import dataclass
from typing import Any

from .protocol import AgentProtocolError, bounded_string

TRANSACTION_TTL_SECONDS = 120.0
MAX_TRANSACTION_RECORDS = 128


@dataclass(slots=True)
class TransactionRecord:
    session_id: str
    transaction_id: str
    validate_only: bool
    fingerprint: str
    request_id: str
    future: asyncio.Future[dict[str, Any]]
    created_at: float
    status: str = "pending"
    result: dict[str, Any] | None = None


class TransactionJournal:
    def __init__(self) -> None:
        self.records: dict[tuple[str, str, bool], TransactionRecord] = {}

    def prune(self) -> None:
        now = time.monotonic()
        for key, record in list(self.records.items()):
            if now - record.created_at > TRANSACTION_TTL_SECONDS:
                self.records.pop(key)
                if not record.future.done():
                    record.future.cancel()

    def find(self, session_id: str, payload: dict) -> TransactionRecord | None:
        self.prune()
        tx_id = bounded_string(payload.get("id"), "transaction.id", 120)
        key = (session_id, tx_id, payload.get("validateOnly") is True)
        record = self.records.get(key)
        fingerprint = hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
        if record is not None and record.fingerprint != fingerprint:
            raise AgentProtocolError("TRANSACTION_ID_CONFLICT", "Transaction id was already used for different content", 409)
        return record

    def create(self, session_id: str, payload: dict, request_id: str, future) -> TransactionRecord:
        self.prune()
        if len(self.records) >= MAX_TRANSACTION_RECORDS:
            raise AgentProtocolError("AGENT_BUSY", "Transaction recovery journal is full; wait before submitting new work", 503)
        tx_id = bounded_string(payload.get("id"), "transaction.id", 120)
        record = TransactionRecord(
            session_id, tx_id, payload.get("validateOnly") is True,
            hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()).hexdigest(),
            request_id, future, time.monotonic(),
        )
        self.records[(session_id, tx_id, record.validate_only)] = record
        return record

    def by_request(self, request_id: str) -> TransactionRecord | None:
        self.prune()
        return next((r for r in self.records.values() if r.request_id == request_id), None)

    def status(self, session_id: str, transaction_id: str, validate_only: bool = False) -> dict:
        self.prune()
        record = self.records.get((session_id, transaction_id, validate_only))
        if record is None:
            raise AgentProtocolError("UNKNOWN_TRANSACTION", "No retained outcome; query the scene before issuing a new intent", 404)
        return {"transaction_id": transaction_id, "status": record.status, "result": record.result}

    def drop_session(self, session_id: str) -> None:
        for key, record in list(self.records.items()):
            if record.session_id == session_id:
                self.records.pop(key)
                if not record.future.done():
                    record.future.cancel()
