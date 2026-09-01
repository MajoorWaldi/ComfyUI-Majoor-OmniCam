"""The fixed order in which a video becomes a canonical OmniCam track.

The sequence matters more than any single step. Normalizing an origin before
the basis conversion, or scaling translation before the origin is anchored,
produces a track that looks plausible and is wrong -- so the order lives here,
once, and every stage above is a pure function this module calls.

    decode -> intrinsics -> solve -> basis   (solve_raw_poses)
           -> spikes -> trim -> origin -> align -> scale
           -> continuity -> smooth -> simplify -> canonical track   (refine)

The split at ``solve_raw_poses`` is what lets the interactive panel exist. A
normal graph execution runs both halves back to back; the panel runs the
expensive half once and re-runs the cheap half on every slider drag. Both go
through the same functions, so an interactive result and a queued result of the
same clip are the same camera.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .backends import select_backend
from .backends.base import SolveError
from .intrinsics import resolve_intrinsics, vertical_fov_from_focal_pixels
from .refine.pipeline import build_refined_track
from .refine.types import RefinementSettings
from .track_builder import build_report
from .transforms import convert_pose_sequence, pose_is_finite
from .types import ExtractionResult, PoseSample
from .video import decode_solver_frames


class _BasisObserver:
    """Expose live poses in the same basis as the final canonical result."""

    def __init__(self, observer, basis: str) -> None:
        self._observer = observer
        self._basis = basis

    def backend(self, name: str) -> None:
        callback = getattr(self._observer, "backend", None)
        if callback is not None:
            callback(name)

    def pose(self, pose) -> None:
        self._observer.pose(convert_pose_sequence([pose], self._basis)[0])

    def quality(self, *args) -> None:
        self._observer.quality(*args)

    def features(self, *args) -> None:
        self._observer.features(*args)

    def progress_frame(self, frame: int) -> None:
        callback = getattr(self._observer, "progress_frame", None)
        if callback is not None:
            callback(frame)


@dataclass(slots=True)
class RawSolve:
    """An immutable solver result, already in OmniCam's basis and nothing else.

    No origin normalization, no scale, no smoothing: this is what the solver
    said, and every refined track in the session is derived from it.
    """

    poses: list[PoseSample]
    backend: str
    coverage: float
    source_fps: float
    duration_frames: int
    width: int
    height: int
    vertical_fov: float
    intrinsics_source: str
    frame_step: int
    warnings: list[str] = field(default_factory=list)
    sampled_frame_count: int = 0
    landmarks_3d: list[dict[str, float]] = field(default_factory=list)


def _validated_poses(poses, backend_name: str) -> list[PoseSample]:
    if len(poses) < 2:
        raise SolveError(
            f"The {backend_name} solver returned {len(poses)} camera poses. "
            "OmniCam Extractor needs at least 2 for a moving camera."
        )
    for pose in poses:
        if not pose_is_finite(pose):
            raise SolveError(
                f"The {backend_name} solver produced an invalid pose at frame {pose.source_frame} "
                "(non-finite value or zero-length quaternion)."
            )
    return list(poses)


def solve_raw_poses(
    *,
    video: Any,
    method: str = "auto",
    lens_mode: str = "auto",
    fov_degrees: float = 53.0,
    focal_length_mm: float = 24.0,
    sensor_width_mm: float = 36.0,
    max_dimension: int = 960,
    frame_step: int = 1,
    progress=None,
    control=None,
    observer=None,
    backend=None,
) -> RawSolve:
    """Decode, solve, and convert into OmniCam's basis. The expensive half."""
    decoded = decode_solver_frames(video, frame_step=frame_step, max_dimension=max_dimension)

    source_intrinsics = resolve_intrinsics(
        width=decoded.info.width,
        height=decoded.info.height,
        lens_mode=lens_mode,
        fov_degrees=fov_degrees,
        focal_length_mm=focal_length_mm,
        sensor_width_mm=sensor_width_mm,
    )
    # The solver sees downscaled frames, so it must be given the intrinsics of
    # those frames; the FOV written to the track stays the source lens, which
    # is scale invariant.
    solver_intrinsics = source_intrinsics.scaled(decoded.scale.scale_x, decoded.scale.scale_y)
    vertical_fov = vertical_fov_from_focal_pixels(source_intrinsics.fy, source_intrinsics.height)

    solver = backend if backend is not None else select_backend(method)
    solve_observer = _BasisObserver(observer, getattr(solver, "basis", "opencv")) if observer else None
    if solve_observer is not None:
        solve_observer.backend(getattr(solver, "name", ""))
    solved = solver.solve(
        decoded.frames, solver_intrinsics, progress=progress, control=control, observer=solve_observer
    )
    poses = _validated_poses(solved.poses, solved.backend)
    converted = convert_pose_sequence(poses, getattr(solver, "basis", "opencv"))
    landmarks = []
    for point in solved.landmarks_3d:
        if getattr(solver, "basis", "opencv") == "opencv":
            landmarks.append({**point, "y": -float(point["y"]), "z": -float(point["z"])})
        else:
            landmarks.append(dict(point))

    return RawSolve(
        poses=converted,
        backend=solved.backend,
        coverage=float(solved.coverage),
        source_fps=decoded.info.fps,
        duration_frames=max(decoded.info.frame_count, converted[-1].source_frame + 1),
        width=decoded.info.width,
        height=decoded.info.height,
        vertical_fov=vertical_fov,
        intrinsics_source=source_intrinsics.source,
        frame_step=max(1, int(frame_step)),
        warnings=[*decoded.warnings, *solved.warnings],
        sampled_frame_count=len(decoded.frames),
        landmarks_3d=landmarks,
    )


def refine_raw_solve(raw: RawSolve, settings: RefinementSettings) -> dict[str, Any]:
    """The cheap half: derive a canonical track from an existing raw solve."""
    return build_refined_track(
        raw_poses=raw.poses,
        settings=settings,
        source_fps=raw.source_fps,
        duration_frames=raw.duration_frames,
        width=raw.width,
        height=raw.height,
        vertical_fov=raw.vertical_fov,
        backend=raw.backend,
        confidence=raw.coverage,
        frame_step=raw.frame_step,
        intrinsics_source=raw.intrinsics_source,
        warnings=raw.warnings,
    )


def extract_camera_track(
    *,
    video: Any,
    method: str = "auto",
    lens_mode: str = "auto",
    fov_degrees: float = 53.0,
    focal_length_mm: float = 24.0,
    sensor_width_mm: float = 36.0,
    max_dimension: int = 960,
    frame_step: int = 1,
    normalize_origin: bool = True,
    motion_scale: float = 1.0,
    position_smoothing: float = 0.15,
    rotation_smoothing: float = 0.10,
    simplify_keys: bool = True,
    position_tolerance: float = 0.01,
    rotation_tolerance_deg: float = 0.25,
    progress=None,
    backend=None,
) -> ExtractionResult:
    """Solve one continuous shot and return a canonical track plus its report.

    ``backend`` is an injection point for tests; production callers leave it
    unset and let ``method`` select.
    """
    raw = solve_raw_poses(
        video=video,
        method=method,
        lens_mode=lens_mode,
        fov_degrees=fov_degrees,
        focal_length_mm=focal_length_mm,
        sensor_width_mm=sensor_width_mm,
        max_dimension=max_dimension,
        frame_step=frame_step,
        progress=progress,
        backend=backend,
    )
    settings = RefinementSettings(
        position_smoothing=position_smoothing,
        rotation_smoothing=rotation_smoothing,
        motion_scale=motion_scale,
        normalize_origin=normalize_origin,
        simplify_keys=simplify_keys,
        position_tolerance=position_tolerance,
        rotation_tolerance_deg=rotation_tolerance_deg,
    )
    track = refine_raw_solve(raw, settings)
    return ExtractionResult(
        track=track,
        confidence=raw.coverage,
        report=build_report(track),
        fingerprint=str(track["metadata"]["extractor_fingerprint"]),
    )
