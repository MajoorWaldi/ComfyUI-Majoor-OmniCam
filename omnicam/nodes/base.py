from __future__ import annotations

import os

import folder_paths

from ..comfy_compat import IO, InputImpl
from ..core.track import OmniCamTrack
from ..core.validation import validate_track_payload

OMNICAM_TRACK = IO.Custom("MAJOOR_OMNICAM_TRACK")
OMNICAM_SHOT_COLLECTION = IO.Custom("MAJOOR_OMNICAM_SHOT_COLLECTION")
OMNICAM_ATI_BRIDGE = IO.Custom("MAJOOR_OMNICAM_ATI_BRIDGE")
OMNICAM_LTX_BRIDGE = IO.Custom("MAJOOR_OMNICAM_LTX_BRIDGE")
OMNICAM_SEQUENCE = IO.Custom("MAJOOR_OMNICAM_SEQUENCE")
OMNICAM_SEQUENCE_TIME = IO.Custom("OMNICAM_SEQUENCE_TIME")
OMNICAM_EDIT_SEQUENCE = IO.Custom("MAJOOR_OMNICAM_EDIT_SEQUENCE")
OMNICAM_EDITOR_STATE = IO.Custom("OMNICAM_EDITOR_STATE")


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
