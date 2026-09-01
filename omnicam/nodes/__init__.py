"""V3 node package for OmniCam.

Only product nodes listed by :mod:`omnicam.node_registry` are loaded by
ComfyUI. Internal tools remain unregistered.
"""

from __future__ import annotations

from ..comfy_compat import IO
from .base import (
    OMNICAM_MOTION_SCENE,
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
    "OMNICAM_MOTION_SCENE",
    "MajoorOmniCamDirector",
    "MajoorOmniCamExtractor",
    "MajoorOmniCamMonitor",
    "get_registered_nodes",
    "resolve_video",
    "validated_track",
]
