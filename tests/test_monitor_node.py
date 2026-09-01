import pytest

pytest.importorskip("comfy_api.latest")

from omnicam.core.motion_scene import MotionScene
from omnicam.nodes.monitor import MajoorOmniCamMonitor


def _scene() -> MotionScene:
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
                                "camera": {
                                    "position": [0.0, 2.0, 6.0],
                                    "target": [0.0, 1.0, 0.0],
                                    "fov": 45.0,
                                    "roll": 0.0,
                                },
                                "interpolation": "linear",
                            }
                        ],
                        "objects": [],
                        "metadata": {},
                    },
                }
            ],
            "active_camera_id": "hero_camera",
            "playblast_camera_id": "hero_camera",
            "objects": [],
            "motion_layers": [
                {
                    "id": "subject_motion",
                    "label": "Subject motion",
                    "enabled": True,
                    "semantic": "screen_point",
                    "source_kind": "manual_2d",
                    "source": {},
                    "keys": [
                        {
                            "time_seconds": 0.0,
                            "interpolation": "linear",
                            "visible": True,
                            "x": 0.25,
                            "y": 0.5,
                        },
                        {
                            "time_seconds": 2.0,
                            "interpolation": "linear",
                            "visible": True,
                            "x": 0.75,
                            "y": 0.5,
                        },
                    ],
                }
            ],
            "cuts": [],
            "metadata": {},
        }
    )


def test_monitor_v3_schema_has_stable_typed_contract():
    schema = MajoorOmniCamMonitor.define_schema()
    assert schema.node_id == "MajoorOmniCamMonitor"
    assert schema.display_name == "OmniCam Monitor"
    assert [item.id for item in schema.inputs] == [
        "motion_scene", "playblast_video", "base_prompt", "target_profile",
        "target_width", "target_height", "duration_seconds", "target_fps"
    ]
    assert [item.display_name for item in schema.outputs] == [
        "final_prompt", "reference_video", "reference_frames",
        "camera_embedding", "native_tracks", "tracks_json",
        "target_width", "target_height", "target_length",
    ]


def test_inactive_typed_outputs_are_none_not_fake_tensors():
    output = MajoorOmniCamMonitor.execute(
        motion_scene=_scene().to_dict(),
        playblast_video=None,
        base_prompt="A test",
        target_profile="wan_move_native",
        target_width=832,
        target_height=480,
        duration_seconds=2.0,
        target_fps=24.0
    )
    values = output.outputs if hasattr(output, "outputs") else tuple(output)

    assert len(values) == 9

    assert values[0] == "A test"
    assert values[1] is None
    assert values[2] is None
    assert values[3] is None
    assert values[4] is not None
    assert values[5] == ""
    assert values[6:] == (832, 480, 48)

    ui = output.ui
    assert "preflight" in ui
    assert "capabilities" in ui
    assert ui["target_profile"] == "wan_move_native"


def test_unknown_target_profile_is_rejected_instead_of_silently_switched():
    with pytest.raises(KeyError, match="missing_profile"):
        MajoorOmniCamMonitor.execute(
            motion_scene=_scene().to_dict(),
            playblast_video=None,
            base_prompt="A test",
            target_profile="missing_profile",
            target_width=832,
            target_height=480,
            duration_seconds=2.0,
            target_fps=24.0,
        )
