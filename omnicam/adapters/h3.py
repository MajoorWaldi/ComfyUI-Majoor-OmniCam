from __future__ import annotations

from ..core.track import OmniCamTrack

H3_PROXY_PRESETS = {
    "balanced": {"render_mode": "omni_ref", "point_count": 90, "burn_in": False},
    "parallax": {"render_mode": "point_field", "point_count": 160, "burn_in": False},
    "subject": {"render_mode": "card_grid", "point_count": 48, "burn_in": False},
    "debug": {"render_mode": "omni_ref", "point_count": 90, "burn_in": True},
}

# Model-specific recommended motion limits (adapter scope only; the core stays neutral).
# Units: world units/s, degrees/s, world units/s², world units/s³, degrees total.
H3_RECOMMENDED_MOTION_LIMITS = {
    "max_speed": 8.0,
    "max_angular_speed": 120.0,
    "max_acceleration": 40.0,
    "max_jerk": 400.0,
    "max_fov_change": 25.0,
    "allow_framing_loss": False,
}


def classify_camera_motion(track: OmniCamTrack) -> str:
    from ..core.camera_tools import analyze_camera_trajectory

    analysis = analyze_camera_trajectory(track)
    return str(analysis["classification"]["primary"])


def build_h3_prompt(track: OmniCamTrack, video_ref_token: str = "<Video 1>", template: str = "auto") -> str:
    motion = classify_camera_motion(track) if template == "auto" else template
    return (
        f"Use {video_ref_token} exclusively as the camera-motion reference. "
        f"The intended move is {motion.replace('_', ' ')}. Reproduce its camera trajectory, "
        "framing evolution, speed, acceleration, parallax, "
        "and timing. Do not copy the proxy geometry, grid, markers, textures, or colors from "
        f"{video_ref_token}. Preserve the identity, scene, styling, and subject appearance from "
        "the other Omni References. Treat the proxy video as spatial/camera guidance only. "
        f"Reference duration: {track.duration_seconds:.3f}s at {track.fps} fps."
    )
