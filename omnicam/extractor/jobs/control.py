"""Cooperative pause/stop for a running solve.

Nothing here interrupts a thread. A solver is torn between a CUDA context, a
decoder and a few hundred megabytes of buffers, and killing that from outside
is how you get a corrupted GPU state that survives the job. So the worker asks
politely, at points it chose, whether it should keep going.

That honesty is visible in the UI: PAUSING means "asked", PAUSED means "the
worker actually stopped at a checkpoint". Promising instant suspension of a
CUDA kernel would be a lie.
"""

from __future__ import annotations

import contextlib
from collections.abc import Callable
from threading import Event


class SolveCancelled(Exception):  # noqa: N818 - a cancellation, not an error condition
    """Raised inside the worker when a stop was requested. Not an error."""


class SolveControl:
    """The pause/stop gate a backend polls between safe steps."""

    def __init__(
        self,
        pause_requested: Event,
        resume_gate: Event,
        stop_requested: Event,
        *,
        on_paused: Callable[[], None] | None = None,
        on_resumed: Callable[[], None] | None = None,
        poll_seconds: float = 0.10,
    ) -> None:
        self.pause_requested = pause_requested
        self.resume_gate = resume_gate
        self.stop_requested = stop_requested
        self._on_paused = on_paused
        self._on_resumed = on_resumed
        self._poll_seconds = poll_seconds

    def cancelled(self) -> bool:
        return self.stop_requested.is_set()

    def checkpoint(self) -> None:
        """Return normally to continue; block while paused; raise to cancel."""
        if self.stop_requested.is_set():
            raise SolveCancelled

        if self.pause_requested.is_set():
            self.resume_gate.clear()

        blocked = False
        while not self.resume_gate.wait(timeout=self._poll_seconds):
            if not blocked:
                # Report PAUSED only now: the worker has genuinely reached a
                # checkpoint and stopped, which is what the user was told.
                blocked = True
                self._notify(self._on_paused)
            if self.stop_requested.is_set():
                raise SolveCancelled
        if blocked:
            self._notify(self._on_resumed)

    @staticmethod
    def _notify(callback: Callable[[], None] | None) -> None:
        if callback is None:
            return
        # A listener must never be able to wedge or fail the solve.
        with contextlib.suppress(Exception):
            callback()
