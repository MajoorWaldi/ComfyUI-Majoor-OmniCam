"""The reconstruction HTTP surface that survives the queue-only migration.

Scene reconstruction now runs through the Extractor's partial-queue path
(``omnicam/reconstruction/node_bridge.py``); the out-of-queue job scheduler
(``omnicam/reconstruction/jobs/``) is gone. What the panel still needs from the
server is read-only or cache-only:

* ``GET  /majoor/omnicam/reconstruction/capabilities`` -- provider inventory;
* ``DELETE /majoor/omnicam/reconstruction/cache`` -- clear every cached scene
  (also the "free the VRAM" button);
* ``DELETE /majoor/omnicam/reconstruction/cache/{fingerprint}`` -- discard one.
"""

from __future__ import annotations

import logging
from typing import Any

from aiohttp import web

from .capabilities import get_reconstruction_capabilities

logger = logging.getLogger(__name__)

CAPABILITIES_PATH = "/majoor/omnicam/reconstruction/capabilities"
CACHE_PATH = "/majoor/omnicam/reconstruction/cache"


class ReconstructionApiError(Exception):
    """Request validation / handling error with an HTTP status and stable code."""

    def __init__(self, status: int, message: str, *, code: str = "RECON_REQUEST_INVALID") -> None:
        super().__init__(message)
        self.status = int(status)
        self.message = str(message)
        self.code = str(code)

    def to_dict(self) -> dict[str, dict[str, str]]:
        return {"error": {"code": self.code, "message": self.message}}


def handle_clear_cache(input_root: Any = None) -> dict[str, Any]:
    """Delete every cached reconstruction from disk and free the resident weights."""
    from .cache import clear_reconstruction_cache
    from .model_release import release_reconstruction_models

    result = clear_reconstruction_cache(input_root=input_root)
    release_reconstruction_models(reason="clear cache")
    return {
        "cleared": True,
        "entries_removed": result.entries_removed,
        "bytes_freed": result.bytes_freed,
    }


def handle_delete_cache_entry(fingerprint: str, input_root: Any = None) -> dict[str, Any]:
    """Delete one cached reconstruction's ``<fingerprint>/`` folder and free weights."""
    from .cache import delete_reconstruction_cache_entry
    from .model_release import release_reconstruction_models

    try:
        result = delete_reconstruction_cache_entry(str(fingerprint), input_root=input_root)
    except ValueError as err:
        raise ReconstructionApiError(400, str(err), code="RECON_REQUEST_INVALID") from err
    release_reconstruction_models(reason="discard result")
    return {
        "cleared": True,
        "fingerprint": str(fingerprint),
        "entries_removed": result.entries_removed,
        "bytes_freed": result.bytes_freed,
    }


def _respond(handler: Any, *args: Any, **kwargs: Any) -> web.Response:
    try:
        return web.json_response(handler(*args, **kwargs))
    except ReconstructionApiError as exc:
        return web.json_response(exc.to_dict(), status=exc.status)


def create_reconstruction_routes_table() -> web.RouteTableDef:
    routes = web.RouteTableDef()

    @routes.get(CAPABILITIES_PATH)
    async def capabilities_route(request: web.Request) -> web.Response:
        return web.json_response(get_reconstruction_capabilities())

    @routes.delete(CACHE_PATH)
    async def clear_cache_route(request: web.Request) -> web.Response:
        return _respond(handle_clear_cache)

    @routes.delete(CACHE_PATH + "/{fingerprint}")
    async def delete_cache_entry_route(request: web.Request) -> web.Response:
        return _respond(handle_delete_cache_entry, request.match_info["fingerprint"])

    return routes


def register_on_prompt_server() -> None:
    """Bind the routes onto PromptServer.instance.routes if it is available.

    Uses RouteTableDef.route(), the same public method ComfyUI's PromptServer
    uses to re-register its own table -- custom-node import happens before
    PromptServer.add_routes() consumes the table.
    """
    try:
        from ..comfy_compat.server import PromptServer

        if hasattr(PromptServer, "instance") and hasattr(PromptServer.instance, "routes"):
            existing = {
                (r.method, r.path)
                for r in PromptServer.instance.routes
                if isinstance(r, web.RouteDef)
            }
            for r in create_reconstruction_routes_table():
                if isinstance(r, web.RouteDef) and (r.method, r.path) not in existing:
                    PromptServer.instance.routes.route(r.method, r.path)(r.handler, **r.kwargs)
    except Exception:  # noqa: BLE001
        logger.debug("PromptServer.instance.routes not available for auto-binding")
