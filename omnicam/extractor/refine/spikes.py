"""Finding the frames where a solve visibly broke.

The hard part is not detecting large steps -- it is *not* detecting a camera
that is simply moving fast. A whip pan produces big deltas on every frame, and
a mean/standard-deviation test would flag the whole shot.

So the statistics here are robust: median and MAD, which a handful of outliers
cannot drag around, plus a ratio floor so a sample has to stand out from the
shot's own typical step, not merely from zero. A constant-speed move has every
delta at the median and is therefore never flagged, however fast it is.
"""

from __future__ import annotations

import math
from collections.abc import Sequence
from itertools import pairwise
from typing import Any

from ..transforms import quaternion_angle_degrees
from .types import PoseAnomaly

#: Scale factor making the MAD a consistent estimator of sigma for normal data.
MAD_TO_SIGMA = 1.4826

#: A flagged step must also be at least this many times the shot's typical step.
#: Without it, a perfectly steady move (MAD ~ 0) makes every rounding wobble a
#: statistical outlier.
MIN_SPIKE_RATIO = 1.8

#: Coverage below this, when the shot is otherwise healthy, is worth reporting.
COVERAGE_DROP = 0.6


def _median(values: Sequence[float]) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    middle = len(ordered) // 2
    if len(ordered) % 2:
        return float(ordered[middle])
    return float(ordered[middle - 1] + ordered[middle]) * 0.5


def robust_scores(values: Sequence[float]) -> tuple[list[float], float]:
    """Robust z-scores plus the median the ratio floor is measured against."""
    if not values:
        return [], 0.0
    median = _median(values)
    deviations = [abs(float(value) - median) for value in values]
    scale = MAD_TO_SIGMA * _median(deviations)
    if scale < 1e-12:
        # The MAD collapses to zero whenever more than half the steps are
        # identical -- which is exactly a perfectly regular move with one jump
        # in it, the case this detector exists for. Fall back to the mean
        # deviation, or to a fraction of the typical step, so the jump is still
        # measurable while a genuinely uniform run still scores zero.
        mean_deviation = sum(deviations) / len(deviations)
        scale = max(mean_deviation, abs(median) * 0.25, 1e-9)
    return [(float(value) - median) / scale for value in values], median


def _step_deltas(poses: Sequence[Any]) -> tuple[list[float], list[float]]:
    translations, rotations = [], []
    for previous, current in pairwise(poses):
        translations.append(
            math.sqrt(
                sum(
                    (float(current.position[axis]) - float(previous.position[axis])) ** 2
                    for axis in range(3)
                )
            )
        )
        rotations.append(quaternion_angle_degrees(previous.quaternion_xyzw, current.quaternion_xyzw))
    return translations, rotations


def _flag(
    poses: Sequence[Any],
    deltas: Sequence[float],
    sigma: float,
    kind: str,
    unit: str,
) -> list[PoseAnomaly]:
    scores, median = robust_scores(deltas)
    anomalies = []
    for index, (delta, score) in enumerate(zip(deltas, scores, strict=True)):
        if score <= sigma:
            continue
        if median > 1e-9 and delta < median * MIN_SPIKE_RATIO:
            continue
        pose = poses[index + 1]
        anomalies.append(
            PoseAnomaly(
                frame=int(pose.source_frame),
                kind=kind,
                severity=float(score),
                detail=f"{kind} step of {delta:.4g}{unit} against a typical {median:.4g}{unit}",
            )
        )
    return anomalies


def detect_pose_spikes(
    poses: Sequence[Any],
    *,
    translation_sigma: float = 4.0,
    rotation_sigma: float = 4.0,
    quality_samples: Sequence[Any] | None = None,
) -> list[PoseAnomaly]:
    """Frames whose step away from the previous pose does not fit the shot.

    Returns at most one anomaly per frame per kind, ordered by frame.
    """
    if len(poses) < 3:
        return []
    translations, rotations = _step_deltas(poses)
    anomalies = [
        *_flag(poses, translations, float(translation_sigma), "translation", " units"),
        *_flag(poses, rotations, float(rotation_sigma), "rotation", " deg"),
    ]

    for sample in quality_samples or []:
        coverage = float(getattr(sample, "coverage", 1.0))
        if coverage < COVERAGE_DROP:
            anomalies.append(
                PoseAnomaly(
                    frame=int(getattr(sample, "frame", 0)),
                    kind="coverage",
                    severity=float(COVERAGE_DROP - coverage),
                    detail=f"solver coverage fell to {coverage:.0%}",
                )
            )

    anomalies.sort(key=lambda anomaly: (anomaly.frame, anomaly.kind))
    return anomalies
