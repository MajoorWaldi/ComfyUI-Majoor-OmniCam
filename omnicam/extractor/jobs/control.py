"""Cooperative stop for a running solve.

Nothing here interrupts a thread. A solver is torn between a CUDA context, a
decoder and a few hundred megabytes of buffers, and killing that from outside
is how you get a corrupted GPU state that survives the job. So the worker asks
politely, at points it chose, whether it should keep going. Stop is therefore
reported as STOPPING until the worker reaches a safe checkpoint.

The same checkpoint carries the other reason a solve must give up: ComfyUI
started a workflow. The manager refuses to *start* a GPU solve while the queue
runs, but that is a one-shot read, and the window it leaves open is the
dangerous one -- OmniCam releases ComfyUI's models to hand the card to the
solver child, so a prompt queued a second later reloads a checkpoint straight
into VRAM the solver is already using. Nobody can win that; both processes OOM.
Rather than reach into ComfyUI's queue to hold it back, the solve steps aside.
"""

from __future__ import annotations

import time
from threading import Event

#: How often the arming solve re-reads ComfyUI's queue. The check happens on a
#: checkpoint that fires ~20x a second, and each one takes the queue's lock;
#: half a second is far inside the reload time of any model worth guarding
#: against, and costs the executor nothing.
CONTENTION_POLL_SECONDS = 0.5

GPU_CONTENTION_MESSAGE = (
    "DPVO solve stopped because a ComfyUI workflow started using the GPU. "
    "Retry tracking after the queue is idle."
)


class SolveCancelled(Exception):  # noqa: N818 - a cancellation, not an error condition
    """Raised inside the worker when a stop was requested. Not an error."""


class GpuContentionError(RuntimeError):
    """A ComfyUI workflow claimed the GPU while a GPU solve was running.

    Deliberately *not* a :class:`SolveCancelled`: the user did not ask for this,
    and a silent STOPPED would leave them staring at a solve that abandoned
    itself for no visible reason. It travels the failure path so the panel shows
    the sentence explaining what happened and what to do about it.
    """


class SolveControl:
    """The cooperative cancellation flag a backend polls between safe steps."""

    def __init__(
        self,
        stop_requested: Event,
        *,
        execution_probe=None,
        clock=time.monotonic,
        poll_seconds: float = CONTENTION_POLL_SECONDS,
    ) -> None:
        self.stop_requested = stop_requested
        self._execution_probe = execution_probe
        self._clock = clock
        self._poll_seconds = float(poll_seconds)
        self._watch_gpu = False
        self._next_probe = 0.0

    def watch_gpu_contention(self) -> None:
        """Start yielding the card to ComfyUI, once a GPU backend is resolved.

        Armed by the caller rather than in ``__init__`` because ``method=auto``
        does not know which backend it got until it has one: an OpenCV solve
        never touches the GPU and has no reason to abandon itself.
        """
        self._watch_gpu = True
        # Not immediately: the manager has just read the queue as idle, and
        # re-reading it in the same instant only re-confirms that.
        self._next_probe = self._clock() + self._poll_seconds

    def cancelled(self) -> bool:
        return self.stop_requested.is_set()

    def checkpoint(self) -> None:
        """Return normally to continue, or raise when the solve must give up."""
        if self.stop_requested.is_set():
            raise SolveCancelled
        self._check_gpu_contention()

    def assert_gpu_free(self) -> None:
        """An *unthrottled* contention check, for the one moment it must not be
        skipped: immediately before OmniCam releases ComfyUI's VRAM to spawn a
        GPU child.

        ``checkpoint()`` there can silently no-op -- ``watch_gpu_contention()``
        set ``_next_probe`` half a second into the future when it armed, and the
        release happens well inside that window -- which leaves exactly the race
        this guards: the queue read as idle at admission, a workflow started
        since, and the VRAM about to be freed straight into its reload.

        Not gated on ``_watch_gpu``: about to hand the card to a child *is* the
        condition. Still a clean no-op with no probe wired (headless, tests).
        """
        if self.stop_requested.is_set():
            raise SolveCancelled
        if self._execution_probe is None:
            return
        now = self._clock()
        self._next_probe = now + self._poll_seconds
        try:
            busy = bool(self._execution_probe())
        except Exception:  # noqa: BLE001 - a probe that breaks must not stop a healthy solve
            return
        if busy:
            raise GpuContentionError(GPU_CONTENTION_MESSAGE)

    def _check_gpu_contention(self) -> None:
        if not self._watch_gpu or self._execution_probe is None:
            return
        now = self._clock()
        if now < self._next_probe:
            return
        self._next_probe = now + self._poll_seconds
        try:
            busy = bool(self._execution_probe())
        except Exception:  # noqa: BLE001 - a probe that breaks must not stop a healthy solve
            return
        if busy:
            raise GpuContentionError(GPU_CONTENTION_MESSAGE)
