"""Reconstruction confidence evaluation and categorization."""

from __future__ import annotations


def calculate_plane_confidence(
    *,
    inlier_ratio: float,
    orientation_score: float,
    coverage_score: float,
) -> float:
    """Compute confidence score for a detected plane candidate in [0.0, 1.0]."""
    score = 0.55 * inlier_ratio + 0.25 * orientation_score + 0.20 * coverage_score
    return max(0.0, min(1.0, float(score)))


def confidence_band(confidence: float) -> str:
    """Return 'high', 'medium', or 'low' confidence tier."""
    val = float(confidence)
    if val >= 0.75:
        return "high"
    if val >= 0.45:
        return "medium"
    return "low"
