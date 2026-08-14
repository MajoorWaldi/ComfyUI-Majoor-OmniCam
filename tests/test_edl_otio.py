import pytest

from omnicam.core.edl import edl_to_shots, otio_to_shots, sequence_to_edl, sequence_to_otio
from omnicam.core.sequence import build_sequence


def _sequence():
    return build_sequence(
        [
            {"fps": 24, "duration_frames": 48, "keyframes": [{"frame": 0, "camera": {}}]},
            {"fps": 24, "duration_frames": 24, "keyframes": [{"frame": 0, "camera": {}}]},
        ],
        names=["Opening", "Orbit"],
        settings=[{"handle_in": 4}, {"handle_out": 2}],
    )


def test_sequence_to_edl_layout():
    edl = sequence_to_edl(_sequence())
    assert "TITLE: OMNICAM SEQUENCE" in edl
    assert "001" in edl and "002" in edl
    assert "* SHOT: Opening" in edl
    # Shot 1: record 00:00:00:00 → 00:00:02:00 at 24 fps (48 frames + handle margin excluded)
    assert "00:00:02:00" in edl


def test_edl_round_trip_shot_skeletons():
    edl = sequence_to_edl(_sequence())
    shots = edl_to_shots(edl, fps=24)
    assert [shot["name"] for shot in shots] == ["Opening", "Orbit"]
    assert shots[0]["duration_frames"] == 48  # handle_in clamps at frame 0
    assert shots[1]["duration_frames"] == 24 + 2


def test_edl_rejects_empty_input():
    with pytest.raises(ValueError):
        edl_to_shots("TITLE: nothing\n")


def test_sequence_to_otio_structure():
    otio = sequence_to_otio(_sequence())
    assert otio["OTIO_SCHEMA"] == "Timeline.1"
    clips = otio["tracks"]["children"][0]["children"]
    assert len(clips) == 2
    assert clips[0]["source_range"]["duration"]["value"] == 48
    assert clips[0]["source_range"]["duration"]["rate"] == 24
    assert clips[1]["metadata"]["omnicam"]["handles"] == {"in": 0, "out": 2}


def test_otio_round_trip_shot_skeletons():
    otio = sequence_to_otio(_sequence())
    shots = otio_to_shots(otio)
    assert [shot["name"] for shot in shots] == ["Opening", "Orbit"]
    assert [shot["duration_frames"] for shot in shots] == [48, 24]


def test_otio_rejects_non_timeline():
    with pytest.raises(ValueError):
        otio_to_shots({"OTIO_SCHEMA": "Clip.2"})
