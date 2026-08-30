from __future__ import annotations

import math

from ..adapters.motion_profiles import profile_limits
from ..core.motion_health import motion_health_report
from ..core.track import OmniCamTrack
from .types import HealthMetric, MonitorHealth

_METRICS = (
    ("max_speed", "Max Speed", "u/s"),
    ("max_angular_speed", "Angular Speed", "deg/s"),
    ("max_acceleration", "Acceleration", "u/s2"),
    ("max_jerk", "Jerk", "u/s3"),
    ("max_fov_change", "FOV Change", "deg"),
    ("framing_loss_frames", "Framing Loss", "frames"),
    ("duration_frames", "Frames", "frames"),
    ("fps", "FPS", "fps"),
)

# Which heuristic limit table grades which adapter. Trajectory adapters share
# ATI's table: they are all following projected 2D points.
_ADAPTER_PROFILES = {
    "h3": "h3",
    "h3_native": "h3",
    "wan_native": "wan_native",
    "wan_ati": "wan_ati",
    "wan_tracks_native": "wan_ati",
    "ltx": "ltx",
    "ltx_motion_track": "ltx",
}

# Objective failures: these are properties of the track, not opinions about a
# model. Everything else grades as risk.
_TRACK_VALIDITY_METRICS = ("framing_loss_frames",)

_RISK_BY_GRADE = {"ok": "LOW", "warn": "MEDIUM", "over": "HIGH"}


def health_profile(adapter: str | None) -> str:
    return _ADAPTER_PROFILES.get(str(adapter or ""), "generic")


def _finite(track: OmniCamTrack) -> bool:
    """A keyframe carrying NaN or infinity cannot be rendered or projected."""
    for keyframe in track.keyframes:
        camera = keyframe.camera
        values = [*camera.position, *camera.target, camera.fov, camera.roll]
        if any(not math.isfinite(float(value)) for value in values):
            return False
    return True


def build_camera_health(track: OmniCamTrack, adapter: str | None = None) -> MonitorHealth:
    """Grade a track against the adapter's own heuristic limit table.

    Passing the adapter matters: the tables existed but nothing ever handed
    them to the grader, so every adapter was silently graded as generic.
    """
    profile = health_profile(adapter)
    limits = profile_limits(profile)
    report = motion_health_report(track, limits, profile=profile)
    violations = list(report.get("violations") or [])
    invalid = {str(item.get("metric")) for item in violations}
    metrics = [
        HealthMetric(
            id=metric_id,
            label=label,
            value=report.get(metric_id, getattr(track, metric_id, 0)),
            unit=unit,
            state="blocked" if metric_id in invalid else "ready",
            recommended_max=next(
                (item.get("recommended_max") for item in violations if item.get("metric") == metric_id),
                None,
            ),
        )
        for metric_id, label, unit in _METRICS
    ]

    finite = _finite(track)
    objective = [item for item in violations if str(item.get("metric")) in _TRACK_VALIDITY_METRICS]
    if not finite:
        state = "BLOCKED"
    elif objective:
        state = "WARNING"
    else:
        state = "READY"

    risk = _RISK_BY_GRADE.get(str(report.get("grade") or "ok"), "LOW")
    reasons = sorted({
        str(item.get("metric"))
        for item in violations
        if str(item.get("metric")) not in _TRACK_VALIDITY_METRICS
    })
    if not finite:
        reasons.insert(0, "non_finite_camera_values")
    return MonitorHealth(
        state=state, metrics=metrics, violations=violations, risk=risk,
        risk_reasons=reasons, profile=profile, heuristic=True,
    )
