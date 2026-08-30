from omnicam.core.track import OmniCamTrack
from omnicam.monitor.health import build_camera_health


def _track(target=(0, 1.5, 0)) -> OmniCamTrack:
    return OmniCamTrack.from_dict({
        "fps": 24, "duration_frames": 25, "width": 640, "height": 360,
        "keyframes": [
            {"frame": 0, "camera": {"position": [0, 1, 5], "target": [0, 1.5, 0]}, "interpolation": "linear"},
            {"frame": 24, "camera": {"position": [1, 1, 5], "target": list(target)}, "interpolation": "linear"},
        ],
    })


def test_ready_health_maps_real_motion_metrics_without_a_score():
    health = build_camera_health(_track())
    values = {metric.id: metric.value for metric in health.metrics}
    assert health.state == "READY"
    assert values["max_speed"] > 0
    assert values["duration_frames"] == 25
    assert all(metric.id not in {"score", "quality_score"} for metric in health.metrics)


def test_framing_loss_is_visible_and_blocks_the_track():
    health = build_camera_health(_track(target=(100, 1.5, 0)))
    assert health.state == "BLOCKED"
    assert any(metric.id == "framing_loss_frames" and metric.value > 0 for metric in health.metrics)
    assert any(item.get("metric") == "framing_loss_frames" for item in health.violations)
