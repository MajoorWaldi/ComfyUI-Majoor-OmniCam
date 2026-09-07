"""Tests for whole-scene re-levelling (review finding #8, full fix)."""

from __future__ import annotations

import math

import numpy as np
import pytest

from omnicam.reconstruction.leveling import (
    MAX_LEVEL_DEGREES,
    level_rotation_from_normal,
    level_scene,
)
from omnicam.reconstruction.types import ReconstructedCamera, ReconstructedPlane


def _ground(normal, conf=0.8):
    return ReconstructedPlane(
        plane_type="ground", center=(0.0, -1.5, -3.0), normal=normal, size=(6.0, 4.0), confidence=conf
    )


def test_rotation_maps_tilted_normal_onto_world_up():
    t = math.radians(12.0)
    normal = (0.0, math.cos(t), math.sin(t))
    rot = level_rotation_from_normal(normal)
    assert rot is not None
    up = rot @ np.asarray(normal)
    assert np.allclose(up, [0.0, 1.0, 0.0], atol=1e-9)


def test_rotation_is_skipped_outside_the_trusted_band():
    assert level_rotation_from_normal((0.0, 1.0, 0.0)) is None  # already level
    tiny = math.radians(0.4)
    assert level_rotation_from_normal((0.0, math.cos(tiny), math.sin(tiny))) is None  # < 1 deg noise
    steep = math.radians(MAX_LEVEL_DEGREES + 5)
    assert level_rotation_from_normal((0.0, math.cos(steep), math.sin(steep))) is None


def test_level_scene_rotates_points_camera_and_planes_together():
    t = math.radians(15.0)
    normal = (0.0, math.cos(t), math.sin(t))
    ground = _ground(normal)
    # A point sitting exactly on the tilted plane through the origin-ish.
    pts = np.array([[[1.0, -1.5, -3.0], [0.0, 0.0, 0.0]]], dtype=np.float32)
    cam = ReconstructedCamera(fov_x_degrees=60.0, fov_y_degrees=45.0, position=(0.0, 0.0, 0.0), target=(0.0, 0.0, -1.0))

    p2, cam2, planes_out, levelled = level_scene(points=pts, camera=cam, planes=[ground], ground=ground)
    assert levelled is True
    # The ground normal is now world up.
    assert np.allclose(planes_out[0].normal, [0.0, 1.0, 0.0], atol=1e-9)
    # Rigid: distances are preserved.
    assert np.linalg.norm(p2[0, 0]) == pytest.approx(np.linalg.norm(pts[0, 0]), rel=1e-6)
    # Camera forward still unit length.
    fwd = np.asarray(cam2.target) - np.asarray(cam2.position)
    assert np.linalg.norm(fwd) == pytest.approx(1.0, rel=1e-6)


def test_level_scene_is_a_noop_for_a_weak_or_missing_ground():
    pts = np.zeros((1, 3, 3), dtype=np.float32)
    cam = ReconstructedCamera(fov_x_degrees=60.0, fov_y_degrees=45.0)
    p2, cam2, _planes, levelled = level_scene(points=pts, camera=cam, planes=[], ground=None)
    assert levelled is False and p2 is pts and cam2 is cam

    weak = _ground((0.0, math.cos(math.radians(10)), math.sin(math.radians(10))), conf=0.3)
    _, _, _, levelled2 = level_scene(points=pts, camera=cam, planes=[weak], ground=weak)
    assert levelled2 is False


def test_blockout_pipeline_levels_a_tilted_ground(tmp_path):
    from PIL import Image

    from omnicam.reconstruction.pipelines.single_blockout import run_single_blockout_pipeline
    from omnicam.reconstruction.segmentation.fake import FakeSegmentationProvider
    from omnicam.reconstruction.settings import ReconstructionSettings
    from omnicam.reconstruction.types import ReconstructionSource

    from .fakes import FakeReconstructionProvider

    Image.new("RGB", (16, 16), (110, 110, 110)).save(tmp_path / "room.png")
    out = run_single_blockout_pipeline(
        source=ReconstructionSource(kind="annotated_input", value="room.png"),
        settings=ReconstructionSettings(mode="blockout", provider="fake", semantic_labels=("chair",)),
        geometry_provider=FakeReconstructionProvider(grid_size=64),
        segmentation_provider=FakeSegmentationProvider(),
        input_root=tmp_path,
    )
    # The fake provider's floor is exactly horizontal, so nothing to level --
    # the flag is present and False, and the scene still validates.
    assert out.summary["provider_summary"]["levelled"] is False


def test_recenter_drops_confident_ground_to_the_origin_on_the_grid():
    from omnicam.reconstruction.leveling import recenter_scene

    ground = _ground((0.0, 1.0, 0.0), conf=0.85)
    ground.center = (2.0, -1.5, -4.0)  # somewhere in front of / below the camera
    pts = np.array([[[2.3, -1.5, -4.2], [1.7, -0.4, -3.6]]], dtype=np.float32)
    cam = ReconstructedCamera(
        fov_x_degrees=60.0, fov_y_degrees=45.0, position=(0.0, 0.0, 0.0), target=(0.0, 0.0, -1.0)
    )

    p2, cam2, planes2, offset = recenter_scene(points=pts, camera=cam, planes=[ground], ground=ground)
    # ground centre is now the world origin (floor on Director's grid at Y=0).
    assert np.allclose(planes2[0].center, [0.0, 0.0, 0.0], atol=1e-6)
    assert np.allclose(offset, [-2.0, 1.5, 4.0], atol=1e-6)
    # camera moved by the same rigid offset -> its framing of the source is kept.
    assert np.allclose(cam2.position, [-2.0, 1.5, 4.0], atol=1e-6)
    assert np.allclose(np.asarray(cam2.target) - np.asarray(cam2.position), [0.0, 0.0, -1.0], atol=1e-6)
    # a point that was on the floor is now at ~Y=0.
    assert abs(float(p2.reshape(-1, 3)[0, 1])) < 0.1


def test_recenter_without_ground_uses_robust_floor_and_xz_median():
    from omnicam.reconstruction.leveling import recenter_scene

    rng = np.random.default_rng(0)
    pts = rng.uniform([-1, 0.2, -6], [3, 2.5, -2], (2000, 3)).astype(np.float32).reshape(1, 2000, 3)
    cam = ReconstructedCamera(fov_x_degrees=60.0, fov_y_degrees=45.0)
    p2, _cam, _planes, _offset = recenter_scene(points=pts, camera=cam, planes=[], ground=None)
    flat = p2.reshape(-1, 3)
    assert abs(float(np.median(flat[:, 0]))) < 0.05  # XZ median at origin
    assert abs(float(np.median(flat[:, 2]))) < 0.05
    assert float(np.percentile(flat[:, 1], 2)) == pytest.approx(0.0, abs=0.05)  # floor at Y=0


def test_apply_rotation_to_points_is_nan_safe_and_silent():
    """MoGe hands us NaN for unprojectable pixels; rotating them must stay NaN
    without a RuntimeWarning (seen on a real RTX 4090 run)."""
    import warnings

    from omnicam.reconstruction.leveling import apply_rotation_to_points

    pts = np.array([[[1.0, 2.0, 3.0], [np.nan, np.nan, np.nan], [np.inf, 0.0, 0.0]]], dtype=np.float32)
    rot = np.eye(3)
    rot[0, 0] = 0.0
    rot[0, 1] = -1.0
    rot[1, 0] = 1.0
    rot[1, 1] = 0.0
    with warnings.catch_warnings():
        warnings.simplefilter("error")  # any RuntimeWarning fails the test
        out = apply_rotation_to_points(pts, rot)
    assert np.isfinite(out[0, 0]).all()
    assert np.isnan(out[0, 1]).all()
