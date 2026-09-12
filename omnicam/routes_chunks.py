"""Static route for the frontend bundle's code-split chunks.

ComfyUI discovers extensions by globbing ``**/*.js`` under every registered
``WEB_DIRECTORY`` and importing each hit as an extension (see ``server.py``'s
``/extensions`` handler). Any chunk emitted next to ``web/omnicam.js`` would
therefore be fetched eagerly at startup -- exactly what code splitting is meant
to avoid -- and imported as if it were an extension of its own.

So the real bundle lives in ``web-chunks/`` instead, outside that glob, and is
served here. The mount sits at the same URL depth as ``/extensions/<node>/`` so
the relative ``../../scripts/app.js`` specifier rollup leaves in the bundle
still resolves to ComfyUI's own ``/scripts/app.js``, including behind a reverse
proxy that serves ComfyUI under a sub-path.

Caching: ``omnicam.js`` is the entry point and keeps a **stable URL** while its
content (the list of hashed chunk imports) changes on every ``npm run build``.
Served from the plain static handler the browser would keep an old copy after a
rebuild and try to import ``chunk-<oldhash>.js`` files that no longer exist --
the module graph then fails and the whole extension silently does not mount
(the "black / dead node until a hard refresh" bug). So the entry is served
``no-cache`` (revalidate every load) while the content-hashed ``chunk-*.js`` /
``asset-*.js`` are served ``immutable`` -- their URL already changes with their
content, so they are safe to cache forever.
"""

from __future__ import annotations

import logging
import mimetypes
from pathlib import Path

from .comfy_compat.server import PromptServer

# Deliberately not the custom-node folder name: this prefix is ours, and the
# stub at web/omnicam.js reaches it with a folder-name-independent "../" hop.
CHUNK_URL_PREFIX = "/extensions/majoor-omnicam-chunks"
CHUNK_DIRECTORY = Path(__file__).resolve().parent.parent / "web-chunks"

_LOG = logging.getLogger(__name__)
#: Content-hashed outputs (see vite.config.mjs chunkFileNames / assetFileNames).
_IMMUTABLE_PREFIXES = ("chunk-", "asset-", "vendor-")


def resolve_chunk_path(name: str) -> Path | None:
    """The on-disk file for a requested chunk name, or ``None`` if the name is
    unsafe or missing. One path segment, no traversal, must sit inside
    ``CHUNK_DIRECTORY``."""
    if not name or "/" in name or "\\" in name or name in (".", ".."):
        return None
    target = (CHUNK_DIRECTORY / name).resolve()
    try:
        target.relative_to(CHUNK_DIRECTORY.resolve())
    except ValueError:
        return None
    return target if target.is_file() else None


def cache_control_for(name: str) -> str:
    """``immutable`` for content-hashed chunks, ``no-cache`` for the mutable
    ``omnicam.js`` entry (its URL is stable but its chunk imports change every
    build -- a stale copy imports deleted files and the extension never mounts)."""
    return (
        "public, max-age=31536000, immutable"
        if name.startswith(_IMMUTABLE_PREFIXES)
        else "no-cache"
    )


def _register() -> None:
    try:
        from aiohttp import web
    except ImportError:  # pragma: no cover - aiohttp ships with ComfyUI
        # Nothing meaningful to register without aiohttp -- a bare unit-test
        # environment (no aiohttp installed) stubs PromptServer.instance.routes
        # as a plain list, which has no .static()/.get() to call anyway.
        return

    @PromptServer.instance.routes.get(CHUNK_URL_PREFIX + "/{name:.*}")
    async def _serve_chunk(request: web.Request) -> web.Response:
        raw = request.match_info.get("name", "")
        target = resolve_chunk_path(raw)
        if target is None:
            raise web.HTTPNotFound()
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        if target.suffix == ".js":
            content_type = "text/javascript"
        return web.Response(
            body=target.read_bytes(),
            content_type=content_type,
            headers={"Cache-Control": cache_control_for(target.name)},
        )


if CHUNK_DIRECTORY.is_dir():
    _register()
else:
    _LOG.warning(
        "OmniCam frontend chunks are missing at %s; run `npm run build`. "
        "The OmniCam nodes will not load until then.",
        CHUNK_DIRECTORY,
    )
