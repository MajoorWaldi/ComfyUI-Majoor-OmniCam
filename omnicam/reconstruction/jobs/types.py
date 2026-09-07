"""State machine and data models for reconstruction jobs."""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from ..pipeline import PipelineOutput
from ..settings import ReconstructionSettings
from ..types import ReconstructionSource


class ReconstructionState(str, Enum):
    IDLE = "IDLE"
    PREPARING = "PREPARING"
    # multi-view scan only
    REGISTER_VIEWS = "REGISTER_VIEWS"
    INFER_GEOMETRY = "INFER_GEOMETRY"
    BUILD_MESH = "BUILD_MESH"
    # semantic blockout
    SEGMENT_SCENE = "SEGMENT_SCENE"
    FUSE_VIEWS = "FUSE_VIEWS"
    ANALYZE_LAYOUT = "ANALYZE_LAYOUT"
    FIT_BLOCKOUT = "FIT_BLOCKOUT"
    COMPLETE_OBJECTS = "COMPLETE_OBJECTS"
    BUILD_REFERENCE = "BUILD_REFERENCE"
    SAVE_ASSETS = "SAVE_ASSETS"
    FINALIZING = "FINALIZING"
    STOPPING = "STOPPING"
    STOPPED = "STOPPED"
    DONE = "DONE"
    FAILED = "FAILED"


IDLE = ReconstructionState.IDLE.value
PREPARING = ReconstructionState.PREPARING.value
REGISTER_VIEWS = ReconstructionState.REGISTER_VIEWS.value
INFER_GEOMETRY = ReconstructionState.INFER_GEOMETRY.value
BUILD_MESH = ReconstructionState.BUILD_MESH.value
SEGMENT_SCENE = ReconstructionState.SEGMENT_SCENE.value
FUSE_VIEWS = ReconstructionState.FUSE_VIEWS.value
ANALYZE_LAYOUT = ReconstructionState.ANALYZE_LAYOUT.value
FIT_BLOCKOUT = ReconstructionState.FIT_BLOCKOUT.value
COMPLETE_OBJECTS = ReconstructionState.COMPLETE_OBJECTS.value
BUILD_REFERENCE = ReconstructionState.BUILD_REFERENCE.value
SAVE_ASSETS = ReconstructionState.SAVE_ASSETS.value
FINALIZING = ReconstructionState.FINALIZING.value
STOPPING = ReconstructionState.STOPPING.value
STOPPED = ReconstructionState.STOPPED.value
DONE = ReconstructionState.DONE.value
FAILED = ReconstructionState.FAILED.value

STATES = (
    IDLE,
    PREPARING,
    REGISTER_VIEWS,
    INFER_GEOMETRY,
    BUILD_MESH,
    SEGMENT_SCENE,
    FUSE_VIEWS,
    ANALYZE_LAYOUT,
    FIT_BLOCKOUT,
    COMPLETE_OBJECTS,
    BUILD_REFERENCE,
    SAVE_ASSETS,
    FINALIZING,
    STOPPING,
    STOPPED,
    DONE,
    FAILED,
)

ACTIVE_STATES = frozenset(
    {
        PREPARING,
        REGISTER_VIEWS,
        INFER_GEOMETRY,
        BUILD_MESH,
        SEGMENT_SCENE,
        FUSE_VIEWS,
        ANALYZE_LAYOUT,
        FIT_BLOCKOUT,
        COMPLETE_OBJECTS,
        BUILD_REFERENCE,
        SAVE_ASSETS,
        FINALIZING,
        STOPPING,
    }
)
TERMINAL_STATES = frozenset({STOPPED, DONE, FAILED})

# Every non-terminal state may also fall through to STOPPING / FAILED; that is
# folded in below so the individual rows stay readable. The linear depth-mesh
# chain (INFER_GEOMETRY -> BUILD_MESH -> ANALYZE_LAYOUT -> SAVE_ASSETS) is
# preserved; blockout and scan add the semantic detours.
_FORWARD: dict[str, frozenset[str]] = {
    IDLE: frozenset({PREPARING}),
    PREPARING: frozenset({REGISTER_VIEWS, INFER_GEOMETRY, DONE}),
    REGISTER_VIEWS: frozenset({INFER_GEOMETRY}),
    INFER_GEOMETRY: frozenset({BUILD_MESH, SEGMENT_SCENE, ANALYZE_LAYOUT}),
    BUILD_MESH: frozenset({ANALYZE_LAYOUT}),
    SEGMENT_SCENE: frozenset({FUSE_VIEWS, ANALYZE_LAYOUT}),
    FUSE_VIEWS: frozenset({ANALYZE_LAYOUT}),
    ANALYZE_LAYOUT: frozenset({FIT_BLOCKOUT, SAVE_ASSETS}),
    FIT_BLOCKOUT: frozenset({COMPLETE_OBJECTS, BUILD_REFERENCE, SAVE_ASSETS}),
    COMPLETE_OBJECTS: frozenset({BUILD_REFERENCE, SAVE_ASSETS}),
    BUILD_REFERENCE: frozenset({SAVE_ASSETS}),
    SAVE_ASSETS: frozenset({FINALIZING}),
    FINALIZING: frozenset({DONE}),
    STOPPING: frozenset({STOPPED}),
    STOPPED: frozenset(),
    DONE: frozenset(),
    FAILED: frozenset(),
}

VALID_TRANSITIONS: dict[str, frozenset[str]] = {
    state: (targets | {STOPPING, FAILED} if state not in TERMINAL_STATES else targets)
    for state, targets in _FORWARD.items()
}


class JobStateError(RuntimeError):
    """An invalid state transition was requested."""


def can_transition(current: str, target: str) -> bool:
    """Return whether transition from current to target is valid."""
    return target in VALID_TRANSITIONS.get(current, frozenset())


class JobCancelToken:
    """Cooperative cancellation token matching CancelToken protocol."""

    def __init__(self) -> None:
        self._event = threading.Event()

    def cancel(self) -> None:
        self._event.set()

    def is_cancelled(self) -> bool:
        return self._event.is_set()


@dataclass(slots=True)
class ReconstructionJob:
    job_id: str
    node_id: str
    client_id: str
    source: ReconstructionSource
    settings: ReconstructionSettings
    state: str = IDLE
    stage: str = IDLE
    progress: float = 0.0
    message: str = ""
    created_at: float = field(default_factory=time.time)
    last_access: float = field(default_factory=time.time)
    cancel_token: JobCancelToken = field(default_factory=JobCancelToken)
    result: PipelineOutput | None = None
    error: dict[str, str] | None = None
    warnings: list[str] = field(default_factory=list)

    def transition(self, target: str) -> None:
        """Advance job state machine or raise JobStateError."""
        if not can_transition(self.state, target):
            raise JobStateError(f"Cannot transition from {self.state} to {target}")
        self.state = target
        self.last_access = time.time()

    def touch(self) -> None:
        self.last_access = time.time()

    def to_dict(self) -> dict[str, Any]:
        res_dict = None
        if self.result is not None:
            res_dict = {
                "motion_scene": self.result.motion_scene,
                "summary": self.result.summary,
                "warnings": self.result.warnings,
                "fingerprint": self.result.fingerprint,
            }
        return {
            "job_id": self.job_id,
            "node_id": self.node_id,
            "client_id": self.client_id,
            "state": self.state,
            "stage": self.stage,
            "progress": round(self.progress, 4),
            "message": self.message,
            "created_at": self.created_at,
            "last_access": self.last_access,
            "result": res_dict,
            "error": self.error,
            "warnings": list(self.warnings),
        }
