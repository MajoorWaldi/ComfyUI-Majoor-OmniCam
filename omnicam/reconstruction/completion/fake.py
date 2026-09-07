"""Deterministic fake completion provider for pipeline tests."""

from __future__ import annotations

from typing import Any

import numpy as np

from .base import CompletedObjectEvidence, CompletionCapabilities


class FakeCompletionProvider:
    provider_id = "fake"
    adapter_version = "1"

    def __init__(self, *, hidden_depth: float = 0.8, confidence: float = 0.75) -> None:
        self._hidden_depth = float(hidden_depth)
        self._confidence = float(confidence)

    def capabilities(self) -> CompletionCapabilities:
        return CompletionCapabilities(
            provider_id=self.provider_id, available=True, metadata={"deterministic": True}
        )

    def complete(self, image: Any, mask: Any, *, seed: int, cancel: Any | None = None):
        """Return a filled box whose local depth extent is exactly ``hidden_depth``."""
        rng = np.random.default_rng(int(seed) if isinstance(seed, int) else 0)
        n = 2000
        pts = np.stack(
            [
                rng.uniform(-0.5, 0.5, n),
                rng.uniform(-0.5, 0.5, n),
                rng.uniform(-self._hidden_depth / 2.0, self._hidden_depth / 2.0, n),
            ],
            axis=-1,
        ).astype(np.float32)
        return CompletedObjectEvidence(
            points_local=pts,
            confidence=self._confidence,
            provider_id=self.provider_id,
            provider_version=self.adapter_version,
        )
