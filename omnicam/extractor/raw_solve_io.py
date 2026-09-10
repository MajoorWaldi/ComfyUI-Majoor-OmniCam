"""Serialize a :class:`omnicam.extractor.pipeline.RawSolve` to/from plain JSON.

The queued Extractor emits the immutable raw solve alongside the refined track
so the panel's cleanup sliders can re-derive a track without re-running the
solver (:mod:`omnicam.extractor.refine_route`). It is the same data the old
out-of-queue job held server-side, just carried in the result envelope now.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from .types import PoseSample

if TYPE_CHECKING:  # avoid a cycle: pipeline imports this module
    from .pipeline import RawSolve


def raw_solve_to_dict(raw: RawSolve) -> dict[str, Any]:
    return {
        "poses": [
            {
                "source_frame": int(p.source_frame),
                "timestamp_seconds": float(p.timestamp_seconds),
                "position": [float(v) for v in p.position],
                "quaternion_xyzw": [float(v) for v in p.quaternion_xyzw],
            }
            for p in raw.poses
        ],
        "backend": str(raw.backend),
        "coverage": float(raw.coverage),
        "source_fps": float(raw.source_fps),
        "duration_frames": int(raw.duration_frames),
        "width": int(raw.width),
        "height": int(raw.height),
        "vertical_fov": float(raw.vertical_fov),
        "intrinsics_source": str(raw.intrinsics_source),
        "frame_step": int(raw.frame_step),
        "warnings": [str(w) for w in raw.warnings],
        "landmarks_3d": [dict(pt) for pt in raw.landmarks_3d],
    }


class RawSolveDecodeError(ValueError):
    """The posted raw solve is missing fields or is the wrong shape."""


def _require(body: dict[str, Any], key: str) -> Any:
    if key not in body:
        raise RawSolveDecodeError(f"raw_solve is missing {key!r}")
    return body[key]


def _floats(value: Any, name: str, count: int) -> list[float]:
    try:
        out = [float(v) for v in value]
    except (TypeError, ValueError) as exc:
        raise RawSolveDecodeError(f"{name} is not a list of numbers") from exc
    if len(out) != count:
        raise RawSolveDecodeError(f"{name} must have {count} values, got {len(out)}")
    return out


def raw_solve_from_dict(body: Any) -> RawSolve:
    from .pipeline import RawSolve  # local: keep module import-cycle-free

    if not isinstance(body, dict):
        raise RawSolveDecodeError("raw_solve must be a JSON object")
    poses_in = _require(body, "poses")
    if not isinstance(poses_in, list) or len(poses_in) < 2:
        raise RawSolveDecodeError("raw_solve.poses must be a list of at least 2 poses")
    poses = [
        PoseSample(
            source_frame=int(p.get("source_frame", 0)),
            timestamp_seconds=float(p.get("timestamp_seconds", 0.0)),
            position=_floats(p.get("position"), "pose.position", 3),
            quaternion_xyzw=_floats(p.get("quaternion_xyzw"), "pose.quaternion_xyzw", 4),
        )
        for p in poses_in
    ]
    return RawSolve(
        poses=poses,
        backend=str(body.get("backend", "solver")),
        coverage=float(body.get("coverage", 0.0)),
        source_fps=float(_require(body, "source_fps")),
        duration_frames=int(_require(body, "duration_frames")),
        width=int(_require(body, "width")),
        height=int(_require(body, "height")),
        vertical_fov=float(body.get("vertical_fov", 0.0)),
        intrinsics_source=str(body.get("intrinsics_source", "")),
        frame_step=int(body.get("frame_step", 1)),
        warnings=[str(w) for w in body.get("warnings", [])],
        landmarks_3d=[dict(pt) for pt in body.get("landmarks_3d", []) if isinstance(pt, dict)],
    )
