from __future__ import annotations

import mimetypes
import os
import re
import uuid
from pathlib import Path

import folder_paths
from aiohttp import web
from server import PromptServer

_CARD_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".webm", ".mov"}
_MODEL_EXTENSIONS = {".glb", ".obj", ".fbx", ".stl", ".ply"}
_PLAYBLAST_EXTENSIONS = {".mp4", ".webm", ".mov"}
_SAFE = re.compile(r"[^A-Za-z0-9._-]+")


def _safe_filename(name: str, allowed_extensions: set[str], fallback_ext: str = ".bin") -> str:
    base = os.path.basename(name or "asset")
    base = _SAFE.sub("_", base).strip("._") or "asset"
    stem, ext = os.path.splitext(base)
    ext = ext.lower() or fallback_ext
    if ext not in allowed_extensions:
        raise web.HTTPBadRequest(text=f"Unsupported file extension: {ext}")
    return f"{stem[:80]}_{uuid.uuid4().hex[:8]}{ext}"


async def _save_multipart_file(request: web.Request, subfolder: str, allowed_extensions: set[str], max_bytes: int) -> dict:
    reader = await request.multipart()
    field = await reader.next()
    if field is None or field.name not in {"file", "video", "asset"}:
        raise web.HTTPBadRequest(text="Expected multipart field named file/video/asset")

    filename = _safe_filename(field.filename or "asset.webm", allowed_extensions, fallback_ext=".webm")
    dest_dir = (Path(folder_paths.get_input_directory()) / "omnicam" / subfolder).resolve()
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = (dest_dir / filename).resolve()
    if dest.parent != dest_dir:
        raise web.HTTPBadRequest(text="Invalid upload destination")

    size = 0
    with dest.open("wb") as handle:
        while True:
            chunk = await field.read_chunk(size=1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > max_bytes:
                handle.close()
                dest.unlink(missing_ok=True)
                raise web.HTTPRequestEntityTooLarge(max_size=max_bytes, actual_size=size)
            handle.write(chunk)

    relative = f"omnicam/{subfolder}/{filename}".replace("\\", "/")
    return {
        "name": filename,
        "subfolder": f"omnicam/{subfolder}",
        "type": "input",
        "path": f"{relative} [input]",
        "relative": relative,
        "mime": mimetypes.guess_type(filename)[0] or "application/octet-stream",
        "size": size,
    }


@PromptServer.instance.routes.post("/majoor/omnicam/upload_playblast")
async def upload_playblast(request: web.Request):
    payload = await _save_multipart_file(request, "playblasts", _PLAYBLAST_EXTENSIONS, 512 * 1024 * 1024)
    return web.json_response(payload)


@PromptServer.instance.routes.post("/majoor/omnicam/upload_asset")
async def upload_asset(request: web.Request):
    payload = await _save_multipart_file(request, "cards", _CARD_EXTENSIONS, 128 * 1024 * 1024)
    return web.json_response(payload)


@PromptServer.instance.routes.post("/majoor/omnicam/upload_model")
async def upload_model(request: web.Request):
    payload = await _save_multipart_file(request, "models", _MODEL_EXTENSIONS, 256 * 1024 * 1024)
    path = Path(folder_paths.get_input_directory()) / payload["relative"]
    extension = path.suffix.lower()
    with path.open("rb") as handle:
        header = handle.read(min(payload["size"], 64 * 1024))
    if extension == ".glb":
        valid = len(header) >= 12 and header[:4] == b"glTF" and int.from_bytes(header[4:8], "little") == 2 and int.from_bytes(header[8:12], "little") == payload["size"]
    elif extension == ".obj":
        text = header.decode("utf-8", errors="replace")
        valid = "\x00" not in text and any(line.lstrip().startswith("v ") for line in text.splitlines())
    elif extension == ".fbx":
        valid = header.startswith(b"Kaydara FBX Binary  \x00") or b"FBXHeaderExtension" in header
    elif extension == ".stl":
        if payload["size"] >= 84 and len(header) >= 84:
            triangle_count = int.from_bytes(header[80:84], "little")
            valid = payload["size"] == 84 + triangle_count * 50
        else:
            valid = False
        valid = valid or (header.lstrip().lower().startswith(b"solid") and b"facet" in header.lower())
    else:
        valid = header.startswith((b"ply\n", b"ply\r\n"))
    if not valid:
        path.unlink(missing_ok=True)
        raise web.HTTPBadRequest(text=f"Invalid {extension[1:].upper()} model file")
    return web.json_response(payload)


@PromptServer.instance.routes.get("/majoor/omnicam/health")
async def health(_request: web.Request):
    return web.json_response({"ok": True, "name": "ComfyUI-Majoor-OmniCam", "api": 2})
