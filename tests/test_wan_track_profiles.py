from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
import pytest

from omnicam.core.motion_sampling import sample_times
from omnicam.core.motion_scene import MotionScene
from omnicam.profiles import CompileRequest
from omnicam.profiles.catalog import PROFILE_REGISTRY
from omnicam.profiles.wan_track import WAN_TRACK_PROFILE
from omnicam.profiles.wanvideo_ati import WANVIDEO_ATI_PROFILE


def _scene(*, first_visible: bool = True) -> MotionScene:
    common = {
        "semantic": "screen_point",
        "source_kind": "manual_2d",
        "source": {},
        "enabled": True,
    }
    return MotionScene.from_dict(
        {
            "version": 1,
            "timeline": {"duration_seconds": 1.0, "authoring_fps": 24.0},
            "canvas": {"width": 640, "height": 360},
            "cameras": [
                {
                    "id": "camera",
                    "label": "Camera",
                    "enabled": True,
                    "track": {
                        "schema_version": 1,
                        "fps": 24,
                        "duration_frames": 24,
                        "width": 640,
                        "height": 360,
                        "keyframes": [
                            {
                                "frame": 0,
                                "camera": {"position": [0, 0, 5], "target": [0, 0, 0]},
                                "interpolation": "linear",
                            }
                        ],
                    },
                }
            ],
            "active_camera_id": "camera",
            "playblast_camera_id": "camera",
            "objects": [],
            "motion_layers": [
                {
                    **common,
                    "id": "full",
                    "label": "Full",
                    "keys": [
                        {
                            "time_seconds": 0.0,
                            "x": 0.1,
                            "y": 0.2,
                            "visible": first_visible,
                            "interpolation": "linear",
                        },
                        {
                            "time_seconds": 1.0,
                            "x": 0.9,
                            "y": 0.8,
                            "visible": True,
                            "interpolation": "linear",
                        },
                    ],
                },
                {
                    **common,
                    "id": "vanishing",
                    "label": "Vanishing",
                    "keys": [
                        {
                            "time_seconds": 0.0,
                            "x": 0.25,
                            "y": 0.75,
                            "visible": True,
                            "interpolation": "hold",
                        },
                        {
                            "time_seconds": 0.5,
                            "x": 0.25,
                            "y": 0.75,
                            "visible": False,
                            "interpolation": "hold",
                        },
                    ],
                },
            ],
            "cuts": [],
            "metadata": {},
        }
    )


def _request(*, first_visible: bool = True) -> CompileRequest:
    return CompileRequest(
        motion_scene=_scene(first_visible=first_visible),
        playblast_video=None,
        base_prompt="A dancer in a white studio.",
        target_width=100,
        target_height=50,
        duration_seconds=1.0,
        target_fps=5.0,
    )


def _pinned_zero_pad(track: list[dict[str, float]]) -> np.ndarray:
    points = np.array([[point["x"], point["y"], 1] for point in track], dtype=np.float32)
    if len(points) < 121:
        points = np.vstack((points, np.zeros((121 - len(points), 3), dtype=np.float32)))
    return points[:121]


def _official_wan_track_functions() -> dict:
    torch = pytest.importorskip("torch")
    source = Path(__file__).resolve().parents[3] / "comfy_extras" / "nodes_wan.py"
    if not source.exists():
        pytest.skip("ComfyUI's official Wan Track source is unavailable")
    text = source.read_text(encoding="utf-8")
    namespace = {
        "Tuple": tuple,
        "json": json,
        "math": math,
        "np": np,
        "torch": torch,
    }
    exec(text[text.index("def parse_json_tracks"):text.index("def ind_sel")], namespace)
    return namespace


def test_wan_track_emits_stable_121_source_grid_for_requested_target_length():
    result = WAN_TRACK_PROFILE.compile(_request())
    tracks = json.loads(result.tracks_json)

    assert result.target_length == 5
    assert result.timeline.frame_policy == "requested_length_with_121_source_grid"
    assert len(tracks) == 2
    assert len(tracks[0]) == 121
    # The 121-sample grid spans the shot's frame times [0, (5-1)/5] = [0, 0.8],
    # so t=0.5 -- where "Vanishing" turns invisible -- is sample 75. Spanning
    # [0, duration] instead put it at 60 and stretched every track by one frame.
    assert len(tracks[1]) == 75
    assert tracks[0][0] == pytest.approx({"x": 10.0, "y": 10.0})
    # "Moving" is keyed to reach (0.9, 0.8) at t=1.0, but a 1 second 5 fps shot
    # has 5 frames and its last one is shown at 0.8 s. The trajectory therefore
    # ends 80% of the way along, which is where the last generated frame is.
    # A key authored past the final frame is simply never displayed -- the same
    # thing that happens in any NLE.
    assert tracks[0][-1] == pytest.approx({"x": 74.0, "y": 34.0})


def test_wan_track_json_survives_the_official_parser_padding_and_resampler():
    functions = _official_wan_track_functions()
    result = WAN_TRACK_PROFILE.compile(_request())
    parsed = functions["parse_json_tracks"](result.tracks_json)
    padded = np.stack([functions["pad_pts"](track) for track in parsed], axis=0)
    processed = functions["process_tracks"](
        padded,
        (result.target_width, result.target_height),
        result.target_length - 1,
    )

    assert padded.shape == (2, 121, 1, 3)
    assert processed.shape[0] == result.target_length
    assert processed.shape[-1] == 4


def test_wanvideo_ati_compiles_fixed_grid_and_kijai_zero_visibility_tail():
    result = WANVIDEO_ATI_PROFILE.compile(_request())
    tracks = json.loads(result.tracks_json)

    assert result.target_length == 121
    assert result.timeline.frame_policy == "fixed_121"
    assert len(tracks[0]) == 121
    assert len(tracks[1]) == 75

    padded = _pinned_zero_pad(tracks[1])
    assert padded.shape == (121, 3)
    assert np.all(padded[:75, 2] == 1)
    assert np.all(padded[75:] == 0)
    # The zero pad must not repeat the last visible point: that would invent
    # continued visibility upstream cannot distinguish from a real sample.
    assert not np.any(np.all(padded[75:, :2] == padded[74, :2], axis=1))


@pytest.mark.parametrize("profile", [WAN_TRACK_PROFILE, WANVIDEO_ATI_PROFILE])
def test_json_track_profiles_drop_unrepresentable_delayed_appearances(profile):
    result = profile.compile(_request(first_visible=False))
    tracks = json.loads(result.tracks_json)

    assert len(tracks) == 1
    assert tracks[0][0] == {"x": 25.0, "y": 37.5}


def test_wan_track_profiles_are_registered_without_aliasing_each_other():
    assert PROFILE_REGISTRY.require("wan_track_native") is WAN_TRACK_PROFILE
    assert PROFILE_REGISTRY.require("wanvideo_ati") is WANVIDEO_ATI_PROFILE
    assert WAN_TRACK_PROFILE is not WANVIDEO_ATI_PROFILE


def test_the_121_grid_lands_exactly_on_the_generated_frame_times():
    """The source grid spans frame times, so every output frame hits a sample.

    With 5 frames at 5 fps the shot runs 0, 0.2, 0.4, 0.6, 0.8 s. Sampling 121
    points across [0, 0.8] puts those frames on samples 0, 30, 60, 90 and 120.
    Sampling across [0, 1.0] instead -- the media duration -- lands them on
    0, 0.25, 0.5, 0.75, 1.0, dilating the whole trajectory by one frame.
    """
    request = _request()
    times = sample_times(121, 0.0, request.source_last_frame_time)

    assert request.source_frame_count == 5
    assert request.source_last_frame_time == pytest.approx(0.8)
    for frame in range(request.source_frame_count):
        expected = frame / request.target_fps
        assert times[frame * 30] == pytest.approx(expected)
