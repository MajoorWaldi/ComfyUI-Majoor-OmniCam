from __future__ import annotations

from h3_track_fixtures import base_track, orbit_track

from omnicam.core.track import OmniCamTrack
from omnicam.guides.health import guide_health_checks


def _check(checks, check_id):
    return next((check for check in checks if check.id == check_id), None)


def test_a_static_hold_warns_about_motion_readability():
    checks = guide_health_checks(base_track(), guide_style="motion_proxy")
    check = _check(checks, "guide_health_peak_speed")
    assert check is not None
    assert check.state == "WARNING"


def test_beauty_reference_does_not_warn_about_a_static_hold():
    # A beauty guide's job is appearance, not motion -- a static hold is fine.
    checks = guide_health_checks(base_track(), guide_style="beauty_reference")
    assert _check(checks, "guide_health_peak_speed") is None


def test_beauty_reference_reports_an_intentional_appearance_check():
    checks = guide_health_checks(base_track(), guide_style="beauty_reference")
    check = _check(checks, "guide_health_appearance")
    assert check is not None
    assert check.state == "PASS"


def test_a_moderate_orbit_has_no_motion_warnings():
    # 90 degrees over ~5 seconds (124 frames @ 24fps) is a normal, readable move.
    checks = guide_health_checks(orbit_track(90.0, frames=124), guide_style="motion_proxy")
    assert _check(checks, "guide_health_peak_speed") is None
    assert _check(checks, "guide_health_angular_velocity") is None


def test_a_fast_whip_orbit_warns_about_angular_velocity():
    # 270 degrees in exactly one second (24 frames @ 24fps) is a whip pan.
    checks = guide_health_checks(orbit_track(270.0, frames=24, fps=24), guide_style="motion_proxy")
    check = _check(checks, "guide_health_angular_velocity")
    assert check is not None
    assert check.state == "WARNING"


def test_a_large_fov_swing_warns_about_focal_length():
    track = OmniCamTrack.from_dict({
        "duration_frames": 24,
        "fps": 24,
        "keyframes": [
            {"frame": 0, "camera": {"position": [0.0, 0.0, 5.0], "target": [0.0, 0.0, 0.0], "fov": 20.0, "roll": 0.0}, "interpolation": "linear"},
            {"frame": 23, "camera": {"position": [0.0, 0.0, 5.0], "target": [0.0, 0.0, 0.0], "fov": 90.0, "roll": 0.0}, "interpolation": "linear"},
        ],
    })
    checks = guide_health_checks(track, guide_style="motion_proxy")
    check = _check(checks, "guide_health_focal_length")
    assert check is not None
    assert check.state == "WARNING"
