"""Small, streaming-safe helpers for JSON request bodies."""

from __future__ import annotations

import json
from typing import Any

from aiohttp import web

_READ_CHUNK_BYTES = 64 * 1024


async def read_bounded_json_object(
    request: web.Request,
    *,
    max_bytes: int,
    allow_empty: bool = False,
) -> dict[str, Any]:
    """Read one JSON object without ever buffering more than ``max_bytes``."""
    declared = request.content_length
    if declared is not None and declared > max_bytes:
        raise web.HTTPRequestEntityTooLarge(max_size=max_bytes, actual_size=declared)
    if not request.can_read_body:
        if allow_empty:
            return {}
        raise web.HTTPBadRequest(text="Expected a JSON object")

    raw = bytearray()
    async for chunk in request.content.iter_chunked(_READ_CHUNK_BYTES):
        next_size = len(raw) + len(chunk)
        if next_size > max_bytes:
            raise web.HTTPRequestEntityTooLarge(max_size=max_bytes, actual_size=next_size)
        raw.extend(chunk)

    if not raw and allow_empty:
        return {}
    try:
        payload = json.loads(bytes(raw))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise web.HTTPBadRequest(text="Expected a JSON object") from exc
    except RecursionError as exc:
        # json.loads recurses per nesting level, so a deeply nested body raises
        # here rather than failing to parse. That is a malformed request, and
        # letting it escape would turn it into a 500.
        raise web.HTTPBadRequest(text="JSON body is nested too deeply") from exc
    if payload is None and allow_empty:
        return {}
    if not isinstance(payload, dict):
        raise web.HTTPBadRequest(text="Expected a JSON object")
    return payload
