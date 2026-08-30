"""Turn a runtime ComfyUI ``VIDEO`` into a browser-safe managed reference."""

from __future__ import annotations

import contextlib
import uuid
from collections.abc import Mapping
from pathlib import Path

RUNTIME_SUBFOLDER = Path("omnicam") / "extractor_runtime"


def _comfy_roots() -> dict[str, Path]:
    import folder_paths

    return {
        "input": Path(folder_paths.get_input_directory()).resolve(),
        "output": Path(folder_paths.get_output_directory()).resolve(),
        "temp": Path(folder_paths.get_temp_directory()).resolve(),
    }


def _inactive_trim(video) -> bool:
    getter = getattr(video, "get_active_trim_window", None)
    if not callable(getter):
        return True
    try:
        start, duration = getter()
        return float(start) == 0.0 and float(duration) == 0.0
    except Exception:  # noqa: BLE001 - unknown VIDEO implementations are materialized safely
        return False


def _managed_reference(source, roots: Mapping[str, Path]) -> str | None:
    if not isinstance(source, (str, Path)):
        return None
    try:
        path = Path(source).resolve(strict=True)
    except (OSError, RuntimeError):
        return None
    if not path.is_file():
        return None
    for annotation in ("input", "output", "temp"):
        root = Path(roots[annotation]).resolve()
        if path == root or root in path.parents:
            relative = path.relative_to(root).as_posix()
            return f"{relative} [{annotation}]"
    return None


def materialize_video_reference(video, *, roots: Mapping[str, Path] | None = None) -> str:
    """Return an annotated ComfyUI asset, encoding runtime VIDEO values if needed.

    The filename is generated here and the destination is fixed below ComfyUI
    temp; neither graph values nor browser values can influence the path.
    """
    managed_roots = {
        key: Path(value).resolve() for key, value in (roots or _comfy_roots()).items()
    }
    source = None
    getter = getattr(video, "get_stream_source", None)
    if callable(getter):
        with contextlib.suppress(Exception):
            source = getter()
    if _inactive_trim(video):
        existing = _managed_reference(source, managed_roots)
        if existing is not None:
            return existing

    runtime_root = managed_roots["temp"] / RUNTIME_SUBFOLDER
    runtime_root.mkdir(parents=True, exist_ok=True)
    target = runtime_root / f"{uuid.uuid4().hex}.mp4"
    try:
        video.save_to(str(target))
        resolved = target.resolve(strict=True)
        if resolved.parent != runtime_root.resolve() or not resolved.is_file():
            raise ValueError("Runtime VIDEO did not produce a managed temp file")
        return f"{resolved.relative_to(managed_roots['temp']).as_posix()} [temp]"
    except BaseException:
        with contextlib.suppress(OSError):
            target.unlink()
        raise


def cleanup_runtime_videos(*, roots: Mapping[str, Path] | None = None) -> int:
    """Remove only OmniCam's transient materialized videos.

    Runtime values have no workflow-owned lifetime. Keeping them after a
    server restart leaks one UUID-named MP4 per execution, so cleanup is called
    both when the extension loads and from the ComfyUI shutdown callback.
    """
    managed_roots = {
        key: Path(value).resolve() for key, value in (roots or _comfy_roots()).items()
    }
    runtime_root = (managed_roots["temp"] / RUNTIME_SUBFOLDER).resolve()
    if not runtime_root.is_dir():
        return 0
    removed = 0
    for path in runtime_root.glob("*.mp4"):
        try:
            resolved = path.resolve(strict=True)
            if resolved.parent != runtime_root or not resolved.is_file():
                continue
            resolved.unlink()
            removed += 1
        except OSError:
            continue
    return removed
