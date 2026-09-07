"""Segmentation provider contract.

A segmentation provider turns one image plus a label list into a flat list of
``InstanceEvidence``. Model-specific code lives behind this so the pipeline and
tests only ever see the structured result.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Protocol, runtime_checkable

from ..blockout.types import InstanceEvidence
from ..providers.base import CancelToken, ProgressSink
from ..settings import ReconstructionSettings

__all__ = [
    "CancelToken",
    "InstanceEvidence",
    "ProgressSink",
    "SegmentationCapabilities",
    "SegmentationProvider",
]


@dataclass(slots=True)
class SegmentationCapabilities:
    provider_id: str
    available: bool
    reason: str = ""
    checkpoints: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "provider_id": self.provider_id,
            "available": bool(self.available),
            "reason": str(self.reason),
            "checkpoints": list(self.checkpoints),
            "metadata": dict(self.metadata),
        }


@runtime_checkable
class SegmentationProvider(Protocol):
    provider_id: str

    def capabilities(self) -> SegmentationCapabilities: ...

    def segment(
        self,
        image: Any,
        labels: list[str],
        settings: ReconstructionSettings,
        *,
        progress: ProgressSink | None = None,
        cancel: CancelToken | None = None,
    ) -> list[InstanceEvidence]: ...
