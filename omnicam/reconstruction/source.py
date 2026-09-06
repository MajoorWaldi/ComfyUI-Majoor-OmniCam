"""Secure managed image source resolution for 3D reconstruction."""

from __future__ import annotations

import contextlib
import logging
from pathlib import Path

from omnicam.reconstruction.types import ReconstructionSource

logger = logging.getLogger(__name__)

ALLOWED_IMAGE_EXTENSIONS = frozenset({".png", ".jpg", ".jpeg", ".webp"})
MAX_IMAGE_BYTES = 100 * 1024 * 1024  # 100 MB


class ReconstructionSourceResolutionError(ValueError):
    """The requested image source cannot be resolved or is not allowed."""


def approved_roots() -> list[Path]:
    """The ComfyUI directories reconstruction is allowed to read from."""
    try:
        import folder_paths
    except Exception as exc:  # pragma: no cover
        raise ReconstructionSourceResolutionError("ComfyUI folder_paths is unavailable") from exc

    roots: list[Path] = []
    for getter in ("get_input_directory", "get_output_directory", "get_temp_directory"):
        directory = getattr(folder_paths, getter, None)
        if callable(directory):
            with contextlib.suppress(Exception):
                res = directory()
                if res:
                    roots.append(Path(res).resolve())
    if not roots:
        raise ReconstructionSourceResolutionError("ComfyUI has no accessible managed directories")
    return roots


def _strip_annotation(value: str) -> str:
    text = str(value).strip()
    if text.endswith("]") and " [" in text:
        return text[: text.rindex(" [")]
    return text


def _reject_unsafe_reference(reference: str) -> None:
    """Validate reference string safety before touching the filesystem."""
    if not reference:
        raise ReconstructionSourceResolutionError("Image reference cannot be empty")
    if len(reference) > 1024:
        raise ReconstructionSourceResolutionError("Image reference is too long")
    if "\x00" in reference:
        raise ReconstructionSourceResolutionError("Image reference contains null byte")

    bare = _strip_annotation(reference).replace("\\", "/")
    if bare.startswith("//") or bare.startswith("\\\\"):
        raise ReconstructionSourceResolutionError("Network paths are not permitted")
    if "://" in bare:
        raise ReconstructionSourceResolutionError("Remote URLs are not permitted")
    if bare.startswith("data:"):
        raise ReconstructionSourceResolutionError("Data URLs are not permitted")
    if bare.startswith("/") or (len(bare) > 1 and bare[1] == ":"):
        raise ReconstructionSourceResolutionError("Absolute paths are not permitted")
    if any(part == ".." for part in bare.split("/")):
        raise ReconstructionSourceResolutionError("Path traversal is not permitted")


def _inside_approved_root(path: Path, roots: list[Path]) -> bool:
    resolved = path.resolve()
    return any(resolved == root or root in resolved.parents for root in roots)


def _annotated_filepath(value: str) -> str:
    try:
        import folder_paths
    except Exception as exc:
        raise ReconstructionSourceResolutionError("ComfyUI folder_paths is unavailable") from exc

    try:
        return folder_paths.get_annotated_filepath(value)
    except Exception as exc:
        raise ReconstructionSourceResolutionError(
            f"{value!r} is not a valid ComfyUI input reference"
        ) from exc


def resolve_reconstruction_source(
    source: ReconstructionSource,
    *,
    roots: list[Path] | None = None,
    max_bytes: int = MAX_IMAGE_BYTES,
) -> Path:
    """Resolve a ReconstructionSource into a verified local file Path.

    ``roots`` allows injecting approved root directories for hermetic testing.
    """
    if not isinstance(source, ReconstructionSource):
        raise TypeError(f"Expected ReconstructionSource, got {type(source).__name__}")

    _reject_unsafe_reference(source.value)

    bare_filename = Path(_strip_annotation(source.value)).name
    suffix = Path(bare_filename).suffix.lower()
    if suffix not in ALLOWED_IMAGE_EXTENSIONS:
        raise ReconstructionSourceResolutionError(
            f"Image extension {suffix!r} is not allowed. Supported: {sorted(ALLOWED_IMAGE_EXTENSIONS)}"
        )

    approved = roots if roots is not None else approved_roots()
    if roots is not None:
        candidate = (approved[0] / _strip_annotation(source.value)).resolve()
    else:
        candidate = Path(_annotated_filepath(source.value)).resolve()

    if not candidate.is_file():
        raise ReconstructionSourceResolutionError(f"Image source does not exist: {candidate}")

    if not _inside_approved_root(candidate, approved):
        raise ReconstructionSourceResolutionError(
            f"Resolved file {candidate} sits outside ComfyUI-managed directories"
        )

    size = candidate.stat().st_size
    if size <= 0:
        raise ReconstructionSourceResolutionError("Image source file is empty")
    if size > max_bytes:
        raise ReconstructionSourceResolutionError(
            f"Image file size ({size} bytes) exceeds limit ({max_bytes} bytes)"
        )

    return candidate
