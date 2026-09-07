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

import contextlib
import importlib
import logging
import threading
import uuid
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

#: A fresh ComfyMoGeProvider() is constructed per reconstruction (see
#: providers/__init__.py::get_provider), so an instance attribute cannot
#: survive between jobs -- this is what actually lets consecutive
#: reconstructions reuse the deserialized weights and, via ComfyUI's own
#: load_model_gpu identity tracking, an already-resident GPU copy instead of
#: reading the checkpoint from disk and re-uploading it every single time.
#: Single-slot: only one checkpoint is ever used in practice (checkpoints[0]),
#: and this deliberately does not pin VRAM against comfy.model_management's
#: own eviction -- it only skips the redundant reload when nothing evicted it.
_model_cache_lock = threading.Lock()
_model_cache: dict[str, Any] = {}


def _cached_load_moge_model(mod: Any, checkpoint_name: str, identity: dict[str, Any]) -> Any:
    """Load (or reuse) the MoGe model for ``checkpoint_name``.

    ``identity`` (from _checkpoint_identity: name/size/mtime) is folded into
    the cache key so a swapped or updated file on disk is never mistaken for
    the one already resident.
    """
    cache_key = f"{checkpoint_name}:{identity.get('size', '')}:{identity.get('mtime_ns', '')}"
    with _model_cache_lock:
        cached = _model_cache.get(cache_key)
        if cached is not None:
            return cached
        load_out = mod.LoadMoGeModel.execute(checkpoint_name)
        moge_model = _extract_node_output(load_out)
        _model_cache.clear()
        _model_cache[cache_key] = moge_model
        return moge_model


def clear_moge_model_cache() -> None:
    """Forget every cached MoGe model instance.

    Exists for test isolation (distinct tests that never mock
    folder_paths.get_full_path_or_raise all degrade to the same
    ``{"name": checkpoint_name}`` identity, and can otherwise collide on the
    same cache key) and as a real, if rarely needed, escape hatch to force
    the next reconstruction to reload from disk.
    """
    with _model_cache_lock:
        _model_cache.clear()


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

    def _checkpoint_identity(self, checkpoint_name: str) -> dict[str, Any]:
        """Name, size and mtime of the checkpoint that will actually be loaded.

        The cache's provider_version currently reads back as a fixed "1.0" no
        matter what -- capabilities().metadata never carried anything else --
        so swapping which checkpoint models/geometry_estimation/ resolves
        first (reorganizing files, adding one that now sorts earlier) served
        a stale GLB generated by a *different* checkpoint as a cache hit.
        This is deliberately not a content hash: hashing a multi-GB file on
        every capabilities() call would make the panel's provider dropdown
        pause for seconds, and a rename/touch already changes size or mtime
        for the cases that matter (a swapped or updated file).
        """
        try:
            import folder_paths

            path = Path(folder_paths.get_full_path_or_raise("geometry_estimation", checkpoint_name))
            stat = path.stat()
            return {"name": checkpoint_name, "size": stat.st_size, "mtime_ns": stat.st_mtime_ns}
        except Exception:  # noqa: BLE001
            return {"name": checkpoint_name}

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

        # reconstruct() always loads checkpoints[0] (see below); capabilities()
        # enumerates the same folder_paths list, so this is that same
        # checkpoint's identity, not a guess at what it might be.
        active = self._checkpoint_identity(checkpoints[0])

        return ProviderCapabilities(
            provider_id=self.provider_id,
            available=True,
            modes=["geometry", "layout"],
            source_kinds=["annotated_input", "annotated_output"],
            reason="",
            recommended=True,
            metadata={"checkpoints": list(checkpoints), "active_checkpoint": active},
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

        requested_checkpoint = str(getattr(settings, "checkpoint", "auto") or "auto")
        if requested_checkpoint == "auto":
            checkpoint_name = checkpoints[0]
        elif requested_checkpoint in checkpoints:
            checkpoint_name = requested_checkpoint
        else:
            raise ReconModelMissingError(
                f"Requested MoGe checkpoint {requested_checkpoint!r} not found in "
                f"models/geometry_estimation. Available: {checkpoints}"
            )

        if progress:
            progress("INFER_GEOMETRY", 0.15, f"Loading model {checkpoint_name}")

        # LoadMoGeModel/MoGeInference are called directly, outside ComfyUI's
        # prompt queue -- that is the whole point of a no-prompt reconstruction
        # job. But comfy.utils.ProgressBar (used internally by MoGeInference)
        # is globally hijacked to route through the queue's execution context,
        # and falls back to PromptServer.instance.last_prompt_id when there is
        # none -- an attribute that plain doesn't exist until a real prompt has
        # run at least once since server start. CurrentNodeContext is core's
        # own public escape hatch for exactly this: it's contextvars-based
        # (thread-local), so it can't collide with a real prompt executing
        # concurrently on the main thread.
        try:
            from comfy_execution.utils import CurrentNodeContext

            node_context = CurrentNodeContext(
                prompt_id=f"omnicam-reconstruction-{uuid.uuid4().hex[:12]}",
                node_id="MajoorOmniCamReconstruction",
            )
        except Exception:  # noqa: BLE001
            node_context = None

        with node_context if node_context is not None else contextlib.nullcontext():
            try:
                identity = self._checkpoint_identity(checkpoint_name)
                moge_model = _cached_load_moge_model(mod, checkpoint_name, identity)
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

        # MoGeInference's packaged node output never re-exposes the model's own
        # metric_scale value (model.py consumes it internally before returning),
        # but MoGeModel.infer()'s apply_metric_scale defaults True and only v2
        # checkpoints predict a metric_scale head at all -- so the model's own
        # "v1"/"v2" tag is the honest, available signal for what actually
        # happened to these points, without reimplementing infer() ourselves.
        scale_mode = "metric_prediction" if getattr(moge_model, "version", None) == "v2" else "relative"

        return GeometryEvidence(
            points=points,
            depth=depth,
            intrinsics=intrinsics,
            mask=mask,
            normals=normal,
            image=image_out,
            coordinate_system="opencv_x_right_y_down_z_forward",
            provider_version="native-core",
            scale_mode=scale_mode,
            # MoGe returns intrinsics in normalized image coordinates
            # (x, y in [0, 1]; cx = cy = 0.5), not pixels.
            normalized_intrinsics=True,
        )
