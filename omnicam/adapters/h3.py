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

from ..core.track import OmniCamTrack
from ..guides.analysis import build_camera_motion_block
from .h3_sections import H3_SOUNDSCAPE_FALLBACK, H3_TASK_MARKER, render_h3_sections

__all__ = [
    "DEFAULT_DIALECT",
    "H3_API_MEDIA_LIMITS",
    "H3_DIALECTS",
    "H3_NATIVE_MEDIA_LIMITS",
    "H3_PROXY_PRESETS",
    "H3_RECOMMENDED_MOTION_LIMITS",
    "build_camera_motion_block",
    "build_h3_prompt",
    "classify_camera_motion",
    "h3_dialect",
    "h3_native_aligned_length",
    "resolve_h3_dialect",
]

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

#: H3 documents reference-video slots 1-3 only; a higher index is read as
#: literal prompt text instead of binding the reference (see module docstring).
MAX_REFERENCE_INDEX = 3

H3_DIALECTS = {
    "comfy_api": {
        "id": "comfy_api",
        "display_name": "MiniMax H3 - Comfy API",
        "node_class": "MinimaxHailuo03ReferenceNode",
        "video_token_template": "Video {index}",
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
        "video_token_template": "<Video {index}>",
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


def build_h3_prompt(
    track: OmniCamTrack,
    video_ref_token: str | None = None,
    template: str = "auto",
    *,
    adapter: str = "h3",
    capabilities: dict[str, Any] | None = None,
    max_phases: int = 4,
    reference_index: int = 1,
) -> str:
    """The MiniMax Ref2VA six-section prompt for an H3 reference video.

    Ref2VA documents ``subject_definitions`` / ``summary`` / ``retention_analysis``
    / ``detailed_description`` / ``overall_soundscape`` / ``non_diegetic_music``,
    in that fixed order, referencing each media slot by its dialect token
    (``<Video N>`` native, ``Video N`` API). OmniCam's own guide only ever
    occupies the camera-motion role here -- subject, appearance and audio come
    from the main prompt and any other declared references, never from this
    video.

    ``video_ref_token`` stays accepted for workflows that pinned one, but the
    dialect resolved from the installed node is the default and the correct
    answer in every other case. ``reference_index`` picks which ``<Video N>``
    / ``Video N`` slot the guide occupies when other references are already
    connected (doc section 10.3) -- H3 documents slots 1-3 only.
    """
    dialect = resolve_h3_dialect(adapter, capabilities)
    token = (video_ref_token or "").strip()
    if not token or token.lower() == "auto":
        if not (1 <= int(reference_index) <= MAX_REFERENCE_INDEX):
            raise ValueError(
                f"reference_index must be between 1 and {MAX_REFERENCE_INDEX} for H3; "
                f"got {reference_index}"
            )
        token = dialect["video_token_template"].format(index=int(reference_index))
    motion = build_camera_motion_block(track, max_phases=max_phases) if template == "auto" else str(template)

    sections = {
        "subject_definitions": (
            f"{token} is the OmniCam motion-reference video. It defines camera translation, "
            "rotation, viewpoint evolution, parallax, shot-size changes and shot timing only. "
            "Subject identity, materials and final appearance come from the main prompt and any "
            "other declared references, never from this video."
        ),
        "summary": (
            f"{H3_TASK_MARKER} Generate the requested scene while preserving the camera work and "
            f"temporal structure carried by {token}."
        ),
        "retention_analysis": (
            f"{token} (camera translation, rotation, framing, parallax and shot timing): "
            "fully_preserved - preserve its physical camera trajectory, pacing, holds, "
            "acceleration/deceleration, shot-size changes and cuts exactly. Do not transfer its "
            "proxy geometry, grey materials, floor, markers, placeholder characters, textures, "
            "colors or lighting."
        ),
        "detailed_description": (
            f"The camera movement follows {token} throughout this shot.\n\n"
            f"Camera schedule:\n{motion}\n\n"
            f"Reference duration: {track.duration_seconds:.3f}s at {track.fps} fps."
        ),
        "overall_soundscape": H3_SOUNDSCAPE_FALLBACK,
        "non_diegetic_music": "N/A",
    }
    return render_h3_sections(sections)
