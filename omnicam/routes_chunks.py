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
"""

from __future__ import annotations

import logging
from pathlib import Path

from .comfy_compat.server import PromptServer

# Deliberately not the custom-node folder name: this prefix is ours, and the
# stub at web/omnicam.js reaches it with a folder-name-independent "../" hop.
CHUNK_URL_PREFIX = "/extensions/majoor-omnicam-chunks"
CHUNK_DIRECTORY = Path(__file__).resolve().parent.parent / "web-chunks"

if CHUNK_DIRECTORY.is_dir():
    # aiohttp validates the directory at registration time, hence the guard.
    PromptServer.instance.routes.static(CHUNK_URL_PREFIX, str(CHUNK_DIRECTORY))
else:
    logging.getLogger(__name__).warning(
        "OmniCam frontend chunks are missing at %s; run `npm run build`. "
        "The OmniCam nodes will not load until then.",
        CHUNK_DIRECTORY,
    )
