"""Tests for reconstruction pipeline orchestration."""

from __future__ import annotations

from pathlib import Path

import pytest
import torch
from PIL import Image

from omnicam.comfy_compat.gpu_guard import GpuContentionGuard
from omnicam.reconstruction.errors import (
    ReconCancelledError,
    ReconEmptyGeometryError,
    ReconGpuContentionError,
)
from omnicam.reconstruction.pipeline import (
    PipelineOutput,
    _resolve_provider_version,
    run_reconstruction_pipeline,
)
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import GeometryEvidence, ReconstructionSource

from .fakes import FakeCancelToken, FakeReconstructionProvider


def _setup_image(tmp_path: Path) -> tuple[ReconstructionSource, Path]:
    img_file = tmp_path / "test_input.png"
    # resolve_reconstruction_source now reads the real image header (pixel
    # decode-bomb guard), so this needs to be a real, decodable PNG.
    Image.new("RGB", (4, 4), color=(128, 64, 32)).save(img_file, format="PNG")
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


def test_hash_file_streams_instead_of_reading_the_whole_file_at_once(tmp_path):
    import hashlib

    from omnicam.reconstruction.pipeline import _HASH_CHUNK_BYTES, _hash_file

    data = bytes(range(256)) * (_HASH_CHUNK_BYTES // 4)  # spans multiple chunks
    f = tmp_path / "big.bin"
    f.write_bytes(data)

    expected = hashlib.sha256(data).hexdigest()[:16]
    assert _hash_file(f) == expected


def test_pipeline_end_to_end_fake_provider(tmp_path):
    source, _ = _setup_image(tmp_path)
    settings = ReconstructionSettings(provider="fake", triangle_budget=10_000)
    provider = FakeReconstructionProvider(grid_size=64)

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


def test_reconstruction_stops_if_prompt_starts_mid_inference(tmp_path):
    """A ComfyUI workflow queued after admission must not race MoGe for VRAM.

    The guard is armed right before the provider touches the GPU (see
    pipeline.py) and polled on every progress checkpoint after that -- the
    same checkpoints FakeReconstructionProvider's inference_progress calls
    already drive. Flipping the probe busy partway through must interrupt the
    run with RECON_GPU_CONTENTION, not a silent hang or a raw OOM later.
    """
    source, _ = _setup_image(tmp_path)
    settings = ReconstructionSettings(provider="fake")
    provider = FakeReconstructionProvider(grid_size=64)

    probe_calls = {"n": 0}

    def execution_probe() -> bool:
        probe_calls["n"] += 1
        # Idle at admission (never checked here) and for the first poll, then
        # a workflow "starts" -- busy from here on, matching a real queue.
        return probe_calls["n"] > 1

    guard = GpuContentionGuard(execution_probe=execution_probe, poll_seconds=0.0)

    with pytest.raises(ReconGpuContentionError, match="ComfyUI workflow"):
        run_reconstruction_pipeline(
            source=source,
            settings=settings,
            provider=provider,
            input_root=tmp_path,
            triangulate_fn=_stub_triangulate,
            save_glb_fn=_stub_save_glb,
            gpu_guard=guard,
        )

    assert probe_calls["n"] >= 2


def test_reconstruction_cache_hit_never_touches_the_gpu_guard(tmp_path):
    """A cache hit returns before the provider (or the GPU) is ever touched.

    The guard only arms once the pipeline reaches inference; a run resolved
    entirely from the on-disk cache must succeed even against a probe that
    would otherwise fail it immediately.
    """
    source, _ = _setup_image(tmp_path)
    settings = ReconstructionSettings(provider="fake")
    provider = FakeReconstructionProvider(grid_size=64)

    # First run: populates the cache, GPU genuinely idle.
    first = run_reconstruction_pipeline(
        source=source,
        settings=settings,
        provider=provider,
        input_root=tmp_path,
        triangulate_fn=_stub_triangulate,
        save_glb_fn=_stub_save_glb,
        gpu_guard=GpuContentionGuard(execution_probe=lambda: False, poll_seconds=0.0),
    )
    assert isinstance(first, PipelineOutput)

    # Second run: same fingerprint, so it must be served from cache. A probe
    # that always reports busy must never be consulted -- check.force alone
    # would fail this if the cache path armed or force-checked the guard.
    def always_busy() -> bool:
        pytest.fail("cache hit must not consult the GPU guard at all")

    second = run_reconstruction_pipeline(
        source=source,
        settings=settings,
        provider=provider,
        input_root=tmp_path,
        triangulate_fn=_stub_triangulate,
        save_glb_fn=_stub_save_glb,
        gpu_guard=GpuContentionGuard(execution_probe=always_busy, poll_seconds=0.0),
    )
    assert second.fingerprint == first.fingerprint


def test_pipeline_progress_bands(tmp_path):
    source, _ = _setup_image(tmp_path)
    settings = ReconstructionSettings(provider="fake")
    provider = FakeReconstructionProvider(grid_size=64)

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

    provider = TrackingProvider(grid_size=64)

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
    provider = FakeReconstructionProvider(grid_size=64)

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


def test_cache_key_changes_with_checkpoint():
    """_resolve_provider_version must produce a different string for two
    different checkpoints, even if everything else about the provider is
    identical -- this is the mechanism that keeps a cache hit from serving a
    GLB generated by a checkpoint that isn't the active one anymore."""
    version_a = _resolve_provider_version(
        {"active_checkpoint": {"name": "moge-v1.pt", "size": 100, "mtime_ns": 111}}
    )
    version_b = _resolve_provider_version(
        {"active_checkpoint": {"name": "moge-v2.pt", "size": 200, "mtime_ns": 222}}
    )
    assert version_a != version_b


def test_cache_key_changes_with_provider_version(tmp_path):
    """End to end: swapping the active checkpoint between two runs of the
    same source image and settings must not serve the first run's cached GLB
    -- provider() re-runs, proving lookup_cache actually rejected the stale
    provider_version rather than silently reusing it."""
    source, _ = _setup_image(tmp_path)
    settings = ReconstructionSettings(provider="fake")

    inference_count = 0

    class VersionedProvider(FakeReconstructionProvider):
        def __init__(self, checkpoint_name: str, **kwargs) -> None:
            super().__init__(**kwargs)
            self._checkpoint_name = checkpoint_name

        def capabilities(self):
            caps = super().capabilities()
            caps.metadata = {"active_checkpoint": {"name": self._checkpoint_name, "size": 1, "mtime_ns": 1}}
            return caps

        def reconstruct(self, *args, **kwargs):
            nonlocal inference_count
            inference_count += 1
            return super().reconstruct(*args, **kwargs)

    provider_a = VersionedProvider("checkpoint_a.pt", grid_size=64)
    out1 = run_reconstruction_pipeline(
        source=source, settings=settings, provider=provider_a, input_root=tmp_path,
        triangulate_fn=_stub_triangulate, save_glb_fn=_stub_save_glb,
    )
    assert inference_count == 1

    # Same fingerprint inputs, but the "active" checkpoint changed underneath.
    provider_b = VersionedProvider("checkpoint_b.pt", grid_size=64)
    out2 = run_reconstruction_pipeline(
        source=source, settings=settings, provider=provider_b, input_root=tmp_path,
        triangulate_fn=_stub_triangulate, save_glb_fn=_stub_save_glb,
    )

    assert inference_count == 2  # re-ran; the stale-checkpoint hit was rejected
    assert out1.fingerprint == out2.fingerprint  # same content fingerprint
