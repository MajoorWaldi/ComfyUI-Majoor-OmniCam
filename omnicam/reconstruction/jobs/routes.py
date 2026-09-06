"""HTTP route bindings for reconstruction jobs."""

from __future__ import annotations

import logging
from typing import Any

from aiohttp import web

try:
    from omnicam.comfy_compat.server import PromptServer
except ImportError:
    PromptServer = None
from omnicam.http_json import read_bounded_json_object
from omnicam.reconstruction.capabilities import get_reconstruction_capabilities
from omnicam.reconstruction.jobs import api
from omnicam.reconstruction.jobs.manager import ReconstructionJobManager

logger = logging.getLogger(__name__)

PREFIX = "/majoor/omnicam/reconstruction/jobs"
CAPABILITIES_PATH = "/majoor/omnicam/reconstruction/capabilities"

_MANAGER: ReconstructionJobManager | None = None


def get_reconstruction_job_manager() -> ReconstructionJobManager:
    """Return singleton job manager for reconstruction."""
    global _MANAGER
    if _MANAGER is None:
        _MANAGER = ReconstructionJobManager()
    return _MANAGER


def _client_id(request: web.Request) -> str:
    """Extract client ID from query params or headers."""
    for candidate in (
        request.rel_url.query.get("clientId"),
        request.rel_url.query.get("client_id"),
        request.headers.get("Comfy-Client-Id"),
    ):
        if candidate:
            return api.validate_client_id(str(candidate))
    return ""


async def _body(request: web.Request) -> dict[str, Any]:
    return await read_bounded_json_object(
        request, max_bytes=api.MAX_REQUEST_BYTES, allow_empty=True
    )


_STATUS_EXCEPTIONS = {
    400: web.HTTPBadRequest,
    403: web.HTTPForbidden,
    404: web.HTTPNotFound,
    409: web.HTTPConflict,
}


def _respond(handler: Any, *args: Any, **kwargs: Any) -> web.Response:
    try:
        return web.json_response(handler(*args, **kwargs))
    except api.ReconstructionApiError as exc:
        if exc.status == 413:
            raise web.HTTPRequestEntityTooLarge(
                max_size=api.MAX_REQUEST_BYTES, actual_size=api.MAX_REQUEST_BYTES + 1
            ) from exc
        factory = _STATUS_EXCEPTIONS.get(exc.status, web.HTTPBadRequest)
        raise factory(text=exc.message) from exc


def create_reconstruction_routes_table(
    manager: ReconstructionJobManager | None = None,
) -> web.RouteTableDef:
    """Construct an aiohttp RouteTableDef bound to the given or singleton manager."""
    routes = web.RouteTableDef()
    mgr = manager or get_reconstruction_job_manager()

    @routes.get(CAPABILITIES_PATH)
    async def capabilities_route(request: web.Request) -> web.Response:
        return web.json_response(get_reconstruction_capabilities())

    @routes.post(PREFIX)
    async def start_job_route(request: web.Request) -> web.Response:
        body = await _body(request)
        client_id = _client_id(request)
        if client_id and "client_id" not in body:
            body["client_id"] = client_id
        return _respond(api.handle_start_job, mgr, body)

    @routes.get(PREFIX + "/{job_id}")
    async def status_route(request: web.Request) -> web.Response:
        job_id = request.match_info["job_id"]
        return _respond(api.handle_get_status, mgr, job_id, client_id=_client_id(request))

    @routes.post(PREFIX + "/{job_id}/stop")
    async def stop_route(request: web.Request) -> web.Response:
        job_id = request.match_info["job_id"]
        return _respond(api.handle_stop_job, mgr, job_id, client_id=_client_id(request))

    @routes.get(PREFIX + "/{job_id}/result")
    async def result_route(request: web.Request) -> web.Response:
        job_id = request.match_info["job_id"]
        return _respond(api.handle_get_result, mgr, job_id, client_id=_client_id(request))

    @routes.delete(PREFIX + "/{job_id}")
    async def delete_route(request: web.Request) -> web.Response:
        job_id = request.match_info["job_id"]
        return _respond(api.handle_delete_job, mgr, job_id, client_id=_client_id(request))

    return routes


def register_on_prompt_server() -> None:
    """Register reconstruction routes onto PromptServer.instance.routes if available."""
    try:
        from omnicam.comfy_compat.server import PromptServer

        if hasattr(PromptServer, "instance") and hasattr(PromptServer.instance, "routes"):
            existing = {
                (r.method, r.path)
                for r in PromptServer.instance.routes
                if isinstance(r, web.RouteDef)
            }
            new_table = create_reconstruction_routes_table()
            for r in new_table:
                if (r.method, r.path) not in existing:
                    PromptServer.instance.routes._items.append(r)
    except Exception:  # noqa: BLE001
        logger.debug("PromptServer.instance.routes not available for auto-binding")


register_on_prompt_server()
