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


def test_framing_loss_warns_without_blocking_the_queue():
    """Losing the subject is a real track fact, not an unqueueable track.

    Framing loss used to block. A whip-pan off the subject is a legitimate shot
    the target model will happily generate, so it warns; only a track the
    renderer cannot consume at all (non-finite values) blocks.
    """
    health = build_camera_health(_track(target=(100, 1.5, 0)))
    assert health.state == "WARNING"
    assert any(metric.id == "framing_loss_frames" and metric.value > 0 for metric in health.metrics)
    assert any(item.get("metric") == "framing_loss_frames" for item in health.violations)


def test_non_finite_camera_values_block_the_track():
    track = _track()
    track.keyframes[-1].camera.position[0] = float("nan")
    health = build_camera_health(track)
    assert health.state == "BLOCKED"
    assert "non_finite_camera_values" in health.risk_reasons


def test_adapter_selects_its_own_heuristic_limit_table():
    """The per-adapter tables existed but were never handed to the grader."""
    track = _track()
    assert build_camera_health(track, "ltx").profile == "ltx"
    assert build_camera_health(track, "h3_native").profile == "h3"
    assert build_camera_health(track, "wan_tracks_native").profile == "wan_ati"
    assert build_camera_health(track).profile == "generic"
    assert build_camera_health(track, "ltx").heuristic is True
