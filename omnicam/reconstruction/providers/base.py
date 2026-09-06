"""Provider interface protocols and capability reporting."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any, Protocol, runtime_checkable

from ..settings import ReconstructionSettings
from ..types import GeometryEvidence, ReconstructionSource

ProgressSink = Callable[[str, float, str], None]


@runtime_checkable
class CancelToken(Protocol):
    """Cooperative cancellation token."""

    def is_cancelled(self) -> bool: ...


@dataclass(slots=True)
class ProviderCapabilities:
    provider_id: str
    available: bool
    modes: list[str]
    source_kinds: list[str]
    reason: str = ""
    recommended: bool = False
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "provider_id": self.provider_id,
            "available": bool(self.available),
            "modes": list(self.modes),
            "source_kinds": list(self.source_kinds),
            "reason": str(self.reason),
            "recommended": bool(self.recommended),
            "metadata": dict(self.metadata),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ProviderCapabilities:
        if not isinstance(data, dict):
            raise TypeError(f"Expected dict for ProviderCapabilities, got {type(data).__name__}")
        return cls(
            provider_id=str(data.get("provider_id", "")),
            available=bool(data.get("available", False)),
            modes=[str(m) for m in data.get("modes", [])],
            source_kinds=[str(s) for s in data.get("source_kinds", [])],
            reason=str(data.get("reason", "")),
            recommended=bool(data.get("recommended", False)),
            metadata=dict(data.get("metadata", {})),
        )


@runtime_checkable
class ReconstructionProvider(Protocol):
    """Protocol for reconstruction geometry providers."""

    @property
    def provider_id(self) -> str: ...

    def capabilities(self) -> ProviderCapabilities: ...

    def reconstruct(
        self,
        source: ReconstructionSource,
        settings: ReconstructionSettings,
        *,
        progress: ProgressSink | None = None,
        cancel: CancelToken | None = None,
    ) -> GeometryEvidence: ...
