"""Tests for bounded proxy mesh builder and decimation control."""

from __future__ import annotations

import pytest
import torch

from omnicam.reconstruction.geometry import (
    MeshTooLargeError,
    ProxyMesh,
    _compute_smooth_vertex_normals,
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
    # quality="custom" is required for an explicit triangle_budget to reach
    # build_proxy_mesh at all -- fast/balanced/high resolve their own budget
    # from QUALITY_PRESETS regardless of what this field says.
    settings = ReconstructionSettings(provider="fake", quality="custom", triangle_budget=30_000)

    mesh = build_proxy_mesh(evidence, settings, triangulate_fn=_make_dense_triangulate_stub())

    assert isinstance(mesh, ProxyMesh)
    assert mesh.triangle_count <= 30_000
    assert mesh.triangle_count > 0


def test_fast_quality_resolves_its_own_budget_and_threshold_ignoring_explicit_fields():
    # A caller passing triangle_budget/discontinuity_threshold alongside a
    # non-custom quality must not have those fields silently win -- the
    # preset for "fast" (40_000 / 0.06) is what actually governs, exactly as
    # if the caller had passed nothing at all.
    provider = FakeReconstructionProvider(grid_size=16)
    evidence = provider.reconstruct(None, ReconstructionSettings(provider="fake"))
    stub = _make_dense_triangulate_stub()

    explicit_low_budget = ReconstructionSettings(
        provider="fake", quality="fast", triangle_budget=1_000, discontinuity_threshold=0.99
    )
    mesh_a = build_proxy_mesh(evidence, explicit_low_budget, triangulate_fn=stub)

    no_override = ReconstructionSettings(provider="fake", quality="fast")
    mesh_b = build_proxy_mesh(evidence, no_override, triangulate_fn=stub)

    assert mesh_a.triangle_count == mesh_b.triangle_count


def test_custom_quality_honors_the_caller_supplied_budget_and_threshold():
    provider = FakeReconstructionProvider(grid_size=16)
    evidence = provider.reconstruct(None, ReconstructionSettings(provider="fake"))
    stub = _make_dense_triangulate_stub()

    custom = ReconstructionSettings(provider="fake", quality="custom", triangle_budget=1_000)
    with pytest.raises(MeshTooLargeError):
        build_proxy_mesh(evidence, custom, triangulate_fn=stub)


def test_over_budget_geometry_raises_mesh_too_large():
    provider = FakeReconstructionProvider(grid_size=16)
    evidence = provider.reconstruct(None, ReconstructionSettings(provider="fake"))
    # Stub at decimation 8 returns 12,500; if budget is 5,000, it cannot satisfy it.
    # quality="custom" is required for this explicit budget to actually apply.
    settings = ReconstructionSettings(provider="fake", quality="custom", triangle_budget=5_000)

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
        # Assertions below only look at vertex/face index 0; the other two
        # vertices exist purely so the face is a valid triangle (normal
        # computation indexes all three corners).
        verts = torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]])
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
        # Assertions below only look at vertex/face index 0; the other two
        # vertices exist purely so the face is a valid triangle (normal
        # computation indexes all three corners).
        verts = torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]])
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


def test_compute_smooth_vertex_normals_on_a_single_triangle():
    # A single triangle in the XZ plane: cross(v1-v0, v2-v0) with this winding
    # (0,0,0)->(1,0,0)->(0,0,1) points straight down (-Y).
    verts = torch.tensor([[0.0, 0.0, 0.0], [1.0, 0.0, 0.0], [0.0, 0.0, 1.0]])
    faces = torch.tensor([[0, 1, 2]])

    normals = _compute_smooth_vertex_normals(verts, faces)

    assert normals.shape == (3, 3)
    for row in normals:
        assert torch.allclose(row, torch.tensor([0.0, -1.0, 0.0]), atol=1e-5)
        assert torch.isclose(row.norm(), torch.tensor(1.0), atol=1e-5)


def test_compute_smooth_vertex_normals_averages_shared_vertices():
    # Two triangles sharing an edge, folded at a slight angle: the shared
    # vertices (0, 1) must average both faces' normals, not just one.
    verts = torch.tensor([
        [0.0, 0.0, 0.0],
        [1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0],
        [1.0, 0.1, 1.0],
    ])
    faces = torch.tensor([[0, 1, 2], [1, 3, 2]])

    normals = _compute_smooth_vertex_normals(verts, faces)

    assert normals.shape == (4, 3)
    assert torch.allclose(normals.norm(dim=-1), torch.ones(4), atol=1e-5)
    # Shared vertices 0 and 1 see a blend of both face normals, so neither is
    # exactly the single-face [0, -1, 0] the un-shared corners would give alone.
    assert not torch.allclose(normals[1], torch.tensor([0.0, -1.0, 0.0]), atol=1e-4)


def test_build_proxy_mesh_attaches_normals_matching_final_vertices(monkeypatch):
    # build_proxy_mesh triangulates through comfy.ldm.moge.geometry, which only
    # exists in a ComfyUI checkout (integration lane / local dev).
    pytest.importorskip("comfy.ldm.moge.geometry")
    from .fakes import FakeReconstructionProvider

    provider = FakeReconstructionProvider(grid_size=16)
    evidence = provider.reconstruct(None, ReconstructionSettings(provider="fake"))
    settings = ReconstructionSettings(provider="fake")

    mesh = build_proxy_mesh(evidence, settings)

    assert mesh.normals is not None
    assert mesh.normals.shape == mesh.vertices.shape
    assert torch.allclose(mesh.normals.norm(dim=-1), torch.ones(mesh.normals.shape[0]), atol=1e-3)
