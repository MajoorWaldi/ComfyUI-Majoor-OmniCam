from __future__ import annotations

import os
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

ALL_NODES = CORE_NODES + PRO_NODES + DEV_NODES


def get_registered_nodes() -> list[type[IO.ComfyNode]]:
    if os.environ.get("OMNICAM_EXPERIMENTAL_NODES") == "1":
        return CORE_NODES + PRO_NODES + DEV_NODES
    return CORE_NODES + PRO_NODES


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
    "ALL_NODES",
    "get_registered_nodes",
]
