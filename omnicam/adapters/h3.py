"""MiniMax H3 adapters -- two dialects, one camera track.

ComfyUI ships two different H3 front doors and they do **not** speak the same
reference syntax:

* ``MinimaxHailuo03ReferenceNode`` (comfy_api_nodes/nodes_minimax.py) documents
  its references as ``'Image 1', 'Image 2', 'Video 1', 'Audio 1'`` -- no angle
  brackets -- and validates each reference video at 23.976-60 FPS, 2s minimum,
  15s total.
* ``MiniMaxH3ReferenceToVideo`` (comfy_extras/nodes_minimax_h3.py) documents
  ``<Picture i> / <Video k> / <Audio j>`` *with* brackets, takes its references
  as IMAGE frames at 24 fps, and constrains ``length`` to 5 + 17n.

Sending one dialect's tags to the other model is a silent quality loss: the tag
is read as literal prompt text instead of binding the reference. Which one to
use is a property of the installed node, never of the user, so the dialect is
resolved from detected capabilities and the token is not a user setting.
"""

from __future__ import annotations

from typing import Any

from ..core.motion_phases import segment_motion_phases
from ..core.track import OmniCamTrack

H3_PROXY_PRESETS = {
    "balanced": {"render_mode": "omni_ref", "point_count": 90, "burn_in": False},
    "parallax": {"render_mode": "point_field", "point_count": 160, "burn_in": False},
    "subject": {"render_mode": "card_grid", "point_count": 48, "burn_in": False},
    "debug": {"render_mode": "omni_ref", "point_count": 90, "burn_in": True},
}

# Heuristic, not a published model limit. OmniCam world units have no metric
# meaning, so these grade *authoring* comfort and are surfaced as Motion Risk
# rather than as a hard contract (adapter scope only; the core stays neutral).
# Units: world units/s, degrees/s, world units/s^2, world units/s^3, degrees.
H3_RECOMMENDED_MOTION_LIMITS = {
    "max_speed": 8.0,
    "max_angular_speed": 120.0,
    "max_acceleration": 40.0,
    "max_jerk": 400.0,
    "max_fov_change": 25.0,
    "allow_framing_loss": False,
}

# Reference-media constraints read from the upstream node, not invented here.
H3_API_MEDIA_LIMITS = {
    "min_fps": 23.9,
    "max_fps": 60.5,
    "min_duration_seconds": 2.0,
    "max_total_duration_seconds": 15.0,
    # fal.ai and the API node both cap the prompt well below OmniCam's own
    # transport limit; 7000 is the documented Reference-to-Video budget.
    "max_prompt_characters": 7000,
}

H3_NATIVE_MEDIA_LIMITS = {
    "reference_fps": 24,
    "min_reference_frames": 5,
    "recommended_min_duration_seconds": 2.0,
    "recommended_max_duration_seconds": 15.0,
    "length_base": 5,
    "length_step": 17,
}

def h3_native_aligned_length(length: int) -> int:
    value = max(5, int(length))
    while value % 17 != 5:
        value += 1
    return value

H3_DIALECTS = {
    "comfy_api": {
        "id": "comfy_api",
        "display_name": "MiniMax H3 - Comfy API",
        "node_class": "MinimaxHailuo03ReferenceNode",
        "video_token": "Video 1",
        "image_token": "Image 1",
        "audio_token": "Audio 1",
        "reference_socket": "reference_video",
        "reference_kind": "VIDEO",
        "media_limits": H3_API_MEDIA_LIMITS,
    },
    "native": {
        "id": "native",
        "display_name": "MiniMax H3 - Native",
        "node_class": "MiniMaxH3ReferenceToVideo",
        "video_token": "<Video 1>",
        "image_token": "<Picture 1>",
        "audio_token": "<Audio 1>",
        "reference_socket": "ref_videos",
        "reference_kind": "IMAGE",
        "media_limits": H3_NATIVE_MEDIA_LIMITS,
    },
}

DEFAULT_DIALECT = "comfy_api"


def h3_dialect(adapter: str = "h3") -> dict[str, Any]:
    """The dialect an H3 adapter id speaks."""
    return H3_DIALECTS["native" if adapter == "h3_native" else DEFAULT_DIALECT]


def resolve_h3_dialect(adapter: str, capabilities: dict[str, Any] | None = None) -> dict[str, Any]:
    """Pick the dialect strictly based on the requested adapter.

    capabilities is retained in the signature for API compatibility, but
    must not cause silent cross-contract dialect fallback.
    """
    del capabilities
    return h3_dialect(adapter)


def classify_camera_motion(track: OmniCamTrack) -> str:
    from ..core.camera_tools import analyze_camera_trajectory

    analysis = analyze_camera_trajectory(track)
    return str(analysis["classification"]["primary"])


def _phase_sentence(phase: dict[str, Any], *, first: bool, only: bool) -> str:
    subject = "The camera" if first else "It"
    if only:
        subject = "The camera"
    pace = {
        "accelerating": " and gradually gains speed",
        "decelerating": " and eases to a stop",
        "steady": "",
    }[phase["pace"]]
    magnitudes = phase.get("magnitudes") or {}
    detail = ""
    if phase["axis"] in {"truck_left", "truck_right"} and abs(magnitudes.get("pan_degrees", 0.0)) > 5.0:
        detail = ", producing increasing background parallax"
    elif phase["axis"] in {"dolly_in", "dolly_out"} and abs(magnitudes.get("fov_degrees", 0.0)) > 2.0:
        detail = ", with the focal length changing at the same time"
    return f"{subject} {phase['phrase']}{detail}{pace}."


def build_camera_motion_block(track: OmniCamTrack, *, max_phases: int = 4) -> str:
    """Timecoded shot list, or one sentence when the move is single-phase.

    A track that really is one continuous push-in gets one line: inventing four
    phases for it would describe a shot the author never authored.
    """
    phases = segment_motion_phases(track, max_phases=max_phases)
    if len(phases) == 1:
        return _phase_sentence(phases[0], first=True, only=True)
    lines = []
    for index, phase in enumerate(phases):
        span = f"[{phase['start_seconds']:.1f}-{phase['end_seconds']:.1f}s]"
        lines.append(f"{span} {_phase_sentence(phase, first=index == 0, only=False)}")
    return "\n".join(lines)


def build_h3_prompt(
    track: OmniCamTrack,
    video_ref_token: str | None = None,
    template: str = "auto",
    *,
    adapter: str = "h3",
    capabilities: dict[str, Any] | None = None,
    max_phases: int = 4,
) -> str:
    """Camera-motion instruction for an H3 reference video.

    ``video_ref_token`` stays accepted for workflows that pinned one, but the
    dialect resolved from the installed node is the default and the correct
    answer in every other case.
    """
    dialect = resolve_h3_dialect(adapter, capabilities)
    token = (video_ref_token or "").strip()
    if not token or token.lower() == "auto":
        token = dialect["video_token"]
    motion = build_camera_motion_block(track, max_phases=max_phases) if template == "auto" else str(template)
    return (
        f"Use {token} only as the camera-motion and shot-timing reference. "
        f"Do not reproduce its proxy geometry, grid, markers, textures, colors or placeholder "
        f"materials. Preserve the subject identity, scene appearance and visual styling described "
        f"by the main prompt and the other references.\n\n"
        f"Camera motion:\n{motion}\n\n"
        f"Follow the reference video's timing and framing evolution closely. "
        f"Reference duration: {track.duration_seconds:.3f}s at {track.fps} fps."
    )
