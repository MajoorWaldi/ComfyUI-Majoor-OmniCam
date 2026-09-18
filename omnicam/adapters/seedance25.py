"""ByteDance Seedance 2.5 reference-to-video adapter.

Targets ComfyUI's ``ByteDance2ReferenceNodeV2`` ("ByteDance Seedance 2.5
Reference to Video"). Never the deprecated ``ByteDance2ReferenceNode``.

Constraints below are read from the upstream node/API, not invented here:
up to 30 reference images, up to 10 reference videos, up to 10 reference
audios, total reference-video duration <= 30.1s, each direct reference video
>= 1.8s, output duration 4-30s, ``task_type`` one of auto|reference|edit|extend.
OmniCam only ever emits ``reference`` -- a new shot from references, never an
edit or an extend of existing footage.
"""

from __future__ import annotations

from ..core.track import OmniCamTrack
from ..guides.analysis import build_camera_motion_block
from ..guides.model import ShotIntent

SEEDANCE25_NODE_CLASS = "ByteDance2ReferenceNodeV2"

#: Reference-media constraints read from the upstream node, not invented here.
SEEDANCE25_MEDIA_LIMITS = {
    "min_reference_video_seconds": 1.8,
    "max_total_reference_video_seconds": 30.1,
    "max_reference_videos": 10,
    "max_reference_images": 30,
    "max_reference_audios": 10,
    "min_output_duration_seconds": 4.0,
    "max_output_duration_seconds": 30.0,
}

#: Seedance's ``task_type`` widget also accepts auto/edit/extend, but OmniCam
#: only ever compiles a new shot from references -- never an edit or extend.
DEFAULT_TASK_TYPE = "reference"

MAX_REFERENCE_INDEX = 10


def seedance25_video_token(index: int) -> str:
    index = int(index)
    if not (1 <= index <= MAX_REFERENCE_INDEX):
        raise ValueError(f"Seedance reference index must be between 1 and {MAX_REFERENCE_INDEX}; got {index}")
    return f"Video {index}"


def resolve_seedance25_guide_style(intent: ShotIntent) -> str:
    """Auto-resolve the guide style from what the shot means to preserve (doc section 12.2).

    P0 always feeds a fixed camera-only intent (no Monitor widget authors a
    different one yet -- that is P1's Reference Role Matrix), but the
    resolution logic is written against the real ``ShotIntent`` so P1 only has
    to add the widget, not this function.
    """
    preserve = set(intent.net_preserve)
    if {"spatial_layout", "blocking"} & preserve:
        return "clay"
    if "final_appearance" in preserve:
        return "beauty_reference"
    return "motion_proxy"


def build_seedance25_prompt(
    track: OmniCamTrack,
    *,
    reference_index: int = 1,
    guide_style: str = "motion_proxy",
    max_phases: int = 4,
    include_camera_schedule: bool = False,
) -> str:
    """Role-first Seedance guide fragment (doc section 12.5).

    Leads with reference roles and preserve/ignore intent, not a numeric
    camera transcript: for Seedance, the guide pixels are the primary
    conditional signal, and the prompt clarifies their role rather than
    competing with them (doc section 12.1). Mirrors ``build_h3_prompt``'s
    shape: the caller composes this fragment with ``base_prompt``.
    """
    token = seedance25_video_token(reference_index)
    if guide_style == "clay":
        role_block = (
            f"Use {token} as the clay / white-model spatial reference.\n\n"
            f"Preserve from {token}:\n"
            f"camera movement, pacing, shot-size transitions, composition, "
            f"spatial layout, subject trajectory and blocking.\n\n"
            f"Do not copy the clay guide's grey proxy materials or temporary lighting."
        )
    else:
        role_block = (
            f"Use {token} as the camera-motion reference.\n\n"
            f"Preserve from {token}:\n"
            f"camera movement, viewpoint trajectory, framing evolution, pacing, "
            f"shot-size changes, parallax and shot timing.\n\n"
            f"Do not copy from {token}:\n"
            f"proxy geometry, grey materials, placeholder subjects, textures, "
            f"colors, lighting or final appearance."
        )
    sections = [
        role_block,
        "Use the other declared references and the main art-direction prompt for "
        "subject identity, design, action and final look.",
    ]
    if include_camera_schedule:
        sections.append(f"Camera schedule:\n{build_camera_motion_block(track, max_phases=max_phases)}")
    return "\n\n".join(sections)
