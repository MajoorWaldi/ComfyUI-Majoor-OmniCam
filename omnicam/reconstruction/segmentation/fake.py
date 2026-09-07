"""Deterministic fake segmentation provider.

Makes the full semantic pipeline testable without CUDA, model weights or the
ComfyUI node graph: given an image size it lays down one axis-aligned
rectangular mask per label, placed by a seeded RNG so results are reproducible.
"""

from __future__ import annotations

import hashlib
from typing import Any

import numpy as np

from ..settings import ReconstructionSettings
from .base import (
    CancelToken,
    InstanceEvidence,
    ProgressSink,
    SegmentationCapabilities,
)


def _image_hw(image: Any) -> tuple[int, int]:
    arr = np.asarray(image)
    if arr.ndim == 4:  # B, H, W, C
        return int(arr.shape[1]), int(arr.shape[2])
    if arr.ndim == 3:  # H, W, C
        return int(arr.shape[0]), int(arr.shape[1])
    if arr.ndim == 2:
        return int(arr.shape[0]), int(arr.shape[1])
    raise ValueError(f"cannot infer image size from array of shape {arr.shape}")


class FakeSegmentationProvider:
    provider_id = "fake"
    adapter_version = "1"

    def __init__(self, *, instances_per_label: int = 1, base_score: float = 0.8) -> None:
        self._per_label = max(1, int(instances_per_label))
        self._base_score = float(base_score)

    def capabilities(self) -> SegmentationCapabilities:
        return SegmentationCapabilities(
            provider_id=self.provider_id,
            available=True,
            reason="",
            checkpoints=["<fake>"],
            metadata={"deterministic": True},
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
        h, w = _image_hw(image)
        instances: list[InstanceEvidence] = []
        n_labels = max(1, len(labels))
        for li, label in enumerate(labels):
            if cancel is not None and cancel.is_cancelled():
                from ..errors import ReconCancelledError

                raise ReconCancelledError("Segmentation cancelled")
            seed = int(hashlib.sha256(label.encode("utf-8")).hexdigest()[:8], 16)
            rng = np.random.default_rng(seed)
            for k in range(self._per_label):
                bw = int(w * rng.uniform(0.15, 0.35))
                bh = int(h * rng.uniform(0.25, 0.5))
                x0 = int(rng.uniform(0, max(1, w - bw)))
                y0 = int(rng.uniform(0, max(1, h - bh)))
                x1, y1 = x0 + bw, y0 + bh
                mask = np.zeros((h, w), dtype=bool)
                mask[y0:y1, x0:x1] = True
                instances.append(
                    InstanceEvidence(
                        instance_id=f"fake_{label}_{k}",
                        label=label,
                        score=min(1.0, self._base_score + 0.05 * (k == 0)),
                        mask=mask,
                        bbox_xyxy=(float(x0), float(y0), float(x1), float(y1)),
                        view_index=0,
                    )
                )
            if progress is not None:
                progress("SEGMENT_SCENE", (li + 1) / n_labels, f"Detecting {label}")
        return instances
