"""Tests for compiling ReconstructionResult into a validated MotionScene."""

from __future__ import annotations

import math

import numpy as np

from omnicam.core.motion_scene import MotionScene
from omnicam.reconstruction.scene_builder import build_reconstructed_scene
from omnicam.reconstruction.types import (
    ReconstructedAsset,
    ReconstructedCamera,
    ReconstructedPlane,
    ReconstructionResult,
)


def _euler_xyz_degrees_to_matrix(degrees: list[float]) -> np.ndarray:
    """Rebuild the rotation matrix from MotionScene's Euler XYZ degrees.

    The inverse of scene_builder._euler_xyz_degrees_from_matrix, using
    three.js's own Matrix4.makeRotationFromEuler('XYZ') formula -- so a test
    that round-trips through this is checking against the exact convention
    Director's viewport renders with, not a reimplementation of it.
    """
    x, y, z = (math.radians(d) for d in degrees)
    a, b = math.cos(x), math.sin(x)
    c, d = math.cos(y), math.sin(y)
    e, f = math.cos(z), math.sin(z)
    ae, af, be, bf = a * e, a * f, b * e, b * f
    return np.array([
        [c * e, -c * f, d],
        [af + be * d, ae - bf * d, -b * c],
        [bf - ae * d, be + af * d, a * c],
    ])


def _sample_result():
    cam = ReconstructedCamera(
        position=(0.0, 0.0, 0.0),
        target=(0.0, 0.0, -1.0),
        fov_x_degrees=65.0,
        fov_y_degrees=45.0,
    )
    asset = ReconstructedAsset(
        role="environment",
        asset_path="majoor_omnicam/reconstruction/abc/environment.glb [input]",
        triangle_count=50000,
        textured=True,
        confidence=0.85,
    )
    ground = ReconstructedPlane(
        plane_type="ground",
        center=(0.0, -1.2, -3.0),
        normal=(0.0, 1.0, 0.0),
        size=(10.0, 8.0),
        confidence=0.9,
    )
    wall = ReconstructedPlane(
        plane_type="wall",
        center=(0.0, 0.0, -6.0),
        normal=(0.0, 0.0, 1.0),
        size=(8.0, 3.0),
        confidence=0.75,
    )
    return ReconstructionResult(
        provider="comfy_moge",
        mode="geometry",
        camera=cam,
        environment_asset=asset,
        planes=[ground, wall],
        warnings=["Test warning"],
        confidence=0.85,
    )


def test_build_reconstructed_scene_validates_and_matches_schema():
    result = _sample_result()
    scene_dict = build_reconstructed_scene(result, source_asset_ref="room.png [input]")

    # Check it passes canonical validation and round-trips
    scene = MotionScene.from_dict(scene_dict)
    assert scene.version == 1
    assert scene.active_camera_id == "camera_1"
    assert scene.playblast_camera_id == "camera_1"

    # Source camera check. camera.fov is vertical FOV throughout OmniCam (the
    # extractor's own track_builder feeds it vertical_fov_from_focal_pixels,
    # and Director's glTF export produces yfov) -- fov_y_degrees, not
    # fov_x_degrees, is the field that belongs here.
    cam_item = scene.cameras[0]
    assert cam_item.id == "camera_1"
    assert cam_item.track.render_mode == "omni_ref"
    assert cam_item.track.keyframes[0].camera.fov == 45.0

    # Objects check
    objects = scene_dict["objects"]
    assert len(objects) == 3  # env, ground, wall
    env = next(o for o in objects if o["id"] == "recon_environment")
    assert env["type"] == "glb"
    assert env["locked"] is True
    assert env["asset"] == "majoor_omnicam/reconstruction/abc/environment.glb [input]"
    assert env["reconstruction"]["role"] == "environment"

    ground = next(o for o in objects if o["id"] == "recon_ground")
    assert ground["type"] == "ground"
    assert ground["locked"] is True

    wall = next(o for o in objects if o["id"] == "recon_wall_1")
    assert wall["type"] == "cube"
    assert wall["locked"] is True


def test_ground_omitted_when_no_ground_plane():
    result = _sample_result()
    result.planes = [p for p in result.planes if p.plane_type != "ground"]

    scene_dict = build_reconstructed_scene(result)
    objects = scene_dict["objects"]
    assert not any(o["id"] == "recon_ground" for o in objects)


def test_warnings_capped_at_32_and_240_chars():
    result = _sample_result()
    result.warnings = ["A" * 300 for _ in range(50)]

    scene_dict = build_reconstructed_scene(result)
    warnings = scene_dict["metadata"]["reconstruction"]["warnings"]
    assert len(warnings) == 32
    assert all(len(w) <= 240 for w in warnings)


def test_reconstruction_uses_vertical_fov():
    """camera.fov is vertical throughout OmniCam; scene_builder must emit
    fov_y_degrees, not fov_x_degrees, even when the two clearly differ."""
    result = _sample_result()
    result.camera.fov_x_degrees = 65.0
    result.camera.fov_y_degrees = 45.0

    scene_dict = build_reconstructed_scene(result, source_asset_ref="room.png [input]")

    assert scene_dict["cameras"][0]["track"]["keyframes"][0]["camera"]["fov"] == 45.0


def test_reconstruction_preserves_landscape_canvas():
    result = _sample_result()
    result.source_width, result.source_height = 1920, 1080

    scene_dict = build_reconstructed_scene(result, source_asset_ref="room.png [input]")

    assert scene_dict["canvas"] == {"width": 1920, "height": 1080}
    track = scene_dict["cameras"][0]["track"]
    assert (track["width"], track["height"]) == (1920, 1080)
    MotionScene.from_dict(scene_dict)  # canvas/track dimensions must agree


def test_reconstruction_preserves_portrait_canvas():
    result = _sample_result()
    result.source_width, result.source_height = 1080, 1920

    scene_dict = build_reconstructed_scene(result, source_asset_ref="room.png [input]")

    assert scene_dict["canvas"] == {"width": 1080, "height": 1920}
    MotionScene.from_dict(scene_dict)


def test_reconstruction_preserves_square_canvas():
    result = _sample_result()
    result.source_width, result.source_height = 1024, 1024

    scene_dict = build_reconstructed_scene(result, source_asset_ref="room.png [input]")

    assert scene_dict["canvas"] == {"width": 1024, "height": 1024}
    MotionScene.from_dict(scene_dict)


def test_explicit_canvas_args_still_override_source_dimensions():
    result = _sample_result()
    result.source_width, result.source_height = 1920, 1080

    scene_dict = build_reconstructed_scene(
        result, source_asset_ref="room.png [input]", canvas_width=640, canvas_height=480,
    )

    assert scene_dict["canvas"] == {"width": 640, "height": 480}


def test_ground_proxy_maps_xz_extents_to_xz():
    """planes.py fits (size_x, size_z) on the ground plane -- Director's
    ground proxy size is [width, thickness, depth], so those extents belong
    in size[0] and size[2], never smuggled into size[1]."""
    result = _sample_result()

    scene_dict = build_reconstructed_scene(result, source_asset_ref="room.png [input]")

    ground = next(o for o in scene_dict["objects"] if o["id"] == "recon_ground")
    assert ground["size"][0] == 10.0  # size_x
    assert ground["size"][2] == 8.0  # size_z


def test_ground_proxy_uses_small_y_thickness():
    result = _sample_result()

    scene_dict = build_reconstructed_scene(result, source_asset_ref="room.png [input]")

    ground = next(o for o in scene_dict["objects"] if o["id"] == "recon_ground")
    assert ground["size"][1] == 0.03


def test_ground_rotation_identity_when_normal_is_straight_up():
    result = _sample_result()  # ground.normal = (0, 1, 0) in _sample_result()

    scene_dict = build_reconstructed_scene(result, source_asset_ref="room.png [input]")

    ground = next(o for o in scene_dict["objects"] if o["id"] == "recon_ground")
    assert ground["rotation"] == [0.0, 0.0, 0.0]


def test_tilted_ground_tilts_the_proxy_to_match():
    result = _sample_result()
    for plane in result.planes:
        if plane.plane_type == "ground":
            # A gently tilted floor: mostly up, leaning toward +X.
            plane.normal = (0.3, 0.95, 0.0)

    scene_dict = build_reconstructed_scene(result, source_asset_ref="room.png [input]")
    ground = next(o for o in scene_dict["objects"] if o["id"] == "recon_ground")

    assert ground["rotation"] != [0.0, 0.0, 0.0]
    matrix = _euler_xyz_degrees_to_matrix(ground["rotation"])
    rotated_up = matrix @ np.array([0.0, 1.0, 0.0])
    expected = np.array([0.3, 0.95, 0.0])
    expected = expected / np.linalg.norm(expected)
    assert np.allclose(rotated_up, expected, atol=1e-6)


def test_side_wall_aligns_to_plane_normal():
    """A wall detected facing +X (a side wall, not the back wall) must
    actually face +X after reconstruction -- previously this only ever
    worked by coincidence for a wall whose normal was already +-Z."""
    result = _sample_result()
    for plane in result.planes:
        if plane.plane_type == "wall":
            plane.normal = (1.0, 0.0, 0.0)

    scene_dict = build_reconstructed_scene(result, source_asset_ref="room.png [input]")
    wall = next(o for o in scene_dict["objects"] if o["id"] == "recon_wall_1")

    assert wall["rotation"] != [0.0, 0.0, 0.0]
    matrix = _euler_xyz_degrees_to_matrix(wall["rotation"])
    local_forward = np.array([0.0, 0.0, 1.0])  # the cube proxy's local +Z
    rotated = matrix @ local_forward
    assert np.allclose(rotated, [1.0, 0.0, 0.0], atol=1e-6)


def test_angled_wall_aligns_to_plane_normal():
    result = _sample_result()
    diag = 1.0 / math.sqrt(2.0)
    for plane in result.planes:
        if plane.plane_type == "wall":
            plane.normal = (diag, 0.0, diag)

    scene_dict = build_reconstructed_scene(result, source_asset_ref="room.png [input]")
    wall = next(o for o in scene_dict["objects"] if o["id"] == "recon_wall_1")

    matrix = _euler_xyz_degrees_to_matrix(wall["rotation"])
    rotated = matrix @ np.array([0.0, 0.0, 1.0])
    assert np.allclose(rotated, [diag, 0.0, diag], atol=1e-6)


def test_back_wall_stays_at_identity_rotation():
    """The one orientation that "worked by accident" before this fix must
    still produce no rotation now, not a numerically-equivalent-but-nonzero
    one that would just be noise in a saved workflow."""
    result = _sample_result()  # wall.normal = (0, 0, 1) in _sample_result()

    scene_dict = build_reconstructed_scene(result, source_asset_ref="room.png [input]")
    wall = next(o for o in scene_dict["objects"] if o["id"] == "recon_wall_1")

    assert wall["rotation"] == [0.0, 0.0, 0.0]


def test_opposite_facing_wall_flips_180_degrees():
    result = _sample_result()
    for plane in result.planes:
        if plane.plane_type == "wall":
            plane.normal = (0.0, 0.0, -1.0)

    scene_dict = build_reconstructed_scene(result, source_asset_ref="room.png [input]")
    wall = next(o for o in scene_dict["objects"] if o["id"] == "recon_wall_1")

    matrix = _euler_xyz_degrees_to_matrix(wall["rotation"])
    rotated = matrix @ np.array([0.0, 0.0, 1.0])
    assert np.allclose(rotated, [0.0, 0.0, -1.0], atol=1e-6)
