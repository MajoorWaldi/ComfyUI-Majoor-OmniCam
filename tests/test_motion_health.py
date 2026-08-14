import pytest

from omnicam.adapters.h3 import H3_RECOMMENDED_MOTION_LIMITS
from omnicam.core.camera_tools import (
    locked_camera,
    motion_health_check,
    retime_to_speed,
    validate_zero_motion,
)
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
