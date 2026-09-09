"""Shared bootstrap dataclasses, limits and the typed error.

Every network / archive / filesystem bound the bootstrap enforces lives here so
the individual stages import one constant set (plan sections 8, 9, 19, 43).
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

# -- exit codes (plan section 43) ------------------------------------------ #
EXIT_OK = 0
EXIT_CONFIG = 2
EXIT_SOURCE = 3
EXIT_DOWNLOAD = 4
EXIT_CURATION = 5
EXIT_INSTALL = 6
EXIT_VERIFY = 7

# -- download / archive safety limits (plan section 9) ------------------- #
MAX_PACK_BYTES = 512 * 1024 * 1024
MAX_MEMBER_BYTES = 256 * 1024 * 1024  # mirrors omnicam.routes.MAX_MODEL_BYTES
MAX_TOTAL_UNCOMPRESSED = 2 * 1024 * 1024 * 1024
MAX_HTML_BYTES = 4 * 1024 * 1024
MAX_GLB_JSON_BYTES = 16 * 1024 * 1024
HTTP_TIMEOUT = 30
DOWNLOAD_CHUNK = 1024 * 1024

#: Curation ceiling for a character candidate (plan section 4.1).
MAX_CHARACTER_TRIANGLES = 75_000

#: Sent on every outbound request the bootstrap makes.
USER_AGENT = (
    "ComfyUI-Majoor-OmniCam/asset-bootstrap "
    "(+https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam)"
)

#: Bumped only with a lockfile / report schema change.
BOOTSTRAP_VERSION = 1


class BootstrapError(RuntimeError):
    """A bootstrap stage failed. ``exit_code`` maps to plan section 43."""

    def __init__(self, message: str, *, exit_code: int = EXIT_CONFIG) -> None:
        super().__init__(message)
        self.exit_code = exit_code


@dataclass(frozen=True, slots=True)
class DownloadedArchive:
    """Result of :func:`omnicam.assets.bootstrap.download.download_archive`."""

    path: Path
    source_url: str
    final_url: str
    size: int
    sha256: str
