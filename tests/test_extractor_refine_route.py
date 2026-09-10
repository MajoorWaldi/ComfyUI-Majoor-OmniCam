"""Post-solve refinement without a scheduler.

``POST /majoor/omnicam/extractor/refine`` re-derives a track from the raw solve
the queued Extractor emitted -- no decode, no solver, no job.
"""

from __future__ import annotations

import math

import pytest

from omnicam.extractor.pipeline import RawSolve
from omnicam.extractor.raw_solve_io import (
    RawSolveDecodeError,
    raw_solve_from_dict,
    raw_solve_to_dict,
)
from omnicam.extractor.refine_route import RefineRequestError, refine_from_raw
from omnicam.extractor.types import PoseSample


def _raw(n: int = 12) -> RawSolve:
    poses = []
    for i in range(n):
        a = i * 0.05
        poses.append(
            PoseSample(
                source_frame=i,
                timestamp_seconds=i / 24.0,
                position=[math.sin(a), 0.1 * i, math.cos(a)],
                quaternion_xyzw=[0.0, math.sin(a / 2), 0.0, math.cos(a / 2)],
            )
        )
    return RawSolve(
        poses=poses,
        backend="opencv_sift",
        coverage=0.9,
        source_fps=24.0,
        duration_frames=n,
        width=1280,
        height=720,
        vertical_fov=45.0,
        intrinsics_source="fov",
        frame_step=1,
        warnings=[],
    )


def test_raw_solve_survives_a_json_round_trip():
    raw = _raw()
    back = raw_solve_from_dict(raw_solve_to_dict(raw))
    assert len(back.poses) == len(raw.poses)
    assert back.poses[3].position == pytest.approx(raw.poses[3].position)
    assert back.source_fps == raw.source_fps
    assert back.frame_step == raw.frame_step


def test_refine_from_raw_produces_a_fingerprinted_track():
    body = {"raw_solve": raw_solve_to_dict(_raw()), "settings": {"position_smoothing": 0.3}}
    out = refine_from_raw(body)
    assert out["key_count"] >= 2
    assert out["fingerprint"]
    assert out["refined_track"]["metadata"]["extractor_fingerprint"] == out["fingerprint"]


def test_different_settings_give_a_different_track():
    raw = raw_solve_to_dict(_raw(24))
    a = refine_from_raw({"raw_solve": raw, "settings": {"simplify_keys": True, "position_tolerance": 0.5}})
    b = refine_from_raw({"raw_solve": raw, "settings": {"simplify_keys": False}})
    assert a["key_count"] != b["key_count"]


def test_a_malformed_raw_solve_is_a_400_not_a_crash():
    with pytest.raises(RefineRequestError) as exc:
        refine_from_raw({"raw_solve": {"poses": [{"position": [0, 0, 0]}]}, "settings": {}})
    assert exc.value.status == 400

    with pytest.raises(RefineRequestError):
        refine_from_raw({"settings": {}})  # no raw_solve at all


def test_an_oversized_body_is_refused_with_413():
    huge = {"raw_solve": raw_solve_to_dict(_raw()), "settings": {}, "_pad": "x" * (5 * 1024 * 1024)}
    with pytest.raises(RefineRequestError) as exc:
        refine_from_raw(huge)
    assert exc.value.status == 413


def test_raw_solve_from_dict_rejects_a_short_pose_list():
    with pytest.raises(RawSolveDecodeError):
        raw_solve_from_dict({"poses": [], "source_fps": 24, "duration_frames": 0, "width": 1, "height": 1})
