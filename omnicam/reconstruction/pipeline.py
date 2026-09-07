"""Reconstruction pipeline facade.

The per-mode orchestrators live in ``reconstruction.pipelines``. This module
keeps the historical entry point ``run_reconstruction_pipeline`` and routes by
``ReconstructionSettings.resolved_mode()`` so existing callers (node bridge, job
runner, tests) do not need to know which path runs.
"""

from __future__ import annotations

from collections.abc import Callable
from pathlib import Path
from typing import Any

from ..comfy_compat.gpu_guard import GpuContentionGuard
from .errors import (
    ReconAssetLibraryUnavailableError,
    ReconRequestInvalidError,
    ReconSegmentationUnavailableError,
)
from .pipelines.base import (
    _HASH_CHUNK_BYTES,
    PipelineOutput,
    hash_source_file,
    resolve_provider_version,
)
from .pipelines.depth_mesh import run_depth_mesh_pipeline
from .pipelines.single_blockout import run_single_blockout_pipeline
from .providers.base import CancelToken, ProgressSink, ReconstructionProvider
from .settings import ReconstructionSettings
from .types import ReconstructionSource

# Back-compat re-exports: tests and other modules import these names from here.
_resolve_provider_version = resolve_provider_version
_hash_file = hash_source_file

__all__ = [
    "_HASH_CHUNK_BYTES",
    "PipelineOutput",
    "_hash_file",
    "_resolve_provider_version",
    "run_reconstruction_pipeline",
]

_DEPTH_MESH_MODES = frozenset({"depth_mesh"})
_BLOCKOUT_MODES = frozenset({"blockout", "hybrid"})
#: Geometry providers that only implement ``reconstruct_views`` (multi-view).
#: Using one outside Scan mode is a request error, not an AttributeError.
_SCAN_ONLY_PROVIDERS = frozenset({"vggt", "vggt_omega_research"})
#: Single-view geometry providers valid for depth_mesh / blockout / hybrid.
_SINGLE_VIEW_PROVIDERS = frozenset({"comfy_moge", "fake", "sam3d", "lucida"})


def _resolve_segmentation_provider(settings: ReconstructionSettings) -> Any:
    """Resolve the segmentation provider for a mode that requires one.

    ``segmentation_provider="none"`` is a hard error here rather than a silent
    fall-through to the fake provider -- a blockout/hybrid/scan run with no
    segmentation must fail loudly, not fabricate synthetic instances.
    """
    from .segmentation.registry import get_segmentation_provider

    provider_id = settings.segmentation_provider or "comfy_sam3"
    if provider_id == "none":
        raise ReconSegmentationUnavailableError(
            f"mode {settings.resolved_mode()!r} needs semantic segmentation but "
            "segmentation_provider is 'none'; choose 'comfy_sam3' or switch to Depth Mesh"
        )
    return get_segmentation_provider(provider_id)


def _resolve_completion_provider(settings: ReconstructionSettings) -> Any | None:
    if settings.completion_provider == "none" or settings.completion_policy == "off":
        return None
    from .completion.registry import get_completion_provider

    return get_completion_provider(settings.completion_provider)


def _resolve_asset_library(
    settings: ReconstructionSettings, input_root: Path | str | None
) -> tuple[Any | None, str]:
    """(library, mode) for blockout asset retrieval.

    ``blockout_assets='off'`` -> ``(None, 'off')``. Otherwise the library is
    loaded and its GLBs must be present: a requested-but-missing library raises
    :class:`ReconAssetLibraryUnavailableError` rather than silently producing
    boxes only (same "explicit error over silent substitution" rule the
    segmentation resolver follows).
    """
    mode = settings.blockout_assets
    if mode == "off":
        return None, "off"
    from .asset_library import load_asset_library

    path = settings.asset_library_path.strip() or None
    library = load_asset_library(path, input_root=input_root)
    available, reason = library.status()
    if not available:
        raise ReconAssetLibraryUnavailableError(reason)
    return library, mode


def run_reconstruction_pipeline(
    *,
    source: ReconstructionSource,
    settings: ReconstructionSettings,
    provider: ReconstructionProvider,
    progress: ProgressSink | None = None,
    cancel: CancelToken | None = None,
    input_root: Path | str | None = None,
    triangulate_fn: Callable[..., Any] | None = None,
    save_glb_fn: Callable[..., Any] | None = None,
    gpu_guard: GpuContentionGuard | None = None,
    segmentation_provider: Any | None = None,
    completion_provider: Any | None = None,
    scan_samples: Any | None = None,
) -> PipelineOutput:
    """Dispatch to the orchestrator for ``settings.resolved_mode()``."""
    mode = settings.resolved_mode()
    provider_id = getattr(provider, "provider_id", "")

    # A multi-view provider only has reconstruct_views(); routing it into a
    # single-view orchestrator would blow up with an AttributeError deep in the
    # stack. Fail fast with an actionable code instead.
    if provider_id in _SCAN_ONLY_PROVIDERS and mode != "scan":
        raise ReconRequestInvalidError(
            f"{provider_id!r} is a multi-view geometry provider and only works in "
            f"Scan mode; got mode {mode!r}. Select Scan, or use 'comfy_moge' for "
            "Depth Mesh / Blockout / Hybrid."
        )
    if mode == "scan" and provider_id in _SINGLE_VIEW_PROVIDERS and provider_id != "fake":
        raise ReconRequestInvalidError(
            f"Scan mode needs a multi-view geometry provider (vggt); got {provider_id!r}."
        )

    if mode in _DEPTH_MESH_MODES:
        return run_depth_mesh_pipeline(
            source=source,
            settings=settings,
            provider=provider,
            progress=progress,
            cancel=cancel,
            input_root=input_root,
            triangulate_fn=triangulate_fn,
            save_glb_fn=save_glb_fn,
            gpu_guard=gpu_guard,
        )

    if mode in _BLOCKOUT_MODES:
        seg = segmentation_provider or _resolve_segmentation_provider(settings)
        comp = completion_provider or _resolve_completion_provider(settings)
        asset_library, asset_mode = _resolve_asset_library(settings, input_root)
        return run_single_blockout_pipeline(
            source=source,
            settings=settings,
            geometry_provider=provider,
            segmentation_provider=seg,
            completion_provider=comp,
            asset_library=asset_library,
            asset_mode=asset_mode,
            progress=progress,
            cancel=cancel,
            input_root=input_root,
            triangulate_fn=triangulate_fn,
            save_glb_fn=save_glb_fn,
            gpu_guard=gpu_guard,
        )

    if mode == "scan":
        from .pipelines.scan import run_scan_pipeline

        seg = segmentation_provider or _resolve_segmentation_provider(settings)
        comp = completion_provider or _resolve_completion_provider(settings)
        asset_library, asset_mode = _resolve_asset_library(settings, input_root)
        return run_scan_pipeline(
            source=source,
            settings=settings,
            geometry_provider=provider,
            segmentation_provider=seg,
            samples=scan_samples,
            completion_provider=comp,
            asset_library=asset_library,
            asset_mode=asset_mode,
            progress=progress,
            cancel=cancel,
            input_root=input_root,
            gpu_guard=gpu_guard,
        )

    raise ReconRequestInvalidError(f"Unsupported reconstruction mode {mode!r}")
