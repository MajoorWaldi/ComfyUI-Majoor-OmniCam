import pytest

from omnicam.core.track import OmniCamTrack
from omnicam.monitor.preflight import build_adapter_preflight


@pytest.fixture
def track():
    return OmniCamTrack.from_dict({"duration_frames": 81, "keyframes": [{"frame": 0, "camera": {}}]})


def _capability(adapter: str, state: str = "verified"):
    return {"capabilities": [{"adapter": adapter, "state": state, "display": adapter, "docs": "https://example.invalid"}]}


def _preflight(track, adapter, *, capability="verified", proxy=True, length=81, width=832, height=480):
    return build_adapter_preflight(
        adapter=adapter, track=track, proxy_available=proxy, width=width, height=height,
        length=length, point_count=16, distribution="balanced",
        capabilities=_capability(adapter, capability),
    )


def test_h3_blocks_without_proxy(track):
    report = _preflight(track, "h3", proxy=False)
    assert report.state == "BLOCKED"
    assert any(issue["id"] == "proxy" for issue in report.issues)


def test_wan_native_blocks_invalid_4n_plus_1_length(track):
    report = _preflight(track, "wan_native", length=80)
    assert report.state == "BLOCKED"
    assert any(issue["id"] == "length_4n_plus_1" for issue in report.issues)


@pytest.mark.parametrize(("capability", "expected"), [("verified", "READY"), ("detected_unverified", "WARNING"), ("missing", "BLOCKED")])
def test_capability_state_is_visible_in_preflight(track, capability, expected):
    assert _preflight(track, "wan_ati", capability=capability).state == expected


def test_ltx_unsafe_decoded_memory_plan_is_blocked(track):
    report = _preflight(track, "ltx", width=4096, height=4096, length=121)
    assert report.state == "BLOCKED"
    assert any(issue["id"] == "ltx_memory" for issue in report.issues)
