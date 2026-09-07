"""Optional hidden-volume completion provider contract.

A completion provider takes one image + one instance mask and returns a
*complete* local point cloud (front and back). It never becomes the scene
representation -- ``alignment`` folds only weak hidden dimensions of the
measured blockout, bounded.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Protocol, runtime_checkable

from ..providers.base import CancelToken

__all__ = [
    "CancelToken",
    "CompletedObjectEvidence",
    "CompletionCapabilities",
    "CompletionProvider",
]


@dataclass(slots=True)
class CompletionCapabilities:
    provider_id: str
    available: bool
    reason: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "provider_id": self.provider_id,
            "available": bool(self.available),
            "reason": str(self.reason),
            "metadata": dict(self.metadata),
        }


@dataclass(slots=True)
class CompletedObjectEvidence:
    points_local: Any  # (N, 3) object-local, origin ~ centroid
    confidence: float
    provider_id: str
    provider_version: str


@runtime_checkable
class CompletionProvider(Protocol):
    provider_id: str

    def capabilities(self) -> CompletionCapabilities: ...

    def complete(
        self,
        image: Any,
        mask: Any,
        *,
        seed: int,
        cancel: CancelToken | None = None,
    ) -> CompletedObjectEvidence: ...
