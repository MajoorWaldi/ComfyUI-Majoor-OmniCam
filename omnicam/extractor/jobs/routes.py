"""aiohttp bindings for the interactive solve API.

Deliberately thin. Every rule lives in :mod:`.api`, which knows nothing about
HTTP and is therefore testable without a server; this file only translates
between aiohttp and that module.

None of these routes queue a prompt. That is the entire point of the panel: a
camera solve is not a render, and making the user press Run to see a trajectory
would turn matchmoving into a batch job.
"""

from __future__ import annotations

from aiohttp import web

from ...comfy_compat.server import PromptServer
from ...http_json import read_bounded_json_object
from . import api
from .manager import solve_manager

PREFIX = "/majoor/omnicam/extractor/jobs"


def _client_id(request: web.Request) -> str:
    """Identify the caller, preferring what the server knows over what it is told."""
    for candidate in (
        request.rel_url.query.get("clientId"),
        request.rel_url.query.get("client_id"),
        request.headers.get("Comfy-Client-Id"),
    ):
        if candidate:
            return str(candidate)
    return ""


async def _body(request: web.Request) -> dict:
    return await read_bounded_json_object(
        request, max_bytes=api.MAX_REQUEST_BYTES, allow_empty=True
    )


#: An invalid transition is a 409, a foreign job a 403, and so on. Mapping this
#: once means every route reports the same failure the same way.
_STATUS_EXCEPTIONS = {
    400: web.HTTPBadRequest,
    403: web.HTTPForbidden,
    404: web.HTTPNotFound,
    409: web.HTTPConflict,
}


def _respond(handler, *args, **kwargs) -> web.Response:
    try:
        return web.json_response(handler(*args, **kwargs))
    except api.ApiError as exc:
        if exc.status == 413:
            raise web.HTTPRequestEntityTooLarge(
                max_size=api.MAX_REQUEST_BYTES, actual_size=api.MAX_REQUEST_BYTES + 1
            ) from exc
        factory = _STATUS_EXCEPTIONS.get(exc.status, web.HTTPBadRequest)
        raise factory(text=exc.message) from exc


@PromptServer.instance.routes.post(PREFIX)
async def start_solve_route(request: web.Request):
    body = await _body(request)
    client_id = _client_id(request) or str(body.get("client_id") or "")
    return _respond(api.start_job, solve_manager(), body, client_id=client_id)


@PromptServer.instance.routes.post("/majoor/omnicam/extractor/source")
async def describe_source_route(request: web.Request):
    return _respond(api.describe_source, await _body(request))


@PromptServer.instance.routes.get(PREFIX + "/{job_id}")
async def solve_status_route(request: web.Request):
    return _respond(
        api.job_status, solve_manager(), request.match_info["job_id"],
        client_id=_client_id(request),
    )


@PromptServer.instance.routes.post(PREFIX + "/{job_id}/pause")
async def pause_solve_route(request: web.Request):
    return _respond(
        api.pause_job, solve_manager(), request.match_info["job_id"],
        client_id=_client_id(request),
    )


@PromptServer.instance.routes.post(PREFIX + "/{job_id}/resume")
async def resume_solve_route(request: web.Request):
    return _respond(
        api.resume_job, solve_manager(), request.match_info["job_id"],
        client_id=_client_id(request),
    )


@PromptServer.instance.routes.post(PREFIX + "/{job_id}/stop")
async def stop_solve_route(request: web.Request):
    return _respond(
        api.stop_job, solve_manager(), request.match_info["job_id"],
        client_id=_client_id(request),
    )


@PromptServer.instance.routes.post(PREFIX + "/{job_id}/refine")
async def refine_solve_route(request: web.Request):
    body = await _body(request)
    return _respond(
        api.refine_job, solve_manager(), request.match_info["job_id"], body,
        client_id=_client_id(request),
    )


@PromptServer.instance.routes.get(PREFIX + "/{job_id}/result")
async def solve_result_route(request: web.Request):
    return _respond(
        api.result_payload, solve_manager(), request.match_info["job_id"],
        client_id=_client_id(request),
    )


@PromptServer.instance.routes.delete(PREFIX + "/{job_id}")
async def delete_solve_route(request: web.Request):
    return _respond(
        api.delete_job, solve_manager(), request.match_info["job_id"],
        client_id=_client_id(request),
    )
