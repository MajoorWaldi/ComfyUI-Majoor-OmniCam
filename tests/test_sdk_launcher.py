"""examples/sdk/run_ltx_motion_track.py: graph preparation, install checks, and
that its API-format export still matches the shipped UI workflow."""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
API = ROOT / "examples" / "sdk" / "ltx25_motion_track.api.json"
UI = ROOT / "examples" / "workflows" / "09_ltx25_motion_track.json"

spec = importlib.util.spec_from_file_location("run_ltx_motion_track", ROOT / "examples" / "sdk" / "run_ltx_motion_track.py")
launcher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(launcher)


def _graph() -> dict:
    return json.loads(API.read_text(encoding="utf-8"))


def _args(**overrides) -> argparse.Namespace:
    values = {"prompt": "A test shot.", "scene": None, "seed": None, "tracks_only": False}
    values.update(overrides)
    return argparse.Namespace(**values)


def test_the_api_export_is_the_shipped_example():
    graph = _graph()
    ui = json.loads(UI.read_text(encoding="utf-8"))
    director = next(node for node in ui["nodes"] if node["type"] == "MajoorOmniCamDirector")
    assert graph[launcher.DIRECTOR]["inputs"]["state_json"] == director["widgets_values"][0]
    assert graph[launcher.MONITOR]["inputs"]["target_profile"] == "ltx25_motion_track"
    assert graph[launcher.LOAD_IMAGE]["class_type"] == "LoadImage"
    assert graph[launcher.POSITIVE_PROMPT]["class_type"] == "PrimitiveStringMultiline"
    assert graph[launcher.NOISE]["class_type"] == "RandomNoise"
    assert graph[launcher.LATENT_MULTIPLE]["class_type"] == "ComfyMathExpression"
    for node_id in (launcher.VIDEO_OUT, launcher.TRACKS_OUT):
        assert graph[node_id]["class_type"] == "SaveVideo"
    # Monitor.tracks_json feeds LTXVDrawTracks, inside the Preprocess subgraph.
    draw = next(node for node in graph.values() if node["class_type"] == "LTXVDrawTracks")
    assert draw["inputs"]["tracks"] == [launcher.MONITOR, 5]


def test_prepare_graph_applies_prompt_seed_and_scene(tmp_path: Path):
    scene = tmp_path / "scene.json"
    scene.write_text(json.dumps({"cameras": [{"id": "camera_1"}], "fps": 24}), encoding="utf-8")
    graph, outputs = launcher.prepare_graph(_graph(), _args(seed=7, scene=scene))
    assert graph[launcher.POSITIVE_PROMPT]["inputs"]["value"] == "A test shot."
    assert graph[launcher.NOISE]["inputs"]["noise_seed"] == 7
    assert json.loads(graph[launcher.DIRECTOR]["inputs"]["state_json"])["cameras"][0]["id"] == "camera_1"
    assert outputs == [launcher.VIDEO_OUT, launcher.TRACKS_OUT]


def test_tracks_only_runs_no_model_loader():
    graph, outputs = launcher.prepare_graph(_graph(), _args(tracks_only=True))
    assert outputs == [launcher.TRACKS_OUT]
    assert launcher.VIDEO_OUT not in graph
    running = launcher.nodes_that_run(graph, outputs)
    loaders = {graph[node]["class_type"] for node in running if "Loader" in graph[node]["class_type"]}
    assert loaders == set()
    assert {graph[node]["class_type"] for node in running} >= {"LTXVDrawTracks", "MajoorOmniCamMonitor", "MajoorOmniCamDirector"}


def test_the_full_run_needs_the_ltx_weights():
    graph, outputs = launcher.prepare_graph(_graph(), _args())
    running = launcher.nodes_that_run(graph, outputs)
    names = {value for node in running for value in graph[node]["inputs"].values() if isinstance(value, str) and value.endswith(".safetensors")}
    assert names >= {"ltx-2.5-22b-distilled-transformer-bf16.safetensors", "ltx-2.3-22b-ic-lora-motion-track-control-ref0.5.safetensors"}
    assert names <= set(launcher.MODEL_LINKS) | {"ltx-2.5-22b-distilled-transformer-bf16.safetensors"}


def test_director_state_reads_a_saved_workflow_or_a_state(tmp_path: Path):
    state = launcher.director_state(UI)
    assert json.loads(state)["motion_layers"]
    bad = tmp_path / "bad.json"
    bad.write_text(json.dumps({"nodes": []}), encoding="utf-8")
    with pytest.raises(launcher.SetupError, match="no OmniCam Director"):
        launcher.director_state(bad)


def test_combo_options_reads_both_schema_styles():
    assert launcher.combo_options([["a.safetensors", "b.safetensors"]]) == ["a.safetensors", "b.safetensors"]
    assert launcher.combo_options(["COMBO", {"options": ["c.safetensors"]}]) == ["c.safetensors"]
    assert launcher.combo_options(["FLOAT", {"default": 1.0}]) is None
    assert launcher.combo_options(None) is None
