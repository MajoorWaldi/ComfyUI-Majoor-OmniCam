"""Concrete profile roster, imported only by compilation entry points."""

from .h3 import H3_API_PROFILE, H3_NATIVE_PROFILE
from .ltx_motion import LTX_MOTION_PROFILE
from .registry import ProfileRegistry
from .wan_camera import WAN_CAMERA_PROFILE
from .wan_move import WAN_MOVE_PROFILE
from .wan_track import WAN_TRACK_PROFILE
from .wanvideo_ati import WANVIDEO_ATI_PROFILE

PROFILE_REGISTRY = ProfileRegistry(
    [
        WAN_CAMERA_PROFILE,
        WAN_MOVE_PROFILE,
        WAN_TRACK_PROFILE,
        WANVIDEO_ATI_PROFILE,
        H3_NATIVE_PROFILE,
        H3_API_PROFILE,
        LTX_MOTION_PROFILE,
    ]
)

__all__ = ["PROFILE_REGISTRY"]
