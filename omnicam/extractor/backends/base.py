"""The contract every camera-motion solver has to honour.

The pipeline never learns which solver ran. It gets camera-to-world poses in a
basis the backend *declares*, plus a coverage number, and converts once. A
backend that quietly returned world-to-camera poses would mirror the whole
trajectory, which is why the basis and the direction are part of the protocol
rather than a comment.
"""

from __future__ import annotations

import contextlib
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from typing import Protocol, runtime_checkable

from ..types import BackendSolveResult, CameraIntrinsics, VideoFrameSample

ProgressCallback = Callable[[int, int], None]


@runtime_checkable
class SolveControlProtocol(Protocol):
    """The cooperative gate a long solve polls; see :mod:`..jobs.control`."""

    def checkpoint(self) -> None:
        ...


@runtime_checkable
class SolveObserver(Protocol):
    """Live per-frame reporting for an interactive solve.

    Backends call this as they go. Normal graph execution passes nothing, so
    the solvers behave exactly as they did before this existed.
    """

    def pose(self, pose) -> None:
        ...

    def quality(self, frame: int, coverage: float, inliers: int | None, state: str) -> None:
        ...

    def features(self, frame: int, points: list[dict], state: str) -> None:
        ...

    def progress_frame(self, frame: int) -> None:
        ...


class BackendUnavailableError(RuntimeError):
    """The requested solver cannot run here. The message must say what to do about it."""


class SolveError(RuntimeError):
    """The solver ran but the footage defeated it. The message names the frame."""


@dataclass(slots=True, frozen=True)
class BackendAvailability:
    available: bool
    reason: str = ""


@runtime_checkable
class CameraMotionBackend(Protocol):
    name: str
    #: Basis the returned camera-to-world poses live in: "opencv" or "omnicam".
    basis: str

    @classmethod
    def availability(cls) -> BackendAvailability:
        ...

    def solve(
        self,
        frames: Sequence[VideoFrameSample],
        intrinsics: CameraIntrinsics,
        *,
        progress: ProgressCallback | None = None,
        control: SolveControlProtocol | None = None,
        observer: SolveObserver | None = None,
    ) -> BackendSolveResult:
        ...


def report_progress(progress: ProgressCallback | None, done: int, total: int) -> None:
    """Progress is optional and must never be able to fail a solve."""
    if progress is None:
        return
    # A UI callback that throws must not be able to lose a finished solve.
    with contextlib.suppress(Exception):
        progress(done, total)


def checkpoint(control: SolveControlProtocol | None) -> None:
    """Poll the cooperative gate. ``None`` means an uninterruptible batch run."""
    if control is not None:
        control.checkpoint()


def observe_pose(observer: SolveObserver | None, pose) -> None:
    if observer is None:
        return
    with contextlib.suppress(Exception):  # live telemetry must not fail a solve
        observer.pose(pose)


def observe_quality(observer: SolveObserver | None, frame: int, coverage: float,
                    inliers: int | None, state: str) -> None:
    if observer is None:
        return
    with contextlib.suppress(Exception):
        observer.quality(int(frame), float(coverage), inliers, str(state))


#: The overlay draws a bounded sample; sending thousands of points per frame
#: would cost more socket time than the solve itself.
MAX_OBSERVED_FEATURES = 240


def sample_features(points, states, limit: int = MAX_OBSERVED_FEATURES) -> list[dict]:
    """Evenly spread at most ``limit`` normalized features, tagged accepted/rejected.

    ``points`` are already normalized to 0..1 of the *solve* resolution, so the
    panel can draw them over footage of any size without knowing what the
    solver downscaled to.
    """
    total = len(points)
    if total <= 0:
        return []
    step = max(1, total // max(1, limit))
    sampled = []
    for index in range(0, total, step):
        x, y = points[index]
        sampled.append({
            "x": round(float(x), 5),
            "y": round(float(y), 5),
            "state": "accepted" if states[index] else "rejected",
        })
        if len(sampled) >= limit:
            break
    return sampled


def observe_features(observer: SolveObserver | None, frame: int, points: list[dict], state: str) -> None:
    if observer is None or not points:
        return
    features = getattr(observer, "features", None)
    if features is None:
        return
    with contextlib.suppress(Exception):
        features(int(frame), points, str(state))


def observe_progress_frame(observer: SolveObserver | None, frame: int) -> None:
    """Report decoder/solver progress even when no pose is available yet."""
    if observer is None:
        return
    callback = getattr(observer, "progress_frame", None)
    if callback is None:
        return
    with contextlib.suppress(Exception):
        callback(int(frame))


def coverage_ratio(valid_poses: int, requested_samples: int) -> float:
    """Solver health, not physical accuracy: the share of samples that produced a pose."""
    if requested_samples <= 0:
        return 0.0
    return max(0.0, min(1.0, valid_poses / requested_samples))
