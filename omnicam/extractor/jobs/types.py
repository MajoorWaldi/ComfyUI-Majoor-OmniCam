"""The interactive solve job and its state machine.

A solve started from the Extractor panel is a long-running server-side job, not
a graph execution. It therefore needs its own lifecycle, and that lifecycle has
to be explicit: the difference between STOPPING and STOPPED, or between STOPPED
and COMPLETED, is exactly what tells the user whether the partial trajectory on
screen is reviewable scratch or a shippable camera.

The state machine is data, not scattered ``if`` statements, so an illegal
transition is a testable fact rather than a bug someone has to reproduce.
"""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from threading import Event
from typing import Any

IDLE = "IDLE"
PREPARING = "PREPARING"
TRACKING = "TRACKING"
SOLVING = "SOLVING"
REFINING = "REFINING"
STOPPING = "STOPPING"
STOPPED = "STOPPED"
COMPLETED = "COMPLETED"
FAILED = "FAILED"

STATES = (
    IDLE, PREPARING, TRACKING, SOLVING, REFINING,
    STOPPING, STOPPED, COMPLETED, FAILED,
)

#: States in which the worker thread is still alive and holding resources.
ACTIVE_STATES = frozenset({PREPARING, TRACKING, SOLVING, REFINING, STOPPING})
#: States from which nothing further happens on its own.
TERMINAL_STATES = frozenset({STOPPED, COMPLETED, FAILED})
VALID_TRANSITIONS: dict[str, frozenset[str]] = {
    IDLE: frozenset({PREPARING, STOPPING, FAILED}),
    PREPARING: frozenset({TRACKING, STOPPING, FAILED}),
    TRACKING: frozenset({SOLVING, STOPPING, FAILED}),
    SOLVING: frozenset({REFINING, STOPPING, FAILED}),
    REFINING: frozenset({COMPLETED, STOPPING, FAILED}),
    STOPPING: frozenset({STOPPED, FAILED}),
    STOPPED: frozenset(),
    COMPLETED: frozenset({REFINING}),
    FAILED: frozenset(),
}


class JobStateError(RuntimeError):
    """An operation was requested that this job's state does not allow."""


def can_transition(current: str, target: str) -> bool:
    return target in VALID_TRANSITIONS.get(current, frozenset())


@dataclass(slots=True)
class QualitySample:
    """One backend-reported health reading, tied to a source frame.

    These are the solver's own numbers. Nothing here is a synthesized
    "confidence": if a backend cannot report inliers, the field stays None
    rather than being filled with a plausible-looking guess.
    """

    frame: int
    coverage: float
    inliers: int | None = None
    state: str = "unknown"

    def to_dict(self) -> dict[str, Any]:
        return {
            "frame": int(self.frame),
            "coverage": round(float(self.coverage), 4),
            "inliers": None if self.inliers is None else int(self.inliers),
            "state": str(self.state),
        }


@dataclass(slots=True)
class InteractiveSolveJob:
    job_id: str
    owner_client_id: str
    extractor_node_id: str
    source_ref: dict[str, Any]
    settings: dict[str, Any]

    source_path: str = ""
    source_info: dict[str, Any] = field(default_factory=dict)

    state: str = IDLE
    progress: float = 0.0
    stage_progress: float = 0.0

    current_source_frame: int = 0
    source_frame_count: int = 0

    raw_poses: list = field(default_factory=list)
    quality_samples: list = field(default_factory=list)
    landmarks_3d: list[dict[str, float]] = field(default_factory=list)

    #: The immutable solver output the refine route re-derives from, so a
    #: slider drag never has to decode or solve anything again.
    raw_solve: Any = None
    raw_track: dict | None = None
    refined_track: dict | None = None
    refine_settings: dict[str, Any] = field(default_factory=dict)
    anomalies: list = field(default_factory=list)

    backend_name: str = ""
    warnings: list[str] = field(default_factory=list)
    error: str = ""

    created_at: float = field(default_factory=time.monotonic)
    #: None until the job reaches a terminal state. Deliberately not 0.0: a
    #: monotonic clock can legitimately read zero, and a falsy timestamp made
    #: the very first job of a process invisible to the TTL sweep.
    finished_at: float | None = None

    stop_requested: Event = field(default_factory=Event)

    @property
    def is_active(self) -> bool:
        return self.state in ACTIVE_STATES

    @property
    def is_terminal(self) -> bool:
        return self.state in TERMINAL_STATES

    def status(self) -> dict[str, Any]:
        """The status payload the frontend polls and recovers from."""
        return {
            "job_id": self.job_id,
            "node_id": self.extractor_node_id,
            "state": self.state,
            "progress": round(float(self.progress), 4),
            "stage_progress": round(float(self.stage_progress), 4),
            "frame": int(self.current_source_frame),
            "frame_count": int(self.source_frame_count),
            "backend": self.backend_name,
            "pose_count": len(self.raw_poses),
            "source": self.source_info,
            "warnings": list(self.warnings),
            "error": self.error,
            "has_result": self.raw_track is not None,
            "anomalies": [anomaly.to_dict() for anomaly in self.anomalies],
        }


def new_job(
    *,
    owner_client_id: str,
    extractor_node_id: str,
    source_ref: dict[str, Any],
    settings: dict[str, Any],
) -> InteractiveSolveJob:
    return InteractiveSolveJob(
        job_id=uuid.uuid4().hex,
        owner_client_id=str(owner_client_id),
        extractor_node_id=str(extractor_node_id),
        source_ref=dict(source_ref),
        settings=dict(settings),
    )
