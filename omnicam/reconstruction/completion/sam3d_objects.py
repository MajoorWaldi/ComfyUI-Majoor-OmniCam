"""SAM 3D Objects completion provider.

Optional and strictly capability-gated. Official baseline: Linux 64-bit, an
NVIDIA CUDA GPU with >= 32 GB VRAM, the ``sam3d_objects`` package, and a
pipeline config under ``ComfyUI/models/sam3d_objects/``. The gate is never
weakened to make an unsupported machine "work"; removing the package must leave
Blockout and Scan fully operational.
"""

from __future__ import annotations

import importlib.util
import platform
from pathlib import Path
from typing import Any

import numpy as np

from ..errors import ReconInferenceFailedError, ReconProviderUnavailableError
from ..model_cache import SingleSlotModelCache
from ..model_identity import ModelIdentity, file_model_identity
from .base import CancelToken, CompletedObjectEvidence, CompletionCapabilities

_APPROVED_SUBDIR = ("sam3d_objects",)
_MIN_VRAM_GB = 32.0
_CONFIG_NAMES = ("pipeline.yaml", "pipeline.yml", "config.yaml")


def _unavailable(reason: str) -> CompletionCapabilities:
    return CompletionCapabilities(provider_id="sam3d_objects", available=False, reason=reason)


class Sam3dObjectsCompletionProvider:
    provider_id = "sam3d_objects"
    adapter_version = "1"

    def __init__(
        self,
        *,
        config_root: Path | str | None = None,
        system: str | None = None,
        cuda_available: bool | None = None,
        vram_gb: float | None = None,
        has_package: bool | None = None,
        inference_class: Any | None = None,
    ) -> None:
        self._config_root = Path(config_root) if config_root is not None else None
        self._system = system
        self._cuda = cuda_available
        self._vram_gb = vram_gb
        self._has_package = has_package
        self._inference_class = inference_class
        self._engine_cache: SingleSlotModelCache = SingleSlotModelCache()

    # -- probes --------------------------------------------------------- #
    def _system_name(self) -> str:
        return self._system if self._system is not None else platform.system()

    def _cuda_ok(self) -> bool:
        if self._cuda is not None:
            return self._cuda
        try:
            import torch

            return bool(torch.cuda.is_available())
        except Exception:  # noqa: BLE001
            return False

    def _total_vram_gb(self) -> float:
        if self._vram_gb is not None:
            return self._vram_gb
        try:
            import torch

            return torch.cuda.get_device_properties(0).total_memory / 1024**3
        except Exception:  # noqa: BLE001
            return 0.0

    def _package_present(self) -> bool:
        if self._has_package is not None:
            return self._has_package
        return importlib.util.find_spec("sam3d_objects") is not None

    def _root(self) -> Path | None:
        if self._config_root is not None:
            return self._config_root
        try:
            import folder_paths

            return Path(folder_paths.models_dir).joinpath(*_APPROVED_SUBDIR)
        except Exception:  # noqa: BLE001
            return None

    def resolve_pipeline_config(self) -> Path | None:
        root = self._root()
        if root is None or not root.is_dir():
            return None
        for name in _CONFIG_NAMES:
            candidate = root / name
            if candidate.is_file():
                return candidate
        return None

    # -- contract ---------------------------------------------------- #
    def capabilities(self) -> CompletionCapabilities:
        if self._system_name() != "Linux":
            return _unavailable("SAM3D Objects official runtime currently requires Linux 64-bit")
        if not self._cuda_ok():
            return _unavailable("SAM3D Objects requires an NVIDIA CUDA GPU")
        total_gb = self._total_vram_gb()
        if total_gb < _MIN_VRAM_GB:
            return _unavailable(
                f"SAM3D Objects official baseline requires >={_MIN_VRAM_GB:.0f} GB VRAM; "
                f"detected {total_gb:.1f} GB"
            )
        if not self._package_present():
            return _unavailable("sam3d_objects Python package is not installed")
        config = self.resolve_pipeline_config()
        if config is None:
            return _unavailable(
                "SAM3D Objects pipeline.yaml/checkpoints were not found in models/sam3d_objects"
            )
        return CompletionCapabilities(
            provider_id=self.provider_id,
            available=True,
            metadata={"config": str(config), "min_vram_gb": _MIN_VRAM_GB},
        )

    def config_identity(self, config: Path) -> ModelIdentity:
        try:
            return file_model_identity(
                config, provider_id=self.provider_id, adapter_version=self.adapter_version
            )
        except OSError:
            return ModelIdentity(self.provider_id, self.adapter_version, str(config), 0, 0)

    def _load_inference_class(self) -> Any:
        if self._inference_class is not None:
            return self._inference_class
        try:
            from sam3d_objects.inference import Inference

            return Inference
        except ImportError:
            pass
        # The official quick-start ships notebook/inference.py exposing the same
        # public wrapper. Never mutate sys.path from an HTTP/DOM value.
        from inference import Inference

        return Inference

    def complete(
        self,
        image: Any,
        mask: Any,
        *,
        seed: int,
        cancel: CancelToken | None = None,
    ) -> CompletedObjectEvidence:
        caps = self.capabilities()
        if not caps.available:
            raise ReconProviderUnavailableError(caps.reason)
        if cancel is not None and cancel.is_cancelled():
            from ..errors import ReconCancelledError

            raise ReconCancelledError("SAM3D completion cancelled")

        inference_cls = self._load_inference_class()
        config = self.resolve_pipeline_config()
        engine = self._engine_cache.get_or_load(
            self.config_identity(config).cache_token,
            lambda: inference_cls(str(config), compile=False),
        )
        image_np = _to_uint8(image)
        mask_np = _to_bool(mask)
        output = engine(image_np, mask_np, seed=int(seed))
        points = _active_gaussian_points(output["gs"], opacity_threshold=0.5)
        if len(points) < 32:
            raise ReconInferenceFailedError(
                "SAM3D returned too little usable object geometry"
            )
        return CompletedObjectEvidence(
            points_local=points,
            confidence=0.75,
            provider_id=self.provider_id,
            provider_version=self.adapter_version,
        )


def _to_uint8(image: Any) -> np.ndarray:
    arr = image.detach().cpu().numpy() if hasattr(image, "detach") else np.asarray(image)
    arr = np.asarray(arr)
    if arr.ndim == 4:
        arr = arr[0]
    if arr.dtype != np.uint8:
        arr = np.clip(arr * (255.0 if arr.max() <= 1.5 else 1.0), 0, 255).astype(np.uint8)
    return arr[..., :3]


def _to_bool(mask: Any) -> np.ndarray:
    arr = mask.detach().cpu().numpy() if hasattr(mask, "detach") else np.asarray(mask)
    arr = np.asarray(arr)
    if arr.ndim == 3:
        arr = arr[0] if arr.shape[0] in (1,) else arr[..., 0]
    return arr > 0.5


def _active_gaussian_points(gs: Any, *, opacity_threshold: float) -> np.ndarray:
    xyz = gs.get_xyz.detach().float().cpu().numpy() if hasattr(gs.get_xyz, "detach") else np.asarray(gs.get_xyz)
    opacity = (
        gs.get_opacity.detach().float().cpu().numpy()
        if hasattr(gs.get_opacity, "detach")
        else np.asarray(gs.get_opacity)
    )
    opacity = np.asarray(opacity).reshape(-1)
    xyz = np.asarray(xyz).reshape(-1, 3)
    return xyz[opacity > opacity_threshold].astype(np.float32, copy=False)
