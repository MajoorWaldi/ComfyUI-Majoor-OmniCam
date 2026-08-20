"""Compatibility facade for imports that predate the split V3 node package.

New node implementations belong in :mod:`omnicam.nodes` modules and are
registered by ``omnicam.nodes.get_registered_nodes``.
"""

from __future__ import annotations

from .nodes import (
    ALL_NODES,
    CORE_NODES,
    DEV_NODES,
    OMNICAM_ATI_BRIDGE,
    OMNICAM_EDITOR_STATE,
    OMNICAM_LTX_BRIDGE,
    OMNICAM_SEQUENCE,
    OMNICAM_TRACK,
    PRO_NODES,
    MajoorOmniCamATIPreview,
    MajoorOmniCamBlenderExport,
    MajoorOmniCamControlPasses,
    MajoorOmniCamDirector,
    MajoorOmniCamH3Adapter,
    MajoorOmniCamLTXAdapter,
    MajoorOmniCamLTXCameraGuide,
    MajoorOmniCamSequenceBuilder,
    MajoorOmniCamSequenceEDL,
    MajoorOmniCamSequenceEDLImport,
    MajoorOmniCamSequenceManifest,
    MajoorOmniCamSequenceShot,
    MajoorOmniCamTrackSampler,
    MajoorOmniCamUnrealExport,
    MajoorOmniCamWanATIAdapter,
    MajoorOmniCamWanNativeCamera,
    MajoorOmniCamWanVideoWrapperATI,
    get_registered_nodes,
    resolve_video,
    write_output,
)
from .nodes.base import _resolve_video, _write_output

__all__ = [
    "OMNICAM_TRACK",
    "OMNICAM_ATI_BRIDGE",
    "OMNICAM_LTX_BRIDGE",
    "OMNICAM_SEQUENCE",
    "OMNICAM_EDITOR_STATE",
    "resolve_video",
    "write_output",
    "_resolve_video",
    "_write_output",
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
