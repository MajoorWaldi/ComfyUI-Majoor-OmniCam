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
    return {"base_prompt": "A fox", "video_ref_token": "auto", "width": 832, "height": 480, "length": 81, "point_count": 16, "distribution": "balanced", "ltx_max_frames": 6, "ltx_sampling_mode": "uniform"}


def _caps(adapter="h3"):
    return {"capabilities": [{"adapter": adapter, "state": "verified"}]}


def test_monitor_fingerprint_is_deterministic_and_covers_semantic_inputs():
    one = monitor_fingerprint(track=_payload(), adapter="h3", settings=_settings())
    assert one == monitor_fingerprint(track=_payload(), adapter="h3", settings=dict(reversed(list(_settings().items()))))
    assert one != monitor_fingerprint(track=_payload(), adapter="wan_native", settings=_settings())
    assert one != monitor_fingerprint(track=_payload(2), adapter="h3", settings=_settings())


_PROXY = {"available": True, "fps": 24.0, "duration_seconds": 5.0, "frame_count": 120}


def test_snapshot_contains_every_monitor_surface():
    track = OmniCamTrack.from_dict(_payload())
    snapshot = build_monitor_snapshot(track=track, adapter="h3", proxy=_PROXY, settings=_settings(), capabilities=_caps())
    payload = snapshot.to_dict()
    assert payload["fingerprint"]
    assert payload["source"]["duration_frames"] == 25
    assert payload["health"]["state"] == "READY"
    assert payload["preflight"]["state"] == "READY"
    assert payload["text"]["camera_prompt"]
    assert payload["preview"]["kind"] == "proxy_video"
    assert payload["adapter"]["id"] == "h3"
    assert payload["adapter"]["settings"] == ["base_prompt"]


def test_unknown_proxy_media_warns_instead_of_claiming_ready():
    """A bare "a proxy exists" boolean cannot answer what H3 validates.

    The old snapshot said READY on exactly this input and let the queue fail
    inside MinimaxHailuo03ReferenceNode.
    """
    track = OmniCamTrack.from_dict(_payload())
    snapshot = build_monitor_snapshot(track=track, adapter="h3", proxy_available=True, settings=_settings(), capabilities=_caps())
    payload = snapshot.to_dict()
    assert payload["preflight"]["state"] == "WARNING"
    assert {issue["id"] for issue in payload["preflight"]["issues"]} >= {"reference_fps", "reference_duration"}


def test_out_of_contract_reference_media_blocks():
    track = OmniCamTrack.from_dict(_payload())
    proxy = {"available": True, "fps": 16.0, "duration_seconds": 1.0}
    snapshot = build_monitor_snapshot(track=track, adapter="h3", proxy=proxy, settings=_settings(), capabilities=_caps())
    payload = snapshot.to_dict()
    assert payload["preflight"]["state"] == "BLOCKED"
    assert {issue["id"] for issue in payload["preflight"]["issues"]} >= {"reference_fps", "reference_duration"}
