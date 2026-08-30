"""Canonical track emission and the deterministic result fingerprint."""

import json

import pytest

from omnicam.core.camera_math import quaternion_from_euler
from omnicam.core.track import OmniCamTrack
from omnicam.core.validation import validate_track_payload
from omnicam.extractor.fingerprint import FINGERPRINT_KEY, stamp_fingerprint, track_fingerprint
from omnicam.extractor.track_builder import build_omnicam_track, build_report
from omnicam.extractor.types import PoseSample

IDENTITY = [0.0, 0.0, 0.0, 1.0]


def pose(frame, position, quaternion=IDENTITY):
    return PoseSample(
        source_frame=frame,
        timestamp_seconds=frame / 24.0,
        position=[float(value) for value in position],
        quaternion_xyzw=list(quaternion),
    )


def build(poses, **overrides):
    settings = {
        "poses": poses,
        "source_fps": 24.0,
        "duration_frames": 48,
        "width": 1280,
        "height": 720,
        "vertical_fov": 53.0,
        "backend": "opencv_sift",
        "confidence": 0.97,
        "frame_step": 1,
        "intrinsics_source": "auto_53deg_vertical_fov",
        "motion_scale": 1.0,
        "raw_key_count": len(poses),
        "warnings": [],
    }
    settings.update(overrides)
    return build_omnicam_track(**settings)


def moving(count=12, step=0.2):
    return [pose(index, [0.0, 0.0, -step * index]) for index in range(count)]


# ---------------------------------------------------------------------------
# Shape
# ---------------------------------------------------------------------------

def test_builder_emits_schema_v1_track():
    track = build(moving())
    assert track["schema_version"] == 1
    assert track["render_mode"] == "omni_ref"
    assert track["objects"] == []
    assert track["fps"] == 24
    assert track["duration_frames"] == 48
    assert (track["width"], track["height"]) == (1280, 720)


def test_builder_output_survives_the_canonical_validator_and_parser():
    track = build(moving())
    assert validate_track_payload(track) == track
    restored = OmniCamTrack.from_dict(track)
    assert len(restored.keyframes) == len(track["keyframes"])


def test_builder_uses_linear_interpolation():
    track = build(moving())
    assert {key["interpolation"] for key in track["keyframes"]} == {"linear"}


def test_builder_emits_perspective_cameras_with_the_solved_lens():
    track = build(moving(), vertical_fov=41.5)
    for key in track["keyframes"]:
        camera = key["camera"]
        assert camera["camera_type"] == "perspective"
        assert camera["zoom"] == 1.0
        assert camera["near"] == 0.01
        assert camera["far"] == 10000.0
        assert camera["fov"] == pytest.approx(41.5)


def test_builder_preserves_source_frame_numbers():
    poses = [pose(index * 3, [0.0, 0.0, -0.1 * index]) for index in range(8)]
    track = build(poses, frame_step=3, duration_frames=24)
    assert [key["frame"] for key in track["keyframes"]] == [0, 3, 6, 9, 12, 15, 18, 21]


def test_builder_marks_monocular_scale():
    metadata = build(moving())["metadata"]
    assert metadata["monocular_scale"] is True
    assert metadata["source"] == "omnicam_extractor"
    assert any("relative" in warning for warning in metadata["warnings"])


def test_builder_labels_confidence_as_solver_coverage():
    metadata = build(moving(), confidence=0.812)["metadata"]
    assert metadata["confidence_kind"] == "solver_coverage"
    assert metadata["confidence"] == pytest.approx(0.812)


def test_builder_warns_about_approximated_lens_intrinsics():
    assert any("53 degree" in w for w in build(moving())["metadata"]["warnings"])
    explicit = build(moving(), intrinsics_source="vertical_fov_60deg")
    assert not any("53 degree" in w for w in explicit["metadata"]["warnings"])


def test_builder_carries_backend_warnings_through_without_duplicates():
    track = build(moving(), warnings=["tracking was noisy", "tracking was noisy"])
    assert track["metadata"]["warnings"].count("tracking was noisy") == 1


def test_builder_records_the_key_reduction():
    track = build(moving(4), raw_key_count=240)
    assert track["metadata"]["raw_key_count"] == 240
    assert track["metadata"]["simplified_key_count"] == 4


def test_builder_refuses_an_empty_pose_list():
    with pytest.raises(ValueError, match="empty pose list"):
        build([])


# ---------------------------------------------------------------------------
# Static solves
# ---------------------------------------------------------------------------

def test_a_static_solve_keeps_one_key_and_the_full_duration():
    still = [pose(index, [0.0, 0.0, 0.0]) for index in range(30)]
    track = build(still, duration_frames=30)
    assert len(track["keyframes"]) == 1
    assert track["keyframes"][0]["frame"] == 0
    assert track["duration_frames"] == 30
    assert track["metadata"]["static_solve"] is True
    # Nothing moved, so there is no relative-scale caveat to make.
    assert not any("relative" in warning for warning in track["metadata"]["warnings"])


def test_a_moving_solve_is_not_reduced_to_one_key():
    track = build(moving())
    assert len(track["keyframes"]) > 1
    assert track["metadata"]["static_solve"] is False


# ---------------------------------------------------------------------------
# Fingerprint
# ---------------------------------------------------------------------------

def test_fingerprint_is_stable_for_same_payload():
    first, second = build(moving()), build(moving())
    assert first["metadata"][FINGERPRINT_KEY] == second["metadata"][FINGERPRINT_KEY]
    assert len(first["metadata"][FINGERPRINT_KEY]) == 64


def test_fingerprint_changes_when_camera_motion_changes():
    a = build(moving(step=0.2))["metadata"][FINGERPRINT_KEY]
    b = build(moving(step=0.4))["metadata"][FINGERPRINT_KEY]
    assert a != b


def test_fingerprint_changes_when_orientation_changes():
    straight = [pose(index, [0.0, 0.0, -0.2 * index]) for index in range(8)]
    turning = [
        pose(index, [0.0, 0.0, -0.2 * index], quaternion_from_euler([0.0, index * 2.0, 0.0]))
        for index in range(8)
    ]
    assert build(straight)["metadata"][FINGERPRINT_KEY] != build(turning)["metadata"][FINGERPRINT_KEY]


def test_fingerprint_does_not_hash_itself():
    track = build(moving())
    stamped = track["metadata"][FINGERPRINT_KEY]
    assert track_fingerprint(track) == stamped
    # Re-stamping an already stamped track is idempotent.
    assert stamp_fingerprint(track) == stamped


def test_fingerprint_ignores_key_ordering_in_the_json_encoding():
    track = build(moving())
    reordered = json.loads(json.dumps(dict(reversed(list(track.items())))))
    assert track_fingerprint(reordered) == track["metadata"][FINGERPRINT_KEY]


def test_fingerprint_is_json_safe():
    """It has to survive a strict browser JSON.parse, so no NaN may reach it."""
    track = build(moving())
    text = json.dumps(track)
    assert "NaN" not in text and "Infinity" not in text
    json.loads(text)


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

def test_report_names_the_backend_the_keys_and_the_caveats():
    report = build_report(build(moving(), backend="dpvo", confidence=0.98))
    assert "dpvo" in report
    assert "camera keys" in report
    assert "98%" in report
    assert "relative" in report
