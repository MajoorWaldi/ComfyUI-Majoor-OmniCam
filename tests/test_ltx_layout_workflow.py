"""Layout to Render uses a video layout and a separate appearance reference."""
import json
from pathlib import Path

from omnicam.core.director_compile import compile_director_motion_scene
from omnicam.core.motion_scene import MotionScene
from omnicam.profiles.base import CompileRequest
from omnicam.profiles.generic_video import EXTERNAL_REFERENCE_VIDEO_PROFILE

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / "examples/workflows/10_ltx25_layout_to_render.json"


def _workflow():
    return json.loads(WORKFLOW.read_text(encoding="utf-8"))


def test_layout_starter_roundtrips_and_compiles_without_motion_layers():
    workflow = _workflow()
    director = next(n for n in workflow["nodes"] if n["type"] == "MajoorOmniCamDirector")
    state, recording, card, width, height, fps, duration, mode = director["widgets_values"]
    scene, path = compile_director_motion_scene(
        json.loads(state), width=width, height=height, fps=fps,
        duration_seconds=duration, render_mode=mode,
        card_asset=card, recording_path=recording,
    )
    assert path == ""
    assert not scene.motion_layers
    scene = MotionScene.from_dict(json.loads(json.dumps(scene.to_dict())))
    video = object()
    request = CompileRequest(
        motion_scene=scene, playblast_video=video, base_prompt="A metal monolith.",
        target_width=width, target_height=height,
        duration_seconds=duration, target_fps=fps,
    )
    result = EXTERNAL_REFERENCE_VIDEO_PROFILE.compile(request)
    assert result.reference_video is video
    assert result.final_prompt == request.base_prompt
    assert not any(check.state == "BLOCKED" for check in result.checks)
    assert result.timeline.frame_count == 25


def test_layout_starter_preserves_the_two_stage_iclora_recipe():
    workflow = _workflow()
    subgraphs = workflow["definitions"]["subgraphs"]
    nodes = [n for graph in subgraphs for n in graph["nodes"]]
    loader = next(n for n in nodes if n["type"] == "LTXICLoRALoaderModelOnly")
    assert loader["widgets_values_named"]["lora_name"] == "ltx-2.5-22b-ic-lora-layout-to-render-1.0.safetensors"
    guides = [n for n in nodes if n["type"] == "LTXAddVideoICLoRAGuide"]
    assert sorted(n["widgets_values_named"]["frame_idx"] for n in guides) == [-1, -1, 0, 0]
    assert any(n["type"] == "LTXVLatentUpsampler" for n in nodes)
    assert not any(n["type"] == "LTXVDrawTracks" for n in nodes)
    resize = next(n for n in nodes if n["type"] == "ResizeImageMaskNode")
    values = resize["widgets_values_named"]
    assert (values["resize_type.width"], values["resize_type.height"]) == (640, 320)
    assert values["resize_type.width"] % 64 == values["resize_type.height"] % 64 == 0
    look = next(n for n in workflow["nodes"] if n["id"] == 9009)
    assert look["type"] == "LoadImage"
    assert look["widgets_values"][0] == "omnicam_layout_look.png"
    monitor = next(n for n in workflow["nodes"] if n["type"] == "MajoorOmniCamMonitor")
    assert monitor["widgets_values"][0] == "external_reference_video"
    assert monitor["outputs"][1]["links"]
    for asset in ("omnicam_layout_look.png", "omnicam_layout_guide.webm", "result-preview.mp4"):
        assert (ROOT / "examples/assets/ltx-layout" / asset).is_file()
