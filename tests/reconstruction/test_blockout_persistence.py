"""Tests for blockout.json / scan_evidence.json persistence (plan Task 35)."""

from __future__ import annotations

import json

import pytest

from omnicam.reconstruction.asset_writer import (
    AssetWriterSecurityError,
    write_blockout_json,
    write_scan_evidence_json,
)


def test_blockout_json_atomic_and_light(tmp_path):
    path = write_blockout_json(
        fingerprint="abc123",
        blockout={
            "objects": [{"object_id": "chair_1", "semantic_class": "chair"}],
            "room": [{"object_id": "reconstruction_ground"}],
            "source_camera": {"fov": 45.0},
            "provider_summary": {"geometry": "fake"},
        },
        input_root=tmp_path,
    )
    assert path.name == "blockout.json"
    assert not path.with_suffix(".json.tmp").exists()  # temp file replaced
    data = json.loads(path.read_text())
    assert data["version"] == 1
    assert data["objects"][0]["object_id"] == "chair_1"
    assert "points" not in json.dumps(data)  # no dense payload


def test_scan_evidence_caps_cameras_and_omits_tensors(tmp_path):
    cams = [{"view_index": i, "extrinsic_camera_from_world": [[1, 0], [0, 1]]} for i in range(30)]
    path = write_scan_evidence_json(
        fingerprint="def456", cameras=cams, max_views=8, input_root=tmp_path,
        extra={"segmentation_views": [0, 4]},
    )
    data = json.loads(path.read_text())
    assert len(data["cameras"]) == 8
    assert data["segmentation_views"] == [0, 4]


def test_rejects_bad_fingerprint(tmp_path):
    with pytest.raises(AssetWriterSecurityError):
        write_blockout_json(fingerprint="../evil", blockout={}, input_root=tmp_path)


def test_blockout_json_written_by_single_blockout_pipeline(tmp_path):
    from PIL import Image

    from omnicam.reconstruction.pipelines.single_blockout import run_single_blockout_pipeline
    from omnicam.reconstruction.segmentation.fake import FakeSegmentationProvider
    from omnicam.reconstruction.settings import ReconstructionSettings
    from omnicam.reconstruction.types import ReconstructionSource

    from .fakes import FakeReconstructionProvider

    Image.new("RGB", (16, 16), (100, 100, 100)).save(tmp_path / "room.png")
    run_single_blockout_pipeline(
        source=ReconstructionSource(kind="annotated_input", value="room.png"),
        settings=ReconstructionSettings(mode="blockout", provider="fake", semantic_labels=("chair",)),
        geometry_provider=FakeReconstructionProvider(grid_size=64),
        segmentation_provider=FakeSegmentationProvider(),
        input_root=tmp_path,
    )
    hits = list((tmp_path / "majoor_omnicam" / "reconstruction").rglob("blockout.json"))
    assert len(hits) == 1
    assert json.loads(hits[0].read_text())["version"] == 1


def test_blockout_pipeline_reuses_cache_on_second_run(tmp_path):
    from PIL import Image

    from omnicam.reconstruction.pipelines.single_blockout import run_single_blockout_pipeline
    from omnicam.reconstruction.segmentation.fake import FakeSegmentationProvider
    from omnicam.reconstruction.settings import ReconstructionSettings
    from omnicam.reconstruction.types import ReconstructionSource

    from .fakes import FakeReconstructionProvider

    Image.new("RGB", (16, 16), (90, 90, 90)).save(tmp_path / "room.png")
    src = ReconstructionSource(kind="annotated_input", value="room.png")
    settings = ReconstructionSettings(mode="blockout", provider="fake", semantic_labels=("chair",))

    calls = {"n": 0}
    real = FakeReconstructionProvider(grid_size=64)

    class _CountingGeo:
        provider_id = "fake"

        def capabilities(self):
            return real.capabilities()

        def reconstruct(self, **kw):
            calls["n"] += 1
            return real.reconstruct(**kw)

    kwargs = dict(
        source=src,
        settings=settings,
        geometry_provider=_CountingGeo(),
        segmentation_provider=FakeSegmentationProvider(),
        input_root=tmp_path,
    )
    out1 = run_single_blockout_pipeline(**kwargs)
    out2 = run_single_blockout_pipeline(**kwargs)

    assert calls["n"] == 1, "second blockout run must hit the cache, not re-infer"
    assert out1.motion_scene == out2.motion_scene
