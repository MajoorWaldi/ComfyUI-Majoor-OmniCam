"""Native ComfyUI MoGe provider adapter for OmniCam Scene Reconstruction.

Upstream verification (ComfyUI Core comfy_extras/nodes_moge.py):
- Node classes:
    - LoadMoGeModel: execute(cls, model_name) -> io.NodeOutput(MoGeModel(sd))
    - MoGeInference: execute(cls, moge_model, image, resolution_level, fov_x_degrees,
                            batch_size, force_projection, apply_mask) -> io.NodeOutput(moge_geometry)
- Result accessor:
    - io.NodeOutput stores results in .args or .outputs. We support .args, .outputs, .result,
      and raw returns.
- Checkpoints location:
    - folder_paths.get_filename_list("geometry_estimation")
"""

from __future__ import annotations

import importlib
import logging
from pathlib import Path
from typing import Any

import numpy as np
import torch
from PIL import Image, ImageOps

from ..errors import (
    ReconCancelledError,
    ReconGpuOomError,
    ReconInferenceFailedError,
    ReconModelMissingError,
    ReconProviderUnavailableError,
    ReconSourceInvalidError,
)
from ..settings import ReconstructionSettings
from ..types import GeometryEvidence, ReconstructionSource
from .base import (
    CancelToken,
    ProgressSink,
    ProviderCapabilities,
    ReconstructionProvider,
)

logger = logging.getLogger(__name__)

QUALITY_RESOLUTION_MAP = {
    "fast": 5,
    "balanced": 7,
    "high": 9,
}


def _extract_node_output(output: Any) -> Any:
    """Extract output payload from ComfyUI io.NodeOutput, tuple/list, or mock."""
    if hasattr(output, "outputs"):
        outputs_val = output.outputs
        if isinstance(outputs_val, (list, tuple)) and len(outputs_val) > 0:
            return outputs_val[0]
    if hasattr(output, "args"):
        args_val = output.args
        if isinstance(args_val, (list, tuple)) and len(args_val) > 0:
            return args_val[0]
    if hasattr(output, "result"):
        res_val = output.result
        if isinstance(res_val, (list, tuple)) and len(res_val) > 0:
            return res_val[0]
    if isinstance(output, (tuple, list)) and len(output) > 0:
        return output[0]
    return output


class ComfyMoGeProvider(ReconstructionProvider):
    """Reconstruction provider using ComfyUI's native MoGe integration."""

    provider_id: str = "comfy_moge"

    def _get_moge_module(self) -> Any:
        """Lazily import comfy_extras.nodes_moge."""
        try:
            return importlib.import_module("comfy_extras.nodes_moge")
        except Exception:  # noqa: BLE001
            return None

    def _get_checkpoints(self) -> list[str]:
        """Query folder_paths for geometry_estimation checkpoints."""
        try:
            import folder_paths

            return folder_paths.get_filename_list("geometry_estimation") or []
        except Exception:  # noqa: BLE001
            return []

    def capabilities(self) -> ProviderCapabilities:
        """Report native MoGe capabilities and model availability."""
        mod = self._get_moge_module()
        if mod is None:
            return ProviderCapabilities(
                provider_id=self.provider_id,
                available=False,
                modes=["geometry", "layout"],
                source_kinds=["annotated_input", "annotated_output"],
                reason="ComfyUI native MoGe module (comfy_extras.nodes_moge) is not available",
                recommended=False,
            )

        checkpoints = self._get_checkpoints()
        if not checkpoints:
            return ProviderCapabilities(
                provider_id=self.provider_id,
                available=False,
                modes=["geometry", "layout"],
                source_kinds=["annotated_input", "annotated_output"],
                reason="No MoGe checkpoint found in models/geometry_estimation",
                recommended=False,
            )

        return ProviderCapabilities(
            provider_id=self.provider_id,
            available=True,
            modes=["geometry", "layout"],
            source_kinds=["annotated_input", "annotated_output"],
            reason="",
            recommended=True,
            metadata={"checkpoints": list(checkpoints)},
        )

    def _load_image_tensor(self, path: Path) -> torch.Tensor:
        """Load an image from disk and return a [1, H, W, 3] float32 tensor in [0, 1]."""
        with Image.open(path) as img:
            img = ImageOps.exif_transpose(img)
            img = img.convert("RGB")
            arr = np.array(img).astype(np.float32) / 255.0
            return torch.from_numpy(arr).unsqueeze(0)

    def reconstruct(
        self,
        source: ReconstructionSource,
        settings: ReconstructionSettings,
        *,
        progress: ProgressSink | None = None,
        cancel: CancelToken | None = None,
        resolved_path: Path | None = None,
    ) -> GeometryEvidence:
        """Execute MoGe inference on a single image."""
        if cancel and cancel.is_cancelled():
            raise ReconCancelledError("Reconstruction cancelled before start")

        mod = self._get_moge_module()
        if mod is None:
            raise ReconProviderUnavailableError(
                "ComfyUI MoGe module (comfy_extras.nodes_moge) is not available"
            )

        checkpoints = self._get_checkpoints()
        if not checkpoints:
            raise ReconModelMissingError(
                "No MoGe checkpoint found in models/geometry_estimation"
            )

        if resolved_path is None:
            from ..source import (
                ReconstructionSourceResolutionError,
                resolve_reconstruction_source,
            )

            try:
                resolved_path = resolve_reconstruction_source(source)
            except ReconstructionSourceResolutionError as err:
                raise ReconSourceInvalidError(str(err)) from err

        checkpoint_name = checkpoints[0]

        if progress:
            progress("INFER_GEOMETRY", 0.15, f"Loading model {checkpoint_name}")

        try:
            load_out = mod.LoadMoGeModel.execute(checkpoint_name)
            moge_model = _extract_node_output(load_out)
        except Exception as err:
            logger.exception("Failed to load MoGe model")
            raise ReconInferenceFailedError(f"Failed to load MoGe model: {err}") from err

        if cancel and cancel.is_cancelled():
            raise ReconCancelledError("Reconstruction cancelled after model load")

        if progress:
            progress("INFER_GEOMETRY", 0.25, "Running geometry estimation")

        image_tensor = self._load_image_tensor(resolved_path)
        resolution_level = QUALITY_RESOLUTION_MAP.get(settings.quality, 7)
        fov_x_degrees = 0.0  # 0.0 signals MoGe to auto-recover FOV

        try:
            infer_out = mod.MoGeInference.execute(
                moge_model,
                image_tensor,
                resolution_level,
                fov_x_degrees,
                1,  # batch_size
                True,  # force_projection
                True,  # apply_mask
            )
            moge_geom = _extract_node_output(infer_out)
        except (torch.cuda.OutOfMemoryError, RuntimeError) as err:
            if "out of memory" in str(err).lower() or isinstance(err, torch.cuda.OutOfMemoryError):
                try:
                    import comfy.model_management

                    comfy.model_management.soft_empty_cache()
                except Exception:  # noqa: BLE001, S110
                    pass
                raise ReconGpuOomError(
                    "CUDA out of memory during MoGe inference. Try 'fast' quality."
                ) from err
            logger.exception("MoGe inference failed")
            raise ReconInferenceFailedError(f"MoGe inference failed: {err}") from err

        if cancel and cancel.is_cancelled():
            raise ReconCancelledError("Reconstruction cancelled after inference")

        if progress:
            progress("INFER_GEOMETRY", 0.50, "Geometry inference completed")

        points = moge_geom.get("points")
        depth = moge_geom.get("depth")
        intrinsics = moge_geom.get("intrinsics")
        mask = moge_geom.get("mask")
        normal = moge_geom.get("normal")
        image_out = moge_geom.get("image", image_tensor)

        return GeometryEvidence(
            points=points,
            depth=depth,
            intrinsics=intrinsics,
            mask=mask,
            normals=normal,
            image=image_out,
            coordinate_system="opencv_x_right_y_down_z_forward",
            provider_version="native-core",
            scale_mode="relative",
            # MoGe returns intrinsics in normalized image coordinates
            # (x, y in [0, 1]; cx = cy = 0.5), not pixels.
            normalized_intrinsics=True,
        )
