"""Reconstruction pipeline facade.

The per-mode orchestrators live in ``reconstruction.pipelines``. This module
keeps the historical entry point ``run_reconstruction_pipeline`` and routes by
``ReconstructionSettings.resolved_mode()`` so existing callers (node bridge, job
runner, tests) do not need to know which path runs.
"""

from __future__ import annotations

import logging
from collections.abc import Callable
from pathlib import Path
from typing import Any

from ..comfy_compat.gpu_guard import GpuContentionGuard
from .errors import (
    ReconAssetLibraryInvalidError,
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

logger = logging.getLogger(__name__)

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


def _catalog_has_assets(input_root: Path | str | None) -> bool:
    """True when the unified asset catalog holds at least one file-backed,
    on-disk asset -- i.e. it can supply blockout replacements on its own."""
    try:
        from ..assets import load_catalog
        from ..assets.reconstruction_bridge import catalog_asset_file_exists

        catalog = load_catalog(input_root=input_root)
    except Exception:  # noqa: BLE001 - no unified catalog is a supported state
        return False
    return any(
        definition.file and catalog_asset_file_exists(definition, input_root)
        for definition in catalog.all()
    )


def _resolve_asset_library(
    settings: ReconstructionSettings, input_root: Path | str | None
) -> tuple[Any | None, str]:
    """(library, mode) for blockout asset retrieval.

    ``blockout_assets='off'`` -> ``(None, 'off')``. Otherwise assets come from
    the **unified catalog** first; the legacy blockout library is an optional
    fallback. An error is raised only when *neither* source can supply an asset
    (same "explicit error over silent substitution" rule the segmentation
    resolver follows).
    """
    mode = settings.blockout_assets
    if mode == "off":
        return None, "off"
    from .asset_library import load_asset_library
    from .asset_library.library import stage_custom_library

    path = settings.asset_library_path.strip() or None
    try:
        library = load_asset_library(path, input_root=input_root)
    except ReconAssetLibraryInvalidError:
        # No legacy blockout manifest at the managed location. That is fine as
        # long as the unified catalog -- the single source of truth -- can
        # supply assets on its own; a bad *custom* path is still a hard error.
        if path is None and _catalog_has_assets(input_root):
            return None, mode
        raise
    available, reason = library.status()
    if not available:
        # The unified catalog is the single source of truth: fall through to it
        # when the (optional) legacy blockout library is absent or incomplete.
        if path is None and _catalog_has_assets(input_root):
            return None, mode
        raise ReconAssetLibraryUnavailableError(reason)
    if path is not None:
        # A library outside the managed folder must be materialised there or its
        # annotated-input GLB references will not load (F09).
        try:
            library = stage_custom_library(library, input_root)
        except OSError as exc:
            raise ReconAssetLibraryUnavailableError(
                f"could not stage custom asset library into the managed folder: {exc}"
            ) from exc
    return library, mode


_VIDEO_EXTENSIONS = frozenset({".mp4", ".mov", ".mkv", ".webm", ".avi"})


def _resolve_scan_input(
    source: ReconstructionSource | None,
    settings: ReconstructionSettings,
    scan_samples: Any | None,
    input_root: Path | str | None,
) -> tuple[Any, float]:
    """(samples, source_fps) for the scan orchestrator.

    Pre-built samples (queued IMAGE batch) pass straight through. Otherwise a
    managed video source is decoded into frames; a single still is rejected
    with an actionable message.
    """
    from .errors import ReconSourceSetInvalidError

    if scan_samples is not None:
        return scan_samples, 24.0
    if source is None:
        raise ReconSourceSetInvalidError(
            "Scan needs multiple views: connect a video, or queue an IMAGE batch of 2+ frames."
        )
    bare = str(source.value).split(" [")[0].strip()
    suffix = ("." + bare.rsplit(".", 1)[-1].lower()) if "." in bare else ""
    if suffix not in _VIDEO_EXTENSIONS:
        raise ReconSourceSetInvalidError(
            f"Scan needs a video source or a multi-view IMAGE batch; got {bare!r}. "
            "Use Blockout or Hybrid for a single photo."
        )
    from .multiview.source import sample_video_scan
    from .source import approved_roots

    roots = [Path(input_root).resolve()] if input_root is not None else approved_roots()
    geom_views, _seg = settings.scan_view_counts()
    samples = sample_video_scan(source.value, roots=roots, max_views=geom_views)
    if settings.source_mode in ("auto", "single_image"):
        settings.source_mode = "video_scan"
    return samples, _probe_video_fps(roots[0] / bare)


def _probe_video_fps(path: Path) -> float:
    """Container fps for the trajectory track, or 24.0 if it cannot be read."""
    try:
        import av

        with av.open(str(path)) as container:
            rate = container.streams.video[0].average_rate
            return float(rate) if rate else 24.0
    except Exception as exc:  # noqa: BLE001 - fps is a nicety, never fail the run
        logger.debug("scan fps probe failed for %s: %s", path, exc)
        return 24.0


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
        # The queued node builds scan_samples from its IMAGE batch. The
        # interactive HTTP job only carries a file-backed `source`; resolve the
        # views here (a managed video -> decoded frames) so Scan is not dead on
        # that path -- and fail loudly for a single still rather than deep in
        # the orchestrator with "samples is None".
        resolved_samples, source_fps = _resolve_scan_input(
            source, settings, scan_samples, input_root
        )
        return run_scan_pipeline(
            source=source,
            settings=settings,
            geometry_provider=provider,
            segmentation_provider=seg,
            samples=resolved_samples,
            completion_provider=comp,
            asset_library=asset_library,
            asset_mode=asset_mode,
            source_fps=source_fps,
            progress=progress,
            cancel=cancel,
            input_root=input_root,
            gpu_guard=gpu_guard,
        )

    raise ReconRequestInvalidError(f"Unsupported reconstruction mode {mode!r}")
