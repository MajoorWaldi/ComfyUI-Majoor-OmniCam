"""Numerical parity: OmniCam's canonical camera moves vs ComfyUI's own Wan maths.

``test_wan_native_golden.py`` established that the *translational* authored moves
(truck, pedestal, dolly) land on the right Wan camera axis and match ComfyUI's
``WanCameraEmbedding`` presets. This file is the companion for the moves that
file does not cover -- **roll, pan, tilt and orbit** -- and consolidates the
translation set so a single suite answers "does an OmniCam move produce the
camera ComfyUI would produce".

Where ComfyUI ships an equivalent preset, this test executes the official
``comfy_extras/nodes_camera_trajectory.py`` source from the checkout provided by
``OMNICAM_COMFYUI_ROOT``. CI sets ``OMNICAM_REQUIRE_OFFICIAL_WAN_PARITY=1`` so a
missing upstream source is a failure rather than a skip.
"""

from __future__ import annotations

import math
import os
import pathlib

import numpy as np
import pytest

from omnicam.adapters.wan import track_to_wan_camera_params
from omnicam.core.track import OmniCamTrack

LENGTH = 21
DISTANCE = 1.5 * (LENGTH - 1) / LENGTH
ANGLE_DEG = math.degrees((LENGTH - 1) / LENGTH * (math.pi / 3))
TOLERANCE = 1e-4


def _upstream():
    """Load ComfyUI's camera-trajectory maths from an explicit checkout."""
    pytest.importorskip("torch")
    root = os.environ.get("OMNICAM_COMFYUI_ROOT")
    if root:
        source = pathlib.Path(root) / "comfy_extras" / "nodes_camera_trajectory.py"
    else:
        source = pathlib.Path(__file__).resolve().parents[4] / "comfy_extras" / "nodes_camera_trajectory.py"
    if not source.exists():
        message = f"ComfyUI camera trajectory source not found: {source}"
        if os.environ.get("OMNICAM_REQUIRE_OFFICIAL_WAN_PARITY") == "1":
            pytest.fail(message)
        pytest.skip(message)
    text = source.read_text(encoding="utf-8")
    namespace: dict = {"np": np}
    exec(text[text.index("CAMERA_DICT = {"):text.index("class WanCameraEmbedding")], namespace)
    return namespace


def _relative_pose(matrices) -> np.ndarray:
    first, last = matrices[0], matrices[-1]
    rotation, translation = first[:3, :3], first[:3, 3]
    inverse = np.eye(4)
    inverse[:3, :3] = rotation.T
    inverse[:3, 3] = -rotation.T @ translation
    return inverse @ last


def _omnicam_relative(keyframes) -> np.ndarray:
    track = OmniCamTrack.from_dict({
        "fps": 24, "duration_frames": LENGTH, "width": 1280, "height": 720,
        "keyframes": keyframes,
    })
    params = np.asarray(track_to_wan_camera_params(track, LENGTH), dtype=np.float64)
    return _relative_pose([np.array(row[7:23]).reshape(4, 4) for row in params])


def _upstream_relative(namespace, preset: str) -> np.ndarray:
    motion = namespace["get_camera_motion"](
        np.array(namespace["CAMERA_DICT"][preset]["angle"]),
        np.array(namespace["CAMERA_DICT"][preset]["T"]),
        1.0,
        LENGTH,
    )
    return _relative_pose([np.vstack([row, [0, 0, 0, 1]]) for row in np.asarray(motion)])


def _move(position_end, target_end, *, position_start=(0.0, 0.0, 5.0), target_start=(0.0, 0.0, 0.0), roll_end=0.0):
    return [
        {"frame": 0, "camera": {"position": list(position_start), "target": list(target_start), "fov": 50, "roll": 0.0}, "interpolation": "linear"},
        {"frame": LENGTH - 1, "camera": {"position": list(position_end), "target": list(target_end), "fov": 50, "roll": roll_end}, "interpolation": "linear"},
    ]


TRANSLATIONS = {
    "truck_right": ((DISTANCE, 0.0, 5.0), (DISTANCE, 0.0, 0.0), "Pan Right", (DISTANCE, 0.0, 0.0)),
    "truck_left": ((-DISTANCE, 0.0, 5.0), (-DISTANCE, 0.0, 0.0), "Pan Left", (-DISTANCE, 0.0, 0.0)),
    "pedestal_up": ((0.0, DISTANCE, 5.0), (0.0, DISTANCE, 0.0), "Pan Up", (0.0, -DISTANCE, 0.0)),
    "pedestal_down": ((0.0, -DISTANCE, 5.0), (0.0, -DISTANCE, 0.0), "Pan Down", (0.0, DISTANCE, 0.0)),
}


@pytest.mark.parametrize("name", sorted(TRANSLATIONS))
def test_translation_moves_match_comfyui_presets(name):
    end_pos, end_target, preset, expected = TRANSLATIONS[name]
    ours = _omnicam_relative(_move(end_pos, end_target))
    assert ours[:3, 3] == pytest.approx(expected, abs=TOLERANCE)
    assert np.allclose(ours[:3, :3], np.eye(3), atol=TOLERANCE)
    theirs = _upstream_relative(_upstream(), preset)
    assert ours[:3, 3] == pytest.approx(theirs[:3, 3], abs=TOLERANCE)


def test_dolly_matches_the_zoom_presets_direction_and_scale():
    namespace = _upstream()
    dolly_in = _omnicam_relative(_move((0.0, 0.0, 5.0 - DISTANCE), (0.0, 0.0, 0.0)))
    dolly_out = _omnicam_relative(_move((0.0, 0.0, 5.0 + DISTANCE), (0.0, 0.0, 0.0)))
    zoom_in = _upstream_relative(namespace, "Zoom In")
    zoom_out = _upstream_relative(namespace, "Zoom Out")
    assert dolly_in[2, 3] > 0 and zoom_in[2, 3] > 0
    assert zoom_in[2, 3] == pytest.approx(dolly_in[2, 3] * 2.0, abs=TOLERANCE)
    assert dolly_out[2, 3] < 0 and zoom_out[2, 3] < 0


def test_roll_matches_the_clockwise_presets_exactly():
    namespace = _upstream()
    clockwise = _upstream_relative(namespace, "ClockWise (CW)")[:3, :3]
    anticlockwise = _upstream_relative(namespace, "Anti Clockwise (ACW)")[:3, :3]
    negative = _omnicam_relative(_move((0.0, 0.0, 5.0), (0.0, 0.0, 0.0), roll_end=-ANGLE_DEG))[:3, :3]
    positive = _omnicam_relative(_move((0.0, 0.0, 5.0), (0.0, 0.0, 0.0), roll_end=ANGLE_DEG))[:3, :3]
    assert np.allclose(negative, clockwise, atol=TOLERANCE)
    assert np.allclose(positive, anticlockwise, atol=TOLERANCE)
    assert not np.allclose(clockwise, anticlockwise, atol=TOLERANCE)


def _axis_angle(rotation: np.ndarray) -> tuple[np.ndarray, float]:
    angle = math.acos(max(-1.0, min(1.0, (np.trace(rotation) - 1.0) / 2.0)))
    if angle < 1e-9:
        return np.zeros(3), 0.0
    axis = np.array([
        rotation[2, 1] - rotation[1, 2],
        rotation[0, 2] - rotation[2, 0],
        rotation[1, 0] - rotation[0, 1],
    ])
    return axis / np.linalg.norm(axis), angle


WAN_FORWARD = np.array([0.0, 0.0, 1.0])


@pytest.mark.parametrize(("target_x", "screen_side"), [(3.0, +1.0), (-3.0, -1.0)])
def test_pan_is_a_pure_yaw_that_turns_toward_the_target(target_x, screen_side):
    pose = _omnicam_relative(_move((0.0, 0.0, 5.0), (target_x, 0.0, 0.0)))
    assert pose[:3, 3] == pytest.approx((0.0, 0.0, 0.0), abs=TOLERANCE)
    axis, angle = _axis_angle(pose[:3, :3])
    assert angle == pytest.approx(math.atan2(abs(target_x), 5.0), abs=TOLERANCE)
    assert abs(axis[1]) == pytest.approx(1.0, abs=TOLERANCE)
    assert abs(axis[0]) < TOLERANCE and abs(axis[2]) < TOLERANCE
    assert np.sign((pose[:3, :3] @ WAN_FORWARD)[0]) == screen_side


@pytest.mark.parametrize(("target_y", "wan_y_sign"), [(3.0, -1.0), (-3.0, +1.0)])
def test_tilt_is_a_pure_pitch_that_turns_toward_the_target(target_y, wan_y_sign):
    pose = _omnicam_relative(_move((0.0, 0.0, 5.0), (0.0, target_y, 0.0)))
    assert pose[:3, 3] == pytest.approx((0.0, 0.0, 0.0), abs=TOLERANCE)
    axis, angle = _axis_angle(pose[:3, :3])
    assert angle == pytest.approx(math.atan2(abs(target_y), 5.0), abs=TOLERANCE)
    assert abs(axis[0]) == pytest.approx(1.0, abs=TOLERANCE)
    assert abs(axis[1]) < TOLERANCE and abs(axis[2]) < TOLERANCE
    assert np.sign((pose[:3, :3] @ WAN_FORWARD)[1]) == wan_y_sign


@pytest.mark.parametrize("degrees", [45.0, 90.0])
def test_orbit_rotates_about_the_subject_and_keeps_its_radius(degrees):
    radius, theta = 5.0, math.radians(degrees)
    keyframes = _move((radius * math.sin(theta), 0.0, radius * math.cos(theta)), (0.0, 0.0, 0.0))
    pose = _omnicam_relative(keyframes)
    axis, angle = _axis_angle(pose[:3, :3])
    assert angle == pytest.approx(theta, abs=TOLERANCE)
    assert abs(axis[1]) == pytest.approx(1.0, abs=TOLERANCE)
    assert np.linalg.norm(pose[:3, 3]) > TOLERANCE
    track = OmniCamTrack.from_dict({
        "fps": 24, "duration_frames": LENGTH, "width": 1280, "height": 720, "keyframes": keyframes,
    })
    start, end = track.sample(0), track.sample(LENGTH - 1)
    assert np.linalg.norm(np.array(end.position) - np.array(end.target)) == pytest.approx(
        np.linalg.norm(np.array(start.position) - np.array(start.target)), abs=TOLERANCE
    )
