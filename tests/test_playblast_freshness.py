from __future__ import annotations

from omnicam.core.motion_scene import MotionScene
from omnicam.profiles.playblast_freshness import captured_guide_style, guide_style_mismatch_check


def _scene(*, metadata: dict | None = None) -> MotionScene:
    return MotionScene.from_dict(
        {
            "version": 1,
            "timeline": {"duration_seconds": 2.0, "authoring_fps": 24.0},
            "canvas": {"width": 640, "height": 360},
            "cameras": [
                {
                    "id": "hero_camera",
                    "label": "Hero Camera",
                    "enabled": True,
                    "track": {
                        "schema_version": 1,
                        "fps": 24,
                        "duration_frames": 48,
                        "width": 640,
                        "height": 360,
                        "render_mode": "omni_ref",
                        "keyframes": [
                            {
                                "frame": 0,
                                "camera": {"position": [0.0, 2.0, 6.0], "target": [0.0, 1.0, 0.0], "fov": 45.0, "roll": 0.0},
                                "interpolation": "linear",
                            },
                            {
                                "frame": 47,
                                "camera": {"position": [2.5, 3.0, 3.0], "target": [0.0, 1.0, 0.0], "fov": 32.0, "roll": 12.0},
                                "interpolation": "smooth",
                            },
                        ],
                        "objects": [],
                        "metadata": {},
                    },
                }
            ],
            "active_camera_id": "hero_camera",
            "playblast_camera_id": "hero_camera",
            "objects": [],
            "motion_layers": [],
            "cuts": [],
            "metadata": metadata or {},
        }
    )


# ---------------------------------------------------------------------------
# captured_guide_style
# ---------------------------------------------------------------------------

def test_captured_guide_style_is_none_without_a_playblast():
    assert captured_guide_style(_scene()) is None


def test_captured_guide_style_is_none_for_a_playblast_recorded_before_p1():
    scene = _scene(metadata={"playblast": {"motion_scene_fingerprint": "abc"}})
    assert captured_guide_style(scene) is None


def test_captured_guide_style_reads_the_recorded_value():
    scene = _scene(metadata={"playblast": {"guide_style": "clay"}})
    assert captured_guide_style(scene) == "clay"


def test_captured_guide_style_ignores_a_non_string_value():
    scene = _scene(metadata={"playblast": {"guide_style": 123}})
    assert captured_guide_style(scene) is None


# ---------------------------------------------------------------------------
# guide_style_mismatch_check
# ---------------------------------------------------------------------------

def test_no_check_when_nothing_was_captured():
    scene = _scene()
    assert guide_style_mismatch_check(scene, expected="motion_proxy", display_name="X", block=False) is None


def test_no_check_when_captured_matches_expected():
    scene = _scene(metadata={"playblast": {"guide_style": "clay"}})
    assert guide_style_mismatch_check(scene, expected="clay", display_name="X", block=False) is None


def test_warns_on_mismatch_by_default():
    scene = _scene(metadata={"playblast": {"guide_style": "clay"}})
    check = guide_style_mismatch_check(scene, expected="motion_proxy", display_name="X", block=False)
    assert check is not None
    assert check.id == "guide_style_mismatch"
    assert check.state == "WARNING"
    assert "clay" in check.message
    assert "motion_proxy" in check.message


def test_blocks_on_mismatch_when_requested():
    scene = _scene(metadata={"playblast": {"guide_style": "clay"}})
    check = guide_style_mismatch_check(scene, expected="motion_proxy", display_name="X", block=True)
    assert check.state == "BLOCKED"
