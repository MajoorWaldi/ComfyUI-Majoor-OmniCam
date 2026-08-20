"""Versioned adapter metadata used by diagnostics, docs and prequeue checks."""

ADAPTER_INFO = {
    "wan_native": {"display_name": "Wan Native Camera", "target": "WAN_CAMERA_EMBEDDING", "required_node_classes": ["WanCameraImageToVideo"], "expected_inputs": ["camera_embedding"], "expected_outputs": [], "tested_version": None, "tested_commit": None, "docs": "https://github.com/Comfy-Org/ComfyUI", "motion_limits": {"length": "4n+1"}, "connection_recipe": "Connect camera_embedding to Wan Camera Image to Video."},
    "h3": {"display_name": "MiniMax H3 Omni Reference", "target": "reference video and prompt", "required_node_classes": ["MinimaxHailuo03ReferenceNode", "MiniMaxHailuo03Reference"], "expected_inputs": ["video", "prompt"], "expected_outputs": [], "tested_version": None, "tested_commit": None, "docs": "https://github.com/Comfy-Org/ComfyUI", "motion_limits": {}, "connection_recipe": "Use the playblast as Omni Reference and the generated prompt as camera-motion guidance."},
    "ltx": {"display_name": "LTX Camera Guide", "target": "IMAGE guide frames", "required_node_classes": ["LTXVAddVideoICLoRAGuide", "LTXVAddGuide"], "expected_inputs": ["images"], "expected_outputs": [], "tested_version": None, "tested_commit": None, "docs": "https://github.com/Lightricks/ComfyUI-LTXVideo", "motion_limits": {}, "connection_recipe": "Connect guide_frames after verifying the installed LTX node inputs."},
    "wan_ati": {"display_name": "WanVideoWrapper ATI", "target": "WanVideoATITracks tracks STRING", "required_node_classes": ["WanVideoATITracks"], "expected_inputs": ["tracks"], "expected_outputs": [], "tested_version": "2026.08 contract", "tested_commit": None, "docs": "https://github.com/kijai/ComfyUI-WanVideoWrapper", "motion_limits": {}, "connection_recipe": "Connect tracks only when the detected input contract is verified."},
}

CAPABILITY_STATES = ("missing", "detected_unverified", "verified", "incompatible")
