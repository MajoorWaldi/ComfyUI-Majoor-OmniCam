"""Native ComfyUI SAM3 / SAM3.1 semantic segmentation adapter.

Uses the official blueprint chain (``CheckpointLoaderSimple`` -> ``CLIPTextEncode``
-> ``SAM3_Detect``) through the installed ComfyUI nodes -- no second segmentation
dependency is added. Every ComfyUI import is lazy so this module imports fine in
a pure-reconstruction test environment; the fake provider covers pipeline tests.
"""

from __future__ import annotations

import contextlib
import uuid
from dataclasses import dataclass
from typing import Any

import numpy as np

from ..errors import (
    ReconCancelledError,
    ReconInferenceFailedError,
    ReconProviderUnavailableError,
    ReconRequestInvalidError,
)
from ..model_cache import SingleSlotModelCache
from ..model_identity import ModelIdentity, file_model_identity
from ..settings import ReconstructionSettings
from .base import CancelToken, InstanceEvidence, ProgressSink, SegmentationCapabilities

#: ``auto`` picks the first of these that is installed, then falls back to the
#: lexically first ``sam3*`` checkpoint.
_AUTO_PRIORITY: tuple[str, ...] = ("sam3.1_multiplex_fp16.safetensors",)

#: SAM3's text path caps detections per category at 1 unless the prompt carries
#: a ``category : N`` suffix (see comfy/text_encoders/sam3_clip.py). Hard cap
#: so a runaway label cannot ask for thousands of masks.
_MAX_DETECTIONS_PER_LABEL = 64

#: Process-lifetime, capacity-1. Shared across provider instances (the registry
#: builds a fresh ``ComfySam3Provider`` per job) so the SAM3 checkpoint is
#: loaded once, not re-read from disk on every reconstruction.
_SHARED_MODEL_CACHE = SingleSlotModelCache()


@contextlib.contextmanager
def _node_execution_context():
    """Give SAM3's internal ``comfy.utils.ProgressBar`` a node context.

    Run outside ComfyUI's prompt queue, that ProgressBar falls back to
    ``PromptServer.instance.last_prompt_id`` -- absent until a real prompt has
    executed once. Same escape hatch the MoGe adapter uses; contextvar-based so
    it cannot collide with a real prompt on the main thread.
    """
    try:
        from comfy_execution.utils import CurrentNodeContext

        ctx = CurrentNodeContext(
            prompt_id=f"omnicam-sam3-{uuid.uuid4().hex[:12]}",
            node_id="MajoorOmniCamReconstruction",
        )
    except Exception:  # noqa: BLE001
        ctx = None
    with ctx if ctx is not None else contextlib.nullcontext():
        yield


@dataclass(slots=True)
class _Sam3Modules:
    sam3_nodes: Any
    core_nodes: Any
    folder_paths: Any


def extract_node_outputs(out: Any, *, expected: int = 2) -> tuple[Any, ...]:
    """Pull the positional outputs out of whatever a ComfyUI node returned.

    Handles a bare tuple/list, a V3 ``NodeOutput``-like object (``.result`` /
    ``.outputs``), and a single value. Raises if fewer than ``expected`` values
    are available.
    """
    candidate = out
    for attr in ("result", "outputs", "args"):
        inner = getattr(candidate, attr, None)
        if inner is not None and not callable(inner):
            candidate = inner
            break
    if isinstance(candidate, dict):
        candidate = tuple(candidate.values())
    if not isinstance(candidate, (tuple, list)):
        candidate = (candidate,)
    if len(candidate) < expected:
        raise ReconInferenceFailedError(
            f"SAM3_Detect returned {len(candidate)} outputs, expected at least {expected}"
        )
    return tuple(candidate[:expected])


def _as_mask_stack(masks: Any) -> np.ndarray:
    arr = masks
    if hasattr(arr, "detach"):
        arr = arr.detach().cpu().numpy()
    arr = np.asarray(arr)
    if arr.ndim == 2:
        arr = arr[None, ...]
    elif arr.ndim == 4:  # N,1,H,W or N,H,W,1
        if arr.shape[1] == 1:
            arr = arr[:, 0, :, :]
        elif arr.shape[-1] == 1:
            arr = arr[..., 0]
        else:
            arr = arr[:, 0, :, :]
    if arr.ndim != 3:
        raise ReconInferenceFailedError(f"unexpected SAM3 mask shape {arr.shape}")
    return arr > 0.5


def _bbox_from_mask(mask: np.ndarray) -> tuple[float, float, float, float]:
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return (0.0, 0.0, 0.0, 0.0)
    return (float(xs.min()), float(ys.min()), float(xs.max()) + 1.0, float(ys.max()) + 1.0)


def _mask_iou(a: np.ndarray, b: np.ndarray) -> float:
    inter = np.logical_and(a, b).sum()
    union = np.logical_or(a, b).sum()
    return float(inter) / float(union) if union else 0.0


def _normalize_sam3_boxes(boxes: Any) -> list[tuple[float, float, float, float, float]]:
    """Flatten SAM3's box output into ``[(x1, y1, x2, y2, score), ...]``.

    The official ``SAM3_Detect`` returns ``all_bbox_dicts`` -- a *per-frame*
    list of lists of ``{"x", "y", "width", "height", "score"}`` dicts, where
    ``x``/``y`` is the top-left corner in pixels. Single-image reconstruction
    only submits one frame, so frame 0 is taken. A numeric ``[N, 4|5]`` array
    (older builds / the test doubles) is still accepted.
    """
    if boxes is None:
        return []
    if hasattr(boxes, "detach"):  # tensor
        boxes = boxes.detach().cpu().numpy().tolist()

    seq = boxes
    # Unwrap one level of per-frame nesting -- but only real per-frame nesting
    # (list[list[dict]] / list[list[[x,y,w,h]]]), not a flat list[[x,y,w,h]].
    if (
        isinstance(seq, (list, tuple))
        and len(seq) > 0
        and isinstance(seq[0], (list, tuple))
        and (len(seq[0]) == 0 or isinstance(seq[0][0], (dict, list, tuple)))
    ):
        seq = seq[0]

    out: list[tuple[float, float, float, float, float]] = []
    for entry in seq or []:
        if isinstance(entry, dict):
            x = float(entry.get("x", 0.0))
            y = float(entry.get("y", 0.0))
            w = float(entry.get("width", 0.0))
            h = float(entry.get("height", 0.0))
            score = float(entry.get("score", 0.9))
            out.append((x, y, x + w, y + h, score))
        elif isinstance(entry, (list, tuple)) and len(entry) >= 4:
            score = float(entry[4]) if len(entry) >= 5 else 0.9
            out.append((float(entry[0]), float(entry[1]), float(entry[2]), float(entry[3]), score))
    return out


def instances_from_sam3_output(
    *,
    label: str,
    label_index: int,
    masks: Any,
    boxes: Any,
    min_area_ratio: float,
) -> list[InstanceEvidence]:
    """One :class:`InstanceEvidence` per returned mask, tiny masks dropped.

    ``masks[i]`` and ``boxes[i]`` are index-aligned: ``SAM3_Detect`` appends the
    refined mask and its bbox dict in the same per-detection order.
    """
    stack = _as_mask_stack(masks)
    box_rows = _normalize_sam3_boxes(boxes)

    out: list[InstanceEvidence] = []
    total_px = float(stack.shape[1] * stack.shape[2]) or 1.0
    for i in range(stack.shape[0]):
        mask = stack[i]
        area_ratio = float(mask.sum()) / total_px
        if area_ratio < float(min_area_ratio):
            continue
        if i < len(box_rows):
            x1, y1, x2, y2, score = box_rows[i]
            bbox = (x1, y1, x2, y2)
        else:
            bbox = _bbox_from_mask(mask)
            score = 0.9
        out.append(
            InstanceEvidence(
                instance_id=f"{label}_{label_index}_{i}",
                label=label,
                score=max(0.0, min(1.0, score)),
                mask=mask,
                bbox_xyxy=bbox,
                view_index=0,
            )
        )
    return out


def deduplicate_instances(
    instances: list[InstanceEvidence], *, iou_threshold: float
) -> list[InstanceEvidence]:
    """Greedy, deterministic NMS across the whole set.

    Sorted by descending score then instance id, an instance is dropped when it
    overlaps an already-kept instance *of the same label* above the threshold --
    the already-kept one has the higher score by construction.
    """
    ordered = sorted(instances, key=lambda x: (-x.score, x.instance_id))
    kept: list[InstanceEvidence] = []
    for cand in ordered:
        cand_mask = np.asarray(cand.mask, dtype=bool)
        if any(
            k.label == cand.label
            and cand_mask.shape == np.asarray(k.mask).shape
            and _mask_iou(cand_mask, np.asarray(k.mask, dtype=bool)) >= iou_threshold
            for k in kept
        ):
            continue
        kept.append(cand)
    return kept


class ComfySam3Provider:
    provider_id = "comfy_sam3"
    adapter_version = "1"

    def __init__(
        self,
        *,
        modules: _Sam3Modules | None = None,
        model_cache: SingleSlotModelCache | None = None,
    ) -> None:
        self._modules = modules
        self._model_cache: SingleSlotModelCache = model_cache or _SHARED_MODEL_CACHE

    # -- module / checkpoint resolution ----------------------------------- #
    def _load_modules(self) -> _Sam3Modules:
        if self._modules is not None:
            return self._modules
        import comfy_extras.nodes_sam3 as sam3_nodes
        import folder_paths
        import nodes as core_nodes

        return _Sam3Modules(sam3_nodes=sam3_nodes, core_nodes=core_nodes, folder_paths=folder_paths)

    @staticmethod
    def _sam3_checkpoints(mods: _Sam3Modules) -> list[str]:
        names = mods.folder_paths.get_filename_list("checkpoints")
        return sorted(n for n in names if "sam3" in str(n).lower())

    def resolve_checkpoint(self, requested: str, mods: _Sam3Modules) -> str:
        available = self._sam3_checkpoints(mods)
        if not available:
            raise ReconProviderUnavailableError(
                "No sam3* checkpoint found under models/checkpoints"
            )
        if requested and requested != "auto":
            if requested in available:
                return requested
            raise ReconRequestInvalidError(
                f"Requested SAM3 checkpoint {requested!r} is not installed"
            )
        for preferred in _AUTO_PRIORITY:
            if preferred in available:
                return preferred
        return available[0]

    def _checkpoint_identity(self, name: str, mods: _Sam3Modules) -> ModelIdentity:
        getter = getattr(mods.folder_paths, "get_full_path", None)
        path = None
        if callable(getter):
            try:
                path = getter("checkpoints", name)
            except Exception:  # noqa: BLE001 - fall back to name-only identity
                path = None
        if path:
            try:
                return file_model_identity(
                    path, provider_id=self.provider_id, adapter_version=self.adapter_version
                )
            except OSError:
                pass
        return ModelIdentity(self.provider_id, self.adapter_version, str(name), 0, 0)

    def identity_token(self, settings: ReconstructionSettings) -> str:
        """Best-effort cache token for the SAM3 checkpoint this run will load.

        Folded into the reconstruction cache key so swapping the SAM3 checkpoint
        invalidates a stale blockout. Falls back to a name-only token when the
        ComfyUI modules are not importable (pure-test env).
        """
        try:
            mods = self._load_modules()
            checkpoint = self.resolve_checkpoint(settings.sam3_checkpoint, mods)
            return self._checkpoint_identity(checkpoint, mods).cache_token
        except Exception:  # noqa: BLE001
            return ModelIdentity(
                self.provider_id, self.adapter_version, str(settings.sam3_checkpoint), 0, 0
            ).cache_token

    # -- public API ----------------------------------------------------- #
    def capabilities(self) -> SegmentationCapabilities:
        try:
            mods = self._load_modules()
        except ImportError as exc:
            return SegmentationCapabilities(
                provider_id=self.provider_id,
                available=False,
                reason=f"ComfyUI SAM3 nodes not importable: {exc}",
            )
        try:
            checkpoints = self._sam3_checkpoints(mods)
        except Exception as exc:  # noqa: BLE001
            return SegmentationCapabilities(
                provider_id=self.provider_id, available=False, reason=f"checkpoint scan failed: {exc}"
            )
        if not checkpoints:
            return SegmentationCapabilities(
                provider_id=self.provider_id,
                available=False,
                reason="Install a sam3* checkpoint (e.g. sam3.1_multiplex_fp16.safetensors) in models/checkpoints",
            )
        return SegmentationCapabilities(
            provider_id=self.provider_id,
            available=True,
            checkpoints=checkpoints,
        )

    def segment(
        self,
        image: Any,
        labels: list[str],
        settings: ReconstructionSettings,
        *,
        progress: ProgressSink | None = None,
        cancel: CancelToken | None = None,
    ) -> list[InstanceEvidence]:
        mods = self._load_modules()
        checkpoint = self.resolve_checkpoint(settings.sam3_checkpoint, mods)
        identity = self._checkpoint_identity(checkpoint, mods)

        model, clip = self._model_cache.get_or_load(
            identity.cache_token,
            lambda: tuple(mods.core_nodes.CheckpointLoaderSimple().load_checkpoint(checkpoint))[:2],
        )

        # SAM3 keeps only the single top-scoring detection per category unless
        # the prompt asks for more via a ``category : N`` suffix.
        max_det = max(1, min(int(settings.max_blockout_objects), _MAX_DETECTIONS_PER_LABEL))

        instances: list[InstanceEvidence] = []
        n_labels = max(1, len(labels))
        with _node_execution_context():
            for label_index, label in enumerate(labels):
                if cancel is not None and cancel.is_cancelled():
                    raise ReconCancelledError("Segmentation cancelled")
                prompt = f"{label} : {max_det}" if max_det > 1 else label
                conditioning = mods.core_nodes.CLIPTextEncode().encode(clip, prompt)[0]
                out = mods.sam3_nodes.SAM3_Detect.execute(
                    model,
                    image,
                    conditioning=conditioning,
                    threshold=settings.sam3_threshold,
                    refine_iterations=settings.sam3_refine_iterations,
                    individual_masks=True,
                )
                masks, boxes = extract_node_outputs(out, expected=2)
                instances.extend(
                    instances_from_sam3_output(
                        label=label,
                        label_index=label_index,
                        masks=masks,
                        boxes=boxes,
                        min_area_ratio=settings.min_instance_area_ratio,
                    )
                )
                if progress is not None:
                    progress("SEGMENT_SCENE", (label_index + 1) / n_labels, f"Detecting {label}")

        return deduplicate_instances(instances, iou_threshold=settings.instance_iou_dedup)
