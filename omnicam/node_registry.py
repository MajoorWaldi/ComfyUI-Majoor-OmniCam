"""Single source of truth for OmniCam's currently enabled public nodes."""

from __future__ import annotations

PRODUCT_NODES = (
    "MajoorOmniCamDirector",
    "MajoorOmniCamExtractor",
    "MajoorOmniCamMonitor",
)

COMPATIBILITY_NODES = (
    "MajoorOmniCamH3Adapter",
    "MajoorOmniCamWanNativeCamera",
    "MajoorOmniCamLTXCameraGuide",
    "MajoorOmniCamWanVideoWrapperATI",
)

REGISTERED_NODE_IDS = PRODUCT_NODES + COMPATIBILITY_NODES
PUBLIC_NODES = PRODUCT_NODES

LEGACY_NODE_IDS = frozenset({
    "MajoorOmniCamSequencer",
    "MajoorOmniCamTrackSampler", "MajoorOmniCamWanATIAdapter", "MajoorOmniCamATIPreview",
    "MajoorOmniCamLTXAdapter", "MajoorOmniCamControlPasses", "MajoorOmniCamCameraTools",
    "MajoorOmniCamSequence", "MajoorOmniCamSequenceBuilder", "MajoorOmniCamSequenceShot",
    "MajoorOmniCamSequenceManifest", "MajoorOmniCamSequenceEDL", "MajoorOmniCamSequenceEDLImport",
    "MajoorOmniCamDCCExport", "MajoorOmniCamBlenderExport", "MajoorOmniCamUnrealExport",
})

INTERNAL_COMPONENTS = ("camera_tools", "scene_motion_analysis")


def get_registered_nodes():
    from .nodes.adapters import (
        MajoorOmniCamH3Adapter,
        MajoorOmniCamLTXCameraGuide,
        MajoorOmniCamWanNativeCamera,
        MajoorOmniCamWanVideoWrapperATI,
    )
    from .nodes.director import MajoorOmniCamDirector
    from .nodes.extractor import MajoorOmniCamExtractor
    from .nodes.monitor import MajoorOmniCamMonitor

    if len(REGISTERED_NODE_IDS) != len(set(REGISTERED_NODE_IDS)):
        raise RuntimeError("OmniCam registered node IDs must be unique")
    return [
        MajoorOmniCamDirector,
        MajoorOmniCamExtractor,
        MajoorOmniCamMonitor,
        MajoorOmniCamH3Adapter,
        MajoorOmniCamWanNativeCamera,
        MajoorOmniCamLTXCameraGuide,
        MajoorOmniCamWanVideoWrapperATI,
    ]
