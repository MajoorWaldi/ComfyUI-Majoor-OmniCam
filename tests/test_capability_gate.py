"""The selected profile's downstream contract is binding, not decorative."""

from __future__ import annotations

from omnicam.profiles.capability_gate import capability_check


def _capabilities(**entry):
    return {"capabilities": [{"adapter": "wan_camera_native", **entry}]}


def test_a_verified_contract_passes():
    check = capability_check(
        "wan_camera_native",
        _capabilities(state="verified", detected_nodes=["WanCameraImageToVideo"]),
    )

    assert check is not None
    assert check.state == "PASS"
    assert "WanCameraImageToVideo" in check.label


def test_a_missing_downstream_blocks():
    check = capability_check(
        "wan_camera_native",
        _capabilities(state="missing", display="Wan Camera", detected_nodes=[]),
    )

    assert check is not None
    assert check.state == "BLOCKED"
    assert "not installed" in check.message


def test_an_incompatible_socket_contract_blocks():
    check = capability_check(
        "wan_camera_native",
        _capabilities(
            state="incompatible",
            detected_nodes=["WanCameraImageToVideo"],
            expected_inputs=["camera_conditions"],
        ),
    )

    assert check is not None
    assert check.state == "BLOCKED"
    assert "camera_conditions" in check.message


def test_a_detected_but_unreadable_contract_only_warns():
    check = capability_check(
        "wan_camera_native",
        _capabilities(state="detected_unverified", detected_nodes=["WanCameraImageToVideo"]),
    )

    assert check is not None
    assert check.state == "WARNING"


def test_detection_being_unavailable_produces_no_check_at_all():
    """Outside a running ComfyUI there is nothing to gate on.

    Returning a BLOCKED here would fail every headless compile for a reason that
    has nothing to do with the scene.
    """
    assert capability_check("wan_camera_native", None) is None
    assert capability_check("wan_camera_native", {}) is None
    assert capability_check("wan_camera_native", {"capabilities": []}) is None
    assert capability_check("h3_api", _capabilities(state="verified")) is None
