"""The Monitor's live preflight: a preview without a queue."""

from __future__ import annotations

import json

import pytest

pytest.importorskip("comfy_api.latest")

from omnicam.nodes.monitor_live import LivePreflightError, build_live_preflight


def _director(**overrides) -> dict:
    state = {
        "cameras": [
            {
                "id": "camera_1",
                "camera": {"position": [0, 2, 5], "target": [0, 1, 0], "fov": 35.0, "roll": 0.0},
                "keyframes": [{"frame": 0, "camera": {"position": [0, 2, 5], "target": [0, 1, 0], "fov": 35.0, "roll": 0.0}}],
            },
        ],
        "active_camera_id": "camera_1",
        "playblast_camera_id": "camera_1",
    }
    payload = {
        "state_json": json.dumps(state),
        "recording_path": "",
        "card_asset": "",
        "width": 1280,
        "height": 720,
        "fps": 24,
        "duration_seconds": 2.0,
        "render_mode": "omni_ref",
    }
    payload.update(overrides)
    return payload


def _monitor(**overrides) -> dict:
    payload = {
        "target_profile": "external_reference_video",
        "base_prompt": "A tracked move.",
        "target_width": 832,
        "target_height": 480,
        "duration_seconds": 2.0,
        "target_fps": 24.0,
    }
    payload.update(overrides)
    return payload


def test_a_healthy_director_state_reports_a_live_panel_with_no_run():
    result = build_live_preflight({"director": _director(), "monitor": _monitor()})

    assert result["live"] is True
    assert result["target_profile"] == "external_reference_video"
    assert isinstance(result["preflight"], list)
    assert result["preflight"], "the generic profile still reports its own checks"
    assert not any(check["state"] == "BLOCKED" for check in result["preflight"])


def test_an_empty_director_state_still_answers_with_the_default_single_camera_scene():
    """A brand-new Director, before the user has authored anything at all."""
    result = build_live_preflight({
        "director": _director(state_json="{}"),
        "monitor": _monitor(),
    })
    assert result["live"] is True


def test_h3_native_reports_blocked_instead_of_raising_when_there_is_no_playblast():
    """preflight(), not compile(): a live preview must report BLOCKED, not 500."""
    result = build_live_preflight({
        "director": _director(),
        "monitor": _monitor(target_profile="h3_native"),
    })
    states = {check["id"]: check["state"] for check in result["preflight"]}
    assert states["playblast_video"] == "BLOCKED"
    # And nothing raised getting here -- the whole point of a live preview.


def test_an_unknown_profile_is_a_client_error_not_a_crash():
    with pytest.raises(LivePreflightError, match="unknown motion profile"):
        build_live_preflight({
            "director": _director(),
            "monitor": _monitor(target_profile="not_a_real_profile"),
        })


def test_malformed_state_json_is_a_client_error():
    with pytest.raises(LivePreflightError, match="Invalid OmniCam state JSON"):
        build_live_preflight({
            "director": _director(state_json="{not json"),
            "monitor": _monitor(),
        })


def test_oversized_state_json_is_rejected_before_parsing():
    with pytest.raises(LivePreflightError, match="too large"):
        build_live_preflight({
            "director": _director(state_json="x" * 3_000_000),
            "monitor": _monitor(),
        })


def test_missing_director_or_monitor_objects_are_rejected():
    with pytest.raises(LivePreflightError):
        build_live_preflight({"director": _director()})
    with pytest.raises(LivePreflightError):
        build_live_preflight({"monitor": _monitor()})
    with pytest.raises(LivePreflightError):
        build_live_preflight({"director": "not a dict", "monitor": _monitor()})


def test_invalid_numeric_settings_are_a_client_error_not_a_traceback():
    with pytest.raises(LivePreflightError, match="Invalid numeric value for 'width'"):
        build_live_preflight({
            "director": _director(width="not a number"),
            "monitor": _monitor(),
        })
    with pytest.raises(LivePreflightError, match="Invalid Monitor settings"):
        build_live_preflight({
            "director": _director(),
            "monitor": _monitor(target_width=-5),
        })


def test_the_resolved_recording_path_travels_with_the_panel():
    """So the frontend can tell whether the live compile actually saw a playblast."""
    result = build_live_preflight({
        "director": _director(recording_path="omnicam_playblasts/shot.webm [temp]"),
        "monitor": _monitor(),
    })
    assert result["recording_path"] == "omnicam_playblasts/shot.webm [temp]"


def test_the_downstream_capability_check_is_folded_in_like_a_real_execution(monkeypatch):
    monkeypatch.setattr(
        "omnicam.nodes.monitor_live.detect_capabilities",
        lambda: {
            "node_registry_available": True,
            "capabilities": [
                {"adapter": "wan_camera_native", "state": "missing", "detected_nodes": [], "requirements": [{}]},
            ],
        },
    )
    result = build_live_preflight({
        "director": _director(),
        "monitor": _monitor(target_profile="wan_camera_native"),
    })
    downstream = next(check for check in result["preflight"] if check["id"] == "downstream_contract")
    assert downstream["state"] == "BLOCKED"


def test_a_scene_that_does_not_validate_yet_is_a_client_error_not_a_500():
    """Mid-edit is the normal state a live preview runs against -- a dangling
    camera reference is the easy way to reach that mid-edit invalid state:
    an object referencing a camera the user has since deleted."""
    invalid_state = json.loads(_director()["state_json"])
    invalid_state["active_camera_id"] = "a_deleted_camera"
    with pytest.raises(LivePreflightError, match="Invalid Director state"):
        build_live_preflight({
            "director": _director(state_json=json.dumps(invalid_state)),
            "monitor": _monitor(),
        })
