"""Single source of truth for OmniCam's currently enabled public nodes."""

from __future__ import annotations

PUBLIC_NODES = (
    "MajoorOmniCamDirector",
    "MajoorOmniCamH3Adapter",
    "MajoorOmniCamWanNativeCamera",
    "MajoorOmniCamLTXCameraGuide",
    "MajoorOmniCamWanVideoWrapperATI",
)

LEGACY_NODE_IDS = frozenset({
    "MajoorOmniCamSequencer",
    "MajoorOmniCamTrackSampler", "MajoorOmniCamWanATIAdapter", "MajoorOmniCamATIPreview",
    "MajoorOmniCamLTXAdapter", "MajoorOmniCamControlPasses", "MajoorOmniCamCameraTools",
    "MajoorOmniCamSequence", "MajoorOmniCamSequenceBuilder", "MajoorOmniCamSequenceShot",
    "MajoorOmniCamSequenceManifest", "MajoorOmniCamSequenceEDL", "MajoorOmniCamSequenceEDLImport",
    "MajoorOmniCamDCCExport", "MajoorOmniCamBlenderExport", "MajoorOmniCamUnrealExport",
})

INTERNAL_COMPONENTS = ("track_sampler", "camera_tools", "scene_motion_analysis", "sequence", "dcc_export", "retime", "audio")


def get_registered_nodes():
    from .nodes.adapters import MajoorOmniCamH3Adapter, MajoorOmniCamLTXCameraGuide, MajoorOmniCamWanNativeCamera, MajoorOmniCamWanVideoWrapperATI
    from .nodes.director import MajoorOmniCamDirector

    if len(PUBLIC_NODES) != 5 or len(set(PUBLIC_NODES)) != 5:
        raise RuntimeError("OmniCam public registry must contain exactly five unique enabled nodes")
    return [
        MajoorOmniCamDirector,
        MajoorOmniCamH3Adapter,
        MajoorOmniCamWanNativeCamera,
        MajoorOmniCamLTXCameraGuide,
        MajoorOmniCamWanVideoWrapperATI,
    ]
