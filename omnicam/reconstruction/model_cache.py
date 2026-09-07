"""Process-lifetime, capacity-1 model cache.

Reconstruction stages load heavy weights (a SAM3 checkpoint, a VGGT model, a
SAM3D engine). Within one process we want to reuse the last one loaded but never
pin more than a single set of weights in memory, so the geometry stage is not
fighting the segmentation stage for VRAM.
"""

from __future__ import annotations

import threading
from collections.abc import Callable
from typing import Generic, TypeVar

T = TypeVar("T")


class SingleSlotModelCache(Generic[T]):
    """Holds at most one ``(token -> value)`` pair. A different token evicts."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._token: str | None = None
        self._value: T | None = None

    def get_or_load(self, token: str, loader: Callable[[], T]) -> T:
        with self._lock:
            if self._token == token and self._value is not None:
                return self._value
            # Drop the old reference before loading the new one.
            self._value = None
            self._token = None
            value = loader()
            self._token = token
            self._value = value
            return value

    def peek_token(self) -> str | None:
        return self._token

    def clear(self) -> None:
        with self._lock:
            self._value = None
            self._token = None
