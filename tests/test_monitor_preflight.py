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


def _h3(track, adapter="h3", *, proxy, length=124, prompt_length=0, capability="verified"):
    return build_adapter_preflight(
        adapter=adapter, track=track, proxy=proxy, width=832, height=480,
        length=length, point_count=16, distribution="balanced",
        capabilities=_capability(adapter, capability), prompt_length=prompt_length,
    )


def test_h3_api_enforces_the_reference_media_contract(track):
    """MinimaxHailuo03ReferenceNode raises on these; the Monitor must not say READY first."""
    slow = _h3(track, proxy={"available": True, "fps": 16.0, "duration_seconds": 5.0})
    assert slow.state == "BLOCKED"
    assert any(issue["id"] == "reference_fps" for issue in slow.issues)

    brief = _h3(track, proxy={"available": True, "fps": 24.0, "duration_seconds": 1.2})
    assert brief.state == "BLOCKED"

    too_long = _h3(track, proxy={"available": True, "fps": 24.0, "duration_seconds": 16.0})
    assert too_long.state == "BLOCKED"

    ok = _h3(track, proxy={"available": True, "fps": 24.0, "duration_seconds": 5.0})
    assert ok.state == "READY"


def test_unknown_reference_media_warns_rather_than_passing(track):
    report = _h3(track, proxy={"available": True})
    assert report.state == "WARNING"
    assert {issue["id"] for issue in report.issues} == {"reference_fps", "reference_duration"}


def test_h3_dialects_are_reported_per_profile(track):
    api = _h3(track, "h3", proxy={"available": True, "fps": 24.0, "duration_seconds": 5.0})
    native = _h3(track, "h3_native", proxy={"available": True, "duration_seconds": 5.0}, length=124)
    assert any(check["label"] == "Prompt dialect: Video 1" for check in api.checks)
    assert any(check["label"] == "Prompt dialect: <Video 1>" for check in native.checks)


def test_h3_native_enforces_its_17n_plus_5_length(track):
    proxy = {"available": True, "duration_seconds": 5.0}
    assert _h3(track, "h3_native", proxy=proxy, length=124).state == "READY"
    bad = _h3(track, "h3_native", proxy=proxy, length=120)
    assert bad.state == "BLOCKED"
    assert any(issue["id"] == "length_17n_plus_5" for issue in bad.issues)


def test_h3_prompt_budget_is_a_real_check(track):
    proxy = {"available": True, "fps": 24.0, "duration_seconds": 5.0}
    assert _h3(track, proxy=proxy, prompt_length=6999).state == "READY"
    over = _h3(track, proxy=proxy, prompt_length=7001)
    assert over.state == "BLOCKED"
    assert any(issue["id"] == "prompt_budget" for issue in over.issues)


def test_ltx_motion_track_warns_off_the_temporal_grid(track):
    on_grid = _preflight(track, "ltx_motion_track", length=121)
    assert on_grid.state == "READY"
    off_grid = _preflight(track, "ltx_motion_track", length=120)
    assert off_grid.state == "WARNING"
    assert any("113" in issue["message"] for issue in off_grid.issues)


def test_motion_risk_is_reported_but_never_changes_the_verdict(track):
    report = _preflight(track, "wan_native", length=81)
    risk = next(check for check in report.checks if check["id"] == "motion_risk")
    assert risk["state"] == "RISK"
    assert "not a published model limit" in risk["message"]
    assert all(issue["id"] != "motion_risk" for issue in report.issues)
    assert report.risk in {"LOW", "MEDIUM", "HIGH"}
