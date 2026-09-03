"""The recorded-vs-current playblast fingerprint gate."""

from __future__ import annotations

from omnicam.core.motion_scene import MotionScene
from omnicam.profiles import CompileRequest
from omnicam.profiles.generic_video import EXTERNAL_REFERENCE_VIDEO_PROFILE
from omnicam.profiles.playblast_freshness import playblast_staleness, stale_playblast_check


def _scene(*, recorded: str | None = None, live: str | None = None) -> MotionScene:
    metadata: dict = {}
    if recorded is not None:
        metadata["playblast"] = {"motion_scene_fingerprint": recorded}
    if live is not None:
        metadata["motion_scene_fingerprint_live"] = live
    return MotionScene.from_dict(
        {
            "version": 1,
            "timeline": {"duration_seconds": 2.0, "authoring_fps": 24.0},
            "canvas": {"width": 640, "height": 360},
            "cameras": [
                {
                    "id": "hero",
                    "label": "Hero",
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
                            }
                        ],
                        "objects": [],
                        "metadata": {},
                    },
                }
            ],
            "active_camera_id": "hero",
            "playblast_camera_id": "hero",
            "objects": [],
            "motion_layers": [],
            "cuts": [],
            "metadata": metadata,
        }
    )


def test_staleness_is_unknown_until_both_fingerprints_are_present():
    assert playblast_staleness(_scene()) == "unknown"
    assert playblast_staleness(_scene(recorded="abc")) == "unknown"
    assert playblast_staleness(_scene(live="abc")) == "unknown"


def test_matching_fingerprints_are_fresh_and_a_mismatch_is_stale():
    assert playblast_staleness(_scene(recorded="abc123", live="abc123")) == "fresh"
    assert playblast_staleness(_scene(recorded="abc123", live="def456")) == "stale"


def test_stale_check_blocks_or_warns_by_profile_kind():
    fresh = _scene(recorded="abc", live="abc")
    assert stale_playblast_check(fresh, display_name="X", block=True) is None

    stale = _scene(recorded="abc", live="zzz")
    blocked = stale_playblast_check(stale, display_name="MiniMax H3 API", block=True)
    assert blocked is not None and blocked.state == "BLOCKED"
    warned = stale_playblast_check(stale, display_name="Generic", block=False)
    assert warned is not None and warned.state == "WARNING"


def _request(scene: MotionScene) -> CompileRequest:
    return CompileRequest(
        motion_scene=scene,
        playblast_video=None,
        base_prompt="A stone tower.",
        target_width=832,
        target_height=480,
        duration_seconds=2.0,
        target_fps=24.0,
    )


def test_generic_profile_only_warns_on_a_stale_playblast():
    checks = EXTERNAL_REFERENCE_VIDEO_PROFILE.preflight(_request(_scene(recorded="abc", live="zzz")))
    freshness = [check for check in checks if check.id == "playblast_freshness"]
    assert len(freshness) == 1
    assert freshness[0].state == "WARNING"

    clean = EXTERNAL_REFERENCE_VIDEO_PROFILE.preflight(_request(_scene(recorded="abc", live="abc")))
    assert not [check for check in clean if check.id == "playblast_freshness"]
