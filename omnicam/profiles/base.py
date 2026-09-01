"""Strict, model-facing profile contracts for MotionScene compilation."""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any, Protocol, runtime_checkable

from ..core.motion_sampling import last_frame_time_seconds
from ..core.motion_scene import MotionScene

if TYPE_CHECKING:
    from ..monitor.result import Check, CompiledMotion, ResolvedTimeline


MOTION_SEMANTICS = frozenset({"camera_embedding", "reference_video", "screen_tracks"})
FRAME_POLICIES = frozenset(
    {
        "requested_length",
        "track_length",
        "requested_length_with_121_source_grid",
        "fixed_121",
        "17n_plus_5_at_24fps",
        "api_duration_seconds",
        "8n_plus_1",
    }
)

_PROFILE_ID_PATTERN = re.compile(r"^[a-z][a-z0-9_]*$")


def validate_profile_id(value: Any) -> str:
    if not isinstance(value, str) or not _PROFILE_ID_PATTERN.fullmatch(value):
        raise ValueError("profile id must use lowercase snake_case")
    return value


def validate_semantic(value: Any) -> str:
    if value not in MOTION_SEMANTICS:
        raise ValueError(f"semantic must be one of {sorted(MOTION_SEMANTICS)}")
    return str(value)


def validate_frame_policy(value: Any) -> str:
    if value not in FRAME_POLICIES:
        raise ValueError(f"frame_policy must be one of {sorted(FRAME_POLICIES)}")
    return str(value)


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
class CompileRequest:
    """Validated Monitor inputs shared by every explicit target profile."""

    motion_scene: MotionScene
    playblast_video: Any | None
    base_prompt: str
    target_width: int
    target_height: int
    duration_seconds: float
    target_fps: float

    def __post_init__(self) -> None:
        if not isinstance(self.motion_scene, MotionScene):
            raise TypeError("motion_scene must be a MotionScene")
        if not isinstance(self.base_prompt, str):
            raise TypeError("base_prompt must be a string")
        _positive_int(self.target_width, "target_width")
        _positive_int(self.target_height, "target_height")
        object.__setattr__(
            self,
            "duration_seconds",
            _positive_finite(self.duration_seconds, "duration_seconds"),
        )
        object.__setattr__(self, "target_fps", _positive_finite(self.target_fps, "target_fps"))

    @property
    def source_frame_count(self) -> int:
        """How many frames the authored shot actually has."""
        return max(1, math.ceil(self.duration_seconds * self.target_fps))

    @property
    def source_last_frame_time(self) -> float:
        """Timestamp of the shot's final frame: (frame_count - 1) / fps.

        Every trajectory is sampled across [0, source_last_frame_time]. Sampling
        across [0, duration_seconds] instead spans one frame too many and dilates
        the whole track -- 1/23.5 s per step instead of 1/24 s on a 2 second,
        24 fps shot.

        Deliberately derived from the *request*, never from a profile's resolved
        timeline: ATI pads to a fixed 121-sample grid and LTX rounds its length
        up, so their frame_count is a target grid, not the shot.
        """
        return last_frame_time_seconds(self.source_frame_count, self.target_fps)


@runtime_checkable
class MotionProfile(Protocol):
    """One exact upstream motion-control contract, never a capability family."""

    id: str
    display_name: str
    semantic: str
    frame_policy: str

    def resolve_timeline(self, request: CompileRequest) -> ResolvedTimeline: ...

    def preflight(self, request: CompileRequest) -> list[Check]: ...

    def compile(self, request: CompileRequest) -> CompiledMotion: ...

