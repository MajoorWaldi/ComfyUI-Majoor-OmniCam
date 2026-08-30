from __future__ import annotations

from typing import Any

from ..adapters.registry import ADAPTER_INFO

MONITOR_ADAPTERS: dict[str, dict[str, Any]] = {
    "h3": {"display_name": "MiniMax H3 / Universal", "preview_kind": "proxy_video", "requires_proxy": True},
    "wan_native": {"display_name": "Wan Native Camera", "preview_kind": "camera_path", "requires_proxy": False},
    "wan_ati": {"display_name": "WanVideoWrapper ATI", "preview_kind": "trajectory_overlay", "requires_proxy": False},
    "wan_tracks_native": {"display_name": "ComfyUI Wan Track To Video", "preview_kind": "trajectory_overlay", "requires_proxy": False},
    "ltx": {"display_name": "LTX Camera Guide", "preview_kind": "frame_sequence", "requires_proxy": True},
}


def adapter_info(adapter: str) -> dict[str, Any]:
    if adapter not in MONITOR_ADAPTERS:
        raise ValueError(f"Unsupported Monitor adapter: {adapter}")
    return MONITOR_ADAPTERS[adapter] | {"capability": ADAPTER_INFO.get(adapter, {})}
