"""Interactive, no-run camera solving.

A solve started from the Extractor panel never touches the ComfyUI prompt
queue. It is a bounded server-side job with its own state machine, its own
cooperative pause/stop, and its own WebSocket telemetry -- because the
alternative, queueing a graph to see a camera path, would make matchmoving a
render-and-wait loop instead of an interactive one.
"""

from __future__ import annotations

from .control import SolveCancelled, SolveControl
from .events import EVENT_NAMES, SolveEventPublisher
from .manager import (
    JobAccessDeniedError,
    JobNotFoundError,
    SolveJobManager,
    SolveSlotBusyError,
    solve_manager,
)
from .types import (
    ACTIVE_STATES,
    STATES,
    TERMINAL_STATES,
    InteractiveSolveJob,
    JobStateError,
    QualitySample,
    can_transition,
)
from .worker import job_result, run_solve_job

__all__ = [
    "ACTIVE_STATES",
    "EVENT_NAMES",
    "STATES",
    "TERMINAL_STATES",
    "InteractiveSolveJob",
    "JobAccessDeniedError",
    "JobNotFoundError",
    "JobStateError",
    "QualitySample",
    "SolveCancelled",
    "SolveControl",
    "SolveEventPublisher",
    "SolveJobManager",
    "SolveSlotBusyError",
    "can_transition",
    "job_result",
    "run_solve_job",
    "solve_manager",
]
