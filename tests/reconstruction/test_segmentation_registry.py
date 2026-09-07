"""Tests for segmentation contracts + fake provider (plan Task 10)."""

from __future__ import annotations

import numpy as np
import pytest

from omnicam.reconstruction.blockout.types import InstanceEvidence
from omnicam.reconstruction.errors import ReconCancelledError, ReconProviderUnavailableError
from omnicam.reconstruction.segmentation import (
    DEFAULT_BLOCKOUT_LABELS,
    get_segmentation_provider,
    list_segmentation_providers,
    resolve_semantic_labels,
)
from omnicam.reconstruction.segmentation.base import SegmentationCapabilities
from omnicam.reconstruction.settings import ReconstructionSettings


def test_default_taxonomy_shape():
    assert "chair" in DEFAULT_BLOCKOUT_LABELS
    assert "car" in DEFAULT_BLOCKOUT_LABELS
    # scene-agnostic: covers exterior too, and drops the indoor-only props SAM3
    # hallucinates on outdoor scenes (counter / cabinet / desk / monitor / ...).
    assert {"building", "tree", "truck"} <= set(DEFAULT_BLOCKOUT_LABELS)
    assert not ({"counter", "cabinet", "desk", "monitor", "armchair"} & set(DEFAULT_BLOCKOUT_LABELS))
    assert len(DEFAULT_BLOCKOUT_LABELS) == 15
    assert len(set(DEFAULT_BLOCKOUT_LABELS)) == len(DEFAULT_BLOCKOUT_LABELS)


def test_resolve_semantic_labels_falls_back_and_dedupes():
    assert resolve_semantic_labels(None) == list(DEFAULT_BLOCKOUT_LABELS)
    assert resolve_semantic_labels(()) == list(DEFAULT_BLOCKOUT_LABELS)
    assert resolve_semantic_labels(["Chair", "chair", " table "]) == ["Chair", "table"]


def test_registry_lists_and_resolves_fake():
    assert "fake" in list_segmentation_providers()
    provider = get_segmentation_provider("fake")
    assert provider.provider_id == "fake"
    with pytest.raises(ReconProviderUnavailableError):
        get_segmentation_provider("does_not_exist")


def test_fake_provider_capabilities_available():
    caps = get_segmentation_provider("fake").capabilities()
    assert isinstance(caps, SegmentationCapabilities)
    assert caps.available is True
    assert caps.to_dict()["provider_id"] == "fake"


def test_fake_provider_is_deterministic_and_labels_masks():
    image = np.zeros((120, 160, 3), np.float32)
    labels = ["chair", "table", "person"]
    settings = ReconstructionSettings(mode="blockout")
    provider = get_segmentation_provider("fake")

    a = provider.segment(image, labels, settings)
    b = provider.segment(image, labels, settings)

    assert len(a) == 3
    assert all(isinstance(x, InstanceEvidence) for x in a)
    assert [x.label for x in a] == labels
    for x, y in zip(a, b):
        assert x.instance_id == y.instance_id
        assert np.array_equal(x.mask, y.mask)
        assert x.mask.shape == (120, 160)
        assert x.mask.any()


def test_fake_provider_reports_progress_and_honours_cancel():
    image = np.zeros((64, 64, 3), np.float32)
    events: list[tuple[str, float, str]] = []
    provider = get_segmentation_provider("fake")
    provider.segment(image, ["chair", "table"], ReconstructionSettings(mode="blockout"),
                     progress=lambda *a: events.append(a))
    assert events and events[-1][1] == pytest.approx(1.0)

    class _Cancelled:
        def is_cancelled(self) -> bool:
            return True

    with pytest.raises(ReconCancelledError):
        provider.segment(image, ["chair"], ReconstructionSettings(mode="blockout"), cancel=_Cancelled())
