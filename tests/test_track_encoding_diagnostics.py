"""What the JSON track formats cannot carry has to be said, not just done.

``visible_prefix_tracks`` is honest about the format's limits and silent about
applying them: a layer hidden on the first sample is dropped, and a layer that
disappears and returns is truncated. "One enabled motion layer" was the only
thing preflight checked, and that is a different claim from "one layer that
survives encoding".
"""

from __future__ import annotations

from omnicam.core.motion_sampling import SampledTrack
from omnicam.profiles.track_json import (
    describe_track_encoding,
    encoding_check,
    visible_prefix_tracks,
)


def _track(layer_id: str, label: str, visible: list[bool]) -> SampledTrack:
    return SampledTrack(id=layer_id, label=label, xy=[(0.4, 0.6)] * len(visible), visible=visible)


def test_a_layer_hidden_on_the_first_sample_is_reported_not_silently_dropped():
    track = _track("hero", "Hero Face", [False, False, True, True])

    issues = describe_track_encoding([track])

    assert [issue.kind for issue in issues] == ["hidden_at_start"]
    assert "dropped entirely" in issues[0].message
    # And the encoder really does drop it, which is what makes the report necessary.
    assert visible_prefix_tracks([track], width=100, height=100) == []


def test_a_layer_that_reappears_is_reported_with_the_frame_it_is_cut_at():
    track = _track("car", "Car", [True, True, False, False, True])

    issues = describe_track_encoding([track])

    assert [issue.kind for issue in issues] == ["visibility_gap"]
    assert issues[0].frame == 2
    encoded = visible_prefix_tracks([track], width=100, height=100)
    assert len(encoded[0]) == 2  # truncated at the gap; the return is lost


def test_a_layer_that_only_ends_early_is_not_an_issue():
    """A trajectory that stops is exactly what the zero pad represents."""
    track = _track("fg", "Foreground", [True, True, True, False, False])

    assert describe_track_encoding([track]) == []


def test_a_fully_visible_layer_passes_cleanly():
    check = encoding_check([_track("fg", "Foreground", [True] * 4)], display_name="Wan Track")

    assert check.state == "PASS"
    assert check.label == "Encodable trajectories: 1"


def test_affected_layers_warn_while_some_still_encode():
    checks = encoding_check(
        [_track("hero", "Hero Face", [False, True]), _track("fg", "Foreground", [True, True])],
        display_name="Wan Track",
    )

    assert checks.state == "WARNING"
    assert "Hero Face" in checks.message


def test_nothing_encodable_blocks_rather_than_warns():
    check = encoding_check(
        [_track("hero", "Hero Face", [False, True, True])], display_name="WanVideo ATI"
    )

    assert check.state == "BLOCKED"
    assert "Encodable trajectories: 0" in check.label


def test_an_unprojectable_point_is_distinguishable_from_the_top_left_corner():
    """A point behind the camera has no screen position, only a placeholder.

    The resolver writes (0.0, 0.0) for it, which is a perfectly valid coordinate,
    so `defined` is what keeps the two apart. Off-screen points are a different
    case and keep their real, unclamped coordinates.
    """
    from omnicam.core.motion_projection import project_world_track
    from omnicam.core.track import OmniCamTrack

    track = OmniCamTrack.from_dict({
        "schema_version": 1, "fps": 24, "duration_frames": 24,
        "width": 640, "height": 360, "render_mode": "omni_ref",
        "keyframes": [{"frame": 0, "camera": {
            "position": [0.0, 0.0, 5.0], "target": [0.0, 0.0, 0.0], "fov": 40.0,
        }}],
        "objects": [], "metadata": {},
    })

    behind = project_world_track([0.0, 0.0, 10.0], track, [0.0], width=640, height=360)[0]
    assert behind.x is None and behind.visible is False

    offscreen = project_world_track([-8.0, 0.0, 0.0], track, [0.0], width=640, height=360)[0]
    assert offscreen.visible is False
    assert offscreen.x is not None and offscreen.x < 0.0  # kept, not clamped to 0
