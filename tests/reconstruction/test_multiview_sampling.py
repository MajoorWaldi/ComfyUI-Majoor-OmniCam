"""Tests for multi-view sampling (plan Tasks 20, 26)."""

from __future__ import annotations

from omnicam.reconstruction.multiview.sampling import (
    choose_segmentation_views,
    uniform_sample_indices,
)


def test_uniform_sample_indices_pins():
    assert uniform_sample_indices(0, 10) == []
    assert uniform_sample_indices(5, 1) == [0]
    assert uniform_sample_indices(10, 10) == list(range(10))
    assert uniform_sample_indices(100, 5) == [0, 25, 50, 74, 99]
    # short clip: rounding collapses duplicates, endpoints kept
    assert uniform_sample_indices(3, 8) == [0, 1, 2]


def test_uniform_sample_includes_endpoints():
    for n in (7, 24, 50, 240):
        idx = uniform_sample_indices(n, 6)
        assert idx[0] == 0
        assert idx[-1] == n - 1
        assert idx == sorted(set(idx))


def test_choose_segmentation_views_is_subset():
    seg = choose_segmentation_views(24, 6)
    assert len(seg) == 6
    assert seg[0] == 0 and seg[-1] == 23
    assert set(seg).issubset(set(range(24)))
    assert choose_segmentation_views(4, 6) == [0, 1, 2, 3]
    assert choose_segmentation_views(0, 6) == []


# --------------------------------------------------------------------------- #
# Task 21 -- managed image-set + video source resolution
# --------------------------------------------------------------------------- #
def test_sample_image_batch_preserves_dims_and_order():
    import numpy as np

    from omnicam.reconstruction.multiview.source import (
        image_batch_fingerprint,
        sample_image_batch,
    )

    batch = np.random.default_rng(0).random((8, 90, 120, 3)).astype("float32")
    samples = sample_image_batch(batch, max_views=4)
    assert [s.source_frame for s in samples] == [0, 2, 5, 7]
    assert all(s.width == 120 and s.height == 90 for s in samples)
    assert [s.view_index for s in samples] == [0, 1, 2, 3]
    # fingerprint is order sensitive
    assert image_batch_fingerprint(batch) != image_batch_fingerprint(batch[::-1])


def test_video_scan_rejects_traversal_and_bad_extension(tmp_path):
    import pytest

    from omnicam.reconstruction.errors import ReconSourceInvalidError, ReconSourceUnsupportedError
    from omnicam.reconstruction.multiview.source import sample_video_scan

    with pytest.raises(ReconSourceInvalidError):
        sample_video_scan("../secrets.mp4", roots=[tmp_path], max_views=4)

    bad = tmp_path / "clip.gif"
    bad.write_bytes(b"GIF89a")
    with pytest.raises((ReconSourceUnsupportedError, ReconSourceInvalidError)):
        sample_video_scan("clip.gif", roots=[tmp_path], max_views=4)
