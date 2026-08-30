from omnicam.core.track import OmniCamTrack
from omnicam.monitor.fingerprint import monitor_fingerprint
from omnicam.monitor.snapshot import build_monitor_snapshot


def _payload(dx=1):
    return {
        "fps": 24, "duration_frames": 25, "width": 640, "height": 360,
        "keyframes": [
            {"frame": 0, "camera": {"position": [0, 1, 5], "target": [0, 1, 0]}, "interpolation": "linear"},
            {"frame": 24, "camera": {"position": [dx, 1, 5], "target": [0, 1, 0]}, "interpolation": "linear"},
        ],
    }


def _settings():
    return {"base_prompt": "A fox", "video_ref_token": "<Video 1>", "width": 832, "height": 480, "length": 81, "point_count": 16, "distribution": "balanced", "ltx_max_frames": 6, "ltx_sampling_mode": "uniform"}


def _caps(adapter="h3"):
    return {"capabilities": [{"adapter": adapter, "state": "verified"}]}


def test_monitor_fingerprint_is_deterministic_and_covers_semantic_inputs():
    one = monitor_fingerprint(track=_payload(), adapter="h3", settings=_settings())
    assert one == monitor_fingerprint(track=_payload(), adapter="h3", settings=dict(reversed(list(_settings().items()))))
    assert one != monitor_fingerprint(track=_payload(), adapter="wan_native", settings=_settings())
    assert one != monitor_fingerprint(track=_payload(2), adapter="h3", settings=_settings())


def test_snapshot_contains_every_monitor_surface():
    track = OmniCamTrack.from_dict(_payload())
    snapshot = build_monitor_snapshot(track=track, adapter="h3", proxy_available=True, settings=_settings(), capabilities=_caps())
    payload = snapshot.to_dict()
    assert payload["fingerprint"]
    assert payload["source"]["duration_frames"] == 25
    assert payload["health"]["state"] == "READY"
    assert payload["preflight"]["state"] == "READY"
    assert payload["text"]["camera_prompt"]
    assert payload["preview"]["kind"] == "proxy_video"
