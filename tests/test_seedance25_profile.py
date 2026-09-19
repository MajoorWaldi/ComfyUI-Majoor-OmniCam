from __future__ import annotations

import copy

import pytest

from omnicam.adapters.registry import ADAPTER_INFO
from omnicam.capabilities import detect_capabilities
from omnicam.core.motion_scene import MotionScene
from omnicam.profiles import CompileRequest
from omnicam.profiles.seedance25 import SEEDANCE25_REFERENCE_PROFILE
from omnicam.profiles.shots import MULTI_SHOT_PROMPT


def _scene(*, camera_enabled: bool = True, duration_seconds: float = 4.0, metadata: dict | None = None) -> MotionScene:
    frames = round(duration_seconds * 24.0)
    return MotionScene.from_dict(
        {
            "version": 1,
            "timeline": {"duration_seconds": duration_seconds, "authoring_fps": 24.0},
            "canvas": {"width": 640, "height": 360},
            "cameras": [
                {
                    "id": "hero_camera",
                    "label": "Hero Camera",
                    "enabled": camera_enabled,
                    "track": {
                        "schema_version": 1,
                        "fps": 24,
                        "duration_frames": frames,
                        "width": 640,
                        "height": 360,
                        "render_mode": "omni_ref",
                        "keyframes": [
                            {
                                "frame": 0,
                                "camera": {
                                    "position": [0.0, 2.0, 6.0], "target": [0.0, 1.0, 0.0],
                                    "fov": 45.0, "roll": 0.0,
                                },
                                "interpolation": "linear",
                            },
                            {
                                "frame": frames - 1,
                                "camera": {
                                    "position": [2.5, 3.0, 3.0], "target": [0.0, 1.0, 0.0],
                                    "fov": 32.0, "roll": 12.0,
                                },
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


class MockVideo:
    """No torch dependency: this profile never decodes frames itself."""

    def __init__(self, duration_seconds: float = 4.0, frame_rate: float = 24.0):
        self._frame_rate = frame_rate
        self._frame_count = max(1, round(duration_seconds * frame_rate))

    def get_frame_rate(self) -> float:
        return self._frame_rate

    def get_frame_count(self) -> int:
        return self._frame_count

    def get_dimensions(self) -> tuple[int, int]:
        return (640, 360)


def _request(*, with_video: bool = True, video=None, duration_seconds: float = 4.0,
             guide_reference_index: int | None = None, guide_style: str | None = None,
             captured_guide_style: str | None = None, reference_plan_json: str = "") -> CompileRequest:
    metadata = {"playblast": {"guide_style": captured_guide_style}} if captured_guide_style else None
    return CompileRequest(
        motion_scene=_scene(duration_seconds=duration_seconds, metadata=metadata),
        playblast_video=video if video is not None else (MockVideo(duration_seconds) if with_video else None),
        base_prompt="A stone tower at blue hour.",
        target_width=832,
        target_height=480,
        duration_seconds=duration_seconds,
        target_fps=24.0,
        guide_reference_index=guide_reference_index,
        guide_style=guide_style,
        reference_plan_json=reference_plan_json,
    )


def _check(checks, check_id):
    return next(check for check in checks if check.id == check_id)


# ---------------------------------------------------------------------------
# resolve_timeline
# ---------------------------------------------------------------------------

def test_resolve_timeline_clamps_duration_into_seedance_bounds():
    short = SEEDANCE25_REFERENCE_PROFILE.resolve_timeline(_request(duration_seconds=1.0))
    assert short.duration_seconds == 4.0

    long = SEEDANCE25_REFERENCE_PROFILE.resolve_timeline(_request(duration_seconds=45.0))
    assert long.duration_seconds == 30.0

    within = SEEDANCE25_REFERENCE_PROFILE.resolve_timeline(_request(duration_seconds=10.0))
    assert within.duration_seconds == 10.0
    assert within.frame_policy == "seedance25_duration_seconds"


# ---------------------------------------------------------------------------
# preflight / compile happy path
# ---------------------------------------------------------------------------

def test_compiles_with_a_valid_guide():
    request = _request()
    result = SEEDANCE25_REFERENCE_PROFILE.compile(request)
    assert result.profile_id == "seedance25_reference"
    assert result.semantic == "reference_video"
    assert result.reference_video is request.playblast_video
    assert "Use Video 1 as the camera-motion reference." in result.final_prompt
    assert result.final_prompt.startswith("A stone tower at blue hour.")


def test_requires_a_playblast_video():
    request = _request(with_video=False)
    checks = SEEDANCE25_REFERENCE_PROFILE.preflight(request)
    assert any(c.id == "playblast_video" and c.state == "BLOCKED" for c in checks)
    with pytest.raises(ValueError, match="playblast video is required"):
        SEEDANCE25_REFERENCE_PROFILE.compile(request)


# ---------------------------------------------------------------------------
# guide duration floor (1.8s)
# ---------------------------------------------------------------------------

def test_blocks_a_guide_shorter_than_the_1_8_second_minimum():
    request = _request(video=MockVideo(duration_seconds=1.0))
    check = _check(SEEDANCE25_REFERENCE_PROFILE.preflight(request), "reference_media")
    assert check.state == "BLOCKED"
    assert "1.8" in check.message
    with pytest.raises(ValueError, match=r"1\.8"):
        SEEDANCE25_REFERENCE_PROFILE.compile(request)


def test_passes_a_guide_at_exactly_the_minimum():
    # frame_rate chosen so 1.8s divides exactly; a 24fps clip rounds 1.8s down
    # to 43 frames (1.7917s), which is a real below-the-floor reference, not a
    # test artifact.
    request = _request(video=MockVideo(duration_seconds=1.8, frame_rate=10.0))
    check = _check(SEEDANCE25_REFERENCE_PROFILE.preflight(request), "reference_media")
    assert check.state == "PASS"


def test_reference_media_budget_is_informational_only():
    check = _check(SEEDANCE25_REFERENCE_PROFILE.preflight(_request()), "reference_media_budget")
    assert check.state == "PASS"
    assert "authoritative" in check.message


# ---------------------------------------------------------------------------
# guide_reference_index (1..10)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("index", [0, -1])
def test_construction_rejects_a_non_positive_reference_index(index):
    """guide_reference_index is never valid at 0 or below, for any profile."""
    with pytest.raises(ValueError, match="guide_reference_index"):
        _request(guide_reference_index=index)


def test_blocks_a_reference_index_above_seedance_ceiling():
    request = _request(guide_reference_index=11)
    check = _check(SEEDANCE25_REFERENCE_PROFILE.preflight(request), "guide_reference_index")
    assert check.state == "BLOCKED"
    with pytest.raises(ValueError):
        SEEDANCE25_REFERENCE_PROFILE.compile(request)


def test_accepts_reference_index_ten():
    request = _request(guide_reference_index=10)
    check = _check(SEEDANCE25_REFERENCE_PROFILE.preflight(request), "guide_reference_index")
    assert check.state == "PASS"
    result = SEEDANCE25_REFERENCE_PROFILE.compile(request)
    assert "Video 10" in result.final_prompt


# ---------------------------------------------------------------------------
# multi-shot
# ---------------------------------------------------------------------------

def _multi_shot_request() -> CompileRequest:
    payload = _scene().to_dict()
    second = copy.deepcopy(payload["cameras"][0])
    second["id"] = "wide_camera"
    second["label"] = "Wide Camera"
    payload["cameras"].append(second)
    payload["cuts"] = [
        {"camera_id": "hero_camera", "time_seconds": 0.0, "end_time_seconds": 2.0},
        {"camera_id": "wide_camera", "time_seconds": 2.0, "end_time_seconds": 4.0},
    ]
    request = _request()
    object.__setattr__(request, "motion_scene", MotionScene.from_dict(payload))
    return request


def test_multi_shot_edit_replaces_the_camera_fragment():
    request = _multi_shot_request()
    assert request.motion_scene.is_multi_shot
    check = _check(SEEDANCE25_REFERENCE_PROFILE.preflight(request), "multi_shot")
    assert check.state == "WARNING"

    result = SEEDANCE25_REFERENCE_PROFILE.compile(request)
    assert MULTI_SHOT_PROMPT in result.final_prompt


# ---------------------------------------------------------------------------
# Motion timeline (P5): the compiler seam actually reaches the profile output.
# ---------------------------------------------------------------------------

def _request_with_action_layer() -> CompileRequest:
    payload = _scene().to_dict()
    payload["motion_layers"] = [
        {
            "id": "hero_action",
            "label": "Hero action",
            "enabled": True,
            "semantic": "screen_point",
            "source_kind": "object_point",
            "keys": [
                {"time_seconds": 0.0, "x": 0.2, "y": 0.5},
                {"time_seconds": 3.9, "x": 0.8, "y": 0.5},
            ],
            "source": {"object_id": "hero", "action_text": "raises the sword and turns to face the doorway"},
        }
    ]
    request = _request()
    object.__setattr__(request, "motion_scene", MotionScene.from_dict(payload))
    return request


def test_compiled_prompt_includes_a_motion_timeline_section():
    result = SEEDANCE25_REFERENCE_PROFILE.compile(_request())
    assert "Motion timeline:" in result.final_prompt


def test_compiled_prompt_carries_an_authored_action_cue_verbatim():
    result = SEEDANCE25_REFERENCE_PROFILE.compile(_request_with_action_layer())
    assert "raises the sword and turns to face the doorway" in result.final_prompt


# ---------------------------------------------------------------------------
# mapping quality / task type
# ---------------------------------------------------------------------------

def test_camera_motion_mapping_is_conditional():
    check = _check(SEEDANCE25_REFERENCE_PROFILE.preflight(_request()), "camera_motion_mapping")
    assert check.state == "PASS"
    assert check.mapping_quality == "CONDITIONAL"


def test_task_type_is_always_reference():
    check = _check(SEEDANCE25_REFERENCE_PROFILE.preflight(_request()), "task_type")
    assert "reference" in check.label


# ---------------------------------------------------------------------------
# Adapter contract / capability detection
# ---------------------------------------------------------------------------

def test_adapter_targets_only_the_current_v2_node():
    info = ADAPTER_INFO["seedance25_reference"]
    assert info["required_node_classes"] == [["ByteDance2ReferenceNodeV2"]]
    for group in info["required_node_classes"]:
        assert "ByteDance2ReferenceNode" not in group or group == ["ByteDance2ReferenceNodeV2"]


def test_profile_is_registered_in_the_catalog():
    from omnicam.profiles.catalog import PROFILE_REGISTRY

    assert PROFILE_REGISTRY.require("seedance25_reference") is SEEDANCE25_REFERENCE_PROFILE


class _FakeDynamicComboOption:
    """Mimics a V3 DynamicCombo.Option: real sockets live under .inputs."""

    def __init__(self, inputs):
        self.inputs = inputs


class _FakeInput:
    def __init__(self, id=None, options=None):
        self.id = id
        self.options = options


class _FakeSchema:
    def __init__(self, inputs):
        self.inputs = inputs


class _FakeByteDanceNode:
    """Shape-only stand-in for ByteDance2ReferenceNodeV2's nested V3 schema."""

    @classmethod
    def define_schema(cls):
        nested = [_FakeInput(id="reference_videos"), _FakeInput(id="prompt"), _FakeInput(id="reference_images")]
        option = _FakeDynamicComboOption(inputs=nested)
        model_input = _FakeInput(id="model", options=[option])
        return _FakeSchema(inputs=[model_input])


def test_capability_detection_reaches_the_nested_dynamiccombo_sockets():
    capabilities = detect_capabilities(node_classes={"ByteDance2ReferenceNodeV2": _FakeByteDanceNode})
    entry = next(c for c in capabilities["capabilities"] if c["adapter"] == "seedance25_reference")
    assert entry["state"] == "verified"


# ---------------------------------------------------------------------------
# P1: guide_style resolution from what the Director actually captured
# ---------------------------------------------------------------------------

def test_prompt_resolves_motion_proxy_when_nothing_was_captured():
    request = _request()
    result = SEEDANCE25_REFERENCE_PROFILE.compile(request)
    assert "Use Video 1 as the camera-motion reference." in result.final_prompt


def test_prompt_resolves_clay_from_a_captured_clay_playblast():
    request = _request(captured_guide_style="clay")
    result = SEEDANCE25_REFERENCE_PROFILE.compile(request)
    assert "Use Video 1 as the clay / white-model spatial reference." in result.final_prompt


def test_prompt_resolves_motion_proxy_from_a_captured_motion_proxy_playblast():
    request = _request(captured_guide_style="motion_proxy")
    result = SEEDANCE25_REFERENCE_PROFILE.compile(request)
    assert "Use Video 1 as the camera-motion reference." in result.final_prompt


def test_explicit_guide_style_bypasses_the_captured_resolver():
    # Captured clay, but the Monitor widget forces motion_proxy -- the forced
    # value wins, the resolver from _resolve_shot_intent never runs.
    request = _request(captured_guide_style="clay", guide_style="motion_proxy")
    result = SEEDANCE25_REFERENCE_PROFILE.compile(request)
    assert "Use Video 1 as the camera-motion reference." in result.final_prompt


def test_explicit_guide_style_auto_still_resolves_from_captured():
    request = _request(captured_guide_style="clay", guide_style="auto")
    result = SEEDANCE25_REFERENCE_PROFILE.compile(request)
    assert "Use Video 1 as the clay / white-model spatial reference." in result.final_prompt


# ---------------------------------------------------------------------------
# P1: guide_style_mismatch preflight check
# ---------------------------------------------------------------------------

def test_no_mismatch_check_when_nothing_was_captured():
    checks = SEEDANCE25_REFERENCE_PROFILE.preflight(_request())
    assert not [c for c in checks if c.id == "guide_style_mismatch"]


def test_mismatch_check_warns_when_forced_style_disagrees_with_captured():
    request = _request(captured_guide_style="clay", guide_style="motion_proxy")
    check = _check(SEEDANCE25_REFERENCE_PROFILE.preflight(request), "guide_style_mismatch")
    assert check.state == "WARNING"
    assert "clay" in check.message and "motion_proxy" in check.message


def test_no_mismatch_check_when_captured_matches_resolved():
    request = _request(captured_guide_style="clay")
    checks = SEEDANCE25_REFERENCE_PROFILE.preflight(request)
    assert not [c for c in checks if c.id == "guide_style_mismatch"]


# ---------------------------------------------------------------------------
# P2: reference_plan_json parsing
# ---------------------------------------------------------------------------

def test_empty_reference_plan_compiles_exactly_as_before():
    result = SEEDANCE25_REFERENCE_PROFILE.compile(_request())
    assert "Use the other declared references" in result.final_prompt


def test_a_declared_reference_appears_in_the_compiled_prompt():
    plan = '[{"id": "identity_img", "media_type": "image", "slot_hint": 1, "roles": ["identity", "design"]}]'
    result = SEEDANCE25_REFERENCE_PROFILE.compile(_request(reference_plan_json=plan))
    assert "Use Image 1 for: identity, design." in result.final_prompt


def test_a_malformed_reference_plan_blocks_preflight_and_compile():
    request = _request(reference_plan_json="{not json")
    check = _check(SEEDANCE25_REFERENCE_PROFILE.preflight(request), "reference_plan")
    assert check.state == "BLOCKED"
    with pytest.raises(ValueError):
        SEEDANCE25_REFERENCE_PROFILE.compile(request)


def test_a_declared_reference_gets_a_compilation_diff_check():
    plan = '[{"id": "identity_img", "media_type": "image", "slot_hint": 1, "roles": ["identity"]}]'
    request = _request(reference_plan_json=plan)
    check = _check(SEEDANCE25_REFERENCE_PROFILE.preflight(request), "reference_role:identity_img")
    assert check.state == "PASS"
    assert check.mapping_quality == "CONDITIONAL"
    assert "Image 1" in check.message


# ---------------------------------------------------------------------------
# P2: role-conflict detection against the OmniCam guide
# ---------------------------------------------------------------------------

def test_a_declared_reference_sharing_the_guides_role_warns():
    # Default guide_style resolves to motion_proxy, which claims camera_motion.
    plan = '[{"id": "action_video", "media_type": "video", "slot_hint": 2, "roles": ["camera_motion"]}]'
    request = _request(reference_plan_json=plan)
    check = _check(SEEDANCE25_REFERENCE_PROFILE.preflight(request), "role_conflict")
    assert check is not None
    assert check.state == "WARNING"


def test_a_declared_reference_with_no_shared_roles_does_not_warn():
    plan = '[{"id": "identity_img", "media_type": "image", "slot_hint": 1, "roles": ["identity"]}]'
    request = _request(reference_plan_json=plan)
    assert not [c for c in SEEDANCE25_REFERENCE_PROFILE.preflight(request) if c.id == "role_conflict"]


# ---------------------------------------------------------------------------
# P2: Guide Health checks surface in preflight
# ---------------------------------------------------------------------------

def test_guide_health_checks_never_block_a_compile():
    # Guide Health is advisory (doc 20) -- exact thresholds are covered in
    # tests/test_guide_health.py; this only pins that the wiring here never
    # escalates a health check to BLOCKED.
    checks = SEEDANCE25_REFERENCE_PROFILE.preflight(_request())
    health_checks = [c for c in checks if c.id.startswith("guide_health_")]
    assert all(c.state != "BLOCKED" for c in health_checks)


def test_beauty_reference_guide_gets_an_intentional_appearance_check():
    request = _request(captured_guide_style="beauty_reference")
    check = _check(SEEDANCE25_REFERENCE_PROFILE.preflight(request), "guide_health_appearance")
    assert check is not None
    assert check.state == "PASS"
