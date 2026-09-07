"""Deterministic view sampling for multi-view / video scans."""

from __future__ import annotations


def uniform_sample_indices(frame_count: int, max_views: int) -> list[int]:
    """Evenly spaced integer indices in ``[0, frame_count - 1]``.

    Endpoints are always included; duplicates (from rounding on a short clip)
    are collapsed, so the result can be shorter than ``max_views``.
    """
    if frame_count <= 0:
        return []
    count = min(frame_count, max(1, max_views))
    if count == 1:
        return [0]
    return sorted({round(i * (frame_count - 1) / (count - 1)) for i in range(count)})


def choose_segmentation_views(total_views: int, count: int) -> list[int]:
    """Pick which of ``total_views`` geometry views also get SAM3 run on them.

    A subset, uniformly spread, so a 24-view scan segments ~6 key views rather
    than paying for SAM3 24 times.
    """
    if total_views <= 0:
        return []
    return uniform_sample_indices(total_views, min(total_views, max(1, count)))
