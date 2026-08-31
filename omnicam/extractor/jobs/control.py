"""Cooperative stop for a running solve.

Nothing here interrupts a thread. A solver is torn between a CUDA context, a
decoder and a few hundred megabytes of buffers, and killing that from outside
is how you get a corrupted GPU state that survives the job. So the worker asks
politely, at points it chose, whether it should keep going. Stop is therefore
reported as STOPPING until the worker reaches a safe checkpoint.
"""

from __future__ import annotations

from threading import Event


class SolveCancelled(Exception):  # noqa: N818 - a cancellation, not an error condition
    """Raised inside the worker when a stop was requested. Not an error."""


class SolveControl:
    """The cooperative cancellation flag a backend polls between safe steps."""

    def __init__(
        self,
        stop_requested: Event,
    ) -> None:
        self.stop_requested = stop_requested

    def cancelled(self) -> bool:
        return self.stop_requested.is_set()

    def checkpoint(self) -> None:
        """Return normally to continue, or raise when cancellation was requested."""
        if self.stop_requested.is_set():
            raise SolveCancelled
