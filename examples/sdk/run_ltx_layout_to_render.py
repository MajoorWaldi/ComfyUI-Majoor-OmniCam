"""Run the OmniCam LTX-2.5 Layout to Render workflow through the official Comfy SDK.

    python examples/sdk/run_ltx_layout_to_render.py --layout layout.mp4 --look look.png \
        --prompt "A tall metallic monolith floating in deep space." --out renders/

The workflow is examples/sdk/ltx25_layout_to_render.api.json, the API-format
export of examples/workflows/10_ltx25_layout_to_render.json. The layout video
(an OmniCam playblast) drives camera and composition, the look still drives
appearance. The Comfy SDK submits the job to a self-hosted ComfyUI through
comfy-api-proxy, follows it and downloads the render. See examples/sdk/README.md.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKFLOW = HERE / "ltx25_layout_to_render.api.json"

# Node ids in ltx25_layout_to_render.api.json (subgraph nodes are "<subgraph>:<node>").
LOOK_IMAGE = "9009"
LAYOUT_VIDEO = "9201"
POSITIVE_PROMPT = "5508"
NOISE_SEEDS = ("5516:4832", "9034:9031")
VIDEO_OUT = "4852"

NODE_PACKS = {
    "MajoorOmniCam": "ComfyUI-Majoor-OmniCam",
    "LTX": "ComfyUI-LTXVideo (https://github.com/Lightricks/ComfyUI-LTXVideo)",
}
MODEL_LINKS = {
    "ltx-2.5-22b-distilled-transformer-bf16.safetensors": "https://huggingface.co/Lightricks/LTX-2.5",
    "ltx-2.5-video-vae-bf16.safetensors": "https://huggingface.co/Lightricks/LTX-2.5",
    "ltx-2.5-audio-vae-bf16.safetensors": "https://huggingface.co/Lightricks/LTX-2.5",
    "ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors": "https://huggingface.co/Lightricks/LTX-2.5",
    "gemma4-12b-with-proj-ltx-2.5-bf16.safetensors": "https://huggingface.co/Lightricks/LTX-2.5",
    "ltx-2.5-22b-ic-lora-layout-to-render-1.0.safetensors": "https://huggingface.co/Lightricks/LTX-2.5-22b-IC-LoRA-Layout-To-Render",
}


class SetupError(Exception):
    """Something the user has to fix before the workflow can run."""


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--layout", type=Path, required=True, help="Layout video: an OmniCam playblast that sets camera and composition.")
    parser.add_argument("--look", type=Path, required=True, help="Look still: the appearance reference.")
    parser.add_argument("--prompt", default="", help="Positive prompt.")
    parser.add_argument("--seed", type=int, help="Noise seed (default: the workflow's).")
    parser.add_argument("--out", type=Path, default=Path("omnicam_renders"), help="Folder for the downloaded video.")
    parser.add_argument("--base-url", default=os.environ.get("COMFY_BASE_URL", "http://127.0.0.1:8189"), help="comfy-api-proxy URL (Comfy API v2).")
    parser.add_argument("--comfyui", default="http://127.0.0.1:8188", help="ComfyUI URL, used to check nodes and models before submitting.")
    parser.add_argument("--timeout", type=float, default=3600.0, help="Seconds to wait for the job.")
    return parser.parse_args(argv)


def prepare_graph(graph: dict, args: argparse.Namespace) -> dict:
    """Apply the user's prompt and seed."""
    graph[POSITIVE_PROMPT]["inputs"]["value"] = args.prompt
    if args.seed is not None:
        for node_id in NOISE_SEEDS:
            graph[node_id]["inputs"]["noise_seed"] = args.seed
    return graph


def nodes_that_run(graph: dict, outputs: list[str]) -> set[str]:
    """Every node an output depends on, plus the outputs."""
    pending = list(outputs)
    seen: set[str] = set()
    while pending:
        node_id = pending.pop()
        if node_id in seen or node_id not in graph:
            continue
        seen.add(node_id)
        for value in graph[node_id]["inputs"].values():
            if isinstance(value, list) and len(value) == 2 and isinstance(value[0], str):
                pending.append(value[0])
    return seen


def combo_options(spec) -> list | None:
    """A combo input's choices from /object_info, in either schema style."""
    if not spec:
        return None
    if isinstance(spec[0], list):
        return spec[0]
    if spec[0] == "COMBO" and len(spec) > 1:
        return spec[1].get("options")
    return None


def check_install(comfyui: str, graph: dict, running: set[str]) -> None:
    """Fail early, with the fix, on a missing node pack or model file."""
    try:
        with urllib.request.urlopen(f"{comfyui.rstrip('/')}/object_info", timeout=30) as response:  # noqa: S310 - operator-supplied ComfyUI URL
            info = json.load(response)
    except (urllib.error.URLError, OSError) as error:
        raise SetupError(f"ComfyUI is not reachable at {comfyui} ({error}). Start it first.") from error

    missing_nodes = sorted({graph[n]["class_type"] for n in running if graph[n]["class_type"] not in info})
    if missing_nodes:
        packs = sorted({pack for name in missing_nodes for prefix, pack in NODE_PACKS.items() if name.startswith(prefix)})
        raise SetupError(f"ComfyUI lacks nodes {missing_nodes}. Install: {', '.join(packs) or 'the node packs that provide them'}.")

    missing_models = []
    for node_id in sorted(running):
        node = graph[node_id]
        spec = {**info[node["class_type"]]["input"].get("required", {}), **info[node["class_type"]]["input"].get("optional", {})}
        for name, value in node["inputs"].items():
            options = combo_options(spec.get(name))
            if isinstance(value, str) and value.endswith(".safetensors") and options is not None and value not in options:
                missing_models.append(value)
    if missing_models:
        lines = [f"  {name}  <- {MODEL_LINKS.get(name, 'see docs/LTX.md')}" for name in sorted(set(missing_models))]
        raise SetupError("Missing model files (see docs/LTX.md for folders):\n" + "\n".join(lines))


def run(args: argparse.Namespace) -> list[Path]:
    for label, path in (("Layout video", args.layout), ("Look still", args.look)):
        if not path.is_file():
            raise SetupError(f"{label} not found: {path}")
    graph = prepare_graph(json.loads(WORKFLOW.read_text(encoding="utf-8")), args)
    outputs = [VIDEO_OUT]
    check_install(args.comfyui, graph, nodes_that_run(graph, outputs))

    # The SDK reads its target from the environment; pin it to the local proxy
    # so a missing variable can never send the job to Comfy Cloud.
    os.environ["COMFY_BASE_URL"] = args.base_url
    # Imported here so the graph preparation and checks above run (and are
    # tested) without the optional SDK installed.
    import httpx
    from comfy_sdk import Comfy, ComfyError, JobFailed, Progress, StatusChange

    args.out.mkdir(parents=True, exist_ok=True)
    try:
        with Comfy() as client:
            workflow = client.workflows.from_json(graph)
            workflow.set_input(LOOK_IMAGE, "image", client.assets.from_file(args.look))
            workflow.set_input(LAYOUT_VIDEO, "file", client.assets.from_file(args.layout))
            job = client.submit(workflow)
            print(f"Submitted job {job.id} to {args.base_url}")
            for event in job.events():
                if isinstance(event, Progress):
                    step = f" step {event.step}/{event.steps}" if event.steps else ""
                    print(f"  {event.value:6.1%}  {event.current_node or ''}{step}", flush=True)
                elif isinstance(event, StatusChange):
                    print(f"  status: {event.status}", flush=True)
            job.wait(timeout=args.timeout)
            job.result()
            saved = [output.to_file(args.out / output.name) for node_id in outputs for output in job.get_outputs(node_id)]
    except JobFailed as error:
        detail = error.error
        where = f" at node {detail.node_id}" if detail is not None and getattr(detail, "node_id", None) else ""
        message = getattr(detail, "message", None) or str(error)
        raise SetupError(f"The job failed{where}: {message}") from error
    except httpx.ConnectError as error:
        raise SetupError(f"No Comfy API v2 at {args.base_url}. Start it with: comfy-api-proxy run") from error
    except ComfyError as error:
        raise SetupError(f"Comfy API error: {error}") from error
    return saved


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        saved = run(args)
    except SetupError as error:
        print(f"error: {error}", file=sys.stderr)
        return 1
    for path in saved:
        print(f"saved {path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
