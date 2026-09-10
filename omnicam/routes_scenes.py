"""Director scene library: save / open / list / delete a whole editor state.

A "scene" is the Director's ``state_json`` payload written to a named file under
ComfyUI's managed output directory, next to the camera exports. Nothing here
runs a graph -- it is a document store the Director drives from its Scene menu
(New / Open / Save / Reset).

Registered from ``routes.py`` after its helpers exist, the same way
``routes_chunks`` is, so this module can borrow the path-containment and quota
helpers instead of re-deriving them.
"""

from __future__ import annotations

import asyncio
import json
import re
import time
from pathlib import Path

import folder_paths
from aiohttp import web

from .comfy_compat.server import PromptServer
from .http_json import read_bounded_json_object
from .routes import (
    MAX_EXPORT_FOLDER_BYTES,
    MAX_EXPORT_JSON_BYTES,
    _check_free_space,
    _folder_size,
)

_SCENES_ROOT_NAME = "omnicam/scenes"
_SCENE_SUFFIX = ".omniscene.json"
_SCHEMA = 1
_SLUG_UNSAFE = re.compile(r"[^a-z0-9._-]+")
#: A generous ceiling on how many scenes the library will hold before a save is
#: refused. This is a runaway guard, not a product limit -- a working library of
#: a few hundred documents stays well under it.
MAX_SCENES = 1000


def _scenes_root() -> Path:
    """The scene folder, always below ComfyUI's managed output directory."""
    output_root = Path(folder_paths.get_output_directory()).resolve()
    root = (output_root / "omnicam" / "scenes").resolve()
    if output_root not in root.parents:
        raise web.HTTPInternalServerError(text="OmniCam scene folder resolves outside ComfyUI output")
    return root


def _slugify(name: str) -> str:
    """A filesystem-safe stem for ``name``. Never empty, never a path."""
    base = _SLUG_UNSAFE.sub("-", str(name or "").strip().lower()).strip("._-")
    base = base[:80].strip("._-")
    return base or "untitled"


def _resolve_scene_path(slug: str) -> Path:
    """The on-disk file for ``slug``, guaranteed to sit directly in the root."""
    stem = _slugify(slug)
    root = _scenes_root()
    path = (root / f"{stem}{_SCENE_SUFFIX}").resolve()
    if path.parent != root:
        raise web.HTTPBadRequest(text="Invalid scene name")
    return path


def _scene_entry(path: Path) -> dict:
    stat = path.stat()
    name = path.name[: -len(_SCENE_SUFFIX)]
    try:
        with path.open("r", encoding="utf-8") as handle:
            stored = json.load(handle)
        if isinstance(stored, dict) and isinstance(stored.get("name"), str) and stored["name"].strip():
            name = stored["name"].strip()
    except (OSError, ValueError):
        pass
    return {
        "slug": path.name[: -len(_SCENE_SUFFIX)],
        "name": name,
        "size": stat.st_size,
        "modified": stat.st_mtime,
    }


def _list_scenes() -> list[dict]:
    root = _scenes_root()
    if not root.exists():
        return []
    entries = []
    for path in root.glob(f"*{_SCENE_SUFFIX}"):
        if not path.is_file():
            continue
        try:
            entries.append(_scene_entry(path))
        except OSError:
            continue
    entries.sort(key=lambda item: item["modified"], reverse=True)
    return entries


@PromptServer.instance.routes.get("/majoor/omnicam/scenes")
async def list_scenes(_request: web.Request):
    scenes = await asyncio.to_thread(_list_scenes)
    return web.json_response({"scenes": scenes})


@PromptServer.instance.routes.get("/majoor/omnicam/scenes/{slug}")
async def get_scene(request: web.Request):
    path = _resolve_scene_path(request.match_info["slug"])

    def _read() -> dict:
        if not path.is_file():
            raise web.HTTPNotFound(text="No such scene")
        with path.open("r", encoding="utf-8") as handle:
            stored = json.load(handle)
        if not isinstance(stored, dict) or not isinstance(stored.get("state"), dict):
            raise web.HTTPUnprocessableEntity(text="Scene file is not a valid OmniCam scene")
        return stored

    try:
        stored = await asyncio.to_thread(_read)
    except web.HTTPException:
        raise
    except (OSError, ValueError) as exc:
        raise web.HTTPUnprocessableEntity(text="Scene file could not be read") from exc

    return web.json_response({
        "slug": path.name[: -len(_SCENE_SUFFIX)],
        "name": str(stored.get("name") or path.name[: -len(_SCENE_SUFFIX)]),
        "state": stored["state"],
        "saved_at": stored.get("saved_at"),
        "modified": path.stat().st_mtime,
    })


@PromptServer.instance.routes.post("/majoor/omnicam/scenes")
async def save_scene(request: web.Request):
    """Write ``{name, state}`` to ``<slug>.omniscene.json``; overwrite by slug."""
    body = await read_bounded_json_object(request, max_bytes=MAX_EXPORT_JSON_BYTES)

    state = body.get("state")
    if not isinstance(state, dict):
        raise web.HTTPBadRequest(text="Expected a scene state object")
    name = str(body.get("name") or "Untitled").strip()[:120] or "Untitled"

    path = _resolve_scene_path(body.get("slug") or name)
    root = path.parent
    root.mkdir(parents=True, exist_ok=True)

    document = json.dumps(
        {"schema": _SCHEMA, "name": name, "saved_at": time.time(), "state": state},
        ensure_ascii=False,
        separators=(",", ":"),
    ).encode("utf-8")

    def _write() -> int:
        existing = {p.name for p in root.glob(f"*{_SCENE_SUFFIX}") if p.is_file()}
        if path.name not in existing and len(existing) >= MAX_SCENES:
            raise web.HTTPInsufficientStorage(text=f"Scene library is full ({MAX_SCENES} scenes)")
        usage = _folder_size(root) if root.exists() else 0
        if usage + len(document) > MAX_EXPORT_FOLDER_BYTES:
            raise web.HTTPInsufficientStorage(
                text=f"OmniCam output quota exceeded ({MAX_EXPORT_FOLDER_BYTES} bytes)"
            )
        _check_free_space(root, len(document))
        tmp = path.with_suffix(".json.tmp")
        tmp.write_bytes(document)
        tmp.replace(path)
        return len(document)

    try:
        size = await asyncio.to_thread(_write)
    except web.HTTPException:
        raise
    except OSError as exc:
        raise web.HTTPInternalServerError(text="Scene could not be written") from exc

    return web.json_response({
        "slug": path.name[: -len(_SCENE_SUFFIX)],
        "name": name,
        "size": size,
    })


@PromptServer.instance.routes.delete("/majoor/omnicam/scenes/{slug}")
async def delete_scene(request: web.Request):
    path = _resolve_scene_path(request.match_info["slug"])

    def _unlink() -> bool:
        try:
            path.unlink()
            return True
        except FileNotFoundError:
            return False

    removed = await asyncio.to_thread(_unlink)
    if not removed:
        raise web.HTTPNotFound(text="No such scene")
    return web.json_response({"slug": path.name[: -len(_SCENE_SUFFIX)], "removed": True})
