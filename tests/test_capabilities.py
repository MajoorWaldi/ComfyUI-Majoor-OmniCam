import math

import pytest

from omnicam.capabilities import check_workflow_compatibility, detect_capabilities, diagnose_setup
from omnicam.core.manifest import camera_manifest, motion_fidelity_report
from omnicam.core.track import OmniCamTrack


def _node_with_inputs(*names: str):
    class Node:
        @classmethod
        def INPUT_TYPES(cls):
            return {"required": {name: ("ANY",) for name in names}}

    return Node


def test_detect_capabilities_marks_installed_nodes():
    caps = detect_capabilities({"WanCameraImageToVideo", "WanVideoATITracks"})
    by_adapter = {entry["adapter"]: entry for entry in caps["capabilities"]}
    assert by_adapter["wan_camera_native"]["installed"] is True
    assert by_adapter["wan_camera_native"]["state"] == "detected_unverified"
    assert by_adapter["wanvideo_ati"]["installed"] is True
    assert by_adapter["wanvideo_ati"]["state"] == "detected_unverified"
    assert by_adapter["h3_api"]["state"] == "missing"


def test_detect_capabilities_verifies_real_input_contract():
    class WanNode:
        @classmethod
        def INPUT_TYPES(cls):
            return {"required": {"camera_conditions": ("WAN_CAMERA_EMBEDDING",)}}

    entry = next(item for item in detect_capabilities({"WanCameraImageToVideo": WanNode})["capabilities"] if item["adapter"] == "wan_camera_native")
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
        if item["adapter"] == "wan_camera_native"
    )
    assert entry["state"] == "verified"


def test_ltx_motion_track_is_not_verified_when_the_guide_stage_is_incompatible():
    report = detect_capabilities({
        "LTXVDrawTracks": _node_with_inputs("tracks", "width", "height"),
        "LTXAddVideoICLoRAGuide": _node_with_inputs("mask"),
    })
    ltx = next(item for item in report["capabilities"] if item["adapter"] == "ltx25_motion_track")
    assert ltx["state"] == "incompatible"
    assert [stage["state"] for stage in ltx["requirements"]] == ["verified", "incompatible"]


def test_ltx_motion_track_verifies_each_distinct_stage_contract():
    report = detect_capabilities({
        "LTXVDrawTracks": _node_with_inputs("tracks", "width", "height"),
        "LTXAddVideoICLoRAGuide": _node_with_inputs("image"),
    })
    ltx = next(item for item in report["capabilities"] if item["adapter"] == "ltx25_motion_track")
    assert ltx["state"] == "verified"
    assert [stage["state"] for stage in ltx["requirements"]] == ["verified", "verified"]


def test_diagnostic_is_actionable():
    diagnostic = diagnose_setup(detect_capabilities(set()))
    assert diagnostic["ok"] is True
    assert all(issue["remediation"] for issue in diagnostic["issues"])
    assert all(issue["docs"].startswith("http") for issue in diagnostic["issues"])


def test_an_incompatible_optional_adapter_warns_without_blocking_global_setup():
    report = diagnose_setup({
        "capabilities": [{
            "adapter": "ltx25_motion_track", "display": "LTX Motion Track",
            "state": "incompatible", "docs": "https://example.test/ltx",
        }],
        "extractor": {},
    })
    assert report["ok"] is True
    assert report["issues"][0]["severity"] == "warning"


def test_wanvideowrapper_legacy_node_does_not_claim_native_tracks():
    capabilities = detect_capabilities({
        "WanVideoATITracks": _node_with_inputs("tracks", "width", "height"),
    })
    report = check_workflow_compatibility(["MajoorOmniCamWanVideoWrapperATI"], capabilities)
    assert "wan_track_native" not in {problem["adapter"] for problem in report["problems"]}


def test_workflow_compatibility_has_nothing_to_flag_without_per_adapter_nodes():
    """Every profile is reachable only through Monitor now.

    The legacy per-adapter nodes were removed before the first public release,
    so no workflow can name one and this check has no node left to map onto a
    contract. Monitor's own preflight is where a missing downstream is reported.
    """
    result = check_workflow_compatibility(["MajoorOmniCamH3Adapter"], detect_capabilities(set()))
    assert result["ok"] is True
    assert result["problems"] == []
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

    assert ADAPTER_INFO["ltx25_motion_track"]["expected_inputs"] == ["tracks"]
    assert ADAPTER_INFO["h3_api"]["expected_inputs"] == ["reference_video"]
    for adapter, info in ADAPTER_INFO.items():
        assert info["required_node_classes"], f"{adapter} must name at least one node class"
        assert info["docs"].startswith("https://"), f"{adapter} needs a docs link"


def test_adapter_contract_matrix_pins_upstream_and_input_fingerprints():
    """Every compatibility claim remains reproducible outside this checkout."""
    from omnicam.adapters.registry import ADAPTER_INFO, input_fingerprint

    assert set(ADAPTER_INFO) == {
        "wan_camera_native", "wan_move_native", "wan_track_native", "h3_api",
        "h3_native", "ltx25_motion_track", "wanvideo_ati",
    }
    for adapter, info in ADAPTER_INFO.items():
        upstream = info["upstream"]
        assert upstream["repository"].startswith("https://github.com/"), adapter
        assert len(upstream["tested_commit"]) == 40, adapter
        assert info["input_fingerprint"] == input_fingerprint(
            info["expected_inputs"], info["expected_widgets"],
        )


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


def test_capabilities_report_extractor_backend_availability():
    report = detect_capabilities(set())["extractor"]
    assert set(report) == {"dpvo", "opencv_sift"}
    for entry in report.values():
        assert isinstance(entry["available"], bool)
        if not entry["available"]:
            assert entry["reason"]


def test_a_missing_tracker_is_a_warning_not_an_error(monkeypatch):
    from omnicam.extractor.backends import BackendAvailability, DpvoBackend, OpenCvSiftBackend

    for backend in (DpvoBackend, OpenCvSiftBackend):
        monkeypatch.setattr(
            backend, "availability", classmethod(lambda cls: BackendAvailability(False, "not here"))
        )
    diagnostic = diagnose_setup(detect_capabilities({"WanCameraImageToVideo", "WanVideoATITracks",
                                                     "MiniMaxHailuoVideoNode", "LTXVBaseSampler"}))
    extractor_issues = [issue for issue in diagnostic["issues"] if issue["adapter"] == "extractor"]
    assert len(extractor_issues) == 1
    assert extractor_issues[0]["severity"] == "warning"
    assert "not here" in extractor_issues[0]["message"]


def test_an_available_tracker_raises_no_extractor_issue():
    from omnicam.extractor.backends import backend_availability

    if not any(entry.available for entry in backend_availability().values()):
        pytest.skip("no camera-tracking backend is installed in this environment")
    diagnostic = diagnose_setup(detect_capabilities(set()))
    assert not [issue for issue in diagnostic["issues"] if issue["adapter"] == "extractor"]


def test_capability_contracts_are_keyed_by_profile_id():
    """One vocabulary across backend, routes, frontend and tests.

    These two registries used to use different names, bridged by a hand-written
    map in the routes layer that had two wrong entries out of seven: both Wan
    track profiles pointed at the same contract, and LTX had none at all. A
    profile without a contract silently reported itself as available.
    """
    from omnicam.adapters.registry import ADAPTER_INFO
    from omnicam.profiles.catalog import PROFILE_REGISTRY

    assert set(ADAPTER_INFO) == set(PROFILE_REGISTRY.ids)
