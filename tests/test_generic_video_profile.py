"""External / Generic Reference Video: the permissive passthrough profile."""

from __future__ import annotations

from omnicam.core.motion_scene import MotionScene
from omnicam.profiles import CompileRequest
from omnicam.profiles.capability_gate import capability_check
from omnicam.profiles.generic_video import EXTERNAL_REFERENCE_VIDEO_PROFILE


def _camera(camera_id: str, *, enabled: bool = True) -> dict:
    return {
        "id": camera_id,
        "label": camera_id,
        "enabled": enabled,
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


def _scene(*, cuts: list | None = None, camera_enabled: bool = True) -> MotionScene:
    return MotionScene.from_dict(
        {
            "version": 1,
            "timeline": {"duration_seconds": 2.0, "authoring_fps": 24.0},
            "canvas": {"width": 640, "height": 360},
            "cameras": [_camera("hero_camera", enabled=camera_enabled), _camera("second_camera")],
            "active_camera_id": "hero_camera",
            "playblast_camera_id": "hero_camera",
            "objects": [],
            "motion_layers": [],
            "cuts": cuts or [],
            "metadata": {},
        }
    )


def _request(*, with_video: bool = True, cuts: list | None = None, base_prompt: str = "A stone tower.") -> CompileRequest:
    return CompileRequest(
        motion_scene=_scene(cuts=cuts),
        playblast_video="a-video-sentinel" if with_video else None,
        base_prompt=base_prompt,
        target_width=832,
        target_height=480,
        duration_seconds=2.0,
        target_fps=24.0,
    )


def test_generic_profile_never_blocks_on_a_missing_playblast():
    checks = EXTERNAL_REFERENCE_VIDEO_PROFILE.preflight(_request(with_video=False))
    states = {check.state for check in checks}
    assert "BLOCKED" not in states


def test_generic_profile_compiles_without_a_playblast_connected():
    result = EXTERNAL_REFERENCE_VIDEO_PROFILE.compile(_request(with_video=False))
    assert result.reference_video is None
    assert result.final_prompt == "A stone tower."


def test_generic_profile_passes_the_playblast_through_unchanged():
    result = EXTERNAL_REFERENCE_VIDEO_PROFILE.compile(_request())
    assert result.reference_video == "a-video-sentinel"


def test_generic_profile_never_imposes_a_frame_grid():
    """No 17n+5, no fixed 121, no 4n+1 -- resolve_timeline just answers duration * fps."""
    timeline = EXTERNAL_REFERENCE_VIDEO_PROFILE.resolve_timeline(_request())
    assert timeline.frame_count == 48
    assert timeline.fps == 24.0
    assert timeline.frame_policy == "requested_length"


def test_generic_profile_leaves_the_prompt_untouched_even_for_a_multi_shot_edit():
    """The cut timing rides in the playblast; the prompt stays exactly the user's.

    A named profile may append a "follow its camera motion, not its look"
    instruction, but that is a claim about how one model reads a reference
    video. For an unknown destination it must not be assumed.
    """
    cuts = [
        {"camera_id": "hero_camera", "time_seconds": 0.0, "end_time_seconds": 1.0},
        {"camera_id": "second_camera", "time_seconds": 1.0, "end_time_seconds": 2.0},
    ]
    result = EXTERNAL_REFERENCE_VIDEO_PROFILE.compile(_request(cuts=cuts))
    assert result.final_prompt == "A stone tower."
    checks = {check.id: check for check in result.checks}
    assert checks["multi_shot"].state == "WARNING"  # never BLOCKED, unlike a single-camera semantic


def test_generic_profile_reports_no_downstream_contract_check_of_its_own():
    """capability_gate owns the 'user managed' message; the profile must not duplicate it."""
    checks = EXTERNAL_REFERENCE_VIDEO_PROFILE.preflight(_request())
    assert "downstream_contract" not in {check.id for check in checks}


def test_capability_check_reports_user_managed_for_a_requirement_free_profile():
    capabilities = {
        "node_registry_available": True,
        "capabilities": [
            {"adapter": "external_reference_video", "state": "verified", "detected_nodes": [], "requirements": []},
        ],
    }
    check = capability_check("external_reference_video", capabilities)
    assert check is not None
    assert check.state == "PASS"
    assert "user managed" in check.label.lower()


def test_the_registry_actually_reports_external_reference_video_as_requirement_free():
    from omnicam.capabilities import detect_capabilities

    report = detect_capabilities(set())
    entry = next(item for item in report["capabilities"] if item["adapter"] == "external_reference_video")
    assert entry["state"] == "verified"
    assert entry["requirements"] == []

    check = capability_check("external_reference_video", report)
    assert check.state == "PASS"
    assert "user managed" in check.label.lower()
