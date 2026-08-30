from omnicam.core.motion_phases import segment_motion_phases
from omnicam.core.track import OmniCamTrack


def _track(keyframes, frames=121, fps=24):
    return OmniCamTrack.from_dict({
        "fps": fps, "duration_frames": frames, "width": 832, "height": 480,
        "keyframes": keyframes,
    })


def _key(frame, position, target=(0, 1.5, 0), **camera):
    return {
        "frame": frame,
        "camera": {"position": list(position), "target": list(target), **camera},
        "interpolation": "ease",
    }


def test_a_single_continuous_move_stays_one_phase():
    """One authored move must not be inflated into an invented four-act shot list."""
    phases = segment_motion_phases(_track([_key(0, (0, 1.5, 6)), _key(120, (0, 1.5, 2))]))
    assert len(phases) == 1
    assert phases[0]["axis"] == "dolly_in"


def test_a_static_track_reports_a_hold():
    phases = segment_motion_phases(_track([_key(0, (0, 1.5, 6)), _key(120, (0, 1.5, 6))]))
    assert len(phases) == 1
    assert phases[0]["axis"] == "hold"


def test_a_two_part_move_is_split_at_its_real_change_point():
    phases = segment_motion_phases(_track([
        _key(0, (0, 1.5, 6)), _key(60, (0, 1.5, 3)), _key(120, (3, 1.5, 3)),
    ]))
    assert [phase["axis"] for phase in phases] == ["dolly_in", "truck_right"]
    assert 1.5 <= phases[1]["start_seconds"] <= 3.5


def test_phase_spans_are_contiguous_and_cover_the_whole_track():
    phases = segment_motion_phases(_track([
        _key(0, (0, 1.5, 6)), _key(40, (0, 1.5, 3)), _key(80, (3, 1.5, 3)), _key(120, (3, 3.0, 3)),
    ]))
    assert phases[0]["start_seconds"] == 0.0
    for previous, following in zip(phases, phases[1:]):
        assert previous["end_seconds"] == following["start_seconds"]
    assert phases[-1]["end"] == 120


def test_adjacent_phases_never_repeat_the_same_axis():
    phases = segment_motion_phases(_track([
        _key(0, (0, 1.5, 6)), _key(43, (0, 1.5, 3.2)),
        _key(86, (2.6, 1.5, 3.0)), _key(120, (3.0, 1.5, 2.4)),
    ]))
    axes = [phase["axis"] for phase in phases]
    assert all(a != b for a, b in zip(axes, axes[1:]))


def test_phase_count_is_capped():
    keyframes = [_key(0, (0, 1.5, 6))]
    positions = [(0, 1.5, 4), (2, 1.5, 4), (2, 3, 4), (0, 3, 4), (0, 3, 6), (2, 3, 6)]
    for index, position in enumerate(positions):
        keyframes.append(_key(20 * (index + 1), position))
    phases = segment_motion_phases(_track(keyframes, frames=141), max_phases=3)
    assert 1 <= len(phases) <= 3


def test_rotation_is_detected_independently_of_translation():
    phases = segment_motion_phases(_track([
        _key(0, (0, 1.5, 6), target=(0, 1.5, 0)),
        _key(120, (0, 1.5, 6), target=(6, 1.5, 0)),
    ]))
    assert phases[0]["axis"] in {"pan_right", "pan_left"}


def test_optical_zoom_is_detected_on_a_locked_camera():
    phases = segment_motion_phases(_track([
        _key(0, (0, 1.5, 6), fov=50.0), _key(120, (0, 1.5, 6), fov=25.0),
    ]))
    assert phases[0]["axis"] == "zoom_in"
