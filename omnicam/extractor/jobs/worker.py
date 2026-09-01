"""What actually runs on the worker thread for one interactive solve.

The worker owns the whole lifecycle of a solve and is written so that every
exit -- success, stop, failure -- lands the job in a terminal state and frees
what it held. A worker that dies leaving a job in TRACKING would hang the panel
forever, which is why the state changes live in ``finally`` blocks rather than
along the happy path.
"""

from __future__ import annotations

import logging
from typing import Any

from ..pipeline import refine_raw_solve, solve_raw_poses
from ..refine.spikes import detect_pose_spikes
from ..refine.types import RefinementSettings
from ..source_resolver import describe_video_file, resolve_interactive_video_source
from ..track_builder import build_report
from ..video import FileVideoSource
from .control import SolveCancelled, SolveControl
from .types import (
    COMPLETED,
    FAILED,
    PREPARING,
    REFINING,
    SOLVING,
    STOPPED,
    TRACKING,
    JobStateError,
    QualitySample,
)

logger = logging.getLogger(__name__)


class _JobObserver:
    """Bridges backend callbacks into job state and throttled events."""

    def __init__(self, job, publisher, manager=None) -> None:
        self._job = job
        self._publisher = publisher
        self._manager = manager

    def backend(self, name: str) -> None:
        self._job.backend_name = str(name)
        self._publisher.progress()

    def pose(self, pose) -> None:
        self._job.raw_poses.append(pose)
        self._job.current_source_frame = int(pose.source_frame)
        self._publisher.pose(pose)

    def progress_frame(self, frame: int) -> None:
        """Advance the playhead when a backend cannot expose live poses."""
        self._job.current_source_frame = int(frame)
        self._publisher.progress()

    def finalizing(self) -> None:
        """Expose DPVO global optimization as SOLVING instead of TRACKING 95%."""
        if self._manager is not None and self._job.state == TRACKING:
            self._manager.transition(self._job, SOLVING)

    def features(self, frame: int, points, state: str) -> None:
        # Deliberately not stored on the job: the overlay is live telemetry, and
        # keeping every frame's features would grow without bound on a long clip.
        self._publisher.features(int(frame), list(points), str(state))

    def quality(self, frame: int, coverage: float, inliers, state: str) -> None:
        sample = QualitySample(frame=int(frame), coverage=float(coverage), inliers=inliers, state=str(state))
        self._job.quality_samples.append(sample)
        self._publisher.quality(sample)


def run_solve_job(job, manager, publisher) -> None:
    """Solve, refine and complete one job. Never raises to the caller."""
    control = SolveControl(job.stop_requested)

    def stage(target: str) -> None:
        """Enter the next stage, or give up if a stop landed first.

        The check has to happen here rather than only inside the solver: a stop
        arriving in the moment between the solve returning and the next
        transition would otherwise collide with the state machine, and the user
        who pressed Stop would be shown an internal error instead of STOPPED.
        """
        control.checkpoint()
        if job.state == target:
            return
        manager.transition(job, target)

    try:
        stage(PREPARING)
        source_path = resolve_interactive_video_source(job.source_ref)
        job.source_path = str(source_path)
        job.source_info = describe_video_file(source_path)
        job.source_frame_count = int(job.source_info.get("frame_count") or 0)
        control.checkpoint()

        stage(TRACKING)
        video = FileVideoSource(
            source_path,
            width=job.source_info.get("width", 0),
            height=job.source_info.get("height", 0),
            fps=job.source_info.get("fps", 0.0),
            frame_count=job.source_frame_count,
        )
        observer = _JobObserver(job, publisher, manager)
        raw = solve_raw_poses(
            video=video,
            method=str(job.settings.get("method", "auto")),
            lens_mode=str(job.settings.get("lens_mode", "auto")),
            fov_degrees=float(job.settings.get("fov_degrees", 53.0)),
            focal_length_mm=float(job.settings.get("focal_length_mm", 24.0)),
            sensor_width_mm=float(job.settings.get("sensor_width_mm", 36.0)),
            max_dimension=int(job.settings.get("max_dimension", 960)),
            frame_step=int(job.settings.get("frame_step", 1)),
            progress=lambda done, total: _report(job, publisher, done, total),
            control=control,
            observer=observer,
        )

        # The poses collected live came straight from the backend, in the
        # backend's basis. Replace them with the converted, validated ones so
        # the raw the panel refines is the raw the pipeline produced.
        stage(SOLVING)
        job.raw_poses = list(raw.poses)
        job.landmarks_3d = list(raw.landmarks_3d)
        job.backend_name = raw.backend
        job.warnings = list(raw.warnings)
        job.source_frame_count = max(job.source_frame_count, raw.duration_frames)
        job.anomalies = detect_pose_spikes(raw.poses, quality_samples=job.quality_samples)
        control.checkpoint()

        stage(REFINING)
        settings = RefinementSettings.from_dict(job.refine_settings or job.settings.get("refine"))
        job.refine_settings = settings.to_dict()
        job.raw_solve = raw
        job.raw_track = refine_raw_solve(raw, RefinementSettings(
            position_smoothing=0.0, rotation_smoothing=0.0, motion_scale=1.0,
            normalize_origin=False, simplify_keys=False,
        ))
        job.refined_track = refine_raw_solve(raw, settings)
        job.progress = 1.0
        job.stage_progress = 1.0

        stage(COMPLETED)
        publisher.completed(completion_payload(job))
    except SolveCancelled:
        manager.transition(job, STOPPED, force=True)
        publisher.state_changed(STOPPED)
    except JobStateError:
        # The only way to lose a transition race is a stop landing mid-stage,
        # and the honest report for that is STOPPED.
        manager.transition(job, STOPPED, force=True)
        publisher.state_changed(STOPPED)
    except Exception as exc:  # noqa: BLE001 - any solver failure has to reach the panel as text
        logger.info("OmniCam interactive solve %s failed: %s", job.job_id, exc)
        job.error = str(exc)
        manager.transition(job, FAILED, force=True)
        publisher.failed(str(exc))
    finally:
        manager.finish(job)


def _report(job, publisher, done: int, total: int) -> None:
    job.stage_progress = 0.0 if total <= 0 else max(0.0, min(1.0, done / total))
    # Tracking is the long pole; refinement is effectively instant, so the
    # solve share of overall progress is deliberately most of the bar.
    job.progress = 0.05 + 0.9 * job.stage_progress
    publisher.progress()


def completion_payload(job) -> dict[str, Any]:
    """What the panel needs the moment a solve finishes."""
    refined = job.refined_track or {}
    payload = {
        "state": job.state,
        "fingerprint": str((refined.get("metadata") or {}).get("extractor_fingerprint", "")),
        "key_count": len(refined.get("keyframes", [])),
        "pose_count": len(job.raw_poses),
        "coverage": round(float((refined.get("metadata") or {}).get(
            "solver_coverage", (refined.get("metadata") or {}).get("confidence", 0.0)
        )), 4),
        "anomaly_count": len(job.anomalies),
    }
    if job.landmarks_3d:
        payload["landmarks_3d"] = list(job.landmarks_3d)
    return payload


def job_result(job) -> dict[str, Any]:
    """The final result. Only a COMPLETED job has one."""
    if job.state != COMPLETED or job.refined_track is None:
        raise ValueError(
            f"Job {job.job_id} is {job.state}; only a COMPLETED solve produces a final track."
        )
    payload = {
        "job_id": job.job_id,
        "raw_track": job.raw_track,
        "refined_track": job.refined_track,
        "quality": [sample.to_dict() for sample in job.quality_samples],
        "anomalies": [anomaly.to_dict() for anomaly in job.anomalies],
        "refine_settings": job.refine_settings,
        "report": build_report(job.refined_track),
        "fingerprint": str((job.refined_track.get("metadata") or {}).get("extractor_fingerprint", "")),
        "solver_coverage": float((job.refined_track.get("metadata") or {}).get(
            "solver_coverage", (job.refined_track.get("metadata") or {}).get("confidence", 0.0)
        )),
    }
    if job.landmarks_3d:
        payload["landmarks_3d"] = list(job.landmarks_3d)
    return payload
