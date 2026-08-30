"""The MajoorOmniCamExtractor node boundary."""

import json

import pytest
from extractor_backend_double import RecordingBackend

from omnicam.extractor.pipeline import extract_camera_track

pytest.importorskip("comfy_api.latest")

from omnicam.nodes.extractor import RESULT_ENVELOPE_KIND, MajoorOmniCamExtractor


def test_node_schema_declares_the_canonical_contract():
    schema = MajoorOmniCamExtractor.define_schema()
    assert schema.node_id == "MajoorOmniCamExtractor"
    assert schema.display_name == "OmniCam Extractor"
    assert schema.category == "Majoor/OmniCam"
    assert schema.outputs[0].io_type == "MAJOOR_OMNICAM_TRACK"
    assert [output.display_name for output in schema.outputs] == ["camera_track", "confidence", "report"]


def test_node_takes_a_required_video_or_image_input():
    schema = MajoorOmniCamExtractor.define_schema()
    video = next(item for item in schema.inputs if item.id == "video")
    assert video.get_io_type() == "VIDEO,IMAGE"
    assert not getattr(video, "optional", False)


def test_node_offers_the_three_documented_methods():
    schema = MajoorOmniCamExtractor.define_schema()
    method = next(item for item in schema.inputs if item.id == "method")
    assert list(method.options) == ["auto", "dpvo", "opencv_sift"]
    assert method.default == "dpvo"


def test_node_defaults_to_a_640_pixel_dpvo_solve():
    schema = MajoorOmniCamExtractor.define_schema()
    max_dimension = next(item for item in schema.inputs if item.id == "max_dimension")

    assert max_dimension.default == 640


def test_node_execution_emits_the_track_and_a_ui_envelope(clip, monkeypatch):
    monkeypatch.setattr(
        "omnicam.nodes.extractor.extract_camera_track",
        lambda **kwargs: extract_camera_track(**kwargs, backend=RecordingBackend()),
    )
    monkeypatch.setattr(
        "omnicam.nodes.extractor.solve_source",
        lambda video: (video, "omnicam/extractor_runtime/test.mp4 [temp]"),
    )
    output = MajoorOmniCamExtractor.execute(
        video=clip, method="auto", lens_mode="auto", fov_degrees=53.0, focal_length_mm=24.0,
        sensor_width_mm=36.0, max_dimension=320, frame_step=1, normalize_origin=True,
        motion_scale=1.0, position_smoothing=0.15, rotation_smoothing=0.1, simplify_keys=True,
        position_tolerance=0.01, rotation_tolerance_deg=0.25,
    )
    track, confidence, report = output[0], output[1], output[2]
    assert track["schema_version"] == 1
    assert 0.0 <= confidence <= 1.0
    assert "OmniCam Extractor" in report

    envelope = json.loads(output.ui.as_dict()["text"][0])
    assert envelope["kind"] == RESULT_ENVELOPE_KIND
    assert envelope["fingerprint"] == track["metadata"]["extractor_fingerprint"]
    assert envelope["track"]["keyframes"] == track["keyframes"]
    assert envelope["source"] == "omnicam/extractor_runtime/test.mp4 [temp]"
