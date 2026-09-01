from __future__ import annotations

import json

import pytest

# torch is optional: the model-agnostic lane installs numpy and nothing else.
# A bare ``import torch`` here fails collection for the whole run, which is how
# three green suites turned the core lane red.
pytest.importorskip("torch")
pytest.importorskip("comfy_api.latest")

import torch

from omnicam.nodes.director import MajoorOmniCamDirector
from omnicam.nodes.monitor import MajoorOmniCamMonitor
from omnicam.profiles.catalog import PROFILE_REGISTRY


class MockVideo:
    def get_frame_rate(self) -> float:
        return 24.0

    def get_frame_count(self) -> int:
        return 100

    def get_dimensions(self) -> tuple[int, int]:
        return (640, 360)

    def as_trimmed(self, start_time: float, duration: float, strict_duration: bool):
        frame_count = max(1, round(duration * 24.0))

        class Trimmed:
            def get_components(self):
                class Components:
                    images = torch.zeros((frame_count, 360, 640, 3))

                return Components()

        return Trimmed()


def _state() -> dict:
    return {
        "active_camera_id": "hero",
        "playblast_camera_id": "hero",
        "cameras": [
            {
                "id": "hero",
                "name": "Hero",
                "camera": {
                    "position": [0.0, 2.0, 6.0],
                    "target": [0.0, 1.0, 0.0],
                    "fov": 45.0,
                    "roll": 0.0,
                },
                "keyframes": [
                    {
                        "frame": 0,
                        "camera": {
                            "position": [0.0, 2.0, 6.0],
                            "target": [0.0, 1.0, 0.0],
                        },
                    },
                    {
                        "frame": 47,
                        "camera": {
                            "position": [2.0, 2.5, 4.0],
                            "target": [0.0, 1.0, 0.0],
                        },
                    },
                ],
            }
        ],
        "objects": [],
        "motion_layers": [
            {
                "id": "subject",
                "label": "Subject",
                "enabled": True,
                "semantic": "screen_point",
                "source_kind": "manual_2d",
                "source": {},
                "keys": [
                    {"time_seconds": 0.0, "x": 0.2, "y": 0.5, "visible": True},
                    {"time_seconds": 2.0, "x": 0.8, "y": 0.5, "visible": True},
                ],
            }
        ],
    }


def _outputs(node_output):
    return node_output.outputs if hasattr(node_output, "outputs") else tuple(node_output)


def _director_outputs():
    return _outputs(
        MajoorOmniCamDirector.execute(
            state_json=json.dumps(_state()),
            recording_path="",
            card_asset="",
            width=1280,
            height=720,
            fps=24,
            duration_seconds=2.0,
            render_mode="omni_ref",
            video=MockVideo(),
        )
    )


@pytest.mark.parametrize("profile_id", PROFILE_REGISTRY.ids)
def test_director_to_monitor_compiles_every_registered_profile(profile_id):
    director_outputs = _director_outputs()
    assert len(director_outputs) == 3
    motion_scene, playblast_video, _audio = director_outputs

    monitor_outputs = _outputs(
        MajoorOmniCamMonitor.execute(
            motion_scene=motion_scene,
            playblast_video=playblast_video,
            base_prompt="A tracked camera move.",
            target_profile=profile_id,
            target_width=832,
            target_height=480,
            duration_seconds=2.0,
            target_fps=24.0,
        )
    )

    assert len(monitor_outputs) == 9
    assert monitor_outputs[0].startswith("A tracked camera move.")
    assert monitor_outputs[6] == 832
    assert monitor_outputs[7] == 480
    assert monitor_outputs[8] > 0

    # Which Monitor socket each profile is required to fill. The two Wan track
    # profiles publish the ``tracks`` STRING their contracts name in
    # omnicam/adapters/registry.py (WanTrackToVideo.tracks and
    # WanVideoATITracks.tracks), not the native TRACKS tensor socket, which
    # only Wan Move consumes.
    payload_index = {
        "wan_camera_native": 3,
        "wan_move_native": 4,
        "wan_track_native": 5,
        "wanvideo_ati": 5,
        "h3_native": 2,
        "h3_api": 1,
        "ltx25_motion_track": 5,
    }[profile_id]
    payload = monitor_outputs[payload_index]
    assert payload is not None
    if payload_index == 5:
        # An empty tracks string is a socket that is present but says nothing.
        assert json.loads(payload), "the tracks JSON socket must carry a trajectory"


def test_director_monitor_motion_scene_round_trip_preserves_selected_camera():
    motion_scene = _director_outputs()[0]
    reloaded = json.loads(json.dumps(motion_scene))

    monitor_outputs = _outputs(
        MajoorOmniCamMonitor.execute(
            motion_scene=reloaded,
            playblast_video=None,
            base_prompt="Camera continuity.",
            target_profile="wan_camera_native",
            target_width=832,
            target_height=480,
            duration_seconds=2.0,
            target_fps=24.0,
        )
    )

    assert monitor_outputs[3] is not None
    assert monitor_outputs[6:] == (832, 480, 49)


def test_monitor_rejects_obsolete_profile_ids_after_director_output():
    motion_scene, playblast_video, _audio = _director_outputs()

    with pytest.raises(KeyError, match="wan_native"):
        MajoorOmniCamMonitor.execute(
            motion_scene=motion_scene,
            playblast_video=playblast_video,
            target_profile="wan_native",
        )
