"""Per-frame camera motion health: the decision data behind the Health panel.

``camera_tools.motion_health_check`` used to reduce the whole track to a handful
of maxima, which answers "is this track too fast?" but never "*where*". The panel
needs to paint the timeline, so the series are the product here and the maxima
are derived from them.

Grading is three-tier: a metric is ``over`` past its recommended maximum and
``warn`` once it crosses ``WARN_RATIO`` of it. Without limits every frame grades
``ok`` -- the core stays model-neutral and only the adapters carry semantics.

``fov_drift`` is deliberately absent from the per-frame grading. Its limit is a
*total* excursion in degrees over the whole track, so there is no honest way to
charge it to one frame; it is reported as a track-level alert instead.
"""

from __future__ import annotations

import math
from itertools import pairwise
from typing import Any

from .camera_math import camera_basis
from .projection import project_point
from .track import CameraState, OmniCamTrack

# Metrics graded frame by frame. Each maps to the ``max_<name>`` limit key.
FRAME_METRICS = ("speed", "angular_speed", "acceleration", "jerk")
# Metrics that only exist for the track as a whole.
TRACK_METRICS = ("fov_drift",)
WARN_RATIO = 0.8
GRADES = ("ok", "warn", "over")

DEFAULT_SUBJECT = [0.0, 1.5, 0.0]

# A neutral profile for "no target model chosen yet". Deliberately permissive:
# it exists so the panel can grade something rather than stay blank, not to
# pretend OmniCam knows what an unnamed model tolerates.
GENERIC_RECOMMENDED_MOTION_LIMITS = {
    "max_speed": 10.0,
    "max_angular_speed": 150.0,
    "max_acceleration": 50.0,
    "max_jerk": 500.0,
    "max_fov_change": 30.0,
    "allow_framing_loss": False,
}


def angular_speed_profile(cameras: list[CameraState], fps: int) -> list[float]:
    """Degrees per second swept by the complete camera orientation."""
    speeds = [0.0]
    for previous, current in pairwise(cameras):
        previous_basis = camera_basis(previous.position, previous.target, previous.roll)
        current_basis = camera_basis(current.position, current.target, current.roll)
        relative_trace = sum(
            sum(previous_basis[axis][i] * current_basis[axis][i] for i in range(3))
            for axis in range(3)
        )
        cosine = max(-1.0, min(1.0, (relative_trace - 1.0) * 0.5))
        speeds.append(math.degrees(math.acos(cosine)) * fps)
    return speeds


def translation_speed_profile(cameras: list[CameraState], fps: int) -> list[float]:
    """World units per second travelled by the camera position, per frame."""
    speeds = [0.0]
    for previous, current in pairwise(cameras):
        distance = math.sqrt(sum((current.position[i] - previous.position[i]) ** 2 for i in range(3)))
        speeds.append(distance * fps)
    return speeds


def _derivative(values: list[float], fps: int) -> list[float]:
    return [0.0, *[abs(b - a) * fps for a, b in pairwise(values)]]


def resolve_subject(track: OmniCamTrack, subject: list[float] | None = None) -> list[float]:
    """Resolve the point whose framing is checked: explicit, scene object, or default."""
    if subject is not None:
        return [float(value) for value in subject]
    found = next((obj for obj in track.objects if obj.get("id") == "subject"), None)
    if isinstance(found, dict) and isinstance(found.get("position"), list):
        return [float(value) for value in found["position"][:3]]
    return list(DEFAULT_SUBJECT)


def framing_profile(cameras: list[CameraState], subject: list[float], width: int, height: int) -> list[bool]:
    """True per frame when the subject point falls inside the rendered image."""
    visible = []
    for camera in cameras:
        projected = project_point(subject, camera, width, height)
        visible.append(bool(projected and 0 <= projected[0] < width and 0 <= projected[1] < height))
    return visible


def _grade(value: float, recommended: float | None) -> str:
    if recommended is None or recommended <= 0.0:
        return "ok"
    if value > recommended:
        return "over"
    return "warn" if value > recommended * WARN_RATIO else "ok"


def _worst(grades: list[str]) -> str:
    for grade in reversed(GRADES):
        if grade in grades:
            return grade
    return "ok"


def _segments(frame_grades: list[str], frame_reasons: list[list[str]]) -> list[dict[str, Any]]:
    """Run-length encode the per-frame grades into contiguous timeline zones."""
    segments: list[dict[str, Any]] = []
    for frame, grade in enumerate(frame_grades):
        reasons = sorted(frame_reasons[frame])
        if segments and segments[-1]["grade"] == grade and segments[-1]["metrics"] == reasons:
            segments[-1]["end"] = frame
            continue
        segments.append({"start": frame, "end": frame, "grade": grade, "metrics": reasons})
    return segments


def motion_health_report(
    track: OmniCamTrack,
    limits: dict[str, float] | None = None,
    subject: list[float] | None = None,
    profile: str = "generic",
) -> dict[str, Any]:
    """Grade a track frame by frame against adapter-recommended motion limits.

    The returned dict is a superset of the historical ``motion_health_check``
    payload: the ``max_*`` maxima, ``violations`` and ``ok`` keys keep their
    exact meaning, and the series, per-frame grades and segments are added.

    ``trajectory_valid`` is the name to read downstream. It states that the
    trajectory stays inside the recommended envelope -- not that the generated
    video will match it.
    """
    limits = dict(limits or {})
    cameras = [track.sample(frame) for frame in range(track.duration_frames)]
    speeds = translation_speed_profile(cameras, track.fps)
    angular = angular_speed_profile(cameras, track.fps)
    accelerations = _derivative(speeds, track.fps)
    jerks = _derivative(accelerations, track.fps)
    resolved_subject = resolve_subject(track, subject)
    visible = framing_profile(cameras, resolved_subject, track.width, track.height)
    fovs = [camera.fov for camera in cameras]

    series = {"speed": speeds, "angular_speed": angular, "acceleration": accelerations, "jerk": jerks}
    allow_framing_loss = limits.get("allow_framing_loss") is True

    frame_grades: list[str] = []
    frame_reasons: list[list[str]] = []
    for frame in range(len(cameras)):
        grades, reasons = [], []
        for metric in FRAME_METRICS:
            grade = _grade(series[metric][frame], limits.get(f"max_{metric}"))
            grades.append(grade)
            if grade != "ok":
                reasons.append(metric)
        if not visible[frame] and not allow_framing_loss:
            grades.append("over")
            reasons.append("framing_loss")
        frame_grades.append(_worst(grades))
        frame_reasons.append(reasons)

    framing_loss = sum(1 for ok in visible if not ok)
    report: dict[str, Any] = {
        "profile": profile,
        "warn_ratio": WARN_RATIO,
        "limits": limits,
        "subject": resolved_subject,
        "duration_frames": track.duration_frames,
        "fps": track.fps,
        "max_speed": max(speeds, default=0.0),
        "max_angular_speed": max(angular, default=0.0),
        "max_acceleration": max(accelerations, default=0.0),
        "max_jerk": max(jerks, default=0.0),
        "max_fov_change": max(fovs, default=0.0) - min(fovs, default=0.0),
        "framing_loss_frames": framing_loss,
        "series": series,
        "framing": visible,
        "frame_grades": frame_grades,
        "segments": _segments(frame_grades, frame_reasons),
        "violations": [],
    }

    for metric in (*FRAME_METRICS, *TRACK_METRICS):
        key = "max_fov_change" if metric == "fov_drift" else f"max_{metric}"
        recommended = limits.get(key)
        if recommended is not None and report[key] > float(recommended):
            report["violations"].append({"metric": key, "value": report[key], "recommended_max": float(recommended)})
    if framing_loss and not allow_framing_loss:
        report["violations"].append({"metric": "framing_loss_frames", "value": framing_loss, "recommended_max": 0})

    fov_grade = _grade(report["max_fov_change"], limits.get("max_fov_change"))
    report["track_grades"] = {"fov_drift": fov_grade}
    report["grade"] = _worst([*frame_grades, fov_grade])
    report["trajectory_valid"] = not report["violations"]
    # Historical key kept for the adapters and node outputs that already read it.
    report["ok"] = report["trajectory_valid"]
    return report
