"""What the user is allowed to change about a finished solve.

The boundary this file draws is the product boundary: Extractor *corrects the
reconstruction*, Director *changes the intention*. Everything here is a global
or statistical correction to what the solver reported. There is no per-key
authoring, because a key the user moved by hand is a creative decision, and
creative decisions belong to the Director.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

#: What the user can do about a detected anomaly.
SPIKE_ACTIONS = ("interpolate", "ignore", "exclude")

ANOMALY_KINDS = ("translation", "rotation", "coverage")


@dataclass(slots=True, frozen=True)
class PoseAnomaly:
    """One suspicious sample, with the measurement that made it suspicious."""

    frame: int
    kind: str
    severity: float
    detail: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "frame": int(self.frame),
            "kind": self.kind,
            "severity": round(float(self.severity), 3),
            "detail": self.detail,
        }


@dataclass(slots=True)
class RefinementSettings:
    position_smoothing: float = 0.15
    rotation_smoothing: float = 0.10
    motion_scale: float = 1.0
    normalize_origin: bool = True

    #: Source-frame bounds, inclusive. ``trim_end_frame = 0`` means "to the end".
    trim_start_frame: int = 0
    trim_end_frame: int = 0

    #: One global world rotation, never a per-key one.
    global_rotation_xyzw: list[float] | None = None
    #: Ask the server to derive that rotation from the solve's own average up
    #: vector. An explicit rotation always wins: the estimate is a suggestion,
    #: and a user who has dialled in an angle has already overruled it.
    estimate_up: bool = False

    #: source frame -> one of SPIKE_ACTIONS
    spike_actions: dict[int, str] = field(default_factory=dict)

    simplify_keys: bool = True
    position_tolerance: float = 0.01
    rotation_tolerance_deg: float = 0.25

    @classmethod
    def from_dict(cls, payload: Any) -> RefinementSettings:
        """Build settings from an untrusted request body, clamped to sane ranges."""
        data = payload if isinstance(payload, dict) else {}

        def number(name: str, default: float, low: float, high: float) -> float:
            try:
                value = float(data.get(name, default))
            except (TypeError, ValueError):
                return default
            if value != value or value in (float("inf"), float("-inf")):
                return default
            return max(low, min(high, value))

        def integer(name: str, default: int, low: int, high: int) -> int:
            try:
                return max(low, min(high, int(data.get(name, default))))
            except (TypeError, ValueError):
                return default

        rotation = data.get("global_rotation_xyzw")
        if isinstance(rotation, (list, tuple)) and len(rotation) == 4:
            try:
                rotation = [float(component) for component in rotation]
            except (TypeError, ValueError):
                rotation = None
            else:
                if any(component != component for component in rotation):
                    rotation = None
        else:
            rotation = None

        actions: dict[int, str] = {}
        raw_actions = data.get("spike_actions")
        if isinstance(raw_actions, dict):
            for frame, action in list(raw_actions.items())[:4096]:
                try:
                    frame_number = int(frame)
                except (TypeError, ValueError):
                    continue
                if str(action) in SPIKE_ACTIONS and frame_number >= 0:
                    actions[frame_number] = str(action)

        return cls(
            position_smoothing=number("position_smoothing", 0.15, 0.0, 1.0),
            rotation_smoothing=number("rotation_smoothing", 0.10, 0.0, 1.0),
            motion_scale=number("motion_scale", 1.0, 0.01, 100.0),
            normalize_origin=bool(data.get("normalize_origin", True)),
            trim_start_frame=integer("trim_start_frame", 0, 0, 10_000_000),
            trim_end_frame=integer("trim_end_frame", 0, 0, 10_000_000),
            global_rotation_xyzw=rotation,
            estimate_up=bool(data.get("estimate_up", False)),
            spike_actions=actions,
            simplify_keys=bool(data.get("simplify_keys", True)),
            position_tolerance=number("position_tolerance", 0.01, 0.0, 10.0),
            rotation_tolerance_deg=number("rotation_tolerance_deg", 0.25, 0.0, 20.0),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "position_smoothing": self.position_smoothing,
            "rotation_smoothing": self.rotation_smoothing,
            "motion_scale": self.motion_scale,
            "normalize_origin": self.normalize_origin,
            "trim_start_frame": self.trim_start_frame,
            "trim_end_frame": self.trim_end_frame,
            "global_rotation_xyzw": self.global_rotation_xyzw,
            "estimate_up": self.estimate_up,
            "spike_actions": {str(frame): action for frame, action in sorted(self.spike_actions.items())},
            "simplify_keys": self.simplify_keys,
            "position_tolerance": self.position_tolerance,
            "rotation_tolerance_deg": self.rotation_tolerance_deg,
        }
