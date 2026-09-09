"""Normalise backend quality readings into the provider-neutral
``metadata.solve_health_v1`` block the Director's timeline strip reads.

This is additive UI metadata only: it does not bump the MotionScene or track
schema version, and it never carries a provider-specific metric. The Director
grades against the normalised ``state`` and the optional ``score`` and nothing
else.

Contract::

    {
      "source": "extractor",
      "frames": [
        {"frame": 0, "state": "good",    "score": 0.98},
        {"frame": 1, "state": "warning", "score": 0.61},
        {"frame": 2, "state": "bad"}
      ]
    }

Rules honoured here:

* ``state`` is one of ``good | warning | bad | unknown``; anything a backend
  reports that is not one of those becomes ``unknown``.
* ``score`` is optional. It is emitted only when the backend gave a real,
  finite coverage/confidence number, clamped to ``[0, 1]``. A frame with no
  usable number simply has no ``score``.
* A frame with no sample is not listed. The frontend fills gaps with
  ``unknown`` -- a solve is never assumed ``good`` just because a frame exists.
* If nothing usable is present, this returns ``None`` and the caller omits the
  block entirely (an all-grey strip, no fabricated confidence).

The metadata validator caps list length at ``MAX_METADATA_ENTRIES`` (64), so at
most that many frame readings survive a round-trip; the extractor samples far
more sparsely than that in practice (``frame_step`` > 1), and denser input is
truncated rather than dropped wholesale.
"""

from __future__ import annotations

import math
from collections.abc import Sequence
from typing import Any

_STATES = ("good", "warning", "bad", "unknown")
_MAX_FRAMES = 64  # mirrors core.validation.MAX_METADATA_ENTRIES


def _coerce_state(value: Any) -> str:
    return value if value in _STATES else "unknown"


def _coerce_score(value: Any) -> float | None:
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(number):
        return None
    return max(0.0, min(1.0, number))


def _read(sample: Any, key: str) -> Any:
    if isinstance(sample, dict):
        return sample.get(key)
    return getattr(sample, key, None)


def normalize_solve_health(
    samples: Sequence[Any] | None,
    duration_frames: int,
    *,
    source: str = "extractor",
) -> dict[str, Any] | None:
    """Build a ``solve_health_v1`` block, or ``None`` when there is nothing to say.

    ``samples`` is any iterable of objects or dicts exposing ``frame``,
    ``state`` and (optionally) ``coverage`` / ``score``. Duplicate frames keep
    the last reading. Frames outside ``[0, duration_frames)`` are dropped.
    """
    if not samples:
        return None

    last = max(0, int(duration_frames)) - 1
    by_frame: dict[int, dict[str, Any]] = {}
    for sample in samples:
        raw_frame = _read(sample, "frame")
        try:
            frame = int(raw_frame)
        except (TypeError, ValueError):
            continue
        if frame < 0 or frame > last:
            continue

        entry: dict[str, Any] = {"frame": frame, "state": _coerce_state(_read(sample, "state"))}
        score = _coerce_score(_read(sample, "score"))
        if score is None:
            score = _coerce_score(_read(sample, "coverage"))
        if score is not None:
            entry["score"] = round(score, 6)
        by_frame[frame] = entry

    if not by_frame:
        return None

    frames = [by_frame[key] for key in sorted(by_frame)][:_MAX_FRAMES]
    block: dict[str, Any] = {"source": str(source), "frames": frames}
    if len(by_frame) > _MAX_FRAMES:
        block["truncated"] = True
    return block
