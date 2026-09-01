"""Typed timeline, preflight and compiled-output values shared by profiles."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any

from ..profiles.base import validate_frame_policy, validate_profile_id, validate_semantic

CHECK_STATES = frozenset({"PASS", "WARNING", "BLOCKED", "RISK"})


def _non_empty(value: Any, name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{name} must be a non-empty string")
    return value


def _positive_int(value: Any, name: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise ValueError(f"{name} must be a positive integer")
    return value


def _positive_finite(value: Any, name: str) -> float:
    if isinstance(value, bool):
        raise ValueError(f"{name} must be a positive finite number")
    try:
        number = float(value)
    except (TypeError, ValueError) as error:
        raise ValueError(f"{name} must be a positive finite number") from error
    if not math.isfinite(number) or number <= 0:
        raise ValueError(f"{name} must be a positive finite number")
    return number


@dataclass(frozen=True, slots=True)
class Check:
    id: str
    label: str
    state: str
    message: str = ""

    def __post_init__(self) -> None:
        _non_empty(self.id, "id")
        _non_empty(self.label, "label")
        if self.state not in CHECK_STATES:
            raise ValueError(f"state must be one of {sorted(CHECK_STATES)}")
        if not isinstance(self.message, str):
            raise TypeError("message must be a string")


@dataclass(frozen=True, slots=True)
class ResolvedTimeline:
    width: int
    height: int
    fps: float
    duration_seconds: float
    frame_count: int
    frame_policy: str

    def __post_init__(self) -> None:
        _positive_int(self.width, "width")
        _positive_int(self.height, "height")
        object.__setattr__(self, "fps", _positive_finite(self.fps, "fps"))
        object.__setattr__(
            self,
            "duration_seconds",
            _positive_finite(self.duration_seconds, "duration_seconds"),
        )
        _positive_int(self.frame_count, "frame_count")
        validate_frame_policy(self.frame_policy)

    @property
    def target_length(self) -> int:
        return self.frame_count


@dataclass(frozen=True, slots=True)
class CompiledMotion:
    """Static Monitor output superset plus the exact resolved contract."""

    profile_id: str
    semantic: str
    timeline: ResolvedTimeline
    final_prompt: str = ""
    reference_video: Any | None = None
    reference_frames: Any | None = None
    camera_embedding: Any | None = None
    native_tracks: Any | None = None
    tracks_json: str = ""
    checks: tuple[Check, ...] = ()

    def __post_init__(self) -> None:
        validate_profile_id(self.profile_id)
        validate_semantic(self.semantic)
        if not isinstance(self.timeline, ResolvedTimeline):
            raise TypeError("timeline must be a ResolvedTimeline")
        if not isinstance(self.final_prompt, str):
            raise TypeError("final_prompt must be a string")
        if not isinstance(self.tracks_json, str):
            raise TypeError("tracks_json must be a string")
        checks = tuple(self.checks)
        if not all(isinstance(check, Check) for check in checks):
            raise TypeError("checks must contain Check values")
        object.__setattr__(self, "checks", checks)

    @property
    def target_width(self) -> int:
        return self.timeline.width

    @property
    def target_height(self) -> int:
        return self.timeline.height

    @property
    def target_length(self) -> int:
        return self.timeline.frame_count

