import math

import pytest

from omnicam.capabilities import check_workflow_compatibility, detect_capabilities, diagnose_setup
from omnicam.core.manifest import camera_manifest, motion_fidelity_report
from omnicam.core.track import OmniCamTrack


def test_detect_capabilities_marks_installed_nodes():
    caps = detect_capabilities({"WanCameraImageToVideo", "WanVideoATITracks"})
    by_adapter = {entry["adapter"]: entry for entry in caps["capabilities"]}
    assert by_adapter["wan_native"]["installed"] is True
    assert by_adapter["wan_native"]["state"] == "detected_unverified"
    assert by_adapter["wan_ati"]["installed"] is True
    assert by_adapter["wan_ati"]["state"] == "detected_unverified"
    assert by_adapter["h3"]["state"] == "missing"


def test_detect_capabilities_verifies_real_input_contract():
    class WanNode:
        @classmethod
        def INPUT_TYPES(cls):
            return {"required": {"camera_conditions": ("WAN_CAMERA_EMBEDDING",)}}

    entry = next(item for item in detect_capabilities({"WanCameraImageToVideo": WanNode})["capabilities"] if item["adapter"] == "wan_native")
    assert entry["state"] == "verified"


def test_detect_capabilities_verifies_v3_schema_before_legacy():
    class Input:
        id = "camera_conditions"

    class Schema:
        inputs = (Input(),)

    class WanV3Node:
        @classmethod
        def define_schema(cls):
            return Schema()

    entry = next(
        item
        for item in detect_capabilities({"WanCameraImageToVideo": WanV3Node})["capabilities"]
        if item["adapter"] == "wan_native"
    )
    assert entry["state"] == "verified"


def test_diagnostic_is_actionable():
    diagnostic = diagnose_setup(detect_capabilities(set()))
    assert diagnostic["ok"] is False
    assert all(issue["remediation"] for issue in diagnostic["issues"])
    assert all(issue["docs"].startswith("http") for issue in diagnostic["issues"])


def test_workflow_compatibility_flags_missing_downstream():
    result = check_workflow_compatibility(["MajoorOmniCamH3Adapter"], detect_capabilities(set()))
    assert result["ok"] is False
    assert result["problems"][0]["adapter"] == "h3"
    class H3Node:
        @classmethod
        def INPUT_TYPES(cls):
            # The socket MinimaxHailuo03ReferenceNode actually exposes.
            return {"required": {"reference_video": ("VIDEO",), "prompt": ("STRING",)}}
    ok = check_workflow_compatibility(["MajoorOmniCamH3Adapter"], detect_capabilities({"MinimaxHailuo03ReferenceNode": H3Node}))
    assert ok["ok"] is True


def _track() -> OmniCamTrack:
    return OmniCamTrack.from_dict(
        {
            "fps": 24,
            "duration_frames": 5,
            "width": 640,
            "height": 360,
            "keyframes": [
                {"frame": 0, "camera": {"position": [0, 1, 5], "target": [0, 1.5, 0], "fov": 35}, "interpolation": "linear"},
                {"frame": 4, "camera": {"position": [2, 1, 5], "target": [0, 1.5, 0], "fov": 40}, "interpolation": "linear"},
            ],
        }
    )


def test_camera_manifest_carries_intrinsics_and_extrinsics():
    manifest = camera_manifest(_track())
    assert manifest["format"] == "majoor.omnicam.camera-manifest.v1"
    assert manifest["coordinate_system"]["up"] == [0.0, 1.0, 0.0]
    assert len(manifest["frames"]) == 5
    first = manifest["frames"][0]
    assert first["extrinsics"]["position"] == [0.0, 1.0, 5.0]
    assert first["intrinsics"]["fov_degrees"] == pytest.approx(35.0)
    for vector in ("right", "up", "forward"):
        assert math.sqrt(sum(v * v for v in first["extrinsics"][vector])) == pytest.approx(1.0)


def test_motion_fidelity_report_per_frame():
    track = _track()
    report = motion_fidelity_report(track)
    assert report["summary"] is None
    observed = [[frame_pos[1][0] + 0.1 * frame_pos[0], frame_pos[1][1], frame_pos[1][2]] for frame_pos in report["expected_positions"]]
    report = motion_fidelity_report(track, observed)
    assert len(report["per_frame_error"]) == 5
    assert report["summary"]["max_error_frame"] == 4
    assert report["summary"]["max_error"] == pytest.approx(0.4)


def test_expected_inputs_match_the_installed_node_sockets():
    """These names are the contract with third-party nodes, and two were wrong.

    `images` (LTX) and `video` (MiniMax H3) do not exist on the real nodes -- the
    guide takes `image` and the reference node takes `reference_video` -- so a
    perfectly healthy install was reported as "incompatible".
    """
    from omnicam.adapters.registry import ADAPTER_INFO

    assert ADAPTER_INFO["ltx"]["expected_inputs"] == ["image"]
    assert ADAPTER_INFO["h3"]["expected_inputs"] == ["reference_video"]
    for adapter, info in ADAPTER_INFO.items():
        assert info["required_node_classes"], f"{adapter} must name at least one node class"
        assert info["docs"].startswith("https://"), f"{adapter} needs a docs link"


def test_nested_template_sockets_are_discovered():
    """Autogrow / DynamicCombo hide real sockets one level down.

    A flat walk over schema.inputs missed them, so the node looked like it was
    missing the very input it exposes.
    """
    from omnicam.capabilities import _socket_names

    class Socket:
        def __init__(self, name):
            self.id = name

    class Autogrow:
        id = "reference_group"

        def __init__(self):
            self.template = [Socket("reference_video"), Socket("reference_image")]

    assert _socket_names([Socket("positive"), Autogrow()]) == {
        "positive", "reference_group", "reference_video", "reference_image",
    }


def test_socket_discovery_survives_hostile_shapes():
    """Third-party schemas are arbitrary objects; introspection must not explode."""
    from omnicam.capabilities import _socket_names

    class Cyclic:
        id = "loop"

        @property
        def template(self):
            return [self]

    assert "loop" in _socket_names([Cyclic()]), "recursion is depth-capped, not fatal"
    assert _socket_names(None) == set()
    assert _socket_names([object()]) == set()
