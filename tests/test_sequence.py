import pytest

from omnicam.core.sequence import build_sequence, playblast_manifest, sequence_to_json, validate_sequence
from omnicam.core.track import OmniCamTrack


def test_sequence_builds_contiguous_named_shots():
    first = OmniCamTrack.from_dict({"duration_frames": 12}).to_dict()
    second = OmniCamTrack.from_dict({"duration_frames": 20}).to_dict()
    first["metadata"]["recording_path"] = "omnicam/playblasts/wide.webm [input]"
    sequence = build_sequence([first, second], ["Wide", "Close"], [{"handle_in": 4, "reference": "hero"}])
    assert sequence["duration_frames"] == 32
    assert sequence["shots"][1]["start_frame"] == 12
    assert sequence["shots"][1]["end_frame"] == 31
    assert sequence["shots"][1]["index"] == 1
    assert sequence["shots"][1]["name"] == "Close"
    assert sequence["shots"][0]["handles"]["in"] == 4
    assert sequence["shots"][0]["reference"] == "hero"
    assert playblast_manifest(sequence)[0]["recording_path"].endswith("[input]")
    assert '"schema_version": 1' in sequence_to_json(sequence)


def test_sequence_validation_rejects_unknown_schema():
    with pytest.raises(ValueError, match="Unsupported"):
        validate_sequence({"schema_version": 2, "shots": []})


def test_sequence_rejects_mixed_frame_rates():
    with pytest.raises(ValueError, match="same fps"):
        build_sequence([OmniCamTrack.from_dict({"fps": 24}).to_dict(), OmniCamTrack.from_dict({"fps": 30}).to_dict()])
