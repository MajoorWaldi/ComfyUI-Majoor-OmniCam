"""HTTP surface for the unified asset catalog (design spec section 17).

    GET    /majoor/omnicam/library                 filtered, paginated list
    GET    /majoor/omnicam/library/{asset_id}      one row
    POST   /majoor/omnicam/library/import          multipart model + ?meta -> row
    POST   /majoor/omnicam/library/register        JSON AssetDefinition -> row
    PATCH  /majoor/omnicam/library/{asset_id}      merge fields into a user row
    DELETE /majoor/omnicam/library/{asset_id}      drop a user row
    POST   /majoor/omnicam/library/thumbnail/{id}  multipart image -> row.thumbnail
    GET    /majoor/omnicam/library/poses           built-in + custom FK poses
    POST   /majoor/omnicam/library/poses           JSON pose -> stored pose
    DELETE /majoor/omnicam/library/poses/{pose_id} drop a custom pose

The existing ``GET /majoor/omnicam/assets`` (managed *file* index) is left
exactly as it is -- this is a parallel *semantic* surface, not a rename
(design spec section 4.5). Every path stays inside the managed library; no
absolute path is ever accepted.

Registered from ``omnicam/routes.py`` after its helpers exist, like
``routes_scenes``.
"""

from __future__ import annotations

import asyncio
from pathlib import Path

import folder_paths
from aiohttp import web

from ..comfy_compat.server import PromptServer
from ..http_json import read_bounded_json_object
from ..routes import (
    MAX_MODEL_BYTES,
    _finish_quota_reservation,
    _managed_root,
    _safe_filename,
    _save_multipart_file,
    _validate_media_metadata,
    _validate_model_complexity,
)
from . import manifest, pose_library
from .catalog import DEFAULT_PAGE_LIMIT, load_catalog
from .errors import AssetError, AssetNotFoundError
from .storage import ensure_library_tree, resolve_within

MAX_LIBRARY_JSON_BYTES = 512 * 1024
MAX_THUMBNAIL_BYTES = 4 * 1024 * 1024
_CATALOG_MODEL_EXTENSIONS = {".glb", ".fbx"}
_THUMBNAIL_EXTENSIONS = {".webp", ".png", ".jpg", ".jpeg"}


def _library_root() -> Path:
    return _managed_root() / "library"


def _int_arg(query: object, name: str, default: int) -> int:
    try:
        return int(getattr(query, "get", lambda *_: default)(name, default))
    except (TypeError, ValueError) as exc:
        raise web.HTTPBadRequest(text=f"{name} must be an integer") from exc


def _error_response(exc: AssetError) -> web.Response:
    status = {
        "ASSET_NOT_FOUND": 404,
        "POSE_NOT_FOUND": 404,
    }.get(exc.code, 400)
    return web.json_response(exc.to_dict(), status=status)


# -- catalog reads --------------------------------------------------- #
@PromptServer.instance.routes.get("/majoor/omnicam/library")
async def library_list(request: web.Request):
    query = getattr(request, "query", {})
    try:
        catalog = await asyncio.to_thread(load_catalog)
        page = catalog.list(
            kind=query.get("kind"),
            tag=query.get("tag"),
            search=query.get("search"),
            offset=_int_arg(query, "offset", 0),
            limit=_int_arg(query, "limit", DEFAULT_PAGE_LIMIT),
        )
    except AssetError as exc:
        return _error_response(exc)
    return web.json_response({"format": "majoor.omnicam.library.v2", **page,
                              "kinds": catalog.kinds()})


@PromptServer.instance.routes.get("/majoor/omnicam/library/poses")
async def library_poses_list(_request: web.Request):
    poses = await asyncio.to_thread(pose_library.list_poses)
    return web.json_response({"poses": poses})


@PromptServer.instance.routes.post("/majoor/omnicam/library/poses")
async def library_poses_save(request: web.Request):
    body = await read_bounded_json_object(request, max_bytes=MAX_LIBRARY_JSON_BYTES)
    try:
        pose = await asyncio.to_thread(pose_library.save_pose, None, body)
    except AssetError as exc:
        return _error_response(exc)
    return web.json_response({"pose": pose})


@PromptServer.instance.routes.delete("/majoor/omnicam/library/poses/{pose_id}")
async def library_poses_delete(request: web.Request):
    pose_id = request.match_info["pose_id"]
    try:
        await asyncio.to_thread(pose_library.delete_pose, None, pose_id)
    except AssetError as exc:
        return _error_response(exc)
    return web.json_response({"pose_id": pose_id, "removed": True})


@PromptServer.instance.routes.post("/majoor/omnicam/library/register")
async def library_register(request: web.Request):
    body = await read_bounded_json_object(request, max_bytes=MAX_LIBRARY_JSON_BYTES)
    try:
        definition = await asyncio.to_thread(manifest.register_asset, None, body)
    except AssetError as exc:
        return _error_response(exc)
    return web.json_response({"asset": definition.to_dict()})


@PromptServer.instance.routes.post("/majoor/omnicam/library/import")
async def library_import(request: web.Request):
    """Multipart model upload straight into the catalog. Metadata rides on the
    query string: ``?id=&name=&kind=&category=&tags=a,b&fit=``."""
    query = getattr(request, "query", {})
    kind = str(query.get("kind", "prop")).strip().lower() or "prop"
    category = str(query.get("category", "")).strip().lower()
    subfolder = f"library/{category or _default_category(kind)}"

    payload = await _save_multipart_file(
        request, subfolder, _CATALOG_MODEL_EXTENSIONS, MAX_MODEL_BYTES
    )
    absolute = Path(folder_paths.get_input_directory()) / payload["relative"]
    extension = absolute.suffix.lower()
    try:
        await asyncio.to_thread(_validate_model_complexity, absolute, extension)
    except Exception:
        absolute.unlink(missing_ok=True)
        await _finish_quota_reservation(0, -payload["size"])
        raise

    file_rel = payload["relative"].split("omnicam/library/", 1)[-1]
    stem = Path(payload["name"]).stem
    definition = {
        "id": str(query.get("id") or f"omnicam.{kind}.{_slugify(stem)}"),
        "name": str(query.get("name") or stem.replace("_", " ").title()),
        "kind": kind,
        "category": category or _default_category(kind),
        "file": file_rel,
        "format": extension.lstrip("."),
        "fit": str(query.get("fit", "upright")).strip().lower() or "upright",
        "tags": [t for t in str(query.get("tags", "")).split(",") if t.strip()],
    }
    try:
        registered = await asyncio.to_thread(manifest.register_asset, None, definition)
    except AssetError as exc:
        absolute.unlink(missing_ok=True)
        await _finish_quota_reservation(0, -payload["size"])
        return _error_response(exc)
    return web.json_response({"asset": registered.to_dict(), "file": payload})


@PromptServer.instance.routes.post("/majoor/omnicam/library/thumbnail/{asset_id}")
async def library_thumbnail(request: web.Request):
    asset_id = request.match_info["asset_id"]
    catalog = await asyncio.to_thread(load_catalog)
    if catalog.find(asset_id) is None:
        return _error_response(AssetNotFoundError(f"no asset with id {asset_id!r}"))

    ensure_library_tree(None)
    reader = await request.multipart()
    field = await reader.next()
    if field is None or field.name not in {"file", "asset"}:
        raise web.HTTPBadRequest(text="Expected a multipart field named file/asset")
    filename = _safe_filename(field.filename or "thumb.webp", _THUMBNAIL_EXTENSIONS, fallback_ext=".webp")
    dest = resolve_within(_library_root() / "thumbnails", f"{_slugify(asset_id)}{Path(filename).suffix}")

    size = 0
    with dest.open("wb") as handle:
        while True:
            chunk = await field.read_chunk(size=256 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_THUMBNAIL_BYTES:
                dest.unlink(missing_ok=True)
                raise web.HTTPRequestEntityTooLarge(max_size=MAX_THUMBNAIL_BYTES, actual_size=size)
            handle.write(chunk)
    try:
        await asyncio.to_thread(_validate_media_metadata, dest)
    except Exception:
        dest.unlink(missing_ok=True)
        raise

    thumb_rel = f"thumbnails/{dest.name}"
    try:
        updated = await asyncio.to_thread(manifest.patch_asset, None, asset_id, {"thumbnail": thumb_rel})
    except AssetError as exc:
        return _error_response(exc)
    return web.json_response({"asset": updated.to_dict(), "thumbnail": thumb_rel, "size": size})


# -- keep the parametrised route last so it never shadows the literals above -- #
@PromptServer.instance.routes.get("/majoor/omnicam/library/{asset_id}")
async def library_get(request: web.Request):
    try:
        catalog = await asyncio.to_thread(load_catalog)
        definition = catalog.get(request.match_info["asset_id"])
    except AssetError as exc:
        return _error_response(exc)
    return web.json_response({"asset": definition.to_dict()})


@PromptServer.instance.routes.patch("/majoor/omnicam/library/{asset_id}")
async def library_patch(request: web.Request):
    body = await read_bounded_json_object(request, max_bytes=MAX_LIBRARY_JSON_BYTES)
    try:
        definition = await asyncio.to_thread(
            manifest.patch_asset, None, request.match_info["asset_id"], body
        )
    except AssetError as exc:
        return _error_response(exc)
    return web.json_response({"asset": definition.to_dict()})


@PromptServer.instance.routes.delete("/majoor/omnicam/library/{asset_id}")
async def library_delete(request: web.Request):
    asset_id = request.match_info["asset_id"]
    try:
        await asyncio.to_thread(manifest.delete_asset, None, asset_id)
    except AssetError as exc:
        return _error_response(exc)
    return web.json_response({"asset_id": asset_id, "removed": True})


# -- helpers ------------------------------------------------------- #
_KIND_CATEGORY = {
    "character": "characters",
    "prop": "props",
    "environment": "environments",
    "vehicle": "vehicles",
    "helper": "props",
}


def _default_category(kind: str) -> str:
    return _KIND_CATEGORY.get(kind, "props")


def _slugify(text: str) -> str:
    out = "".join(c if c.isalnum() else "_" for c in str(text).strip().lower()).strip("_")
    return out or "asset"
