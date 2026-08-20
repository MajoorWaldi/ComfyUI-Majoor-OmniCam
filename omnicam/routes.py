from __future__ import annotations

import asyncio
import mimetypes
import os
import re
import shutil
import uuid
from pathlib import Path

import folder_paths
from aiohttp import web
from server import PromptServer

_CARD_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".webm", ".mov"}
_MODEL_EXTENSIONS = {".glb", ".obj", ".fbx", ".stl", ".ply"}
_PLAYBLAST_EXTENSIONS = {".mp4", ".webm", ".mov"}
_SAFE = re.compile(r"[^A-Za-z0-9._-]+")
_EXECUTABLE_EXTENSIONS = {".exe", ".bat", ".ps1", ".sh", ".js", ".py", ".dll", ".com"}

def _env_limit(name: str, default: int, *, minimum: int = 1, maximum: int = 1 << 50) -> int:
    """Read a positive bounded byte/count limit without breaking extension import."""
    try:
        value = int(os.environ.get(name, default))
    except (TypeError, ValueError):
        return default
    return value if minimum <= value <= maximum else default


# Configurable limits (safe environment overrides).
MAX_CARD_BYTES = _env_limit("OMNICAM_MAX_CARD_BYTES", 128 * 1024 * 1024)
MAX_MODEL_BYTES = _env_limit("OMNICAM_MAX_MODEL_BYTES", 256 * 1024 * 1024)
MAX_PLAYBLAST_BYTES = _env_limit("OMNICAM_MAX_PLAYBLAST_BYTES", 512 * 1024 * 1024)
MAX_FOLDER_BYTES = _env_limit("OMNICAM_MAX_FOLDER_BYTES", 4 * 1024 * 1024 * 1024)
MIN_FREE_BYTES = _env_limit("OMNICAM_MIN_FREE_BYTES", 512 * 1024 * 1024)
MAX_IMAGE_PIXELS = _env_limit("OMNICAM_MAX_IMAGE_PIXELS", 80_000_000)
MAX_IMAGE_FRAMES = _env_limit("OMNICAM_MAX_IMAGE_FRAMES", 2_000)
MAX_VIDEO_PIXELS = _env_limit("OMNICAM_MAX_VIDEO_PIXELS", 16_777_216)
MAX_VIDEO_DURATION_SECONDS = _env_limit("OMNICAM_MAX_VIDEO_DURATION_SECONDS", 3_600)

_quota_lock = asyncio.Lock()
_quota_usage: int | None = None
_quota_reserved = 0

# Magic-byte signatures per extension: accepted (offset, prefix) pairs.
_SIGNATURES = {
    ".png": [(0, b"\x89PNG\r\n\x1a\n")],
    ".jpg": [(0, b"\xff\xd8\xff")],
    ".jpeg": [(0, b"\xff\xd8\xff")],
    ".webp": [(0, b"RIFF")],
    ".gif": [(0, b"GIF87a"), (0, b"GIF89a")],
    ".mp4": [(4, b"ftyp")],
    ".mov": [(4, b"ftyp")],
    ".webm": [(0, b"\x1a\x45\xdf\xa3")],
    ".glb": [(0, b"glTF")],
    ".fbx": [(0, b"Kaydara FBX Binary  \x00")],
}


def _safe_filename(name: str, allowed_extensions: set[str], fallback_ext: str = ".bin") -> str:
    base = os.path.basename(name or "asset")
    base = _SAFE.sub("_", base).strip("._") or "asset"
    stem, ext = os.path.splitext(base)
    ext = ext.lower() or fallback_ext
    if ext not in allowed_extensions:
        raise web.HTTPBadRequest(text=f"Unsupported file extension: {ext}")
    # Double extensions (evil.png.exe is already rejected above; card.png.png is flattened).
    inner_ext = os.path.splitext(stem)[1].lower()
    if inner_ext in _EXECUTABLE_EXTENSIONS:
        raise web.HTTPBadRequest(text=f"Unsupported file extension: {inner_ext}")
    return f"{stem[:80]}_{uuid.uuid4().hex[:8]}{ext}"


def _signature_ok(extension: str, header: bytes) -> bool:
    signatures = _SIGNATURES.get(extension)
    if not signatures:
        return True  # text formats (obj/stl/ply) are content-checked in upload_model
    return any(len(header) >= offset + len(prefix) and header[offset : offset + len(prefix)] == prefix for offset, prefix in signatures)


def _managed_root() -> Path:
    return (Path(folder_paths.get_input_directory()) / "omnicam").resolve()


def _folder_size(directory: Path) -> int:
    total = 0
    for entry in directory.rglob("*"):
        if entry.is_file():
            total += entry.stat().st_size
    return total


def _check_free_space(dest_dir: Path, incoming_max: int) -> None:
    free = shutil.disk_usage(str(dest_dir)).free
    if free < MIN_FREE_BYTES + incoming_max:
        raise web.HTTPInsufficientStorage(text="Not enough free disk space for this upload")


async def _reserve_quota(dest_dir: Path, incoming_max: int) -> None:
    global _quota_usage, _quota_reserved
    async with _quota_lock:
        if _quota_usage is None:
            root = _managed_root()
            _quota_usage = await asyncio.to_thread(_folder_size, root) if root.exists() else 0
        if _quota_usage + _quota_reserved + incoming_max > MAX_FOLDER_BYTES:
            raise web.HTTPInsufficientStorage(text=f"OmniCam folder quota exceeded ({MAX_FOLDER_BYTES} bytes)")
        await asyncio.to_thread(_check_free_space, dest_dir, incoming_max)
        _quota_reserved += incoming_max


async def _finish_quota_reservation(reserved: int, actual: int = 0) -> None:
    global _quota_usage, _quota_reserved
    async with _quota_lock:
        _quota_reserved = max(0, _quota_reserved - reserved)
        if _quota_usage is not None:
            _quota_usage = max(0, _quota_usage + actual)


def _validate_media_metadata(path: Path) -> None:
    extension = path.suffix.lower()
    if extension in {".png", ".jpg", ".jpeg", ".webp", ".gif"}:
        try:
            from PIL import Image

            with Image.open(path) as image:
                width, height = image.size
                frames = int(getattr(image, "n_frames", 1))
                if width <= 0 or height <= 0 or width * height > MAX_IMAGE_PIXELS:
                    raise web.HTTPBadRequest(text="Image dimensions exceed the OmniCam safety limit")
                if frames <= 0 or frames > MAX_IMAGE_FRAMES:
                    raise web.HTTPBadRequest(text="Animated image frame count exceeds the OmniCam safety limit")
                image.verify()
        except web.HTTPException:
            raise
        except Exception as exc:
            raise web.HTTPBadRequest(text="Image metadata could not be validated") from exc
    elif extension in _PLAYBLAST_EXTENSIONS:
        # OpenCV is part of common ComfyUI installations. When unavailable, the
        # signature and byte limits remain enforced rather than adding a new
        # heavyweight OmniCam dependency.
        try:
            import cv2
        except ImportError:
            return
        capture = cv2.VideoCapture(str(path))
        try:
            if not capture.isOpened():
                raise web.HTTPBadRequest(text="Video metadata could not be validated")
            width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = float(capture.get(cv2.CAP_PROP_FPS))
            frames = float(capture.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = frames / fps if fps > 0 and frames >= 0 else 0
            if width <= 0 or height <= 0 or width * height > MAX_VIDEO_PIXELS:
                raise web.HTTPBadRequest(text="Video dimensions exceed the OmniCam safety limit")
            if duration <= 0 or duration > MAX_VIDEO_DURATION_SECONDS:
                raise web.HTTPBadRequest(text="Video duration exceeds the OmniCam safety limit")
        finally:
            capture.release()


async def _save_multipart_file(request: web.Request, subfolder: str, allowed_extensions: set[str], max_bytes: int) -> dict:
    reader = await request.multipart()
    field = await reader.next()
    if field is None or field.name not in {"file", "video", "asset"}:
        raise web.HTTPBadRequest(text="Expected multipart field named file/video/asset")

    filename = _safe_filename(field.filename or "asset.webm", allowed_extensions, fallback_ext=".webm")
    dest_dir = (_managed_root() / subfolder).resolve()
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = (dest_dir / filename).resolve()
    if dest.parent != dest_dir:
        raise web.HTTPBadRequest(text="Invalid upload destination")
    await _reserve_quota(dest_dir, max_bytes)

    size = 0
    header = b""
    try:
        with dest.open("wb") as handle:
            while True:
                try:
                    chunk = await field.read_chunk(size=1024 * 1024)
                except (ConnectionResetError, asyncio.IncompleteReadError) as exc:
                    raise web.HTTPRequestTimeout(text="Client disconnected during upload") from exc
                if not chunk:
                    break
                if len(header) < 64 * 1024:
                    header += chunk[: 64 * 1024 - len(header)]
                size += len(chunk)
                if size > max_bytes:
                    raise web.HTTPRequestEntityTooLarge(max_size=max_bytes, actual_size=size)
                # Keep blocking file I/O off the async server event loop.
                await asyncio.to_thread(handle.write, chunk)
        if size == 0:
            raise web.HTTPBadRequest(text="Empty uploads are rejected")
        if not _signature_ok(dest.suffix.lower(), header):
            raise web.HTTPBadRequest(text=f"File signature does not match {dest.suffix.lower()}")
        if dest.suffix.lower() in _CARD_EXTENSIONS | _PLAYBLAST_EXTENSIONS:
            await asyncio.to_thread(_validate_media_metadata, dest)
    except Exception:
        dest.unlink(missing_ok=True)
        await _finish_quota_reservation(max_bytes)
        raise
    await _finish_quota_reservation(max_bytes, size)

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
    payload = await _save_multipart_file(request, "playblasts", _PLAYBLAST_EXTENSIONS, MAX_PLAYBLAST_BYTES)
    return web.json_response(payload)


@PromptServer.instance.routes.post("/majoor/omnicam/upload_asset")
async def upload_asset(request: web.Request):
    payload = await _save_multipart_file(request, "cards", _CARD_EXTENSIONS, MAX_CARD_BYTES)
    return web.json_response(payload)


@PromptServer.instance.routes.post("/majoor/omnicam/upload_model")
async def upload_model(request: web.Request):
    payload = await _save_multipart_file(request, "models", _MODEL_EXTENSIONS, MAX_MODEL_BYTES)
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
        await _finish_quota_reservation(0, -payload["size"])
        raise web.HTTPBadRequest(text=f"Invalid {extension[1:].upper()} model file")
    return web.json_response(payload)


@PromptServer.instance.routes.get("/majoor/omnicam/health")
async def health(_request: web.Request):
    return web.json_response({"ok": True, "name": "ComfyUI-Majoor-OmniCam", "api": 2})


@PromptServer.instance.routes.get("/majoor/omnicam/capabilities")
async def capabilities(_request: web.Request):
    """Per-adapter compatibility states for the running ComfyUI install."""
    from .capabilities import detect_capabilities, diagnose_setup

    detected = detect_capabilities()
    return web.json_response({**detected, "diagnostic": diagnose_setup(detected)})


@PromptServer.instance.routes.get("/majoor/omnicam/assets")
async def list_assets(_request: web.Request):
    """Managed-asset index: every file OmniCam wrote below <input>/omnicam."""
    root = _managed_root()
    assets = []
    if root.exists():
        for entry in sorted(root.rglob("*")):
            if entry.is_file():
                stat = entry.stat()
                assets.append({"relative": entry.relative_to(root).as_posix(), "size": stat.st_size, "modified": stat.st_mtime})
    return web.json_response({"root": "omnicam", "assets": assets, "total_bytes": sum(asset["size"] for asset in assets)})


@PromptServer.instance.routes.post("/majoor/omnicam/cleanup")
async def cleanup_assets(request: web.Request):
    """Delete explicitly listed managed assets (safe unused-asset cleanup).

    Body: {"files": ["cards/foo.png", ...]} with paths relative to the managed
    omnicam folder. Traversal outside the managed folder is rejected.
    """
    try:
        body = await request.json()
    except Exception as exc:
        raise web.HTTPBadRequest(text="Expected a JSON body") from exc
    files = body.get("files") if isinstance(body, dict) else None
    if not isinstance(files, list) or not files:
        raise web.HTTPBadRequest(text="Expected a non-empty files list")
    root = _managed_root()
    targets = []
    for relative in files:
        if not isinstance(relative, str):
            raise web.HTTPBadRequest(text="Asset paths must be strings")
        candidate = (root / relative).resolve()
        if root not in candidate.parents:
            raise web.HTTPBadRequest(text=f"Invalid managed asset path: {relative}")
        if not candidate.is_file():
            raise web.HTTPNotFound(text=f"Unknown managed asset: {relative}")
        targets.append((relative, candidate, candidate.stat().st_size))
    removed = []
    for relative, candidate, size in targets:
        candidate.unlink()
        removed.append({"relative": relative, "size": size})
    global _quota_usage
    async with _quota_lock:
        if _quota_usage is not None:
            _quota_usage = max(0, _quota_usage - sum(item["size"] for item in removed))
    return web.json_response({"removed": removed, "freed_bytes": sum(item["size"] for item in removed)})
