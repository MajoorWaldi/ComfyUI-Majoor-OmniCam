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
    assert schema.outputs[0].io_type == "OMNICAM_MOTION_SCENE"
    assert [output.display_name for output in schema.outputs] == [
        "motion_scene", "solver_coverage", "report",
    ]


def test_node_takes_a_required_video_or_image_input():
    schema = MajoorOmniCamExtractor.define_schema()
    video = next(item for item in schema.inputs if item.id == "video")
    assert video.get_io_type() == "VIDEO,IMAGE"
    assert not getattr(video, "optional", False)


def test_node_offers_the_four_documented_methods():
    schema = MajoorOmniCamExtractor.define_schema()
    method = next(item for item in schema.inputs if item.id == "method")
    assert list(method.options) == ["auto", "dpvo", "pycolmap", "opencv_sift"]
    assert method.default == "auto"


def test_node_defaults_to_an_840_pixel_dpvo_solve():
    """840 solves 1080p at 840x472, the panel default the solver is tuned for.

    The widget default and the job-settings default have to agree: a solve
    started from the panel and one started from the graph must not silently
    pick different resolutions.
    """
    schema = MajoorOmniCamExtractor.define_schema()
    max_dimension = next(item for item in schema.inputs if item.id == "max_dimension")

    assert max_dimension.default == 840


def test_node_execution_emits_a_one_camera_motion_scene_and_a_ui_envelope(clip, monkeypatch):
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
    motion_scene, solver_coverage, report = output[0], output[1], output[2]
    assert motion_scene["version"] == 1
    assert motion_scene["active_camera_id"] == "extracted_camera"
    assert motion_scene["playblast_camera_id"] == "extracted_camera"
    assert len(motion_scene["cameras"]) == 1
    track = motion_scene["cameras"][0]["track"]
    assert track["schema_version"] == 1
    assert motion_scene["timeline"]["duration_seconds"] == pytest.approx(
        track["duration_frames"] / track["fps"]
    )
    assert motion_scene["canvas"] == {"width": track["width"], "height": track["height"]}
    assert 0.0 <= solver_coverage <= 1.0
    assert "OmniCam Extractor" in report

    envelope = json.loads(output.ui.as_dict()["text"][0])
    assert envelope["kind"] == RESULT_ENVELOPE_KIND
    assert envelope["mode"] == "camera_track"
    assert envelope["fingerprint"] == track["metadata"]["extractor_fingerprint"]
    assert envelope["motion_scene"] == motion_scene
    assert envelope["solver_coverage"] == solver_coverage
    assert "track" not in envelope
    assert "confidence" not in envelope
    assert envelope["source"] == "omnicam/extractor_runtime/test.mp4 [temp]"
