from __future__ import annotations

import os

import folder_paths

from ..comfy_compat import IO, InputImpl
from ..core.motion_scene import MOTION_SCENE_IO_TYPE
from ..core.track import OmniCamTrack
from ..core.validation import validate_track_payload

OMNICAM_MOTION_SCENE = IO.Custom(MOTION_SCENE_IO_TYPE)


def resolve_video(path: str | None):
    if not path:
        return None
    try:
        resolved = folder_paths.get_annotated_filepath(path)
    except ValueError:
        return None
    if not resolved or not os.path.isfile(resolved):
        return None
    return InputImpl.VideoFromFile(resolved)


def validated_track(payload: dict) -> OmniCamTrack:
    """Apply resource limits and strict canonical validation at node boundaries."""
    return OmniCamTrack.from_dict(validate_track_payload(payload))


# Backward compatibility aliases
_resolve_video = resolve_video
