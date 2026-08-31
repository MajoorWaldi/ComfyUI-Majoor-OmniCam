"""One prompt builder per adapter family, because one prompt does not fit them.

The single universal sentence the Monitor used to emit --

    "Reproduce the authored dolly in camera trajectory, framing, timing, FOV,
     speed, acceleration and deceleration while preserving the scene appearance."

-- is wrong in two different ways at once. For Wan Camera it is *redundant and
potentially contradictory*: the move is already in the WAN_CAMERA_EMBEDDING,
numerically, and a text classification that disagrees with it competes with the
conditioning it is supposed to support. For LTX it reads like an engineering
report rather than the natural cinematographic present tense LTX is prompted
best with.

So each family gets its own builder:

    h3 / h3_native      reference-video contract + timecoded shot list
    wan_native          base prompt, and at most one deferential camera line
    trajectory          natural camera language, the tracks carry the geometry
    ltx (legacy)        natural camera language for the proxy guide path
"""

from __future__ import annotations

from typing import Any

from ..adapters.h3 import build_camera_motion_block, build_h3_prompt, resolve_h3_dialect
from ..core.camera_tools import analyze_camera_trajectory
from ..core.track import OmniCamTrack
from .adapter_registry import adapter_info


def _natural_camera_prompt(track: OmniCamTrack) -> str:
    """Cinematographic present tense: what LTX and the trajectory models read best."""
    block = build_camera_motion_block(track, max_phases=3)
    return block if block.endswith(".") or "\n" in block else f"{block}."


def _h3_prompt(track: OmniCamTrack, *, adapter: str, settings: dict[str, Any], capabilities: dict[str, Any] | None) -> str:
    return build_h3_prompt(
        track,
        video_ref_token=str(settings.get("video_ref_token") or "auto"),
        adapter=adapter,
        capabilities=capabilities,
    )


def _wan_camera_prompt(track: OmniCamTrack, **_: Any) -> str:
    """Deliberately minimal.

    Wan receives the camera as an embedding built from real extrinsics and
    intrinsics. The only thing text can usefully add is a statement that the
    conditioning is authoritative.
    """
    return "Cinematic camera motion follows the supplied camera conditioning."


def _trajectory_prompt(track: OmniCamTrack, **_: Any) -> str:
    return (
        f"{_natural_camera_prompt(track)}\n\n"
        "The supplied motion tracks define the movement; keep the scene, subject and styling "
        "described by the main prompt."
    )


def _ltx_prompt(track: OmniCamTrack, **_: Any) -> str:
    return _natural_camera_prompt(track)

def _ltx_motion_track_prompt(track: OmniCamTrack, **_: Any) -> str:
    del track
    return ""


_BUILDERS = {
    "h3": _h3_prompt,
    "h3_native": _h3_prompt,
    "wan_native": _wan_camera_prompt,
    "wan_ati": _trajectory_prompt,
    "wan_tracks_native": _trajectory_prompt,
    "ltx_motion_track": _ltx_motion_track_prompt,
    "ltx": _ltx_prompt,
}


def build_camera_prompt(
    track: OmniCamTrack, *, adapter: str, settings: dict[str, Any] | None = None,
    capabilities: dict[str, Any] | None = None,
) -> str:
    """The camera instruction this adapter's target model should actually receive."""
    adapter_info(adapter)
    builder = _BUILDERS[adapter]
    return builder(track, adapter=adapter, settings=dict(settings or {}), capabilities=capabilities)  # type: ignore[operator]


def prompt_contract(adapter: str, capabilities: dict[str, Any] | None = None) -> dict[str, Any]:
    """What the preflight has to check about this adapter's prompt."""
    info = adapter_info(adapter)
    contract: dict[str, Any] = {
        "adapter": adapter,
        "family": info["family"],
        "dialect": None,
        "reference_token": None,
        "max_prompt_characters": None,
    }
    if adapter in {"h3", "h3_native"}:
        dialect = resolve_h3_dialect(adapter, capabilities)
        contract.update({
            "dialect": dialect["id"],
            "dialect_display": dialect["display_name"],
            "reference_token": dialect["video_token"],
            "reference_socket": dialect["reference_socket"],
            "reference_kind": dialect["reference_kind"],
            "max_prompt_characters": dialect["media_limits"].get("max_prompt_characters"),
        })
    return contract


def camera_analysis(track: OmniCamTrack, adapter: str) -> dict[str, Any]:
    """Diagnostic payload: the analysis, never the control path itself."""
    analysis = dict(analyze_camera_trajectory(track))
    analysis.update({
        "frames": track.duration_frames,
        "fps": track.fps,
        "duration_seconds": track.duration_seconds,
        "resolution": [track.width, track.height],
        "keyframes": len(track.keyframes),
        "adapter": adapter,
    })
    return analysis
