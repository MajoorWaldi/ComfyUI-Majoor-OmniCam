"""Tests for reconstruction pipeline orchestration."""

from __future__ import annotations

from pathlib import Path

import pytest
import torch

from omnicam.reconstruction.errors import (
    ReconCancelledError,
    ReconEmptyGeometryError,
)
from omnicam.reconstruction.pipeline import (
    PipelineOutput,
    run_reconstruction_pipeline,
)
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import GeometryEvidence, ReconstructionSource

from .fakes import FakeCancelToken, FakeReconstructionProvider


def _setup_image(tmp_path: Path) -> tuple[ReconstructionSource, Path]:
    img_file = tmp_path / "test_input.png"
    img_file.write_bytes(b"\x89PNG\r\n\x1a\nfakeimage")
    source = ReconstructionSource(kind="annotated_input", value="test_input.png")
    return source, img_file


def _stub_save_glb(*args, **kwargs):
    fp = kwargs.get("filepath")
    if fp:
        Path(fp).write_bytes(b"GLBfake")


def _stub_triangulate(points, decimation=1, discontinuity_threshold=0.04, depth=None):
    verts = torch.tensor([[1.0, 1.0, 1.0], [2.0, 2.0, 2.0], [3.0, 3.0, 3.0]])
    faces = torch.tensor([[0, 1, 2]])
    uvs = torch.zeros((3, 2))
    return verts, faces, uvs


def test_pipeline_end_to_end_fake_provider(tmp_path):
    source, _ = _setup_image(tmp_path)
    settings = ReconstructionSettings(provider="fake", triangle_budget=10_000)
    provider = FakeReconstructionProvider(grid_size=16)

    output = run_reconstruction_pipeline(
        source=source,
        settings=settings,
        provider=provider,
        input_root=tmp_path,
        triangulate_fn=_stub_triangulate,
        save_glb_fn=_stub_save_glb,
    )

    assert isinstance(output, PipelineOutput)
    assert output.fingerprint
    assert output.motion_scene["version"] == 1
    assert output.motion_scene["active_camera_id"] == "camera_1"
    assert len(output.motion_scene["objects"]) >= 1
    assert "triangle_count" in output.summary
    assert isinstance(output.warnings, list)


def test_pipeline_progress_bands(tmp_path):
    source, _ = _setup_image(tmp_path)
    settings = ReconstructionSettings(provider="fake")
    provider = FakeReconstructionProvider(grid_size=16)

    progress_history: list[tuple[str, float, str]] = []

    def on_progress(stage: str, pct: float, msg: str):
        progress_history.append((stage, pct, msg))

    run_reconstruction_pipeline(
        source=source,
        settings=settings,
        provider=provider,
        progress=on_progress,
        input_root=tmp_path,
        triangulate_fn=_stub_triangulate,
        save_glb_fn=_stub_save_glb,
    )

    assert len(progress_history) >= 5
    # Non-decreasing progress
    pcts = [p[1] for p in progress_history]
    assert pcts == sorted(pcts)
    assert pcts[0] >= 0.0
    assert pcts[-1] <= 1.0

    stages = [p[0] for p in progress_history]
    assert "PREPARING" in stages
    assert "INFER_GEOMETRY" in stages
    assert "BUILD_MESH" in stages
    assert "FINALIZING" in stages


def test_pipeline_cache_hit_skips_provider(tmp_path):
    source, _ = _setup_image(tmp_path)
    settings = ReconstructionSettings(provider="fake")

    inference_count = 0

    class TrackingProvider(FakeReconstructionProvider):
        def reconstruct(self, *args, **kwargs):
            nonlocal inference_count
            inference_count += 1
            return super().reconstruct(*args, **kwargs)

    provider = TrackingProvider(grid_size=16)

    # First run (cache miss)
    out1 = run_reconstruction_pipeline(
        source=source,
        settings=settings,
        provider=provider,
        input_root=tmp_path,
        triangulate_fn=_stub_triangulate,
        save_glb_fn=_stub_save_glb,
    )
    assert inference_count == 1

    # Second run (cache hit)
    out2 = run_reconstruction_pipeline(
        source=source,
        settings=settings,
        provider=provider,
        input_root=tmp_path,
        triangulate_fn=_stub_triangulate,
        save_glb_fn=_stub_save_glb,
    )
    assert inference_count == 1  # Should NOT run inference again
    assert out1.fingerprint == out2.fingerprint


def test_pipeline_cancellation(tmp_path):
    source, _ = _setup_image(tmp_path)
    settings = ReconstructionSettings(provider="fake")
    provider = FakeReconstructionProvider(grid_size=16)

    token = FakeCancelToken()
    token.cancel()

    with pytest.raises(ReconCancelledError):
        run_reconstruction_pipeline(
            source=source,
            settings=settings,
            provider=provider,
            cancel=token,
            input_root=tmp_path,
            triangulate_fn=_stub_triangulate,
            save_glb_fn=_stub_save_glb,
        )


def test_pipeline_empty_geometry(tmp_path):
    source, _ = _setup_image(tmp_path)
    settings = ReconstructionSettings(provider="fake")

    class EmptyProvider(FakeReconstructionProvider):
        def reconstruct(self, *args, **kwargs):
            return GeometryEvidence(points=None)

    with pytest.raises(ReconEmptyGeometryError):
        run_reconstruction_pipeline(
            source=source,
            settings=settings,
            provider=EmptyProvider(),
            input_root=tmp_path,
            triangulate_fn=_stub_triangulate,
            save_glb_fn=_stub_save_glb,
        )
