from omnicam.core.camera_tools import (
    add_camera_shake,
    animate_fov,
    apply_camera_preset,
    apply_dolly_zoom,
    constrain_arc,
    constrain_look_at,
    follow_track_target,
    motion_speed_profile,
    smooth_camera_path,
)
from omnicam.core.track import OmniCamTrack


def test_camera_presets_preserve_track_contract():
    track = OmniCamTrack.from_dict({"duration_frames": 24})
    orbit = apply_camera_preset(track, "orbit_left")
    assert orbit.schema_version == track.schema_version
    assert orbit.duration_frames == 24
    assert orbit.keyframes[-1].camera.position != orbit.keyframes[0].camera.position

    product = apply_camera_preset(track, "product_360")
    assert len(product.keyframes) >= 9
    assert product.keyframes[len(product.keyframes) // 2].camera.position != product.keyframes[0].camera.position
    assert product.keyframes[-1].camera.position == product.keyframes[0].camera.position


def test_camera_tools_are_deterministic_and_keep_dimensions():
    track = OmniCamTrack.from_dict({"duration_frames": 12, "width": 640, "height": 360})
    assert add_camera_shake(track, seed=42).to_dict() == add_camera_shake(track, seed=42).to_dict()
    assert smooth_camera_path(track).width == 640
    assert apply_dolly_zoom(track).height == 360
    assert constrain_look_at(track, [1, 2, 3]).keyframes[0].camera.target == [1.0, 2.0, 3.0]
    assert len(motion_speed_profile(track)) == 12
    assert animate_fov(track, 2).keyframes[-1].camera.fov < track.keyframes[0].camera.fov
    assert constrain_arc(track).duration_frames == track.duration_frames
    assert follow_track_target(track).schema_version == 1


def test_focal_length_conversion_and_trajectory_analysis():
    from omnicam.core.camera_tools import (
        analyze_camera_trajectory,
        build_cinematic_motion_prompt,
        focal_length_to_fov,
        fov_to_focal_length,
    )

    # 50mm on 36mm sensor gives ~39.6° horizontal FOV
    fov_50 = focal_length_to_fov(50.0, 36.0)
    assert 38.0 < fov_50 < 42.0
    assert abs(fov_to_focal_length(fov_50, 36.0) - 50.0) < 0.1

    # 24mm wide lens
    fov_24 = focal_length_to_fov(24.0, 36.0)
    assert 70.0 < fov_24 < 76.0

    track = OmniCamTrack.from_dict({"duration_frames": 24, "fps": 24})
    orbit_track = apply_camera_preset(track, "orbit_left", 1.0)
    analysis = analyze_camera_trajectory(orbit_track)
    assert len(analysis["movements"]) > 0
    assert "orbit" in analysis["primary_movement"] or "orbit" in str(analysis["movements"])
    assert analysis["start_focal_mm"] > 0

    prompt = build_cinematic_motion_prompt(orbit_track, base_prompt="A futuristic neon city")
    assert "A futuristic neon city" in prompt
    assert "Cinematic" in prompt
    assert "fps" in prompt

    prompt_h3 = build_cinematic_motion_prompt(orbit_track, style="h3")
    assert "The camera executes" in prompt_h3
    assert "framing" in prompt_h3

    prompt_kling = build_cinematic_motion_prompt(orbit_track, style="kling")
    assert "Camera Movement:" in prompt_kling
    assert "Lens:" in prompt_kling

    prompt_luma = build_cinematic_motion_prompt(orbit_track, style="luma")
    assert "Camera motion:" in prompt_luma

    prompt_hunyuan = build_cinematic_motion_prompt(orbit_track, style="hunyuan")
    assert "Film captured" in prompt_hunyuan

    prompt_wan = build_cinematic_motion_prompt(orbit_track, style="wan")
    assert "Dynamic camera movement:" in prompt_wan
