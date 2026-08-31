import json

import pytest

from omnicam.core.track import OmniCamTrack
from omnicam.monitor import execute as monitor_execute


class FakeVideo:
    def get_frame_rate(self):
        return 24.0

    def get_frame_count(self):
        return 120

    def get_dimensions(self):
        return 1280, 720


def test_proxy_media_facts_reads_a_real_video_contract():
    facts = monitor_execute.proxy_media_facts(FakeVideo())
    assert facts == {
        "available": True,
        "fps": 24.0,
        "frame_count": 120,
        "duration_seconds": 5.0,
        "width": 1280,
        "height": 720,
    }


def _track():
    return OmniCamTrack.from_dict({"duration_frames": 2, "keyframes": [{"frame": 0, "camera": {}}]})


def _run(adapter, **overrides):
    args = dict(
        adapter=adapter, track=_track(), proxy_video="proxy", base_prompt="base",
        video_ref_token="<Video 1>", width=832, height=480, length=81,
        point_count=4, distribution="balanced", ltx_max_frames=6,
        ltx_sampling_mode="uniform",
    )
    args.update(overrides)
    return monitor_execute.execute_monitor_adapter(**args)


def test_wan_native_executes_only_the_wan_embedding_engine(monkeypatch):
    calls = []
    monkeypatch.setattr(monitor_execute, "build_wan_camera_embedding", lambda *a, **k: calls.append("wan") or "embedding")
    monkeypatch.setattr(monitor_execute, "build_ltx_guide_frames", lambda *a, **k: calls.append("ltx") or {})
    result = _run("wan_native")
    assert calls == ["wan"]
    assert result["wan_camera"] == "embedding"
    assert result["guide_frames"] is None


def test_ltx_executes_only_the_ltx_frame_engine(monkeypatch):
    calls = []
    monkeypatch.setattr(monitor_execute, "build_wan_camera_embedding", lambda *a, **k: calls.append("wan") or "embedding")
    monkeypatch.setattr(monitor_execute, "build_ltx_guide_frames", lambda *a, **k: calls.append("ltx") or {"frames": "images", "profile": {"kind": "ltx"}, "plan": {"indices": [0, 1]}})
    result = _run("ltx")
    assert calls == ["ltx"]
    assert result["guide_frames"] == "images"
    assert result["wan_camera"] is None


def test_h3_and_ati_never_touch_heavy_engines(monkeypatch):
    def forbidden(*args, **kwargs):
        raise AssertionError("heavy engine called")
    monkeypatch.setattr(monitor_execute, "build_wan_camera_embedding", forbidden)
    monkeypatch.setattr(monitor_execute, "build_ltx_guide_frames", forbidden)
    assert _run("h3")["reference_video"] == "proxy"
    assert _run("wan_ati")["tracks"]


@pytest.mark.parametrize(("adapter", "payload_key"), [
    ("wan_native", "wan_camera"),
    ("wan_tracks_native", "tracks"),
    ("h3", "reference_video"),
    ("h3_native", "reference_video"),
    ("ltx_motion_track", "tracks"),
    ("wan_ati", "tracks"),
])
def test_pinned_adapter_contracts_accept_generated_payloads(adapter, payload_key, monkeypatch):
    if adapter == "wan_native":
        monkeypatch.setattr(
            monitor_execute,
            "build_wan_camera_embedding",
            lambda *args, **kwargs: {"camera_conditions": []},
        )
    result = _run(adapter)
    assert result[payload_key] not in (None, "")
    assert result["adapter_width"] == 832
    assert result["adapter_height"] == 480
    assert result["adapter_length"] == 81
    json.loads(result["adapter_profile_json"])
