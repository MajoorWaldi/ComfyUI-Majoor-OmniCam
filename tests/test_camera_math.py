import math

import pytest

from omnicam.core.projection import basis, project_point
from omnicam.core.track import CameraState, OmniCamTrack, camera_to_load3d


def test_vertical_camera_basis_is_not_degenerate():
    camera = CameraState(position=[0, 10, 0], target=[0, 0, 0])  # straight down, parallel to world up
    right, up, forward = basis(camera)
    for vector in (right, up, forward):
        assert all(math.isfinite(value) for value in vector)
        assert math.sqrt(sum(v * v for v in vector)) == pytest.approx(1.0)
    assert forward == [0.0, -1.0, 0.0]


def test_coincident_position_and_target_get_stable_forward():
    camera = CameraState(position=[1, 2, 3], target=[1, 2, 3])
    _, _, forward = basis(camera)
    assert forward == [0.0, 0.0, -1.0]
    projected = project_point([1, 2, 2], camera, 640, 360)
    assert projected is not None


def test_orthographic_projection_is_depth_independent():
    camera = CameraState(position=[0, 0, 10], target=[0, 0, 0], camera_type="orthographic", zoom=1.0)
    near = project_point([1, 0, 0], camera, 1000, 500)
    far = project_point([1, 0, -10], camera, 1000, 500)
    assert near is not None and far is not None
    assert near[0] == pytest.approx(far[0])
    assert near[1] == pytest.approx(far[1])


def test_orthographic_zoom_scales_image():
    camera = CameraState(position=[0, 0, 10], target=[0, 0, 0], camera_type="orthographic", zoom=2.0)
    projected = project_point([1, 0, 0], camera, 1000, 500)
    # half_height = 5 / zoom = 2.5, half_width = 5 → x=1 maps to 0.5 + 1/10 of width
    assert projected[0] == pytest.approx(600.0)


def test_clip_boundaries_are_enforced():
    camera = CameraState(position=[0, 0, 0], target=[0, 0, -1], near=0.5, far=10.0)
    assert project_point([0, 0, -0.4], camera, 640, 360) is None  # inside near plane
    assert project_point([0, 0, -11], camera, 640, 360) is None  # beyond far plane
    assert project_point([0, 0, -1], camera, 640, 360) is not None


def test_extreme_fov_remains_finite():
    camera = CameraState(position=[0, 0, 5], target=[0, 0, 0], fov=1e-3)
    projected = project_point([0.001, 0, 0], camera, 640, 360)
    assert projected is not None
    assert all(math.isfinite(v) for v in projected)


def _roll_track(a: float, b: float) -> OmniCamTrack:
    return OmniCamTrack.from_dict(
        {
            "fps": 24,
            "duration_frames": 11,
            "keyframes": [
                {"frame": 0, "camera": {"position": [0, 0, 5], "target": [0, 0, 0], "roll": a}, "interpolation": "linear"},
                {"frame": 10, "camera": {"position": [0, 0, 5], "target": [0, 0, 0], "roll": b}, "interpolation": "linear"},
            ],
        }
    )


def _norm_angle(value: float) -> float:
    return value % 360.0


def test_roll_interpolates_over_shortest_arc():
    track = _roll_track(350.0, 10.0)
    midpoint = track.sample(5)
    assert _norm_angle(midpoint.roll) == pytest.approx(0.0)  # via 360, not backwards through 180


def test_roll_wrap_negative_direction():
    track = _roll_track(10.0, 350.0)
    midpoint = track.sample(5)
    assert _norm_angle(midpoint.roll) == pytest.approx(0.0)


def test_projection_change_is_cut_at_key_boundary():
    track = OmniCamTrack.from_dict(
        {
            "duration_frames": 11,
            "keyframes": [
                {"frame": 0, "camera": {"position": [0, 0, 5], "camera_type": "perspective"}, "interpolation": "linear"},
                {"frame": 10, "camera": {"position": [0, 0, 5], "camera_type": "orthographic"}, "interpolation": "linear"},
            ],
        }
    )
    assert track.sample(9).camera_type == "perspective"
    assert track.sample(10).camera_type == "orthographic"


@pytest.mark.parametrize(
    ("position", "target", "roll"),
    [
        ([0, 0, 5], [0, 0, 0], 0),
        ([0, 0, 5], [0, 0, 0], 90),
        ([0, 0, 5], [0, 0, 0], 180),
        ([0, 5, 0], [0, 0, 0], 0),
        ([0, -5, 0], [0, 0, 0], 0),
        ([1, 2, 3], [1, 2, 3], 90),
    ],
)
def test_load3d_quaternion_conventions_are_finite_and_normalized(position, target, roll):
    payload = camera_to_load3d(CameraState(position=position, target=target, roll=roll))
    quaternion = payload["quaternion"]
    values = list(quaternion.values()) if isinstance(quaternion, dict) else list(quaternion)
    assert all(math.isfinite(value) for value in values)
    assert math.sqrt(sum(value * value for value in values)) == pytest.approx(1.0, abs=1e-6)
