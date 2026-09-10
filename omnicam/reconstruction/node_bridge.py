"""Bridge between Extractor graph node and reconstruction pipeline."""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path
from typing import Any

import numpy as np
import torch
from PIL import Image

from .pipeline import run_reconstruction_pipeline
from .providers import get_provider
from .settings import (
    KNOWN_BLOCKOUT_ASSET_MODES,
    KNOWN_COMPLETION_POLICIES,
    KNOWN_COMPLETION_PROVIDERS,
    KNOWN_MODES,
    KNOWN_SEGMENTATION_PROVIDERS,
    KNOWN_SOURCE_MODES,
    ReconstructionSettings,
)
from .types import ReconstructionSource

logger = logging.getLogger(__name__)

#: Geometry provider ids the Extractor node offers for reconstruction.
RECON_GEOMETRY_PROVIDERS = ("comfy_moge", "vggt", "vggt_omega_research")


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def _split_labels(raw: Any) -> tuple[str, ...]:
    if isinstance(raw, (list, tuple)):
        parts = [str(x).strip() for x in raw]
    else:
        parts = [p.strip() for p in str(raw or "").replace("\n", ",").split(",")]
    seen: set[str] = set()
    out: list[str] = []
    for p in parts:
        key = p.lower()
        if p and key not in seen:
            seen.add(key)
            out.append(p[:64])
    return tuple(out[:64])


def reconstruction_settings_from_widgets(
    *,
    recon_mode: str = "depth_mesh",
    recon_source_mode: str = "auto",
    recon_geometry_provider: str = "comfy_moge",
    recon_segmentation_provider: str = "comfy_sam3",
    recon_completion_provider: str = "none",
    recon_quality: str = "balanced",
    recon_sam3_checkpoint: str = "auto",
    recon_sam3_threshold: float = 0.55,
    recon_semantic_labels: str = "",
    recon_max_objects: int = 24,
    recon_vggt_checkpoint: str = "auto",
    recon_vggt_max_views: int = 24,
    recon_vggt_segmentation_views: int = 6,
    recon_completion_policy: str = "off",
    recon_max_completion_objects: int = 4,
    recon_completion_object_ids: str = "",
    recon_blockout_assets: str = "off",
    recon_asset_library_path: str = "",
    recon_source_texture: bool = True,
    recon_detect_ground: bool = True,
    recon_detect_walls: bool = False,
    recon_scene_scale: float = 1.0,
) -> ReconstructionSettings:
    """Build a validated :class:`ReconstructionSettings` from Extractor widgets.

    The same object interactive Start and a queued graph run must both produce.
    Unknown enum values fall back to the safe default rather than raising, so a
    stale saved workflow still loads.
    """
    mode = recon_mode if recon_mode in KNOWN_MODES else "depth_mesh"
    provider = (
        recon_geometry_provider
        if recon_geometry_provider in RECON_GEOMETRY_PROVIDERS
        else "comfy_moge"
    )
    # Scan needs a multi-view geometry provider; anything else uses MoGe.
    if mode == "scan" and provider == "comfy_moge":
        provider = "vggt"
    if mode != "scan" and provider != "comfy_moge":
        provider = "comfy_moge"

    seg = (
        recon_segmentation_provider
        if recon_segmentation_provider in KNOWN_SEGMENTATION_PROVIDERS
        else "comfy_sam3"
    )
    comp = (
        recon_completion_provider
        if recon_completion_provider in KNOWN_COMPLETION_PROVIDERS
        else "none"
    )
    policy = (
        recon_completion_policy
        if recon_completion_policy in KNOWN_COMPLETION_POLICIES
        else "off"
    )
    source_mode = recon_source_mode if recon_source_mode in KNOWN_SOURCE_MODES else "auto"
    blockout_assets = (
        recon_blockout_assets if recon_blockout_assets in KNOWN_BLOCKOUT_ASSET_MODES else "off"
    )

    vggt_max_views = int(_clamp(int(recon_vggt_max_views), 2, 128))
    vggt_seg_views = int(_clamp(int(recon_vggt_segmentation_views), 1, min(vggt_max_views, 32)))

    return ReconstructionSettings(
        provider=provider,
        mode=mode,
        quality=recon_quality if recon_quality in {"fast", "balanced", "high", "custom"} else "balanced",
        source_texture=bool(recon_source_texture),
        detect_ground=bool(recon_detect_ground),
        detect_walls=bool(recon_detect_walls),
        scene_scale=float(_clamp(float(recon_scene_scale), 0.001, 1000.0)),
        source_mode=source_mode,
        segmentation_provider=seg,
        completion_provider=comp,
        sam3_checkpoint=str(recon_sam3_checkpoint or "auto"),
        sam3_threshold=float(_clamp(float(recon_sam3_threshold), 0.0, 1.0)),
        semantic_labels=_split_labels(recon_semantic_labels),
        max_blockout_objects=int(_clamp(int(recon_max_objects), 1, 128)),
        completion_policy=policy,
        max_completion_objects=int(_clamp(int(recon_max_completion_objects), 0, 16)),
        completion_object_ids=_split_labels(recon_completion_object_ids),
        blockout_assets=blockout_assets,
        asset_library_path=str(recon_asset_library_path or "").strip()[:512],
        vggt_checkpoint=str(recon_vggt_checkpoint or "auto"),
        vggt_max_views=vggt_max_views,
        vggt_segmentation_views=vggt_seg_views,
    )


def execute_reconstruction(
    image_input: Any,
    *,
    settings: ReconstructionSettings | None = None,
    provider_id: str | None = None,
    progress: Any | None = None,
) -> tuple[dict[str, Any], float, str, dict[str, Any]]:
    """Execute scene reconstruction synchronously for ComfyUI graph execution.

    Returns (motion_scene, solver_coverage, report, envelope). ``progress`` is
    an optional :class:`omnicam.comfy_compat.progress.ExecutionProgress`; when
    given, coarse phase transitions are reported through ComfyUI.
    """
    from ..comfy_compat.progress import SCENE_RECONSTRUCT_PHASES

    def _mark(phase: str) -> None:
        if progress is not None:
            progress.phase_done(SCENE_RECONSTRUCT_PHASES[phase])
    if not isinstance(image_input, torch.Tensor):
        raise ValueError(
            "Scene reconstruction requires an IMAGE input (a single still, or a batch "
            "for Scan) -- not a video clip."
        )
    if image_input.ndim != 4:
        raise ValueError(
            f"Scene reconstruction expects IMAGE [B, H, W, C], got shape {list(image_input.shape)}."
        )

    active_settings = settings or ReconstructionSettings(provider=provider_id or "comfy_moge")
    resolved_mode = active_settings.resolved_mode()
    batch = int(image_input.shape[0])

    # Scan mode consumes the whole batch as views; every other mode keeps its
    # single-still contract (and a batch is rejected there, as before).
    scan_samples = None
    if resolved_mode == "scan":
        from .errors import ReconSourceSetInvalidError

        if batch < 2:
            raise ReconSourceSetInvalidError(
                "Scan reconstruction needs an IMAGE batch of at least 2 views."
            )
        from .multiview.source import sample_image_batch

        geom_views, _seg = active_settings.scan_view_counts()
        scan_samples = sample_image_batch(
            image_input[..., :3].cpu().numpy(), max_views=geom_views
        )
        # A queued IMAGE batch is treated as an unordered image set unless the
        # widget explicitly says video_scan (the node has no VIDEO socket yet).
        if active_settings.source_mode in ("auto", "single_image"):
            active_settings.source_mode = "multi_view"
    elif batch != 1:
        raise ValueError(
            f"{resolved_mode} reconstruction accepts only 1 image [1, H, W, C]; "
            f"got a batch of {batch}. Use Scan mode for multi-view input."
        )

    # Convert the first (or only) frame to numpy [H, W, 3] in [0, 255]
    img_tensor = image_input[0, ..., :3].cpu()
    img_np = (img_tensor.numpy() * 255.0).clip(0, 255).astype(np.uint8)

    # Compute deterministic fingerprint of image
    img_bytes = img_np.tobytes()
    im_hash = hashlib.sha256(img_bytes).hexdigest()[:16]

    try:
        import folder_paths

        input_dir = Path(folder_paths.get_input_directory())
    except Exception:  # noqa: BLE001
        input_dir = Path.cwd() / "input"

    recon_in_dir = input_dir / "majoor_omnicam" / "reconstruction" / "inputs"
    recon_in_dir.mkdir(parents=True, exist_ok=True)
    filename = f"recon_input_{im_hash}.png"
    file_path = recon_in_dir / filename

    if not file_path.exists():
        Image.fromarray(img_np).save(file_path, format="PNG")

    rel_value = f"majoor_omnicam/reconstruction/inputs/{filename} [input]"
    source = ReconstructionSource(kind="annotated_input", value=rel_value)
    _mark("source")

    provider = get_provider(active_settings.provider)

    output = run_reconstruction_pipeline(
        source=source,
        settings=active_settings,
        provider=provider,
        scan_samples=scan_samples,
    )
    _mark("completion")

    # solver_coverage must report the overall reconstruction confidence, not
    # the ground plane's alone -- an excellent mesh over a scene with no
    # detectable floor is not a confidence of 0. Falls back to
    # ground_confidence only for a cache entry written before "confidence"
    # was part of the summary.
    overall_conf = output.summary.get("confidence")
    if overall_conf is None:
        overall_conf = output.summary.get("ground_confidence")
    confidence = float(overall_conf) if overall_conf is not None else 1.0

    tri_count = output.summary.get("triangle_count", 0)
    prov_name = output.summary.get("provider", active_settings.provider)
    if resolved_mode in {"blockout", "hybrid", "scan"}:
        n_obj = output.summary.get("blockout_object_count", 0)
        n_inst = output.summary.get("instance_count", output.summary.get("view_count", 0))
        detail = f"{n_obj} blockout object(s)"
        if resolved_mode == "scan":
            detail += f", {output.summary.get('view_count', 0)} views"
        elif n_inst:
            detail += f" from {n_inst} instance(s)"
        report = f"OmniCam Reconstruction [{resolved_mode}]: {prov_name} ({detail})."
    else:
        fov_x = output.summary.get("camera_fov_x", 53.0)
        report = (
            f"OmniCam Reconstruction [depth_mesh]: {prov_name} "
            f"({tri_count:,} triangles, camera FOV {fov_x:.1f}°)."
        )

    envelope = {
        "kind": "omnicam_extractor_result_v2",
        "mode": "scene_reconstruct",
        "fingerprint": output.fingerprint,
        "motion_scene": output.motion_scene,
        "solver_coverage": round(confidence, 4),
        "report": report,
        "source": {"kind": source.kind, "value": source.value},
        "reconstruction": {
            "provider": prov_name,
            "recon_mode": resolved_mode,
            "triangle_count": tri_count,
            "blockout_object_count": output.summary.get("blockout_object_count", 0),
            "provider_summary": output.summary.get("provider_summary", {}),
            "warnings": list(output.warnings),
            # The full pipeline summary (triangle_count, camera_fov_x,
            # confidence, ...) so the panel renders the same detail a queued
            # result shows as the old job did.
            "summary": dict(output.summary),
        },
    }

    return output.motion_scene, confidence, report, envelope
