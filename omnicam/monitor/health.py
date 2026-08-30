from __future__ import annotations

from ..core.camera_tools import motion_health_check
from ..core.track import OmniCamTrack
from .types import HealthMetric, MonitorHealth

_METRICS = (
    ("max_speed", "Max Speed", "u/s"),
    ("max_angular_speed", "Angular Speed", "°/s"),
    ("max_acceleration", "Acceleration", "u/s²"),
    ("max_jerk", "Jerk", "u/s³"),
    ("max_fov_change", "FOV Change", "°"),
    ("framing_loss_frames", "Framing Loss", "frames"),
    ("duration_frames", "Frames", "frames"),
    ("fps", "FPS", "fps"),
)


def build_camera_health(track: OmniCamTrack) -> MonitorHealth:
    report = motion_health_check(track)
    violations = list(report.get("violations") or [])
    invalid = {str(item.get("metric")) for item in violations}
    metrics = [
        HealthMetric(
            id=metric_id,
            label=label,
            value=report.get(metric_id, getattr(track, metric_id, 0)),
            unit=unit,
            state="blocked" if metric_id in invalid else "ready",
            recommended_max=next((item.get("recommended_max") for item in violations if item.get("metric") == metric_id), None),
        )
        for metric_id, label, unit in _METRICS
    ]
    return MonitorHealth(state="BLOCKED" if violations else "READY", metrics=metrics, violations=violations)
