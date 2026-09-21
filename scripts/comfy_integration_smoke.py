"""CI smoke test executed with a supported ComfyUI checkout on PYTHONPATH."""

from __future__ import annotations

import asyncio
import sys


async def main() -> None:
    if "--cpu" not in sys.argv:
        sys.argv.append("--cpu")
    from comfy.cli_args import args
    args.cpu = True

    # ComfyUI constructs PromptServer before loading custom nodes, and
    # ComfyExtension.on_load() registers node replacements through
    # PromptServer.instance. Stand one up so this smoke test exercises the same
    # path a real startup does instead of crashing on a missing instance.
    from omnicam.comfy_compat.server import create_prompt_server
    create_prompt_server(asyncio.get_running_loop())
    from omnicam.comfy_compat.execution import execution_busy
    assert execution_busy() is False, "a fresh PromptServer must not report GPU execution"

    from omnicam.extension import comfy_entrypoint
    from omnicam.node_registry import REGISTERED_NODE_IDS

    extension = await comfy_entrypoint()
    await extension.on_load()
    nodes = await extension.get_node_list()
    assert [node.__name__ for node in nodes] == list(REGISTERED_NODE_IDS)
    for node in nodes:
        schema = node.define_schema()
        assert schema is not None, node.__name__

    _assert_upstream_reconstruction_api()

    print(f"OmniCam integration smoke: OK ({', '.join(node.__name__ for node in nodes)})")


def _assert_upstream_reconstruction_api() -> None:
    """Fail CI loudly if the native MoGe / SAM3 node surface OmniCam builds on
    changes shape -- a missing mandatory parameter here breaks the blockout
    pipeline at runtime, so catch it without loading any weights."""
    import inspect

    import nodes
    from comfy_extras import nodes_moge, nodes_sam3

    assert hasattr(nodes_moge, "MoGeInference"), "comfy_extras.nodes_moge.MoGeInference is gone"
    assert hasattr(nodes_sam3, "SAM3_Detect"), "comfy_extras.nodes_sam3.SAM3_Detect is gone"
    assert hasattr(nodes, "CheckpointLoaderSimple"), "nodes.CheckpointLoaderSimple is gone"
    assert hasattr(nodes, "CLIPTextEncode"), "nodes.CLIPTextEncode is gone"

    sam3_params = set(inspect.signature(nodes_sam3.SAM3_Detect.execute).parameters)
    for name in ("model", "image", "conditioning", "threshold", "refine_iterations", "individual_masks"):
        assert name in sam3_params, f"SAM3_Detect.execute lost mandatory parameter {name!r}"

    moge_infer = getattr(nodes_moge.MoGeInference, "execute", None) or getattr(
        nodes_moge.MoGeInference, "inference", None
    )
    assert moge_infer is not None, "MoGeInference has no execute/inference entry point"
    moge_params = set(inspect.signature(moge_infer).parameters)
    for name in (
        "moge_model", "image", "resolution_level", "fov_x_degrees",
        "batch_size", "force_projection", "apply_mask",
    ):
        assert name in moge_params, f"MoGeInference.execute lost mandatory parameter {name!r}"
    print("  upstream reconstruction API (MoGe / SAM3): OK")


if __name__ == "__main__":
    asyncio.run(main())
