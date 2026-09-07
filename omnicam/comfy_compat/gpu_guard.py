"""Generic, throttled GPU-contention probe.

Any OmniCam subsystem that hands the GPU to work outside ComfyUI's own prompt
queue (DPVO's SolveControl, and reconstruction's provider inference) needs the
same protection: ComfyUI does not know a card is spoken for, so a workflow
queued mid-solve reloads a checkpoint straight into VRAM the child is already
using. Nobody wins that race; both sides OOM.

Two ways to lose that race, two checks:

- At *admission*: refuse to even start while the queue is running. One-shot,
  cheap, and it stops the common case outright.
- *Mid-run*: the admission read is stale the instant a workflow queues a
  moment later, so a running job has to keep asking -- at points it chose,
  throttled, so the check costs nothing between them.

This module holds only the throttling/probing primitive itself; job-specific
wiring (which exception to raise, when to arm, what state transition follows)
belongs to the caller. See omnicam/extractor/jobs/control.py for the
DPVO-specific sibling this generalizes from -- deliberately not rebuilt on top
of this shared primitive, so its already-tested behavior stays exactly as it
was.
"""

from __future__ import annotations

import time
from collections.abc import Callable

#: How often an armed guard re-reads ComfyUI's queue. Half a second is far
#: inside the reload time of any model worth guarding against, and the check
#: happens on a loop that is not otherwise CPU-bound.
DEFAULT_POLL_SECONDS = 0.5


class GpuContentionDetected(Exception):  # noqa: N818 - a condition, not necessarily an error
    """A ComfyUI workflow claimed the GPU while an out-of-band GPU job was running."""


class GpuContentionGuard:
    """A throttled, arm-then-poll contention probe."""

    def __init__(
        self,
        *,
        execution_probe: Callable[[], bool] | None = None,
        clock: Callable[[], float] = time.monotonic,
        poll_seconds: float = DEFAULT_POLL_SECONDS,
    ) -> None:
        self._execution_probe = execution_probe
        self._clock = clock
        self._poll_seconds = float(poll_seconds)
        self._armed = False
        self._next_probe = 0.0

    def arm(self) -> None:
        """Start polling from the next check() call onward.

        Not immediately: the caller has typically just read the queue as idle
        at admission, and re-reading it in the same instant only re-confirms
        that. The first real poll lands one interval later.
        """
        self._armed = True
        self._next_probe = self._clock() + self._poll_seconds

    def check(self, *, force: bool = False) -> None:
        """Raise GpuContentionDetected if ComfyUI has claimed the GPU.

        A clean no-op with no probe wired (headless, tests), while unarmed
        (``force=False``), or before the next scheduled poll -- unless
        ``force=True``, for the one moment a check must not be skipped:
        immediately before releasing ComfyUI's own VRAM to a child.
        """
        if self._execution_probe is None:
            return
        if not force:
            if not self._armed:
                return
            now = self._clock()
            if now < self._next_probe:
                return
            self._next_probe = now + self._poll_seconds
        else:
            self._next_probe = self._clock() + self._poll_seconds
        try:
            busy = bool(self._execution_probe())
        except Exception:  # noqa: BLE001 - a probe that breaks must not stop a healthy job
            return
        if busy:
            raise GpuContentionDetected
