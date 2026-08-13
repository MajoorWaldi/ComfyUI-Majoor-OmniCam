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
