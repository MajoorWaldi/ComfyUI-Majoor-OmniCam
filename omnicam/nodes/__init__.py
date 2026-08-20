from __future__ import annotations

from comfy_api.latest import IO

from .base import (
    OMNICAM_ATI_BRIDGE,
    OMNICAM_EDITOR_STATE,
    OMNICAM_LTX_BRIDGE,
    OMNICAM_SEQUENCE,
    OMNICAM_TRACK,
    resolve_video,
    write_output,
)
from .director import MajoorOmniCamDirector
from .adapters import (
    MajoorOmniCamATIPreview,
    MajoorOmniCamControlPasses,
    MajoorOmniCamH3Adapter,
    MajoorOmniCamLTXAdapter,
    MajoorOmniCamLTXCameraGuide,
    MajoorOmniCamWanATIAdapter,
    MajoorOmniCamWanNativeCamera,
    MajoorOmniCamWanVideoWrapperATI,
)
from .tools import MajoorOmniCamTrackSampler
from .exports import (
    MajoorOmniCamBlenderExport,
    MajoorOmniCamUnrealExport,
)
from .sequence import (
    MajoorOmniCamSequenceBuilder,
    MajoorOmniCamSequenceEDL,
    MajoorOmniCamSequenceEDLImport,
    MajoorOmniCamSequenceManifest,
    MajoorOmniCamSequenceShot,
)

CORE_NODES = [
    MajoorOmniCamDirector,
    MajoorOmniCamH3Adapter,
    MajoorOmniCamWanNativeCamera,
    MajoorOmniCamLTXCameraGuide,
]

PRO_NODES = [
    MajoorOmniCamWanVideoWrapperATI,
]

DEV_NODES = [
    MajoorOmniCamTrackSampler,
    MajoorOmniCamWanATIAdapter,
    MajoorOmniCamATIPreview,
    MajoorOmniCamLTXAdapter,
    MajoorOmniCamControlPasses,
    MajoorOmniCamSequenceBuilder,
    MajoorOmniCamSequenceShot,
    MajoorOmniCamSequenceManifest,
    MajoorOmniCamSequenceEDL,
    MajoorOmniCamSequenceEDLImport,
    MajoorOmniCamBlenderExport,
    MajoorOmniCamUnrealExport,
]

def get_registered_nodes() -> list[type[IO.ComfyNode]]:
    from ..node_registry import get_registered_nodes as registry_nodes
    return registry_nodes()


__all__ = [
    "OMNICAM_TRACK",
    "OMNICAM_ATI_BRIDGE",
    "OMNICAM_LTX_BRIDGE",
    "OMNICAM_SEQUENCE",
    "OMNICAM_EDITOR_STATE",
    "resolve_video",
    "write_output",
    "MajoorOmniCamDirector",
    "MajoorOmniCamH3Adapter",
    "MajoorOmniCamWanNativeCamera",
    "MajoorOmniCamWanVideoWrapperATI",
    "MajoorOmniCamWanATIAdapter",
    "MajoorOmniCamATIPreview",
    "MajoorOmniCamLTXAdapter",
    "MajoorOmniCamLTXCameraGuide",
    "MajoorOmniCamControlPasses",
    "MajoorOmniCamTrackSampler",
    "MajoorOmniCamBlenderExport",
    "MajoorOmniCamUnrealExport",
    "MajoorOmniCamSequenceBuilder",
    "MajoorOmniCamSequenceShot",
    "MajoorOmniCamSequenceManifest",
    "MajoorOmniCamSequenceEDL",
    "MajoorOmniCamSequenceEDLImport",
    "CORE_NODES",
    "PRO_NODES",
    "DEV_NODES",
    "get_registered_nodes",
]
