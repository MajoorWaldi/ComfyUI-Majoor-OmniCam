import math

from omnicam.core.camera_semantics import analyze_camera_view, classify_lens, classify_roll, classify_shot
from omnicam.core.track import CameraState


def test_camera_semantics_uses_front_plus_z_and_target_offset():
    camera = CameraState(position=[2.0, 1.0, 6.0], target=[2.0, 1.0, 0.0], fov=26.99146656159162)
    semantic = analyze_camera_view(camera, objects=[], width=1280, height=720, frame=0)
    assert semantic.viewpoint == "front"
    assert semantic.vertical_angle == "eye_level"
    assert math.isclose(semantic.focal_length_mm, 50.0, rel_tol=1e-6)


def test_semantic_boundaries_are_stable():
    assert classify_roll(2.9) == "level"
    assert classify_roll(3) == "subtle_dutch"
    assert classify_roll(8) == "dutch"
    assert classify_roll(25) == "extreme_dutch"
    assert classify_lens(20) == "wide"
    assert classify_lens(32) == "normal"
    assert classify_lens(60) == "short_telephoto"
    assert classify_lens(100) == "telephoto"
    assert classify_lens(180) == "long_telephoto"
    assert classify_shot(0.55) == "medium_close_up"


def test_framing_projects_subject_bounds_and_classifies_shot():
    camera = CameraState(position=[0, 0, 6], target=[0, 0, 0], fov=60)
    subject = {"id": "subject", "type": "cube", "position": [0, 0, 0], "rotation": [0, 0, 0], "size": [2, 2, 2]}
    semantic = analyze_camera_view(camera, objects=[subject], width=1000, height=1000, frame=0)
    assert semantic.framing is not None
    assert semantic.framing.coverage_y > 0.2
    assert semantic.framing.subject_id == "subject"


def test_no_subject_does_not_invent_framing():
    semantic = analyze_camera_view(CameraState([0, 0, 5], [0, 0, 0]), objects=[{"id": "ground", "type": "ground"}], width=1280, height=720, frame=0)
    assert semantic.framing is None