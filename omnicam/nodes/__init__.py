"""V3 node package for OmniCam.

Product nodes and compatibility facades listed by :mod:`omnicam.node_registry`
are loaded by ComfyUI. Internal tools remain unregistered.
"""

from __future__ import annotations

from ..comfy_compat import IO
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
from .extractor import MajoorOmniCamExtractor
from .monitor import MajoorOmniCamMonitor


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
    "MajoorOmniCamExtractor",
    "MajoorOmniCamH3Adapter",
    "MajoorOmniCamLTXCameraGuide",
    "MajoorOmniCamMonitor",
    "MajoorOmniCamWanNativeCamera",
    "MajoorOmniCamWanVideoWrapperATI",
    "get_registered_nodes",
    "resolve_video",
    "validated_track",
]
