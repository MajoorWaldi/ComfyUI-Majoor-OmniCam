"""Versioned upstream adapter contracts used by diagnostics and prequeue checks."""

from __future__ import annotations

import hashlib
import json
from typing import Any


def input_fingerprint(inputs: list[str], widgets: list[str] | None = None) -> str:
    """Return a stable fingerprint for the downstream input surface."""
    payload = {"inputs": sorted(inputs), "widgets": sorted(widgets or [])}
    encoded = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("ascii")
    return f"sha256:{hashlib.sha256(encoded).hexdigest()}"


def _requirement(
    any_of: list[str], inputs: list[str], widgets: list[str] | None = None,
) -> dict[str, list[str]]:
    return {
        "any_of": list(any_of),
        "expected_inputs": list(inputs),
        "expected_widgets": list(widgets or []),
    }


def _contract(
    *,
    display_name: str,
    target: str,
    node_classes: list[list[str]],
    inputs: list[str],
    repository: str,
    tested_ref: str,
    tested_commit: str,
    docs: str,
    connection_recipe: str,
    widgets: list[str] | None = None,
    motion_limits: dict[str, str] | None = None,
    requirements: list[dict[str, list[str]]] | None = None,
) -> dict[str, Any]:
    stage_requirements = requirements or [
        _requirement(group, inputs, widgets) for group in node_classes
    ]
    return {
        "display_name": display_name,
        "target": target,
        "required_node_classes": node_classes,
        "expected_inputs": inputs,
        "expected_widgets": widgets or [],
        "requirements": stage_requirements,
        "input_fingerprint": input_fingerprint(inputs, widgets),
        "upstream": {"repository": repository, "tested_ref": tested_ref, "tested_commit": tested_commit},
        "tested_version": tested_ref,
        "tested_commit": tested_commit,
        "docs": docs,
        "motion_limits": motion_limits or {},
        "connection_recipe": connection_recipe,
    }


# `12d5279438bfefc058a269eae805ceab6047777f` is ComfyUI's immutable v0.34.0
# release commit. External adapter commits are pinned rather than inferred from
# their `master`.
ADAPTER_INFO = {
    "wan_camera_native": _contract(
        display_name="Wan Camera",
        target="WAN_CAMERA_EMBEDDING",
        node_classes=[["WanCameraImageToVideo"]],
        inputs=["camera_conditions"],
        repository="https://github.com/Comfy-Org/ComfyUI",
        tested_ref="v0.34.0",
        tested_commit="12d5279438bfefc058a269eae805ceab6047777f",
        docs="https://github.com/Comfy-Org/ComfyUI",
        motion_limits={"length": "4n+1"},
        connection_recipe="Connect camera_embedding to Wan Camera Image to Video.camera_conditions.",
    ),
    "wan_track_native": _contract(
        display_name="Wan Motion Tracks",
        target="WanTrackToVideo tracks STRING",
        node_classes=[["WanTrackToVideo"]],
        inputs=["tracks"],
        repository="https://github.com/Comfy-Org/ComfyUI",
        tested_ref="v0.34.0",
        tested_commit="12d5279438bfefc058a269eae805ceab6047777f",
        docs="https://github.com/Comfy-Org/ComfyUI",
        connection_recipe="Connect the OmniCam tracks STRING to WanTrackToVideo.tracks.",
    ),
    "wan_move_native": _contract(
        display_name="Wan Move Native",
        target="WanMoveTrackToVideo TRACKS",
        node_classes=[["WanMoveTrackToVideo"]],
        inputs=["tracks"],
        widgets=["width", "height", "length"],
        repository="https://github.com/Comfy-Org/ComfyUI",
        tested_ref="v0.34.0",
        tested_commit="12d5279438bfefc058a269eae805ceab6047777f",
        docs="https://github.com/Comfy-Org/ComfyUI/blob/v0.34.0/comfy_extras/nodes_wanmove.py",
        motion_limits={"length": "4n+1"},
        connection_recipe=(
            "Connect native_tracks to WanMoveTrackToVideo.tracks. The TRACKS type is "
            "comfy_api.latest.io.Tracks: a dict of track_path [frames, tracks, 2] and "
            "track_visibility [frames, tracks], which is exactly what this profile emits."
        ),
    ),
    "h3_api": _contract(
        display_name="MiniMax H3 - Comfy API",
        target="reference video and prompt",
        node_classes=[["MinimaxHailuo03ReferenceNode"]],
        inputs=["reference_video"],
        repository="https://github.com/Comfy-Org/ComfyUI",
        tested_ref="v0.34.0",
        tested_commit="12d5279438bfefc058a269eae805ceab6047777f",
        docs="https://github.com/Comfy-Org/ComfyUI/blob/v0.34.0/comfy_api_nodes/nodes_minimax.py",
        connection_recipe="Use the playblast as Omni Reference and the generated prompt as camera-motion guidance.",
    ),
    "h3_native": _contract(
        display_name="MiniMax H3 - Native",
        target="reference frames and prompt",
        node_classes=[["MiniMaxH3ReferenceToVideo"]],
        inputs=["ref_videos"],
        repository="https://github.com/Comfy-Org/ComfyUI",
        tested_ref="v0.34.0",
        tested_commit="12d5279438bfefc058a269eae805ceab6047777f",
        docs="https://github.com/Comfy-Org/ComfyUI/blob/v0.34.0/comfy_extras/nodes_minimax_h3.py",
        motion_limits={"length": "17n+5"},
        connection_recipe="Wire reference_frames into ref_video_1 and use the generated <Video 1> prompt.",
    ),
    "ltx25_motion_track": _contract(
        display_name="LTX 2.5 Motion Track",
        target="LTXVDrawTracks tracks STRING",
        node_classes=[["LTXVDrawTracks"], ["LTXAddVideoICLoRAGuide", "LTXAddVideoICLoRAGuideAdvanced", "LTXVAddGuide"]],
        inputs=["tracks"],
        widgets=["width", "height"],
        requirements=[
            _requirement(["LTXVDrawTracks"], ["tracks"], ["width", "height"]),
            _requirement(
                ["LTXAddVideoICLoRAGuide", "LTXAddVideoICLoRAGuideAdvanced", "LTXVAddGuide"],
                ["image"],
            ),
        ],
        repository="https://github.com/Lightricks/ComfyUI-LTXVideo",
        tested_ref="ac4d99839020b983e956a8ab67ec38aec1b6e65a",
        tested_commit="ac4d99839020b983e956a8ab67ec38aec1b6e65a",
        docs="https://github.com/Lightricks/ComfyUI-LTXVideo/blob/master/sparse_tracks.py",
        motion_limits={"length": "8n+1"},
        connection_recipe="Connect tracks to LTXVDrawTracks, then its IMAGE into LTX Add Video IC-LoRA Guide.",
    ),
    "wanvideo_ati": _contract(
        display_name="Wan 2.1 ATI - WanVideoWrapper",
        target="WanVideoATITracks tracks STRING",
        node_classes=[["WanVideoATITracks"]],
        inputs=["tracks"],
        widgets=["width", "height"],
        repository="https://github.com/kijai/ComfyUI-WanVideoWrapper",
        tested_ref="088128b224242e110d3906c6750e9a3a348a659b",
        tested_commit="088128b224242e110d3906c6750e9a3a348a659b",
        docs="https://github.com/kijai/ComfyUI-WanVideoWrapper",
        connection_recipe="Connect tracks only when the detected input contract is verified.",
    ),
}

CAPABILITY_STATES = ("missing", "detected_unverified", "verified", "incompatible")
