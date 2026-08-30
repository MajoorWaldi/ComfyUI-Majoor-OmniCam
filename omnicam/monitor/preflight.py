from __future__ import annotations

from typing import Any

from ..core.track import OmniCamTrack
from .adapter_registry import adapter_info
from .health import build_camera_health
from .types import MonitorPreflight

_TWO_GIB = 2 * 1024**3


def _capability(capabilities: dict[str, Any], adapter: str) -> dict[str, Any]:
    return next((item for item in capabilities.get("capabilities", []) if item.get("adapter") == adapter), {"state": "missing"})


def build_adapter_preflight(
    *, adapter: str, track: OmniCamTrack, proxy_available: bool, width: int,
    height: int, length: int, point_count: int, distribution: str,
    capabilities: dict[str, Any],
) -> MonitorPreflight:
    info = adapter_info(adapter)
    capability = _capability(capabilities, adapter)
    capability_state = str(capability.get("state") or "missing")
    checks: list[dict[str, Any]] = []
    issues: list[dict[str, Any]] = []

    def check(check_id: str, label: str, passed: bool, *, warning: bool = False, message: str = "") -> None:
        state = "WARNING" if warning else ("PASS" if passed else "BLOCKED")
        checks.append({"id": check_id, "label": label, "state": state, "message": message})
        if not passed or warning:
            issues.append({"id": check_id, "severity": "warning" if warning else "error", "message": message or label})

    check("track", "Canonical camera track", track.duration_frames > 0 and bool(track.keyframes))
    if info["requires_proxy"]:
        check("proxy", "Managed proxy available", proxy_available, message="A managed Director proxy is required.")
    check("dimensions", "Adapter dimensions", 64 <= int(width) <= 4096 and 64 <= int(height) <= 4096)
    if adapter == "wan_native":
        check("length_4n_plus_1", "Length is 4n+1", int(length) > 0 and (int(length) - 1) % 4 == 0)
    if adapter in {"wan_ati", "wan_tracks_native"}:
        check("point_count", "Trajectory point count", 4 <= int(point_count) <= 128)
        check("distribution", "Trajectory distribution", distribution in {"balanced", "subject_focus", "ground_parallax"})
    if adapter == "ltx":
        estimate = max(0, int(length)) * max(0, int(width)) * max(0, int(height)) * 3 * 4
        check("ltx_memory", "Decoded guide memory plan", 0 < estimate <= _TWO_GIB, message="LTX guide would exceed the 2 GiB safety limit.")

    if capability_state == "detected_unverified":
        check("capability", "Downstream adapter contract", True, warning=True, message="Adapter detected but its socket contract is unverified.")
    else:
        check("capability", "Downstream adapter contract", capability_state == "verified", message=f"Adapter contract is {capability_state}.")

    health = build_camera_health(track)
    if health.state == "BLOCKED":
        check("camera_health", "Camera motion health", False, message="Camera motion health is blocked.")

    if any(item["severity"] == "error" for item in issues):
        state = "BLOCKED"
    elif issues:
        state = "WARNING"
    else:
        state = "READY"
    return MonitorPreflight(state, adapter, capability_state, checks, issues)
