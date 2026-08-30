import pytest

pytest.importorskip("comfy_api.latest")

from omnicam.nodes.adapters import (
    MajoorOmniCamH3Adapter,
    MajoorOmniCamLTXCameraGuide,
    MajoorOmniCamWanNativeCamera,
    MajoorOmniCamWanVideoWrapperATI,
)
from omnicam.nodes.monitor import MajoorOmniCamMonitor


def _track():
    return {"duration_frames": 2, "keyframes": [{"frame": 0, "camera": {}}]}


def test_monitor_v3_schema_has_stable_typed_contract():
    schema = MajoorOmniCamMonitor.define_schema()
    assert schema.node_id == "MajoorOmniCamMonitor"
    assert schema.display_name == "OmniCam Monitor"
    assert [item.id for item in schema.inputs][:3] == ["camera_track", "proxy_video", "adapter"]
    assert [item.display_name for item in schema.outputs] == [
        "reference_video", "camera_prompt", "cinematic_prompt", "final_prompt",
        "camera_data_json", "wan_camera", "tracks", "adapter_width",
        "adapter_height", "adapter_length", "guide_frames", "adapter_profile_json",
        "reference_frames",
    ]


def test_inactive_typed_outputs_are_none_not_fake_tensors():
    output = MajoorOmniCamMonitor.execute(camera_track=_track(), proxy_video="proxy", adapter="h3")
    values = output.outputs if hasattr(output, "outputs") else tuple(output)
    assert len(values) == 13
    assert values[0] == "proxy"
    assert values[5] is None
    assert values[10] is None
    # "proxy" is an opaque placeholder, not a real VIDEO: the twin degrades to
    # None rather than crashing on a value it cannot sample.
    assert values[12] is None


def test_legacy_adapter_schemas_are_deprecated_compatibility_facades():
    for node in (MajoorOmniCamH3Adapter, MajoorOmniCamWanNativeCamera, MajoorOmniCamLTXCameraGuide, MajoorOmniCamWanVideoWrapperATI):
        schema = node.define_schema()
        assert schema.is_deprecated is True
        assert schema.category == "Majoor/OmniCam/Legacy"
        assert "Monitor" in schema.description
