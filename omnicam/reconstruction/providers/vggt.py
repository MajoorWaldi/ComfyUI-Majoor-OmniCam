"""VGGT multi-view / video geometry provider.

No auto-download: ``VGGT.from_pretrained()`` is never called because it can pull
from Hugging Face. Weights must already sit under::

    ComfyUI/models/geometry_estimation/vggt/VGGT-1B-Commercial/model.pt

Capability is false when the ``vggt`` package is missing, no checkpoint is
found, or CUDA is unavailable. ``VGGT-1B-Commercial`` is the documented
production target; the research-only Omega variant is a separate provider that
is never auto-selected.
"""

from __future__ import annotations

import importlib.util
from pathlib import Path
from typing import Any

from ..errors import (
    ReconRequestInvalidError,
    ReconVggtInferenceFailedError,
    ReconVggtModelMissingError,
    ReconVggtUnavailableError,
)
from ..gpu_guard import GpuStageGuard
from ..model_identity import ModelIdentity, file_model_identity
from ..settings import ReconstructionSettings
from .base import CancelToken, ProgressSink, ProviderCapabilities

_APPROVED_SUBDIR = ("geometry_estimation", "vggt")
_AUTO_PRIORITY = ("VGGT-1B-Commercial",)
_CHECKPOINT_FILENAMES = ("model.pt", "model.safetensors", "pytorch_model.bin")

#: Checkpoint folder names licensed for commercial use. Anything else installed
#: under models/geometry_estimation/vggt/ (notably the research-only
#: ``VGGT-1B``) is reported as non-commercial in the capability metadata.
_COMMERCIAL_CHECKPOINT_NAMES = frozenset({"VGGT-1B-Commercial"})


def _default_model_root() -> Path | None:
    try:
        import folder_paths
    except ImportError:
        return None
    try:
        base = Path(folder_paths.models_dir)
    except Exception:  # noqa: BLE001
        return None
    return base.joinpath(*_APPROVED_SUBDIR)


class VggtProvider:
    provider_id = "vggt"
    adapter_version = "1"

    #: Set False on the research-only subclass.
    commercial_use = True

    def __init__(
        self,
        *,
        model_root: Path | str | None = None,
        has_vggt_package: bool | None = None,
        cuda_available: bool | None = None,
    ) -> None:
        self._model_root = Path(model_root) if model_root is not None else None
        self._has_vggt_override = has_vggt_package
        self._cuda_override = cuda_available

    # -- environment probes ------------------------------------------- #
    def _has_vggt(self) -> bool:
        if self._has_vggt_override is not None:
            return self._has_vggt_override
        return importlib.util.find_spec("vggt") is not None

    def _cuda_available(self) -> bool:
        if self._cuda_override is not None:
            return self._cuda_override
        try:
            import torch

            return bool(torch.cuda.is_available())
        except Exception:  # noqa: BLE001
            return False

    def _root(self) -> Path | None:
        return self._model_root or _default_model_root()

    def _available_checkpoints(self) -> list[tuple[str, Path]]:
        root = self._root()
        if root is None or not root.is_dir():
            return []
        found: list[tuple[str, Path]] = []
        for entry in sorted(root.iterdir()):
            if entry.is_dir():
                for fname in _CHECKPOINT_FILENAMES:
                    if (entry / fname).is_file():
                        found.append((entry.name, entry / fname))
                        break
            elif entry.suffix in {".pt", ".safetensors", ".bin"}:
                found.append((entry.stem, entry))
        return found

    # -- public contract ------------------------------------------- #
    def capabilities(self) -> ProviderCapabilities:
        reasons: list[str] = []
        if not self._has_vggt():
            reasons.append("the 'vggt' Python package is not installed")
        checkpoints = self._available_checkpoints()
        if not checkpoints:
            reasons.append(
                "no VGGT checkpoint found under models/geometry_estimation/vggt/"
            )
        if not self._cuda_available():
            reasons.append("no CUDA GPU is available")
        available = not reasons
        checkpoint_names = [name for name, _ in checkpoints]
        # Report commercial-use only when the *installed* checkpoints actually
        # allow it -- not just because this is the base (non-research) adapter.
        installed_commercial = any(
            n in _COMMERCIAL_CHECKPOINT_NAMES for n in checkpoint_names
        )
        commercial_use = bool(self.commercial_use and installed_commercial)
        return ProviderCapabilities(
            provider_id=self.provider_id,
            available=available,
            modes=["scan"],
            source_kinds=["annotated_input", "annotated_output"],
            reason="" if available else "; ".join(reasons),
            recommended=False,
            metadata={
                "commercial_use": commercial_use,
                "checkpoints": checkpoint_names,
                "noncommercial_checkpoints": [
                    n for n in checkpoint_names if n not in _COMMERCIAL_CHECKPOINT_NAMES
                ],
                # never auto-select on a non-commercial checkpoint alone
                "auto_select": bool(self.commercial_use and installed_commercial),
            },
        )

    def resolve_checkpoint(self, requested: str) -> Path:
        available = self._available_checkpoints()
        if not available:
            raise ReconVggtModelMissingError(
                "No VGGT checkpoint under models/geometry_estimation/vggt/ "
                "(place e.g. VGGT-1B-Commercial/model.pt)"
            )
        by_name = {name: path for name, path in available}
        if requested and requested != "auto":
            if requested in by_name:
                return by_name[requested]
            raise ReconRequestInvalidError(
                f"Requested VGGT checkpoint {requested!r} is not installed"
            )
        for preferred in _AUTO_PRIORITY:
            if preferred in by_name:
                return by_name[preferred]
        return available[0][1]

    def checkpoint_identity(self, path: Path) -> ModelIdentity:
        try:
            return file_model_identity(
                path, provider_id=self.provider_id, adapter_version=self.adapter_version
            )
        except OSError:
            return ModelIdentity(self.provider_id, self.adapter_version, str(path), 0, 0)

    def reconstruct_views(
        self,
        samples: list[Any],
        settings: ReconstructionSettings,
        *,
        progress: ProgressSink | None = None,
        cancel: CancelToken | None = None,
        gpu_guard: GpuStageGuard | None = None,
    ) -> Any:
        """Run VGGT on ``samples`` and return normalized :class:`MultiViewEvidence`.

        Kept import-light: the heavy ``vggt`` / ``torch`` work is only imported
        when this actually runs on a capable machine.
        """
        caps = self.capabilities()
        if not caps.available:
            raise ReconVggtUnavailableError(caps.reason or "VGGT provider unavailable")

        checkpoint = self.resolve_checkpoint(settings.vggt_checkpoint)

        import torch
        from vggt.models.vggt import VGGT
        from vggt.utils.geometry import unproject_depth_map_to_point_map
        from vggt.utils.pose_enc import pose_encoding_to_extri_intri

        from ..multiview.coordinates import normalize_vggt_evidence
        from ..multiview.types import MultiViewEvidence, ViewCameraEvidence

        if gpu_guard is not None:
            gpu_guard.checkpoint()

        model = VGGT().eval()
        state = torch.load(str(checkpoint), map_location="cpu", weights_only=True)
        model.load_state_dict(state, strict=False)

        device = torch.device("cuda")
        dtype = torch.bfloat16 if torch.cuda.get_device_capability()[0] >= 8 else torch.float16
        images = _preprocess_vggt_samples(samples).to(device)
        model = model.to(device)
        try:
            with torch.inference_mode(), torch.autocast("cuda", dtype=dtype):
                pred = model(images)
            extr, intr = pose_encoding_to_extri_intri(pred["pose_enc"], images.shape[-2:])
            # Depth unprojection is generally more accurate than the direct
            # point-map branch (official VGGT README).
            points = unproject_depth_map_to_point_map(
                pred["depth"].squeeze(0), extr.squeeze(0), intr.squeeze(0)
            )
        except RuntimeError as exc:
            raise ReconVggtInferenceFailedError(f"VGGT forward failed: {exc}") from exc
        finally:
            model.to("cpu")
            del images
            torch.cuda.empty_cache()

        if gpu_guard is not None:
            gpu_guard.checkpoint()

        depth_conf = pred.get("depth_conf")
        cameras = []
        extr_np = extr.squeeze(0).float().cpu().numpy()
        intr_np = intr.squeeze(0).float().cpu().numpy()
        for i, sample in enumerate(samples):
            cameras.append(
                ViewCameraEvidence(
                    view_index=i,
                    width=int(getattr(sample, "width", 0)),
                    height=int(getattr(sample, "height", 0)),
                    extrinsic_camera_from_world=extr_np[i],
                    intrinsics=intr_np[i],
                    source_frame=getattr(sample, "source_frame", None),
                )
            )

        evidence = MultiViewEvidence(
            images=None,
            depth=pred["depth"].squeeze(0).float().cpu().numpy(),
            depth_confidence=None if depth_conf is None else depth_conf.squeeze(0).float().cpu().numpy(),
            points_world=points.float().cpu().numpy() if hasattr(points, "cpu") else points,
            point_confidence=None,
            cameras=cameras,
            provider_id=self.provider_id,
            provider_version=self.adapter_version,
        )
        return normalize_vggt_evidence(evidence)


#: VGGT's ViT patch size -- every input H and W must be a multiple of this.
_VGGT_PATCH = 14
#: Target long-edge resolution, matching vggt.utils.load_fn (``target_size``).
_VGGT_TARGET = 518


def _round_to_patch(value: float) -> int:
    return max(_VGGT_PATCH, round(value / _VGGT_PATCH) * _VGGT_PATCH)


def _preprocess_vggt_samples(samples: list[Any]) -> Any:
    """Stack sample images into a ``[V, 3, H, W]`` float tensor in [0, 1].

    Mirrors ``vggt.utils.load_fn.load_and_preprocess_images(mode="crop")`` but
    works on the in-memory ``ViewSample`` images the pipeline already holds:
    resize width to 518, height to the aspect-preserving multiple of 14, then
    centre-crop height to 518 if it overran. The model requires both dims to be
    multiples of the patch size.
    """
    import numpy as np
    import torch
    import torch.nn.functional as F  # noqa: N812

    resized: list[Any] = []
    for sample in samples:
        img = sample.image if hasattr(sample, "image") else sample
        arr = img.detach().cpu().numpy() if hasattr(img, "detach") else np.asarray(img)
        arr = np.asarray(arr, dtype=np.float32)
        if arr.ndim == 4:
            arr = arr[0]
        if arr.shape[-1] in (3, 4):  # H, W, C -> C, H, W
            arr = np.transpose(arr[..., :3], (2, 0, 1))
        if arr.max() > 1.5:
            arr = arr / 255.0

        chw = torch.from_numpy(np.ascontiguousarray(arr)).float().clamp_(0.0, 1.0)
        _, h, w = chw.shape
        new_w = _VGGT_TARGET
        new_h = _round_to_patch(round(h * (new_w / w)))
        chw = (
            F.interpolate(chw.unsqueeze(0), size=(new_h, new_w), mode="bicubic", align_corners=False)
            .squeeze(0)
            .clamp_(0.0, 1.0)
        )
        if new_h > _VGGT_TARGET:  # centre-crop the overrun (crop mode)
            top = (new_h - _VGGT_TARGET) // 2
            chw = chw[:, top : top + _VGGT_TARGET, :]
        resized.append(chw)

    # Pad every frame (white) to the common patch-aligned batch shape so
    # different aspect ratios still stack. Matches load_fn's white padding.
    batch_h = _round_to_patch(max(int(f.shape[1]) for f in resized))
    batch_w = _round_to_patch(max(int(f.shape[2]) for f in resized))
    frames = []
    for f in resized:
        pad_h = batch_h - int(f.shape[1])
        pad_w = batch_w - int(f.shape[2])
        if pad_h or pad_w:
            f = F.pad(f, (0, pad_w, 0, pad_h), value=1.0)
        frames.append(f)
    return torch.stack(frames, dim=0)
