"""Run the OmniCam -> LTX-2.5 Motion Track workflow through the official Comfy SDK.

    python examples/sdk/run_ltx_motion_track.py --image start.png \
        --prompt "A lighthouse keeper walks along the jetty at dusk." --out renders/

The workflow is examples/sdk/ltx25_motion_track.api.json, the API-format export
of examples/workflows/09_ltx25_motion_track.json. The Comfy SDK submits it to a
self-hosted ComfyUI through comfy-api-proxy, follows the job and downloads the
videos. --tracks-only runs just the OmniCam -> LTXVDrawTracks part, which needs
no LTX weights, to check an install end to end. See examples/sdk/README.md.
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
WORKFLOW = HERE / "ltx25_motion_track.api.json"

# Node ids in ltx25_motion_track.api.json (subgraph nodes are "<subgraph>:<node>").
LOAD_IMAGE = "2004"
POSITIVE_PROMPT = "5508"
DIRECTOR = "9100"
MONITOR = "9101"
NOISE = "5516:4832"
LATENT_MULTIPLE = "5014:5563"
VIDEO_OUT = "4852"
TRACKS_OUT = "9006"
PROMPT_PREVIEW = "5544"

NODE_PACKS = {
    "MajoorOmniCam": "ComfyUI-Majoor-OmniCam",
    "LTX": "ComfyUI-LTXVideo (https://github.com/Lightricks/ComfyUI-LTXVideo)",
}
MODEL_LINKS = {
    "ltx-2.5-22b-distilled-transformer-bf16.safetensors": "https://huggingface.co/Lightricks/LTX-2.5",
    "ltx-2.5-video-vae-bf16.safetensors": "https://huggingface.co/Lightricks/LTX-2.5",
    "ltx-2.5-audio-vae-bf16.safetensors": "https://huggingface.co/Lightricks/LTX-2.5",
    "gemma4-12b-with-proj-ltx-2.5-bf16.safetensors": "https://huggingface.co/Lightricks/LTX-2.5",
    "gemma4_e2b_it_bf16.safetensors": "https://huggingface.co/Comfy-Org/gemma-4",
    "ltx-2.3-22b-ic-lora-motion-track-control-ref0.5.safetensors": "https://huggingface.co/Lightricks/LTX-2.3-22b-IC-LoRA-Motion-Track-Control",
}


class SetupError(Exception):
    """Something the user has to fix before the workflow can run."""


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--image", type=Path, required=True, help="Start image (the first frame and the Director's card).")
    parser.add_argument("--prompt", default="", help="Positive prompt; OmniCam appends the camera wording.")
    parser.add_argument("--scene", type=Path, help="Director scene: a saved workflow .json with an OmniCam Director, or a Director state_json file.")
    parser.add_argument("--seed", type=int, help="Noise seed (default: the workflow's).")
    parser.add_argument("--out", type=Path, default=Path("omnicam_renders"), help="Folder for the downloaded videos.")
    parser.add_argument("--tracks-only", action="store_true", help="Only render the motion-track guide; needs no LTX weights.")
    parser.add_argument("--base-url", default=os.environ.get("COMFY_BASE_URL", "http://127.0.0.1:8189"), help="comfy-api-proxy URL (Comfy API v2).")
    parser.add_argument("--comfyui", default="http://127.0.0.1:8188", help="ComfyUI URL, used to check nodes and models before submitting.")
    parser.add_argument("--timeout", type=float, default=3600.0, help="Seconds to wait for the job.")
    return parser.parse_args(argv)


def director_state(path: Path) -> str:
    """The Director state_json in `path`: a saved UI workflow or the state itself."""
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, dict) and isinstance(data.get("nodes"), list):
        for node in data["nodes"]:
            if node.get("type") == "MajoorOmniCamDirector":
                return node["widgets_values"][0]
        raise SetupError(f"{path} has no OmniCam Director node")
    if isinstance(data, dict) and isinstance(data.get("cameras"), list):
        return json.dumps(data)
    raise SetupError(f"{path} is neither a workflow with a Director nor a Director state")


def prepare_graph(graph: dict, args: argparse.Namespace) -> tuple[dict, list[str]]:
    """Apply the user's inputs; returns the graph and the output nodes to download."""
    graph[POSITIVE_PROMPT]["inputs"]["value"] = args.prompt
    if args.scene:
        graph[DIRECTOR]["inputs"]["state_json"] = director_state(args.scene)
    if args.seed is not None:
        graph[NOISE]["inputs"]["noise_seed"] = args.seed
    if not args.tracks_only:
        return graph, [VIDEO_OUT, TRACKS_OUT]
    # Without the model the IC-LoRA loader cannot report its reference downscale
    # factor; 1 keeps the template's own resize math (a multiple of 32).
    graph[LATENT_MULTIPLE]["inputs"]["values.a"] = 1.0
    for node_id in (VIDEO_OUT, PROMPT_PREVIEW):
        graph.pop(node_id, None)
    return graph, [TRACKS_OUT]


def nodes_that_run(graph: dict, outputs: list[str]) -> set[str]:
    """Every node an output depends on, plus the outputs (and the Monitor, an output node)."""
    pending = [*outputs, MONITOR]
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
        with urllib.request.urlopen(f"{comfyui.rstrip('/')}/object_info", timeout=30) as response:
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
        raise SetupError("Missing model files (see docs/LTX.md for folders):\n" + "\n".join(lines) + "\nOr run with --tracks-only.")


def run(args: argparse.Namespace) -> list[Path]:
    if not args.image.is_file():
        raise SetupError(f"Start image not found: {args.image}")
    graph, outputs = prepare_graph(json.loads(WORKFLOW.read_text(encoding="utf-8")), args)
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
            workflow.set_input(LOAD_IMAGE, "image", client.assets.from_file(args.image))
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
