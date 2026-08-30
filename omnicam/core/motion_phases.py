"""Segment a camera track into the temporal phases a prompt can describe.

MiniMax H3 and LTX both read shot lists far better than a single global
sentence: "[0.0-1.8s] the camera pushes in ... [1.8-3.6s] it arcs right" says
strictly more than "the intended move is dolly in". The phases here are
*derived from the track*, never invented -- each one is a run of frames whose
dominant motion axis is stable, so a track that really is one continuous move
yields exactly one phase and the prompt stays short.

Decomposition is done in the camera's own basis (dolly/truck/crane) plus
pan/tilt/roll/FOV rates, which is why this lives next to ``camera_math``
rather than in an adapter: it is model-neutral description, not payload.
"""

from __future__ import annotations

import math
from itertools import pairwise
from typing import Any

from .camera_math import camera_basis
from .track import CameraState, OmniCamTrack

# A phase shorter than this reads as noise in a prompt, not as direction.
MIN_PHASE_SECONDS = 0.6
MAX_PHASES = 4

# Per-frame rate below which an axis is considered inactive. Expressed per
# second so the thresholds do not change meaning with the track's fps.
TRANSLATION_EPSILON = 0.05  # world units/s
ROTATION_EPSILON = 2.0  # degrees/s
FOV_EPSILON = 1.0  # degrees/s

AXIS_PHRASES = {
    "dolly_in": "pushes in toward the subject",
    "dolly_out": "pulls back away from the subject",
    "truck_right": "tracks laterally to camera-right",
    "truck_left": "tracks laterally to camera-left",
    "crane_up": "cranes upward",
    "crane_down": "cranes downward",
    "pan_right": "pans to the right",
    "pan_left": "pans to the left",
    "tilt_up": "tilts upward",
    "tilt_down": "tilts downward",
    "roll": "rolls into a Dutch angle",
    "zoom_in": "zooms in optically",
    "zoom_out": "zooms out optically",
    "hold": "holds a locked, static frame",
}


def _unit(vector: list[float]) -> list[float]:
    magnitude = math.sqrt(sum(value * value for value in vector))
    return [value / max(1e-12, magnitude) for value in vector]


def _clamp(value: float) -> float:
    return max(-1.0, min(1.0, value))


def _rates(previous: CameraState, current: CameraState, fps: int) -> dict[str, float]:
    """Signed per-second rates of every motion axis between two frames."""
    delta = [current.position[i] - previous.position[i] for i in range(3)]
    right, up, forward = camera_basis(previous.position, previous.target, previous.roll)
    forward_a = _unit([previous.target[i] - previous.position[i] for i in range(3)])
    forward_b = _unit([current.target[i] - current.position[i] for i in range(3)])
    yaw_a, yaw_b = math.atan2(forward_a[0], -forward_a[2]), math.atan2(forward_b[0], -forward_b[2])
    pan = math.degrees((yaw_b - yaw_a + math.pi) % (2.0 * math.pi) - math.pi)
    tilt = math.degrees(math.asin(_clamp(forward_b[1])) - math.asin(_clamp(forward_a[1])))
    return {
        "dolly": sum(delta[i] * forward[i] for i in range(3)) * fps,
        "truck": sum(delta[i] * right[i] for i in range(3)) * fps,
        "crane": sum(delta[i] * up[i] for i in range(3)) * fps,
        "pan": pan * fps,
        "tilt": tilt * fps,
        "roll": (current.roll - previous.roll) * fps,
        "fov": (current.fov - previous.fov) * fps,
        "speed": math.sqrt(sum(value * value for value in delta)) * fps,
    }


def _dominant_axis(rates: dict[str, float]) -> str:
    """The single axis that carries this frame, as a signed label."""
    # Translations and rotations are not comparable in raw magnitude, so each
    # is scored against its own epsilon: "how many times over the noise floor".
    scores = {
        "dolly": abs(rates["dolly"]) / TRANSLATION_EPSILON,
        "truck": abs(rates["truck"]) / TRANSLATION_EPSILON,
        "crane": abs(rates["crane"]) / TRANSLATION_EPSILON,
        "pan": abs(rates["pan"]) / ROTATION_EPSILON,
        "tilt": abs(rates["tilt"]) / ROTATION_EPSILON,
        "roll": abs(rates["roll"]) / ROTATION_EPSILON,
        "fov": abs(rates["fov"]) / FOV_EPSILON,
    }
    axis, score = max(scores.items(), key=lambda item: item[1])
    if score <= 1.0:
        return "hold"
    if axis == "roll":
        return "roll"
    signs = {
        "dolly": ("dolly_in", "dolly_out"),
        "truck": ("truck_right", "truck_left"),
        "crane": ("crane_up", "crane_down"),
        "pan": ("pan_right", "pan_left"),
        "tilt": ("tilt_up", "tilt_down"),
        "fov": ("zoom_out", "zoom_in"),
    }[axis]
    return signs[0] if rates[axis] > 0 else signs[1]


def _absorb(phases: list[dict[str, Any]], index: int) -> None:
    """Merge phase `index` into whichever neighbour is longer."""
    victim = phases[index]
    neighbours = [i for i in (index - 1, index + 1) if 0 <= i < len(phases)]
    into = max(neighbours, key=lambda i: phases[i]["end"] - phases[i]["start"])
    phases[into]["start"] = min(phases[into]["start"], victim["start"])
    phases[into]["end"] = max(phases[into]["end"], victim["end"])
    phases.pop(index)


def _merge_short(phases: list[dict[str, Any]], min_frames: int) -> list[dict[str, Any]]:
    """Absorb runs too short to be worth a sentence into their longer neighbour."""
    while len(phases) > 1:
        index = min(range(len(phases)), key=lambda i: phases[i]["end"] - phases[i]["start"])
        if (phases[index]["end"] - phases[index]["start"] + 1) >= min_frames:
            break
        _absorb(phases, index)
    return phases


def _cap(phases: list[dict[str, Any]], maximum: int) -> list[dict[str, Any]]:
    """Keep the longest phases; merge the rest into their neighbours."""
    while len(phases) > maximum:
        _absorb(phases, min(range(len(phases)), key=lambda i: phases[i]["end"] - phases[i]["start"]))
    return phases


def _pace(speeds: list[float]) -> str:
    """How the phase's own speed evolves, in three honest buckets."""
    if len(speeds) < 3:
        return "steady"
    half = len(speeds) // 2
    first = sum(speeds[:half]) / max(1, half)
    last = sum(speeds[half:]) / max(1, len(speeds) - half)
    if last > first * 1.35 and last - first > TRANSLATION_EPSILON:
        return "accelerating"
    if first > last * 1.35 and first - last > TRANSLATION_EPSILON:
        return "decelerating"
    return "steady"


def _static_phase(track: OmniCamTrack, frames: int) -> dict[str, Any]:
    return {
        "start": 0, "end": frames - 1, "start_seconds": 0.0,
        "end_seconds": round(frames / track.fps, 2), "axis": "hold",
        "phrase": AXIS_PHRASES["hold"], "pace": "steady",
        "magnitudes": {}, "peak_speed": 0.0,
    }


def segment_motion_phases(
    track: OmniCamTrack, *, max_phases: int = MAX_PHASES,
    min_phase_seconds: float = MIN_PHASE_SECONDS,
) -> list[dict[str, Any]]:
    """Split a track into 1..max_phases runs of stable dominant motion.

    Each phase carries its time span, dominant axis, signed magnitudes and a
    pace trend -- everything a prompt builder needs to write one timecoded
    sentence without inventing anything the track does not contain.
    """
    frames = max(1, track.duration_frames)
    if frames < 2 or not track.keyframes:
        return [_static_phase(track, frames)]

    cameras = [track.sample(frame) for frame in range(frames)]
    rates = [_rates(previous, current, track.fps) for previous, current in pairwise(cameras)]
    labels = [_dominant_axis(rate) for rate in rates]

    runs: list[dict[str, Any]] = []
    for index, label in enumerate(labels):
        if runs and runs[-1]["axis"] == label:
            runs[-1]["end"] = index + 1
            continue
        runs.append({"axis": label, "start": index, "end": index + 1})

    min_frames = max(2, int(round(min_phase_seconds * track.fps)))
    runs = _cap(_merge_short(runs, min_frames), max(1, int(max_phases)))
    runs.sort(key=lambda phase: phase["start"])

    # Merging can leave neighbours whose recomputed axis is identical. Two
    # consecutive lines saying the same thing is worse than one, so they
    # coalesce before any span or sentence is derived from them.
    resolved: list[dict[str, Any]] = []
    for run in runs:
        span = rates[run["start"]:max(run["start"] + 1, run["end"])]
        mean = {key: sum(rate[key] for rate in span) / max(1, len(span)) for key in span[0]}
        axis = _dominant_axis(mean)
        if resolved and resolved[-1]["axis"] == axis:
            resolved[-1]["end"] = run["end"]
            continue
        resolved.append({"axis": axis, "start": run["start"], "end": run["end"]})

    phases = []
    for index, run in enumerate(resolved):
        # Spans are derived from the *next* phase's start so the shot list is
        # contiguous by construction: no gaps, no overlaps to explain away.
        last_frame = (resolved[index + 1]["start"] if index + 1 < len(resolved) else frames - 1)
        span = rates[run["start"]:max(run["start"] + 1, run["end"])]
        phases.append({
            "start": run["start"], "end": last_frame,
            "start_seconds": round(run["start"] / track.fps, 2),
            "end_seconds": round(last_frame / track.fps, 2),
            "axis": run["axis"],
            "phrase": AXIS_PHRASES.get(run["axis"], AXIS_PHRASES["hold"]),
            "pace": _pace([rate["speed"] for rate in span]),
            "magnitudes": {
                "dolly": round(sum(rate["dolly"] for rate in span) / track.fps, 3),
                "truck": round(sum(rate["truck"] for rate in span) / track.fps, 3),
                "crane": round(sum(rate["crane"] for rate in span) / track.fps, 3),
                "pan_degrees": round(sum(rate["pan"] for rate in span) / track.fps, 2),
                "tilt_degrees": round(sum(rate["tilt"] for rate in span) / track.fps, 2),
                "roll_degrees": round(sum(rate["roll"] for rate in span) / track.fps, 2),
                "fov_degrees": round(sum(rate["fov"] for rate in span) / track.fps, 2),
            },
            "peak_speed": round(max((rate["speed"] for rate in span), default=0.0), 3),
        })
    return phases
