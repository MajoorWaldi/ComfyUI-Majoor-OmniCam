"""Versioned adapter metadata used by diagnostics, docs and prequeue checks.

`expected_inputs` are socket names read from the installed nodes themselves, not
guessed. Two of them were wrong and made the diagnostic report a healthy install
as incompatible: the LTX guide takes `image`, not `images`, and the MiniMax H3
reference node takes `reference_video` inside an Autogrow template, not `video`.
"""

ADAPTER_INFO = {
    "wan_native": {"display_name": "Wan Native Camera", "target": "WAN_CAMERA_EMBEDDING", "required_node_classes": ["WanCameraImageToVideo"], "expected_inputs": ["camera_conditions"], "expected_outputs": [], "tested_version": None, "tested_commit": None, "docs": "https://github.com/Comfy-Org/ComfyUI", "motion_limits": {"length": "4n+1"}, "connection_recipe": "Connect camera_embedding to the camera_conditions input of Wan Camera Image to Video."},
    "h3": {"display_name": "MiniMax H3 Omni Reference", "target": "reference video and prompt", "required_node_classes": ["MinimaxHailuo03ReferenceNode"], "expected_inputs": ["reference_video"], "expected_outputs": [], "tested_version": None, "tested_commit": None, "docs": "https://github.com/Comfy-Org/ComfyUI", "motion_limits": {}, "connection_recipe": "Use the playblast as Omni Reference and the generated prompt as camera-motion guidance."},
    "ltx": {"display_name": "LTX Camera Guide", "target": "IMAGE guide frames", "required_node_classes": ["LTXAddVideoICLoRAGuide", "LTXAddVideoICLoRAGuideAdvanced", "LTXVAddGuide"], "expected_inputs": ["image"], "expected_outputs": [], "tested_version": None, "tested_commit": None, "docs": "https://github.com/Lightricks/ComfyUI-LTXVideo", "motion_limits": {}, "connection_recipe": "Connect guide_frames after verifying the installed LTX node inputs."},
    "wan_ati": {"display_name": "WanVideoWrapper ATI", "target": "WanVideoATITracks tracks STRING", "required_node_classes": ["WanVideoATITracks"], "expected_inputs": ["tracks"], "expected_outputs": [], "tested_version": "2026.08 contract", "expected_widgets": ["width", "height"], "tested_commit": None, "docs": "https://github.com/kijai/ComfyUI-WanVideoWrapper", "motion_limits": {}, "connection_recipe": "Connect tracks only when the detected input contract is verified."},
    "wan_tracks_native": {"display_name": "ComfyUI Wan Track To Video", "target": "WanTrackToVideo tracks STRING", "required_node_classes": ["WanTrackToVideo"], "expected_inputs": ["tracks"], "expected_outputs": [], "tested_version": None, "tested_commit": None, "docs": "https://github.com/Comfy-Org/ComfyUI", "motion_limits": {}, "connection_recipe": "Connect the OmniCam tracks STRING to WanTrackToVideo.tracks."},
}

CAPABILITY_STATES = ("missing", "detected_unverified", "verified", "incompatible")
