"""examples/sdk/run_ltx_layout_to_render.py: graph preparation, install checks, and
that its API-format export still matches the shipped UI workflow."""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API = ROOT / "examples" / "sdk" / "ltx25_layout_to_render.api.json"
UI = ROOT / "examples" / "workflows" / "10_ltx25_layout_to_render.json"

spec = importlib.util.spec_from_file_location("run_ltx_layout_to_render", ROOT / "examples" / "sdk" / "run_ltx_layout_to_render.py")
launcher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(launcher)


def _graph() -> dict:
    return json.loads(API.read_text(encoding="utf-8"))


def _args(**overrides) -> argparse.Namespace:
    values = {"prompt": "A test shot.", "seed": None}
    values.update(overrides)
    return argparse.Namespace(**values)


def test_the_api_export_is_the_shipped_example():
    graph = _graph()
    ui = json.loads(UI.read_text(encoding="utf-8"))
    nodes = {node["id"]: node for node in ui["nodes"]}
    assert graph[launcher.POSITIVE_PROMPT]["inputs"]["value"] == nodes[5508]["widgets_values"][0]
    assert graph[launcher.LOOK_IMAGE]["class_type"] == "LoadImage"
    assert graph[launcher.LOOK_IMAGE]["inputs"]["image"] == nodes[9009]["widgets_values"][0]
    assert graph[launcher.LAYOUT_VIDEO]["class_type"] == "LoadVideo"
    assert graph[launcher.LAYOUT_VIDEO]["inputs"]["file"] == nodes[9201]["widgets_values"][0]
    assert graph[launcher.VIDEO_OUT]["class_type"] == "SaveVideo"
    for node_id in launcher.NOISE_SEEDS:
        assert graph[node_id]["class_type"] == "RandomNoise"
    director = next(node for node in ui["nodes"] if node["type"] == "MajoorOmniCamDirector")
    assert graph["9100"]["inputs"]["state_json"] == director["widgets_values"][0]
    assert graph["9100"]["inputs"]["video"] == [launcher.LAYOUT_VIDEO, 0]
    assert graph["9101"]["inputs"]["target_profile"] == "external_reference_video"


def test_prepare_graph_applies_prompt_and_seed():
    graph = launcher.prepare_graph(_graph(), _args(seed=7))
    assert graph[launcher.POSITIVE_PROMPT]["inputs"]["value"] == "A test shot."
    assert {graph[node_id]["inputs"]["noise_seed"] for node_id in launcher.NOISE_SEEDS} == {7}


def test_the_seed_defaults_to_the_workflows():
    before = _graph()
    after = launcher.prepare_graph(_graph(), _args())
    for node_id in launcher.NOISE_SEEDS:
        assert after[node_id]["inputs"]["noise_seed"] == before[node_id]["inputs"]["noise_seed"]


def test_the_render_runs_the_layout_to_render_models():
    graph = _graph()
    running = launcher.nodes_that_run(graph, [launcher.VIDEO_OUT])
    assert {graph[node]["class_type"] for node in running} >= {"MajoorOmniCamMonitor", "LTXAddVideoICLoRAGuide", "LTXVLatentUpsampler"}
    names = {value for node in running for value in graph[node]["inputs"].values() if isinstance(value, str) and value.endswith(".safetensors")}
    assert "ltx-2.5-22b-ic-lora-layout-to-render-1.0.safetensors" in names
    assert names <= set(launcher.MODEL_LINKS)


def test_combo_options_reads_both_schema_styles():
    assert launcher.combo_options([["a.safetensors", "b.safetensors"]]) == ["a.safetensors", "b.safetensors"]
    assert launcher.combo_options(["COMBO", {"options": ["c.safetensors"]}]) == ["c.safetensors"]
    assert launcher.combo_options(["FLOAT", {"default": 1.0}]) is None
    assert launcher.combo_options(None) is None
