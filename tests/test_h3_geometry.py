from __future__ import annotations

from h3_track_fixtures import (
    base_track,
    mild_drift_orbit_track,
    orbit_track,
    pan_in_place_track,
    reverse_orbit_track,
    track_with_moving_target,
)

from omnicam.adapters.h3_geometry import analyze_h3_geometry
from omnicam.adapters.h3_representability import evaluate_h3_scene_coverage
from omnicam.core.camera_tools import apply_camera_preset


def test_full_orbit_stays_unwrapped():
    analysis = analyze_h3_geometry(orbit_track(degrees=360.0, frames=124))
    assert abs(abs(analysis.net_orbit_degrees) - 360.0) < 1.0
    assert analysis.total_orbit_degrees >= 359.0


def test_left_and_right_orbits_use_omnicam_direction_convention():
    left = analyze_h3_geometry(apply_camera_preset(base_track(), "orbit_left"))
    right = analyze_h3_geometry(apply_camera_preset(base_track(), "orbit_right"))
    assert left.coverage_direction == "counterclockwise / camera left"
    assert right.coverage_direction == "clockwise / camera right"


def test_target_drift_is_measured_against_frame_zero_anchor():
    analysis = analyze_h3_geometry(track_with_moving_target())
    assert analysis.max_target_drift_ratio > 0.0


def test_loop_closure_requires_matching_camera_state():
    assert analyze_h3_geometry(orbit_track(degrees=360.0, frames=124)).loop_closure is True

    drifted_fov = orbit_track(degrees=360.0, frames=124)
    keyframes = drifted_fov.to_dict()["keyframes"]
    keyframes[-1]["camera"]["fov"] += 8.0
    payload = drifted_fov.to_dict()
    payload["keyframes"] = keyframes
    from omnicam.core.track import OmniCamTrack

    assert analyze_h3_geometry(OmniCamTrack.from_dict(payload)).loop_closure is False


def test_reversal_is_preserved_as_segment_boundary():
    analysis = analyze_h3_geometry(reverse_orbit_track())
    assert any(segment.reverses_after for segment in analysis.segments)


def test_parallax_metric_scales_with_orbit_angle():
    small = analyze_h3_geometry(orbit_track(degrees=30.0, frames=124))
    large = analyze_h3_geometry(orbit_track(degrees=120.0, frames=124))
    assert sum(s.parallax_frame_widths for s in large.segments) > sum(
        s.parallax_frame_widths for s in small.segments
    )


def test_pan_in_place_shows_large_target_drift_and_small_orbit():
    analysis = analyze_h3_geometry(pan_in_place_track())
    assert analysis.max_target_drift_ratio > 0.05
    assert analysis.total_orbit_degrees < 5.0


def test_mild_drift_orbit_stays_within_warning_band():
    analysis = analyze_h3_geometry(mild_drift_orbit_track())
    assert 0.01 < analysis.max_target_drift_ratio <= 0.05
    assert 1.0 < analysis.max_roll_delta_degrees <= 5.0
    assert 1.0 < analysis.max_fov_delta_degrees <= 10.0


def test_pan_in_place_is_blocked_for_scene_coverage():
    track = pan_in_place_track()
    result = evaluate_h3_scene_coverage(track, analyze_h3_geometry(track), is_multi_shot=False)
    assert result.state == "BLOCKED"
    assert any("reference-video" in item for item in result.recommendations)


def test_small_target_and_lens_drift_warns_not_blocks():
    track = mild_drift_orbit_track()
    result = evaluate_h3_scene_coverage(track, analyze_h3_geometry(track), is_multi_shot=False)
    assert result.state == "WARNING"


def test_multi_shot_is_blocked():
    track = orbit_track(degrees=90.0, frames=124)
    result = evaluate_h3_scene_coverage(track, analyze_h3_geometry(track), is_multi_shot=True)
    assert result.state == "BLOCKED"


def test_more_than_one_turn_is_blocked():
    track = orbit_track(degrees=720.0, frames=243)
    result = evaluate_h3_scene_coverage(track, analyze_h3_geometry(track), is_multi_shot=False)
    assert result.state == "BLOCKED"


def test_clean_orbit_passes():
    track = orbit_track(degrees=180.0, frames=124)
    result = evaluate_h3_scene_coverage(track, analyze_h3_geometry(track), is_multi_shot=False)
    assert result.state == "PASS"


def test_static_camera_passes_as_a_hold():
    track = base_track()
    result = evaluate_h3_scene_coverage(track, analyze_h3_geometry(track), is_multi_shot=False)
    assert result.state == "PASS"
