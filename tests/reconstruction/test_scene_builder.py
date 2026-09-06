"""Tests for compiling ReconstructionResult into a validated MotionScene."""

from __future__ import annotations

from omnicam.core.motion_scene import MotionScene
from omnicam.reconstruction.scene_builder import build_reconstructed_scene
from omnicam.reconstruction.types import (
    ReconstructedAsset,
    ReconstructedCamera,
    ReconstructedPlane,
    ReconstructionResult,
)


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

    # Source camera check
    cam_item = scene.cameras[0]
    assert cam_item.id == "camera_1"
    assert cam_item.track.render_mode == "omni_ref"
    assert cam_item.track.keyframes[0].camera.fov == 65.0

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
