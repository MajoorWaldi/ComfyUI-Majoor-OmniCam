from __future__ import annotations

import pytest

from omnicam.adapters.h3_geometry import analyze_h3_geometry
from omnicam.adapters.h3_scene_coverage import (
    build_h3edit_scene_options,
    h3_grid,
    select_h3_scene_profile,
)

from h3_track_fixtures import orbit_track


@pytest.mark.parametrize(
    ("requested", "expected"),
    [(72, 124), (124, 124), (125, 243), (243, 243), (244, 362), (362, 362)],
)
def test_scene_profile_uses_smallest_non_shorter_length(requested, expected):
    assert select_h3_scene_profile(requested).frames == expected


def test_scene_profile_rejects_more_than_362_frames():
    with pytest.raises(ValueError, match="362"):
        select_h3_scene_profile(363)


def test_h3_grid_matches_downstream_32_pixel_rounding():
    assert h3_grid(831) == 832
    assert h3_grid(481) == 480


def test_scene_options_fill_every_downstream_key():
    track = orbit_track(degrees=180.0, frames=124)
    options = build_h3edit_scene_options(track, analyze_h3_geometry(track), target_frames=124)
    assert set(options) == {
        "mode", "show_overrides", "prompt_mode", "quality_profile",
        "primary_image_role", "reference_mode", "source_fit",
        "semantic_resolution", "native_reference_size", "coverage_views",
        "coverage_arc_degrees", "coverage_direction",
        "coverage_hold_frames", "coverage_loop_closure",
    }
    assert options["coverage_hold_frames"] == 1


def test_closed_360_orbit_enables_loop_closure_option():
    track = orbit_track(degrees=360.0, frames=124)
    options = build_h3edit_scene_options(track, analyze_h3_geometry(track), target_frames=124)
    assert options["coverage_arc_degrees"] == 360.0
    assert options["coverage_loop_closure"] is True


def test_static_hold_reports_minimum_coverage_arc():
    from h3_track_fixtures import base_track

    track = base_track()
    options = build_h3edit_scene_options(track, analyze_h3_geometry(track), target_frames=124)
    assert options["coverage_arc_degrees"] == 15.0
