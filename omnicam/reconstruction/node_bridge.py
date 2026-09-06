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
from .settings import ReconstructionSettings
from .types import ReconstructionSource

logger = logging.getLogger(__name__)


def execute_reconstruction(
    image_input: Any,
    *,
    settings: ReconstructionSettings | None = None,
    provider_id: str | None = None,
) -> tuple[dict[str, Any], float, str, dict[str, Any]]:
    """Execute scene reconstruction synchronously for ComfyUI graph execution.

    Returns (motion_scene, solver_coverage, report, envelope).
    """
    if not isinstance(image_input, torch.Tensor):
        raise ValueError(
            "Scene reconstruction requires a single still IMAGE input, not a video clip."
        )

    if len(image_input.shape) != 4 or image_input.shape[0] != 1:
        raise ValueError(
            f"Scene reconstruction accepts only 1 image [1, H, W, C], got shape {list(image_input.shape)}."
        )

    # Convert torch image to numpy array [H, W, 3] in [0, 255]
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

    active_settings = settings or ReconstructionSettings(provider=provider_id or "comfy_moge")
    provider = get_provider(active_settings.provider)

    output = run_reconstruction_pipeline(
        source=source,
        settings=active_settings,
        provider=provider,
    )

    ground_conf = output.summary.get("ground_confidence")
    confidence = float(ground_conf) if ground_conf is not None else 1.0

    tri_count = output.summary.get("triangle_count", 0)
    fov_x = output.summary.get("camera_fov_x", 53.0)
    prov_name = output.summary.get("provider", active_settings.provider)
    report = (
        f"OmniCam Reconstruction: {prov_name} "
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
            "triangle_count": tri_count,
            "warnings": list(output.warnings),
        },
    }

    return output.motion_scene, confidence, report, envelope
