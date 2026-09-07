"""Shared pieces for the mode-specific reconstruction orchestrators."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ...comfy_compat.gpu_guard import GpuContentionDetected, GpuContentionGuard
from ..errors import ReconCancelledError, ReconGpuContentionError
from ..providers.base import CancelToken, ProgressSink

__all__ = [
    "GpuContentionGuard",
    "PipelineOutput",
    "geometry_provider_version",
    "hash_source_file",
    "make_progress_gate",
    "resolve_provider_version",
    "stage_cache_version",
]


@dataclass(slots=True)
class PipelineOutput:
    motion_scene: dict[str, Any]
    summary: dict[str, Any]
    warnings: list[str]
    fingerprint: str


_HASH_CHUNK_BYTES = 1024 * 1024


def hash_source_file(path: Path) -> str:
    """First 16 hex chars of the file's SHA-256, read in bounded chunks."""
    digest = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(_HASH_CHUNK_BYTES), b""):
            digest.update(chunk)
    return digest.hexdigest()[:16]


def resolve_provider_version(metadata: dict[str, Any]) -> str:
    """A cache-busting version string identifying what actually ran."""
    checkpoint = metadata.get("active_checkpoint")
    if isinstance(checkpoint, dict) and checkpoint.get("name"):
        name = checkpoint["name"]
        size = checkpoint.get("size", "")
        mtime_ns = checkpoint.get("mtime_ns", "")
        return f"{name}:{size}:{mtime_ns}"
    return str(metadata.get("version", "1.0"))


def _identity_dict_token(identity: dict[str, Any]) -> str:
    name = identity.get("name", "")
    return f"{name}:{identity.get('size', '')}:{identity.get('mtime_ns', '')}"


def geometry_provider_version(provider: Any, settings: Any) -> str:
    """Cache version for the geometry stage, keyed on the checkpoint the run
    will *actually* load (``settings.checkpoint``), not just ``checkpoints[0]``."""
    resolver = getattr(provider, "active_checkpoint_identity", None)
    if callable(resolver):
        try:
            identity = resolver(settings)
        except Exception:  # noqa: BLE001 - fall back to the metadata form below
            identity = None
        if identity is not None:
            return _identity_dict_token(identity)
    return resolve_provider_version(provider.capabilities().metadata)


def stage_cache_version(
    geometry_provider: Any,
    settings: Any,
    *,
    segmentation_provider: Any | None = None,
    asset_library: Any | None = None,
    completion_provider: Any | None = None,
) -> str:
    """Combined cache version across every model-bearing stage.

    A change to the geometry checkpoint, the segmentation checkpoint *or* the
    asset library must invalidate a cached blockout -- checking only geometry
    would serve a stale result after any of them was swapped.
    """
    parts = [f"geo={geometry_provider_version(geometry_provider, settings)}"]
    if segmentation_provider is not None:
        token = None
        ident_fn = getattr(segmentation_provider, "identity_token", None)
        if callable(ident_fn):
            try:
                token = str(ident_fn(settings))
            except Exception:  # noqa: BLE001
                token = None
        if token is None:
            token = f"{getattr(segmentation_provider, 'provider_id', 'seg')}:{getattr(segmentation_provider, 'adapter_version', '')}"
        parts.append(f"seg={token}")
    if asset_library is not None:
        ident_fn = getattr(asset_library, "identity_token", None)
        parts.append(f"assets={ident_fn() if callable(ident_fn) else 'lib'}:{getattr(settings, 'blockout_assets', 'off')}")
    if completion_provider is not None:
        cid = getattr(completion_provider, "provider_id", "comp")
        cver = getattr(completion_provider, "adapter_version", "")
        ident_fn = getattr(completion_provider, "config_identity", None) or getattr(
            completion_provider, "identity_token", None
        )
        try:
            token = str(ident_fn()) if callable(ident_fn) else ""
        except Exception:  # noqa: BLE001
            token = ""
        parts.append(
            f"comp={cid}:{cver}:{token}:{getattr(settings, 'completion_policy', 'off')}"
        )
    return "|".join(parts)


def make_progress_gate(
    progress: ProgressSink | None,
    cancel: CancelToken | None,
    gpu_guard: GpuContentionGuard | None,
):
    """Return ``(report, check_cancel)`` closures shared by every orchestrator.

    ``check_cancel`` raises on user cancellation and on a ComfyUI workflow
    grabbing the GPU mid-run; ``report`` calls it before forwarding progress.
    """

    def check_cancel() -> None:
        if cancel and cancel.is_cancelled():
            raise ReconCancelledError("Reconstruction cancelled by user")
        if gpu_guard is not None:
            try:
                gpu_guard.check()
            except GpuContentionDetected as exc:
                raise ReconGpuContentionError(
                    "Scene reconstruction stopped because a ComfyUI workflow "
                    "started using the GPU."
                ) from exc

    def report(stage: str, pct: float, msg: str) -> None:
        check_cancel()
        if progress:
            progress(stage, float(pct), msg)

    return report, check_cancel
