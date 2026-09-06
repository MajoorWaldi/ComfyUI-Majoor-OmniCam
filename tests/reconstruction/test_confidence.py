"""Tests for plane reconstruction confidence scoring."""

from __future__ import annotations

import pytest

from omnicam.reconstruction.confidence import (
    calculate_plane_confidence,
    confidence_band,
)


def test_confidence_calculation_formula():
    # 0.55 * inlier + 0.25 * orientation + 0.20 * coverage
    score = calculate_plane_confidence(inlier_ratio=1.0, orientation_score=1.0, coverage_score=1.0)
    assert pytest.approx(score) == 1.0

    score_half = calculate_plane_confidence(inlier_ratio=0.5, orientation_score=0.8, coverage_score=0.5)
    # 0.55 * 0.5 + 0.25 * 0.8 + 0.20 * 0.5 = 0.275 + 0.200 + 0.100 = 0.575
    assert pytest.approx(score_half) == 0.575


def test_confidence_clamping():
    score_high = calculate_plane_confidence(inlier_ratio=1.5, orientation_score=1.2, coverage_score=1.1)
    assert score_high == 1.0

    score_low = calculate_plane_confidence(inlier_ratio=-0.5, orientation_score=-0.2, coverage_score=-0.1)
    assert score_low == 0.0


def test_confidence_bands():
    assert confidence_band(0.85) == "high"
    assert confidence_band(0.75) == "high"
    assert confidence_band(0.74) == "medium"
    assert confidence_band(0.45) == "medium"
    assert confidence_band(0.44) == "low"
    assert confidence_band(0.10) == "low"
