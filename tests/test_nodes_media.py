"""The VIDEO-or-IMAGE socket and the coercions behind it."""


import pytest

torch = pytest.importorskip("torch")
pytest.importorskip("comfy_api.latest")

from omnicam.nodes.media import (  # noqa: E402
    DEFAULT_IMAGE_FPS,
    as_image_batch,
    as_video,
    is_image_batch,
    media_input,
    solve_source,
)


def image_batch(frames=3, height=16, width=24):
    return torch.rand((frames, height, width, 3))


def canonical_track_payload(duration_frames):
    base = {"camera_type": "perspective", "zoom": 1.0, "near": 0.05, "far": 5000.0}
    camera = {
        "position": [0, 1, 4], "target": [0, 1, 0], "fov": 35, "roll": 0, **base,
    }
    return {
        "schema_version": 1, "fps": 24, "duration_frames": duration_frames,
        "width": 320, "height": 180, "render_mode": "omni_ref", "objects": [],
        "keyframes": [{"frame": 0, "camera": camera, "interpolation": "smooth"}],
    }


def test_media_input_accepts_both_media_types():
    socket = media_input("video", tooltip="One shot")
    assert socket.get_io_type() == "VIDEO,IMAGE"
    assert socket.id == "video"
    assert socket.tooltip == "One shot"
    assert not socket.optional


def test_media_input_stays_optional_when_asked():
    assert media_input("proxy_video", optional=True).optional


def test_an_image_batch_is_recognised_and_a_video_is_not(clip):
    assert is_image_batch(image_batch())
    assert not is_image_batch(clip)
    assert not is_image_batch(None)


def test_a_video_passes_through_as_a_video_unchanged(clip):
    assert as_video(clip) is clip


def test_an_image_batch_becomes_a_playable_video():
    video = as_video(image_batch(4), fps=12.0)
    assert video.get_frame_count() == 4
    assert video.get_dimensions() == (24, 16)
    assert float(video.get_frame_rate()) == 12.0


def test_a_single_image_becomes_a_one_frame_video():
    assert as_video(image_batch(1)).get_frame_count() == 1


def test_missing_media_coerces_to_nothing():
    assert as_video(None) is None
    assert as_image_batch(None) is None


def test_an_image_batch_passes_through_as_frames():
    frames = image_batch(5)
    assert as_image_batch(frames) is frames


def test_an_image_batch_is_trimmed_to_the_requested_frame_budget():
    assert as_image_batch(image_batch(9), max_frames=4).shape[0] == 4


def test_a_video_is_decoded_into_frames(clip):
    from comfy_api.latest import InputImpl

    frames = as_image_batch(InputImpl.VideoFromFile(clip.get_stream_source()), max_frames=6)
    assert frames.shape[0] == 6
    assert frames.shape[3] == 3


def test_a_file_backed_video_is_solved_from_its_own_file(clip, monkeypatch):
    monkeypatch.setattr(
        "omnicam.nodes.media.materialize_video_reference", lambda video: "shot.mp4 [input]",
    )
    video, reference = solve_source(clip)
    assert video is clip
    assert reference == "shot.mp4 [input]"


def test_an_image_batch_is_encoded_to_a_managed_file_before_solving(monkeypatch):
    written = {}

    def fake_materialize(video):
        written["frames"] = video.get_frame_count()
        return "omnicam/extractor_runtime/from_images.mp4 [temp]"

    monkeypatch.setattr("omnicam.nodes.media.materialize_video_reference", fake_materialize)
    monkeypatch.setattr("omnicam.nodes.media.resolve_video", lambda ref: f"resolved:{ref}")
    video, reference = solve_source(image_batch(3))
    assert written["frames"] == 3
    assert reference == "omnicam/extractor_runtime/from_images.mp4 [temp]"
    assert video == f"resolved:{reference}"


def test_an_unresolvable_encoded_image_batch_fails_loudly(monkeypatch):
    monkeypatch.setattr(
        "omnicam.nodes.media.materialize_video_reference", lambda video: "gone.mp4 [temp]",
    )
    monkeypatch.setattr("omnicam.nodes.media.resolve_video", lambda ref: None)
    with pytest.raises(ValueError, match="could not be encoded"):
        solve_source(image_batch(2))


def test_the_documented_default_frame_rate_is_used_for_bare_images():
    assert float(as_video(image_batch(2)).get_frame_rate()) == DEFAULT_IMAGE_FPS


def registered_media_sockets():
    from omnicam.node_registry import get_registered_nodes

    for node in get_registered_nodes():
        for socket in node.define_schema().inputs:
            if {"VIDEO", "IMAGE"} & set(socket.get_io_type().split(",")):
                yield node.__name__, socket


def test_every_registered_media_socket_takes_both_types():
    sockets = list(registered_media_sockets())
    assert sockets, "the registry declares no media sockets at all"
    for node_name, socket in sockets:
        assert socket.get_io_type() == "VIDEO,IMAGE", f"{node_name}.{socket.id}"


def test_the_director_reads_stills_connected_to_its_video_socket():
    from omnicam.nodes.director import MajoorOmniCamDirector

    output = MajoorOmniCamDirector.execute(
        state_json="{}", recording_path="", card_asset="", width=1280, height=720, fps=24,
        duration_seconds=1.0, render_mode="omni_ref", video=image_batch(4),
    )
    proxy = output.args[1]
    assert proxy is not None
    assert proxy.get_frame_count() == 4
    assert float(proxy.get_frame_rate()) == 24.0


def _output_by_name(schema, name):
    return next(item for item in schema.outputs if item.display_name == name)


def test_director_keeps_video_transport_without_an_image_twin():
    from omnicam.nodes.director import MajoorOmniCamDirector

    schema = MajoorOmniCamDirector.define_schema()
    assert [output.display_name for output in schema.outputs] == [
        "motion_scene", "playblast_video", "audio",
    ]

    output = MajoorOmniCamDirector.execute(
        state_json="{}", recording_path="", card_asset="", width=1280, height=720, fps=24,
        duration_seconds=1.0, render_mode="omni_ref", video=image_batch(5),
    )
    playblast_video = output.args[1]
    assert playblast_video is not None
    assert playblast_video.get_frame_count() == 5


def test_director_playblast_is_none_without_a_proxy():
    from omnicam.nodes.director import MajoorOmniCamDirector

    output = MajoorOmniCamDirector.execute(
        state_json="{}", recording_path="", card_asset="", width=1280, height=720, fps=24,
        duration_seconds=1.0, render_mode="omni_ref",
    )
    assert output.args[1] is None




