"""Retime and speed F-Curve engine for OmniCam Sequencer.

Provides pure-math evaluation, integral displacement, RetimeMap construction,
and F-Curve splitting with tangent continuity.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class RetimeKey:
    frame: float
    value: float = 1.0
    interpolation: str = "bezier"  # "constant", "linear", "bezier"
    tangents: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "frame": self.frame,
            "value": self.value,
            "interpolation": self.interpolation,
            "tangents": dict(self.tangents),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> RetimeKey:
        return cls(
            frame=float(data.get("frame", 0.0)),
            value=float(data.get("value", 1.0)),
            interpolation=str(data.get("interpolation", "bezier")),
            tangents=dict(data.get("tangents", {})),
        )


@dataclass
class RetimeCurve:
    keys: list[RetimeKey] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {"keys": [k.to_dict() for k in sorted(self.keys, key=lambda k: k.frame)]}

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> RetimeCurve:
        if not data or not isinstance(data, dict):
            return cls(keys=[RetimeKey(frame=0.0, value=1.0)])
        raw_keys = data.get("keys", [])
        if not isinstance(raw_keys, list) or not raw_keys:
            return cls(keys=[RetimeKey(frame=0.0, value=1.0)])
        keys = [RetimeKey.from_dict(k) for k in raw_keys if isinstance(k, dict)]
        keys.sort(key=lambda k: k.frame)
        return cls(keys=keys or [RetimeKey(frame=0.0, value=1.0)])


@dataclass
class RetimeMap:
    output_duration: int
    source_duration: int
    source_frames: list[float]  # source frame position per output frame
    speeds: list[float]  # instantaneous speed per output frame
    average_speed: float = 1.0
    minimum_speed: float = 1.0
    maximum_speed: float = 1.0

    def to_dict(self) -> dict[str, Any]:
        return {
            "output_duration": self.output_duration,
            "source_duration": self.source_duration,
            "average_speed": self.average_speed,
            "minimum_speed": self.minimum_speed,
            "maximum_speed": self.maximum_speed,
        }


def _solve_bezier_1d(p0: float, p1: float, p2: float, p3: float, t: float) -> float:
    """Evaluate 1D cubic Bezier value at parameter t in [0, 1]."""
    u = 1.0 - t
    return u * u * u * p0 + 3.0 * u * u * t * p1 + 3.0 * u * t * t * p2 + t * t * t * p3


def sample_speed(curve: RetimeCurve | dict[str, Any], frame: float, default_speed: float = 1.0) -> float:
    """Sample instantaneous speed from a RetimeCurve at any float frame."""
    if isinstance(curve, dict):
        curve = RetimeCurve.from_dict(curve)

    keys = curve.keys
    if not keys:
        return default_speed
    if len(keys) == 1:
        return max(0.01, float(keys[0].value))

    if frame <= keys[0].frame:
        return max(0.01, float(keys[0].value))
    if frame >= keys[-1].frame:
        return max(0.01, float(keys[-1].value))

    # Find bounding keyframes
    for i in range(len(keys) - 1):
        k0 = keys[i]
        k1 = keys[i + 1]
        if k0.frame <= frame <= k1.frame:
            span = k1.frame - k0.frame
            if span <= 1e-6:
                return max(0.01, float(k1.value))
            alpha = (frame - k0.frame) / span

            interp = k0.interpolation.lower()
            if interp == "constant":
                return max(0.01, float(k0.value))
            elif interp == "linear":
                val = k0.value + alpha * (k1.value - k0.value)
                return max(0.01, float(val))
            else:  # bezier
                # Extract tangent handles or synthesize smooth cubic bezier
                tangents0 = k0.tangents or {}
                tangents1 = k1.tangents or {}
                right_h = tangents0.get("right", {})
                left_h = tangents1.get("left", {})

                # Default 1/3 handle offsets if not explicitly authored
                y0 = k0.value
                y3 = k1.value
                y1 = y0 + float(right_h.get("y", 0.0)) if "y" in right_h else (y0 + (y3 - y0) / 3.0)
                y2 = y3 + float(left_h.get("y", 0.0)) if "y" in left_h else (y3 - (y3 - y0) / 3.0)

                val = _solve_bezier_1d(y0, y1, y2, y3, alpha)
                return max(0.01, float(val))

    return max(0.01, float(keys[-1].value))


def integrate_speed(
    curve: RetimeCurve | dict[str, Any],
    start_frame: float,
    end_frame: float,
    subdivisions: int = 4,
) -> float:
    """Numerically integrate speed between start_frame and end_frame using Simpson's/trapezoid rule."""
    if end_frame <= start_frame:
        return 0.0
    steps = max(1, int(round((end_frame - start_frame) * subdivisions)))
    dt = (end_frame - start_frame) / steps
    total = 0.0
    for s in range(steps):
        t0 = start_frame + s * dt
        t1 = t0 + dt
        s0 = sample_speed(curve, t0)
        s1 = sample_speed(curve, t1)
        total += 0.5 * (s0 + s1) * dt
    return total


def build_retime_map(
    curve: RetimeCurve | dict[str, Any] | None,
    source_duration: int,
    target_duration: int | None = None,
    mode: str = "absolute_speed",
    min_speed: float = 0.01,
    speed_scale: float = 1.0,
) -> RetimeMap:
    """Build a RetimeMap mapping each output timeline frame to source float frame and speed."""
    if curve is None:
        c = RetimeCurve(keys=[RetimeKey(frame=0.0, value=1.0)])
    elif isinstance(curve, dict):
        c = RetimeCurve.from_dict(curve)
    else:
        c = curve

    src_dur = max(1, int(source_duration))
    scale_per_tick = max(1e-6, float(speed_scale))

    if mode == "fit_duration" and target_duration is not None and target_duration > 0:
        out_dur = int(target_duration)
        # Compute integral over target duration with unscaled curve
        raw_integral = integrate_speed(c, 0.0, float(out_dur))
        scale = (src_dur / raw_integral) if raw_integral > 1e-6 else 1.0

        source_frames: list[float] = []
        speeds: list[float] = []
        current_src = 0.0
        for f in range(out_dur):
            spd = max(min_speed, sample_speed(c, float(f)) * scale)
            speeds.append(spd)
            source_frames.append(min(float(src_dur - 1), current_src))
            step_integral = integrate_speed(c, float(f), float(f + 1)) * scale
            current_src = min(float(src_dur), current_src + step_integral)

        avg_spd = sum(speeds) / max(1, len(speeds))
        return RetimeMap(
            output_duration=out_dur,
            source_duration=src_dur,
            source_frames=source_frames,
            speeds=speeds,
            average_speed=avg_spd,
            minimum_speed=min(speeds),
            maximum_speed=max(speeds),
        )

    # Mode absolute_speed: curve speed determines output duration
    source_frames = []
    speeds = []
    current_src = 0.0
    out_frame = 0
    max_output_frames = max(10000, src_dur * 50)  # safety ceiling

    while current_src < src_dur and out_frame < max_output_frames:
        spd = max(min_speed, sample_speed(c, float(out_frame)))
        speeds.append(spd)
        source_frames.append(min(float(src_dur - 1), current_src))
        step_integral = integrate_speed(c, float(out_frame), float(out_frame + 1)) * scale_per_tick
        current_src += max(1e-4, step_integral)
        out_frame += 1

    out_dur = max(1, len(source_frames))
    avg_spd = sum(speeds) / max(1, len(speeds)) if speeds else 1.0
    return RetimeMap(
        output_duration=out_dur,
        source_duration=src_dur,
        source_frames=source_frames,
        speeds=speeds,
        average_speed=avg_spd,
        minimum_speed=min(speeds) if speeds else 1.0,
        maximum_speed=max(speeds) if speeds else 1.0,
    )


def output_frame_to_source_frame(output_frame: int, retime_map: RetimeMap) -> float:
    """Lookup source float frame from output frame."""
    if not retime_map.source_frames:
        return 0.0
    idx = max(0, min(output_frame, len(retime_map.source_frames) - 1))
    return retime_map.source_frames[idx]


def split_retime_curve(curve: RetimeCurve | dict[str, Any], split_frame: float) -> tuple[RetimeCurve, RetimeCurve]:
    """Split a RetimeCurve at split_frame into two continuous curves.

    Curve A spans [0, split_frame].
    Curve B is rebased so split_frame becomes frame 0.
    """
    if isinstance(curve, dict):
        c = RetimeCurve.from_dict(curve)
    else:
        c = curve

    split_spd = sample_speed(c, split_frame)
    keys = sorted(c.keys, key=lambda k: k.frame)

    keys_a: list[RetimeKey] = []
    keys_b: list[RetimeKey] = []

    # Insert keys before split
    for k in keys:
        if k.frame < split_frame:
            keys_a.append(RetimeKey(frame=k.frame, value=k.value, interpolation=k.interpolation, tangents=dict(k.tangents)))
        elif k.frame > split_frame:
            # Rebase frame to split_frame
            keys_b.append(RetimeKey(frame=k.frame - split_frame, value=k.value, interpolation=k.interpolation, tangents=dict(k.tangents)))

    # Boundary keys at split
    keys_a.append(RetimeKey(frame=split_frame, value=split_spd, interpolation="bezier"))
    keys_b.insert(0, RetimeKey(frame=0.0, value=split_spd, interpolation="bezier"))

    return RetimeCurve(keys=keys_a), RetimeCurve(keys=keys_b)
