from omnicam.core.lighting_semantics import analyze_lighting
from omnicam.core.track import CameraState


def test_lighting_semantics_respects_explicit_roles_and_camera_relative_direction():
    camera = CameraState([0, 0, 5], [0, 0, 0])
    lights = [
        {"id": "key", "type": "point_light", "position": [2, 4, 3], "intensity": 2, "color": "#ffd9b0", "light_role": "key"},
        {"id": "rim", "type": "point_light", "position": [-2, 3, -4], "intensity": 1, "color": "#9fbfff", "light_role": "rim"},
    ]
    semantic = analyze_lighting(lights, camera, frame=0, subject_center=[0, 0, 0])
    assert semantic is not None
    assert semantic.active_light_count == 2
    assert semantic.key_direction == "front_right"
    assert semantic.key_height == "high"
    assert semantic.key_color == "#ffd9b0"
    assert semantic.rim_direction == "rear_left"


def test_lighting_semantics_does_not_invent_lights():
    assert analyze_lighting([], CameraState([0, 0, 5], [0, 0, 0]), frame=0, subject_center=[0, 0, 0]) is None


def test_sun_light_direction_uses_the_same_subject_to_light_convention_as_point_lights():
    # The Director's own default scene (web-src/director/core.js): a sun_light
    # authored to key the subject from camera-front-ish, high. A directional
    # light's shine vector points light->subject, so it must be negated to the
    # subject->light convention point_light already uses, or every sun/spot
    # light direction comes out mirrored front<->rear, left<->right.
    camera = CameraState([6.0, 4.0, 6.0], [0.0, 1.5, 0.0])
    lights = [{
        "id": "sun", "type": "sun_light", "position": [5.0, 8.5, 4.0], "rotation": [-55, 35, 0],
        "intensity": 2.2, "color": "#fff6ec", "light_role": "key",
    }]
    semantic = analyze_lighting(lights, camera, frame=0, subject_center=[0.0, 1.5, 0.0])
    assert semantic is not None
    assert semantic.key_direction == "front"
    assert semantic.key_height == "high"