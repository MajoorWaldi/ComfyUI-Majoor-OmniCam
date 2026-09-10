"""High-level execution progress, forwarded to ComfyUI when it is present.

A queued Extractor solve reports coarse progress through ComfyUI's own
execution API (``ComfyAPISync().execution.set_progress``) so the frontend's
node progress bar and the queue view stay authoritative. Rich diagnostics
(feature points, pose samples, quality) remain a separate non-authoritative
side channel.

This module is import-safe without ComfyUI: the default setter resolves
``ComfyAPISync`` lazily and yields ``None`` when it is unavailable, so
:class:`ExecutionProgress` becomes a silent no-op rather than an error in the
pure test suite.
"""

from __future__ import annotations

import contextlib
from collections.abc import Callable

#: Percentage bands for the two Extractor modes. ``omnicam/nodes/extractor.py``
#: maps each solve phase onto one of these.
CAMERA_TRACK_PHASES: dict[str, tuple[float, float]] = {
    "source": (0.0, 5.0),
    "tracking": (5.0, 85.0),
    "solver": (85.0, 97.0),
    "finalize": (97.0, 100.0),
}
SCENE_RECONSTRUCT_PHASES: dict[str, tuple[float, float]] = {
    "source": (0.0, 10.0),
    "geometry": (10.0, 45.0),
    "segmentation": (45.0, 70.0),
    "completion": (70.0, 90.0),
    "compile": (90.0, 100.0),
}


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _default_setter() -> Callable[..., None] | None:
    try:
        from . import ComfyAPISync
    except Exception:  # noqa: BLE001 - ComfyUI absent: progress is simply silent
        return None
    try:
        return ComfyAPISync().execution.set_progress
    except Exception:  # noqa: BLE001 - never let a progress sink break a solve
        return None


class ExecutionProgress:
    """Monotonic high-level progress, reported through Comfy's execution API.

    ``update`` never moves backward and never raises: a finished solve must not
    be lost because a progress sink misbehaved.
    """

    def __init__(
        self,
        setter: Callable[..., None] | None = None,
        *,
        max_value: float = 100.0,
    ) -> None:
        self._setter = _default_setter() if setter is None else setter
        self._max = float(max_value)
        self._last = 0.0

    def update(self, value: float, max_value: float | None = None) -> None:
        if max_value is not None:
            self._max = float(max_value)
        current = _clamp(float(value), 0.0, self._max)
        if current <= self._last:
            return
        self._last = current
        if self._setter is None:
            return
        # progress is best-effort: a sink that misbehaves must not lose a solve.
        with contextlib.suppress(Exception):
            self._setter(value=current, max_value=self._max)

    def phase(self, band: tuple[float, float], fraction: float) -> None:
        """Report ``fraction`` (0..1) mapped into the percentage ``band``."""
        start, end = band
        self.update(start + (end - start) * _clamp(float(fraction), 0.0, 1.0), 100.0)

    def phase_done(self, band: tuple[float, float]) -> None:
        """Snap to the end of ``band`` once its phase has finished."""
        self.update(band[1], 100.0)

    def frame_reporter(self, band: tuple[float, float]) -> Callable[[int, int], None]:
        """A ``(done, total)`` callback for the solver, mapped into ``band``."""

        def report(done: int, total: int) -> None:
            self.phase(band, done / total if total else 0.0)

        return report
