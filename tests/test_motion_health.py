from itertools import pairwise

import pytest

from omnicam.adapters.ati import ATI_RECOMMENDED_MOTION_LIMITS, ati_visibility_report
from omnicam.adapters.h3 import H3_RECOMMENDED_MOTION_LIMITS
from omnicam.adapters.motion_profiles import MOTION_PROFILES, motion_profile_roster, profile_limits
from omnicam.core.camera_tools import (
    locked_camera,
    motion_health_check,
    plan_speed_fix,
    recenter_subject_range,
    retime_constant_speed,
    retime_to_speed,
    smooth_camera_path_range,
    validate_zero_motion,
)
from omnicam.core.motion_health import FRAME_METRICS, WARN_RATIO, motion_health_report
from omnicam.core.track import OmniCamTrack


def _moving_track(speed_units: float = 5.0) -> OmniCamTrack:
    return OmniCamTrack.from_dict(
        {
            "fps": 24,
            "duration_frames": 25,
            "keyframes": [
                {"frame": 0, "camera": {"position": [0, 1, 5], "target": [0, 1.5, 0]}, "interpolation": "linear"},
                {"frame": 24, "camera": {"position": [speed_units, 1, 5], "target": [0, 1.5, 0]}, "interpolation": "linear"},
            ],
        }
    )


def test_locked_camera_preset_has_zero_motion():
    track = locked_camera(_moving_track())
    assert validate_zero_motion(track) is True
    report = motion_health_check(track)
    assert report["max_speed"] == pytest.approx(0.0)
    assert report["max_angular_speed"] == pytest.approx(0.0)
    assert report["ok"] is True


def test_zero_motion_validation_detects_drift():
    with pytest.raises(ValueError, match="locked"):
        validate_zero_motion(_moving_track())


def test_motion_health_reports_metrics():
    track = _moving_track(speed_units=5.0)  # 5 units over 1 second
    report = motion_health_check(track)
    assert report["max_speed"] == pytest.approx(5.0, rel=0.05)
    assert report["max_acceleration"] >= 0.0
    assert report["framing_loss_frames"] == 0  # target stays centered ahead
    assert report["ok"] is True


def test_angular_speed_includes_roll_even_when_view_direction_is_fixed():
    track = OmniCamTrack.from_dict(
        {
            "fps": 24,
            "duration_frames": 2,
            "keyframes": [
                {"frame": 0, "camera": {"position": [0, 0, 5], "target": [0, 0, 0], "roll": 0}, "interpolation": "linear"},
                {"frame": 1, "camera": {"position": [0, 0, 5], "target": [0, 0, 0], "roll": 90}, "interpolation": "linear"},
            ],
        }
    )

    report = motion_health_report(track)

    assert report["max_angular_speed"] == pytest.approx(90.0 * track.fps)


def test_motion_health_flags_model_limit_violations():
    track = _moving_track(speed_units=50.0)
    report = motion_health_check(track, H3_RECOMMENDED_MOTION_LIMITS)
    assert report["ok"] is False
    assert any(violation["metric"] == "max_speed" for violation in report["violations"])


def test_motion_health_detects_framing_loss():
    track = OmniCamTrack.from_dict(
        {
            "fps": 24,
            "duration_frames": 13,
            "width": 640,
            "height": 360,
            "keyframes": [
                {"frame": 0, "camera": {"position": [0, 0, 5], "target": [0, 0, 0]}, "interpolation": "linear"},
                # Target swings far off-axis: leaves the frame
                {"frame": 12, "camera": {"position": [0, 0, 5], "target": [100, 0, 0]}, "interpolation": "linear"},
            ],
        }
    )
    report = motion_health_check(track)
    assert report["framing_loss_frames"] > 0
    assert report["ok"] is False  # framing loss counts as violation by default


def test_retime_to_speed_normalizes_peak_speed():
    track = _moving_track(speed_units=10.0)
    normalized = retime_to_speed(track, 5.0)
    peak = motion_health_check(normalized)["max_speed"]
    assert peak <= 5.0 + 0.5
    # untouched tracks stay identical
    assert retime_to_speed(_moving_track(2.0), 5.0).to_dict() == _moving_track(2.0).to_dict()


def _burst_track() -> OmniCamTrack:
    """A track that idles, then lurches: the profile has a real peak to flatten."""
    return OmniCamTrack.from_dict(
        {
            "fps": 24,
            "duration_frames": 25,
            "keyframes": [
                {"frame": 0, "camera": {"position": [0, 1, 5], "target": [0, 1.5, 0]}, "interpolation": "linear"},
                {"frame": 18, "camera": {"position": [0.2, 1, 5], "target": [0, 1.5, 0]}, "interpolation": "linear"},
                {"frame": 24, "camera": {"position": [6, 1, 5], "target": [0, 1.5, 0]}, "interpolation": "linear"},
            ],
        }
    )


def test_report_series_have_one_value_per_frame():
    track = _moving_track(speed_units=5.0)
    report = motion_health_report(track)
    for metric in FRAME_METRICS:
        assert len(report["series"][metric]) == track.duration_frames, metric
    assert len(report["framing"]) == track.duration_frames
    assert len(report["frame_grades"]) == track.duration_frames
    # Maxima stay consistent with the series they are derived from.
    assert report["max_speed"] == pytest.approx(max(report["series"]["speed"]))
    assert report["max_jerk"] == pytest.approx(max(report["series"]["jerk"]))


def test_warn_tier_sits_between_ok_and_over():
    track = _moving_track(speed_units=5.0)  # peak ~5 units/s
    over = motion_health_report(track, {"max_speed": 4.0})
    warn = motion_health_report(track, {"max_speed": 5.0 / WARN_RATIO * 0.99})
    ok = motion_health_report(track, {"max_speed": 100.0})
    assert over["grade"] == "over"
    assert warn["grade"] == "warn"
    assert ok["grade"] == "ok"
    # A warn is an advisory, not a violation: the trajectory is still valid.
    assert warn["trajectory_valid"] is True
    assert over["trajectory_valid"] is False


def test_segments_cover_every_frame_exactly_once():
    report = motion_health_report(_burst_track(), {"max_speed": 3.0})
    segments = report["segments"]
    assert segments[0]["start"] == 0
    assert segments[-1]["end"] == report["duration_frames"] - 1
    for previous, current in pairwise(segments):
        assert current["start"] == previous["end"] + 1
    for segment in segments:
        for frame in range(segment["start"], segment["end"] + 1):
            assert report["frame_grades"][frame] == segment["grade"]


def test_segments_localize_the_burst_rather_than_flagging_the_whole_track():
    report = motion_health_report(_burst_track(), {"max_speed": 3.0})
    flagged = [segment for segment in report["segments"] if segment["grade"] == "over"]
    assert flagged, "the lurch must be flagged"
    assert all("speed" in segment["metrics"] for segment in flagged)
    # The idle head of the track must stay green.
    assert report["frame_grades"][5] == "ok"


def test_fov_drift_is_a_track_level_alert_not_a_frame_grade():
    track = OmniCamTrack.from_dict(
        {
            "fps": 24,
            "duration_frames": 13,
            "keyframes": [
                {"frame": 0, "camera": {"position": [0, 1, 5], "target": [0, 1.5, 0], "fov": 20}, "interpolation": "linear"},
                {"frame": 12, "camera": {"position": [0, 1, 5], "target": [0, 1.5, 0], "fov": 80}, "interpolation": "linear"},
            ],
        }
    )
    report = motion_health_report(track, {"max_fov_change": 10.0})
    assert report["track_grades"]["fov_drift"] == "over"
    assert report["grade"] == "over"
    # No frame is individually blamed for a total excursion.
    assert set(report["frame_grades"]) == {"ok"}
    assert any(violation["metric"] == "max_fov_change" for violation in report["violations"])


def test_constant_speed_retime_preserves_duration_and_lowers_the_peak():
    track = _burst_track()
    before = motion_health_report(track)
    flattened = retime_constant_speed(track)
    after = motion_health_report(flattened)
    assert flattened.duration_frames == track.duration_frames
    assert after["max_speed"] < before["max_speed"]
    # Flattened means flat: peak collapses onto the average it cannot go below.
    moving = [speed for speed in after["series"]["speed"][1:]]
    assert max(moving) - min(moving) < max(moving) * 0.25


def test_plan_speed_fix_admits_when_a_fixed_duration_cannot_reach_the_limit():
    track = _moving_track(speed_units=10.0)  # constant 10 units/s already
    plan = plan_speed_fix(track, 5.0)
    assert plan["already_within_limit"] is False
    # Path and duration are fixed, so flattening cannot help here and the plan says so.
    assert plan["constant_speed_is_enough"] is False
    assert plan["required_duration_frames"] > plan["duration_frames"]

    # The burst peaks far above 8 but averages below it, so flattening suffices
    # and the shot keeps its length.
    relaxed = plan_speed_fix(_burst_track(), 8.0)
    assert relaxed["already_within_limit"] is False
    assert relaxed["constant_speed_is_enough"] is True
    assert relaxed["required_duration_frames"] == relaxed["duration_frames"]


def test_ranged_smoothing_leaves_frames_outside_the_range_untouched():
    track = _burst_track()
    smoothed = smooth_camera_path_range(track, 18, 24, radius=2)
    for frame in range(0, 17):
        assert smoothed.sample(frame).position == pytest.approx(track.sample(frame).position)
    # Frame 18 is the velocity corner the burst introduces -- the one the
    # averaging window actually has something to round off.
    assert smoothed.sample(18).position != pytest.approx(track.sample(18).position)


def test_ranged_recenter_only_retargets_keys_inside_the_range():
    track = _burst_track()
    recentred = recenter_subject_range(track, [0.0, 1.5, 0.0], start=18, end=24)
    targets = {key.frame: key.camera.target for key in recentred.keyframes}
    assert targets[24] == [0.0, 1.5, 0.0]
    # The head keeps its authored target instead of being flattened.
    assert targets[0] == track.keyframes[0].camera.target


def test_ati_visibility_report_flags_frames_where_the_points_leave_frame():
    track = OmniCamTrack.from_dict(
        {
            "fps": 24, "duration_frames": 13, "width": 640, "height": 360,
            "keyframes": [
                {"frame": 0, "camera": {"position": [0, 1.5, 9], "target": [0, 1.5, 0], "fov": 50}, "interpolation": "linear"},
                {"frame": 12, "camera": {"position": [0, 1.5, 0.2], "target": [0, 1.5, 0], "fov": 50}, "interpolation": "linear"},
            ],
        }
    )
    report = ati_visibility_report(track, point_count=16)
    assert len(report["visible_ratios"]) == track.duration_frames
    assert report["ok"] is False
    assert report["ranges"], "the frames with no followable point must be reported as ranges"
    for span in report["ranges"]:
        assert span["start"] <= span["end"]


def test_every_profile_covers_the_graded_metrics():
    roster = motion_profile_roster()
    assert roster["default"] in MOTION_PROFILES
    assert roster["warn_ratio"] == WARN_RATIO
    for entry in roster["profiles"]:
        for metric in FRAME_METRICS:
            assert f"max_{metric}" in entry["limits"], f"{entry['id']} misses max_{metric}"
        assert "max_fov_change" in entry["limits"]
    assert profile_limits("wan_ati") == ATI_RECOMMENDED_MOTION_LIMITS
    # An unknown id degrades to the generic table instead of grading against nothing.
    assert profile_limits("not_a_model") == profile_limits("generic")
