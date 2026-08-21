import pytest

from omnicam.core.director_shot import build_director_shot, build_shot_collection, validate_director_shot, validate_shot_collection
from omnicam.core.track import OmniCamTrack


def test_director_shot_preserves_runtime_media_and_validates_track():
    video = object()
    audio = object()
    packet = build_director_shot(
        shot_id="cam_a",
        name="Camera A",
        video=video,
        audio=audio,
        camera_track=OmniCamTrack.from_dict({}).to_dict(),
        metadata={"source": "test"},
    )

    assert packet["video"] is video
    assert packet["audio"] is audio
    assert packet["camera_track"]["schema_version"] == 1
    assert packet["metadata"] == {"source": "test"}


def test_director_shot_rejects_wrong_contract_version():
    with pytest.raises(ValueError, match="schema_version"):
        validate_director_shot({"schema_version": 2, "kind": "omnicam_shot"})


def test_shot_collection_validates_every_camera_packet():
    track = OmniCamTrack.from_dict({}).to_dict()
    shots = [
        build_director_shot(shot_id=f"cam_{index}", name=f"Camera {index}", video=object(), audio=None, camera_track=track)
        for index in range(2)
    ]
    validated = validate_shot_collection(build_shot_collection(shots, {"source": "test"}))
    assert [shot["id"] for shot in validated["shots"]] == ["cam_0", "cam_1"]
    assert validated["metadata"] == {"source": "test"}
