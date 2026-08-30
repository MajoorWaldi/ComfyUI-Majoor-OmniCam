"""What each Monitor target actually is, and what it actually needs.

The five adapters are not five variants of one thing -- they are five families
of control with genuinely different fidelity:

    h3 / h3_native      motion transfer from a reference VIDEO plus prompt
    wan_native          true numeric camera conditioning (the fidelity anchor)
    wan_tracks_native   2D trajectory control (an approximation of a camera)
    wan_ati             2D trajectory control, third-party, Wan 2.1
    ltx_motion_track    2D trajectory control feeding an IC-LoRA guide
    ltx                 legacy proxy-frame guide, kept as a fallback

``settings`` names the controls that mean anything for that adapter, so the UI
can stop showing LTX sampling options to an H3 user, and ``fidelity`` states in
one word how directly the authored camera survives the translation.
"""

from __future__ import annotations

from typing import Any

from ..adapters.registry import ADAPTER_INFO

_COMMON = ("base_prompt",)

MONITOR_ADAPTERS: dict[str, dict[str, Any]] = {
    "h3": {
        "display_name": "MiniMax H3 - Comfy API",
        "family": "video_reference",
        "preview_kind": "proxy_video",
        "requires_proxy": True,
        "proxy_kind": "VIDEO",
        "fidelity": "motion_transfer",
        "settings": (*_COMMON,),
        "length_rule": None,
    },
    "h3_native": {
        "display_name": "MiniMax H3 - Native",
        "family": "video_reference",
        "preview_kind": "proxy_video",
        "requires_proxy": True,
        "proxy_kind": "IMAGE",
        "fidelity": "motion_transfer",
        "settings": (*_COMMON, "length"),
        "length_rule": "17n+5",
    },
    "wan_native": {
        "display_name": "Wan Camera",
        "family": "camera_conditioning",
        "preview_kind": "camera_path",
        "requires_proxy": False,
        "proxy_kind": None,
        "fidelity": "numeric_camera",
        "settings": (*_COMMON, "width", "height", "length"),
        "length_rule": "4n+1",
    },
    "wan_ati": {
        "display_name": "Wan 2.1 ATI - WanVideoWrapper",
        "family": "trajectory",
        "preview_kind": "trajectory_overlay",
        "requires_proxy": False,
        "proxy_kind": None,
        "fidelity": "trajectory_approximation",
        "settings": (*_COMMON, "width", "height", "point_count", "distribution"),
        "length_rule": None,
    },
    "wan_tracks_native": {
        "display_name": "Wan Motion Tracks",
        "family": "trajectory",
        "preview_kind": "trajectory_overlay",
        "requires_proxy": False,
        "proxy_kind": None,
        "fidelity": "trajectory_approximation",
        "settings": (*_COMMON, "width", "height", "length", "point_count", "distribution"),
        "length_rule": None,
    },
    "ltx_motion_track": {
        "display_name": "LTX 2.5 Motion Track",
        "family": "trajectory",
        "preview_kind": "trajectory_overlay",
        "requires_proxy": False,
        "proxy_kind": None,
        "fidelity": "trajectory_approximation",
        "settings": (*_COMMON, "width", "height", "length", "point_count", "distribution"),
        "length_rule": "8n+1",
    },
    "ltx": {
        "display_name": "LTX Proxy Guide (legacy)",
        "family": "proxy_guide",
        "preview_kind": "frame_sequence",
        "requires_proxy": True,
        "proxy_kind": "VIDEO",
        "fidelity": "proxy_passthrough",
        "settings": (*_COMMON, "width", "height", "ltx_max_frames", "ltx_sampling_mode"),
        "length_rule": None,
    },
}

# Adapter ids whose payload is a camera the model consumes numerically. Their
# prompt must not repeat the move: the embedding already carries it.
NUMERIC_CAMERA_ADAPTERS = frozenset({"wan_native"})


def adapter_info(adapter: str) -> dict[str, Any]:
    if adapter not in MONITOR_ADAPTERS:
        raise ValueError(f"Unsupported Monitor adapter: {adapter}")
    return MONITOR_ADAPTERS[adapter] | {"capability": ADAPTER_INFO.get(adapter, {})}


def adapter_roster() -> list[dict[str, Any]]:
    """Serializable descriptor list, so the frontend owns no second copy."""
    return [
        {
            "id": adapter,
            "display_name": info["display_name"],
            "family": info["family"],
            "fidelity": info["fidelity"],
            "requires_proxy": info["requires_proxy"],
            "proxy_kind": info["proxy_kind"],
            "settings": list(info["settings"]),
            "length_rule": info["length_rule"],
        }
        for adapter, info in MONITOR_ADAPTERS.items()
    ]
