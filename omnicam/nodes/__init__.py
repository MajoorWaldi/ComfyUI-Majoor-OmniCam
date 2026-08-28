"""V3 node package for OmniCam.

Only the five nodes listed in :mod:`omnicam.node_registry` are ever loaded by
ComfyUI. ``tools`` stays importable for internal reuse but is not registered.
"""

from __future__ import annotations

from comfy_api.latest import IO

from .adapters import (
    MajoorOmniCamH3Adapter,
    MajoorOmniCamLTXCameraGuide,
    MajoorOmniCamWanNativeCamera,
    MajoorOmniCamWanVideoWrapperATI,
)
from .base import (
    OMNICAM_ATI_BRIDGE,
    OMNICAM_EDITOR_STATE,
    OMNICAM_LTX_BRIDGE,
    OMNICAM_SHOT_COLLECTION,
    OMNICAM_TRACK,
    resolve_video,
    validated_track,
)
from .director import MajoorOmniCamDirector


def get_registered_nodes() -> list[type[IO.ComfyNode]]:
    from ..node_registry import get_registered_nodes as registry_nodes

    return registry_nodes()


__all__ = [
    "OMNICAM_ATI_BRIDGE",
    "OMNICAM_EDITOR_STATE",
    "OMNICAM_LTX_BRIDGE",
    "OMNICAM_SHOT_COLLECTION",
    "OMNICAM_TRACK",
    "MajoorOmniCamDirector",
    "MajoorOmniCamH3Adapter",
    "MajoorOmniCamLTXCameraGuide",
    "MajoorOmniCamWanNativeCamera",
    "MajoorOmniCamWanVideoWrapperATI",
    "get_registered_nodes",
    "resolve_video",
    "validated_track",
]
