"""Resolving the video an interactive solve is allowed to read.

An interactive solve runs outside the prompt queue, which means the path it
opens comes from the browser rather than from a executed graph. That makes this
module a trust boundary: it takes a *reference* (never a path) and answers with
a real file only when that file sits inside a directory ComfyUI already owns.

Everything else is refused -- absolute paths, traversal, network shares, URLs,
and anything whose extension or container does not read as video.

``folder_paths`` is imported lazily so the extractor package stays importable,
and unit-testable, without a running ComfyUI.
"""

from __future__ import annotations

import contextlib
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

#: Containers PyAV can open and the solvers can decode.
SUPPORTED_EXTENSIONS = frozenset({".mp4", ".mov", ".webm", ".mkv", ".m4v", ".avi"})

#: Where the Extractor's own source picker uploads land, under ComfyUI's input.
MANAGED_SUBFOLDER = "omnicam/extractor_sources"

SOURCE_KINDS = ("annotated_input", "managed")

#: A solve reads the whole clip; a multi-gigabyte source is a mistake, not a shot.
MAX_SOURCE_BYTES = 4 * 1024 * 1024 * 1024


class SourceResolutionError(ValueError):
    """The requested source cannot be used for an interactive solve."""


def approved_roots() -> list[Path]:
    """The ComfyUI directories an interactive solve may read from."""
    try:
        import folder_paths
    except Exception as exc:  # pragma: no cover - only outside ComfyUI
        raise SourceResolutionError("ComfyUI folder_paths is unavailable") from exc
    roots = []
    for getter in ("get_input_directory", "get_output_directory", "get_temp_directory"):
        directory = getattr(folder_paths, getter, None)
        if callable(directory):
            # A misconfigured directory is simply not a root, never a failure.
            with contextlib.suppress(Exception):
                roots.append(Path(directory()).resolve())
    if not roots:
        raise SourceResolutionError("ComfyUI has no readable input directory")
    return roots


def _annotated_filepath(value: str) -> str:
    import folder_paths

    try:
        return folder_paths.get_annotated_filepath(value)
    except Exception as exc:  # an unknown annotation raises ValueError
        raise SourceResolutionError(f"{value!r} is not a ComfyUI input reference") from exc


def _strip_annotation(value: str) -> str:
    text = str(value).strip()
    if text.endswith("]") and " [" in text:
        return text[: text.rindex(" [")]
    return text


def _reject_unsafe_reference(reference: str) -> None:
    """Refuse anything that is a path rather than a reference, before touching disk."""
    if not reference:
        raise SourceResolutionError("An interactive solve needs a video source")
    if len(reference) > 1024:
        raise SourceResolutionError("Video reference is too long")
    if "\x00" in reference:
        raise SourceResolutionError("Video reference contains an invalid character")
    bare = _strip_annotation(reference).replace("\\", "/")
    if bare.startswith("//") or bare.startswith("\\\\"):
        raise SourceResolutionError("Network paths are not accepted as a video source")
    if "://" in bare:
        raise SourceResolutionError("Remote URLs are not accepted as a video source")
    # Checked explicitly rather than through os.path.isabs: that function is
    # platform-dependent (and, since 3.13, no longer calls a rooted "/etc/..."
    # absolute on Windows), so relying on it would make the *reason* a file was
    # refused depend on the host OS.
    if bare.startswith("/") or (len(bare) > 1 and bare[1] == ":"):
        raise SourceResolutionError("Absolute paths are not accepted as a video source")
    if any(part == ".." for part in bare.split("/")):
        raise SourceResolutionError("Video reference must not traverse directories")


def _inside_approved_root(path: Path, roots: list[Path]) -> bool:
    resolved = path.resolve()
    return any(resolved == root or root in resolved.parents for root in roots)


def resolve_interactive_video_source(
    source: Any,
    *,
    roots: list[Path] | None = None,
    max_bytes: int = MAX_SOURCE_BYTES,
    validate_metadata: bool = True,
) -> Path:
    """Turn a frontend source reference into a file an interactive solve may read.

    ``roots`` exists for tests; production callers let it default to ComfyUI's
    own input/output/temp directories.
    """
    if not isinstance(source, dict):
        raise SourceResolutionError("Video source must be an object with a kind and a value")
    kind = str(source.get("kind", ""))
    if kind not in SOURCE_KINDS:
        raise SourceResolutionError(
            f"Unsupported video source kind {kind!r}; expected one of {list(SOURCE_KINDS)}"
        )
    reference = str(source.get("value", ""))
    _reject_unsafe_reference(reference)
    if kind == "managed" and not _strip_annotation(reference).replace("\\", "/").startswith(
        f"{MANAGED_SUBFOLDER}/"
    ):
        raise SourceResolutionError(f"Managed sources must live under {MANAGED_SUBFOLDER}/")

    approved = roots if roots is not None else approved_roots()
    if roots is not None:
        # Test/injection mode: resolve against the first supplied root instead
        # of asking ComfyUI, but apply exactly the same containment rules.
        candidate = (approved[0] / _strip_annotation(reference)).resolve()
    else:
        candidate = Path(_annotated_filepath(reference)).resolve()

    if not _inside_approved_root(candidate, approved):
        raise SourceResolutionError("Video source resolves outside the ComfyUI managed directories")
    if candidate.suffix.lower() not in SUPPORTED_EXTENSIONS:
        raise SourceResolutionError(
            f"Unsupported video extension {candidate.suffix!r}; expected one of "
            f"{sorted(SUPPORTED_EXTENSIONS)}"
        )
    if not candidate.is_file():
        raise SourceResolutionError(f"Video source not found: {_strip_annotation(reference)}")
    size = candidate.stat().st_size
    if size <= 0:
        raise SourceResolutionError("Video source is empty")
    if size > max_bytes:
        raise SourceResolutionError(f"Video source is {size} bytes, above the {max_bytes} limit")
    if validate_metadata:
        describe_video_file(candidate)
    return candidate


def describe_video_file(path: Path) -> dict[str, Any]:
    """Read container metadata, and refuse a file that does not decode as video."""
    try:
        import av
    except ImportError as exc:
        raise SourceResolutionError("PyAV is unavailable, so no video source can be validated") from exc
    try:
        container = av.open(str(path))
    except Exception as exc:  # any container failure means "not usable video"
        raise SourceResolutionError(f"Video metadata could not be validated: {exc}") from exc
    try:
        stream = next((item for item in container.streams if item.type == "video"), None)
        if stream is None:
            raise SourceResolutionError("This file contains no video stream")
        width, height = int(stream.width or 0), int(stream.height or 0)
        if width <= 0 or height <= 0:
            raise SourceResolutionError("This video reports no usable dimensions")
        fps = float(stream.average_rate or 0)
        frames = int(stream.frames or 0)
        if frames <= 0 and stream.duration and stream.time_base and fps > 0:
            frames = int(float(stream.duration * stream.time_base) * fps)
        return {
            "name": path.name,
            "width": width,
            "height": height,
            "fps": fps,
            "frame_count": max(0, frames),
            "size_bytes": path.stat().st_size,
        }
    finally:
        container.close()
