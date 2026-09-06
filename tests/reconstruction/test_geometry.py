"""Tests for bounded proxy mesh builder and decimation control."""

from __future__ import annotations

import pytest
import torch

from omnicam.reconstruction.geometry import (
    MeshTooLargeError,
    ProxyMesh,
    build_proxy_mesh,
)
from omnicam.reconstruction.settings import ReconstructionSettings

from .fakes import FakeReconstructionProvider


def _make_dense_triangulate_stub():
    """Stub returning triangle counts inversely proportional to decimation."""

    def stub(points, decimation=1, discontinuity_threshold=0.04, depth=None):
        # decimation 1: 100k, 2: 50k, 3: 33k, 4: 25k, 5: 20k, 6: 16k, 7: 14k, 8: 12k
        n_tris = int(100_000 / decimation)
        verts = torch.zeros((n_tris * 3, 3), dtype=torch.float32)
        # Put sample points in OpenCV [1, 2, 3]
        verts[:, 0] = 1.0
        verts[:, 1] = 2.0
        verts[:, 2] = 3.0
        faces = torch.arange(n_tris * 3, dtype=torch.int64).reshape((n_tris, 3))
        uvs = torch.zeros((n_tris * 3, 2), dtype=torch.float32)
        return verts, faces, uvs

    return stub


def test_decimation_loop_reduces_triangles_below_budget():
    provider = FakeReconstructionProvider(grid_size=16)
    evidence = provider.reconstruct(None, ReconstructionSettings(provider="fake"))
    settings = ReconstructionSettings(provider="fake", triangle_budget=30_000)

    mesh = build_proxy_mesh(evidence, settings, triangulate_fn=_make_dense_triangulate_stub())

    assert isinstance(mesh, ProxyMesh)
    assert mesh.triangle_count <= 30_000
    assert mesh.triangle_count > 0


def test_over_budget_geometry_raises_mesh_too_large():
    provider = FakeReconstructionProvider(grid_size=16)
    evidence = provider.reconstruct(None, ReconstructionSettings(provider="fake"))
    # Stub at decimation 8 returns 12,500; if budget is 5,000, it cannot satisfy it
    settings = ReconstructionSettings(provider="fake", triangle_budget=5_000)

    with pytest.raises(MeshTooLargeError, match="exceeding budget"):
        build_proxy_mesh(evidence, settings, triangulate_fn=_make_dense_triangulate_stub())


def test_opencv_coordinate_system_is_converted_to_omnicam():
    provider = FakeReconstructionProvider(grid_size=16)
    evidence = provider.reconstruct(None, ReconstructionSettings(provider="fake"))
    evidence.coordinate_system = "opencv_x_right_y_down_z_forward"

    def stub(points, decimation=1, discontinuity_threshold=0.04, depth=None):
        verts = torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]])
        faces = torch.tensor([[0, 1, 2]])
        uvs = torch.zeros((3, 2))
        return verts, faces, uvs

    settings = ReconstructionSettings(provider="fake", triangle_budget=50_000, scene_scale=1.0)
    mesh = build_proxy_mesh(evidence, settings, triangulate_fn=stub)

    # OpenCV [1, 2, 3] -> glTF [1, -2, -3]
    assert torch.allclose(mesh.vertices[0], torch.tensor([1.0, -2.0, -3.0]))
    # Winding flipped from [0, 1, 2] to [0, 2, 1]
    assert torch.equal(mesh.faces[0], torch.tensor([0, 2, 1]))


def test_already_gltf_coordinate_system_is_untouched():
    provider = FakeReconstructionProvider(grid_size=16)
    evidence = provider.reconstruct(None, ReconstructionSettings(provider="fake"))
    evidence.coordinate_system = "gltf_y_up_z_back"

    def stub(points, decimation=1, discontinuity_threshold=0.04, depth=None):
        verts = torch.tensor([[1.0, 2.0, 3.0]])
        faces = torch.tensor([[0, 1, 2]])
        uvs = torch.zeros((3, 2))
        return verts, faces, uvs

    settings = ReconstructionSettings(provider="fake")
    mesh = build_proxy_mesh(evidence, settings, triangulate_fn=stub)

    assert torch.allclose(mesh.vertices[0], torch.tensor([1.0, 2.0, 3.0]))
    assert torch.equal(mesh.faces[0], torch.tensor([0, 1, 2]))


def test_scene_scale_and_texture_handling():
    provider = FakeReconstructionProvider(grid_size=16)
    evidence = provider.reconstruct(None, ReconstructionSettings(provider="fake"))

    def stub(points, decimation=1, discontinuity_threshold=0.04, depth=None):
        verts = torch.tensor([[1.0, 2.0, 3.0]])
        faces = torch.tensor([[0, 1, 2]])
        uvs = torch.zeros((3, 2))
        return verts, faces, uvs

    # Scaled x2 with texture
    settings_textured = ReconstructionSettings(provider="fake", scene_scale=2.0, source_texture=True)
    mesh1 = build_proxy_mesh(evidence, settings_textured, triangulate_fn=stub)
    # [1, -2, -3] * 2 = [2, -4, -6]
    assert torch.allclose(mesh1.vertices[0], torch.tensor([2.0, -4.0, -6.0]))
    assert mesh1.texture is not None

    # Scaled x1 with no texture
    settings_untextured = ReconstructionSettings(provider="fake", scene_scale=1.0, source_texture=False)
    mesh2 = build_proxy_mesh(evidence, settings_untextured, triangulate_fn=stub)
    assert mesh2.texture is None
