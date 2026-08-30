"""Numeric golden test: OmniCam's Wan camera against ComfyUI's own trajectories.

Everything before this checked that the Monitor *had* the outputs and that the
adapter existed. Nothing checked that the camera OmniCam sends to Wan is the
camera the author framed -- a sign error on one axis would silently mirror
every horizontal move and no test would have noticed.

The comparison is made on the pose expressed in the first frame's own camera
basis, which is exactly what ``process_pose_params`` reduces the trajectory to
via ``get_relative_pose``. Absolute world conventions cancel there, so the
check is on the only thing that reaches the model.

The reference values come from ComfyUI's own ``WanCameraEmbedding`` presets,
executed from the installed source rather than transcribed.
"""

from __future__ import annotations

import pathlib

import numpy as np
import pytest

from omnicam.adapters.wan import track_to_wan_camera_params
from omnicam.core.track import OmniCamTrack

LENGTH = 21
DISTANCE = 10.0 / 7.0  # ComfyUI's base_T_norm 1.5 over 21 frames at speed 1.0
TOLERANCE = 1e-4


def _upstream():
    """Load ComfyUI's camera-trajectory maths without importing ComfyUI itself."""
    torch = pytest.importorskip("torch")
    rearrange = pytest.importorskip("einops").rearrange
    source = pathlib.Path(__file__).resolve().parents[3] / "comfy_extras" / "nodes_camera_trajectory.py"
    if not source.exists():
        pytest.skip("ComfyUI's comfy_extras is not available next to this checkout")
    text = source.read_text(encoding="utf-8")
    namespace: dict = {"np": np, "torch": torch, "rearrange": rearrange}
    exec(text[text.index("CAMERA_DICT = {"):text.index("class WanCameraEmbedding")], namespace)
    return namespace


def _relative(matrices) -> np.ndarray:
    """The last pose expressed in the first frame's own camera basis."""
    first, last = matrices[0], matrices[-1]
    rotation, translation = first[:3, :3], first[:3, 3]
    inverse = np.eye(4)
    inverse[:3, :3] = rotation.T
    inverse[:3, 3] = -rotation.T @ translation
    return (inverse @ last)[:3, 3]


def _upstream_move(namespace, preset: str) -> np.ndarray:
    motion = namespace["get_camera_motion"](
        np.array(namespace["CAMERA_DICT"][preset]["angle"]),
        np.array(namespace["CAMERA_DICT"][preset]["T"]),
        1.0,
        LENGTH,
    )
    return _relative([np.vstack([row, [0, 0, 0, 1]]) for row in np.asarray(motion)])


def _omnicam_move(start, end, start_target, end_target) -> np.ndarray:
    track = OmniCamTrack.from_dict({
        "fps": 24, "duration_frames": LENGTH, "width": 1280, "height": 720,
        "keyframes": [
            {"frame": 0, "camera": {"position": list(start), "target": list(start_target), "fov": 50}, "interpolation": "linear"},
            {"frame": LENGTH - 1, "camera": {"position": list(end), "target": list(end_target), "fov": 50}, "interpolation": "linear"},
        ],
    })
    params = np.asarray(track_to_wan_camera_params(track, LENGTH), dtype=np.float64)
    # Row layout: [pad, fx, fy, cx, cy, 0, 0] + a flattened 4x4 camera-to-world.
    return _relative([np.array(row[7:23]).reshape(4, 4) for row in params])


# Canonical authored moves, each starting from the default +Z framing.
CANONICAL = {
    "static": ((0, 0, 5), (0, 0, 5), (0, 0, 0), (0, 0, 0)),
    "truck_right": ((0, 0, 5), (DISTANCE, 0, 5), (0, 0, 0), (DISTANCE, 0, 0)),
    "truck_left": ((0, 0, 5), (-DISTANCE, 0, 5), (0, 0, 0), (-DISTANCE, 0, 0)),
    "pedestal_up": ((0, 0, 5), (0, DISTANCE, 5), (0, 0, 0), (0, DISTANCE, 0)),
    "pedestal_down": ((0, 0, 5), (0, -DISTANCE, 5), (0, 0, 0), (0, -DISTANCE, 0)),
    "dolly_in": ((0, 0, 5), (0, 0, 5 - DISTANCE), (0, 0, 0), (0, 0, 0)),
    "dolly_out": ((0, 0, 5), (0, 0, 5 + DISTANCE), (0, 0, 0), (0, 0, 0)),
}

# Wan's camera basis is OpenCV-style: X right, Y **down**, Z forward.
EXPECTED = {
    "static": (0.0, 0.0, 0.0),
    "truck_right": (DISTANCE, 0.0, 0.0),
    "truck_left": (-DISTANCE, 0.0, 0.0),
    "pedestal_up": (0.0, -DISTANCE, 0.0),
    "pedestal_down": (0.0, DISTANCE, 0.0),
    "dolly_in": (0.0, 0.0, DISTANCE),
    "dolly_out": (0.0, 0.0, -DISTANCE),
}


@pytest.mark.parametrize("move", sorted(CANONICAL))
def test_authored_moves_land_on_the_expected_wan_camera_axis(move):
    """A mirrored axis here would flip every horizontal move sent to Wan."""
    assert _omnicam_move(*CANONICAL[move]) == pytest.approx(EXPECTED[move], abs=TOLERANCE)


@pytest.mark.parametrize(("move", "preset"), [
    ("truck_right", "Pan Right"),
    ("truck_left", "Pan Left"),
    ("pedestal_up", "Pan Up"),
    ("pedestal_down", "Pan Down"),
    ("static", "Static"),
])
def test_omnicam_matches_comfyui_own_camera_presets(move, preset):
    namespace = _upstream()
    assert _omnicam_move(*CANONICAL[move]) == pytest.approx(_upstream_move(namespace, preset), abs=TOLERANCE)


def test_dolly_matches_the_zoom_presets_direction_and_scale():
    """ComfyUI's Zoom presets use T = 2.0, so only the ratio can be compared."""
    namespace = _upstream()
    ours = _omnicam_move(*CANONICAL["dolly_in"])
    theirs = _upstream_move(namespace, "Zoom In")
    assert ours[2] > 0 and theirs[2] > 0
    assert theirs[2] == pytest.approx(ours[2] * 2.0, abs=TOLERANCE)
    assert _omnicam_move(*CANONICAL["dolly_out"])[2] < 0
    assert _upstream_move(namespace, "Zoom Out")[2] < 0


def test_roll_and_fov_reach_the_wan_parameter_rows():
    """The intrinsics row is normalised per axis: fx/fy must be height/width."""
    track = OmniCamTrack.from_dict({
        "fps": 24, "duration_frames": 5, "width": 1280, "height": 720,
        "keyframes": [
            {"frame": 0, "camera": {"position": [0, 0, 5], "target": [0, 0, 0], "fov": 50, "roll": 0.0}},
            {"frame": 4, "camera": {"position": [0, 0, 5], "target": [0, 0, 0], "fov": 50, "roll": 30.0}},
        ],
    })
    rows = track_to_wan_camera_params(track, 5)
    focal_x, focal_y = rows[0][1], rows[0][2]
    assert focal_x == pytest.approx(focal_y * 720 / 1280)
    # A pure roll leaves the position untouched but must rotate the basis.
    first = np.array(rows[0][7:23]).reshape(4, 4)
    last = np.array(rows[-1][7:23]).reshape(4, 4)
    assert np.allclose(first[:3, 3], last[:3, 3])
    assert not np.allclose(first[:3, :3], last[:3, :3])
