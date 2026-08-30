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
    from server import PromptServer
    if getattr(PromptServer, "instance", None) is None:
        PromptServer(asyncio.get_running_loop())

    from omnicam.extension import comfy_entrypoint
    from omnicam.node_registry import REGISTERED_NODE_IDS

    extension = await comfy_entrypoint()
    await extension.on_load()
    nodes = await extension.get_node_list()
    assert [node.__name__ for node in nodes] == list(REGISTERED_NODE_IDS)
    for node in nodes:
        schema = node.define_schema()
        assert schema is not None, node.__name__
    print(f"OmniCam integration smoke: OK ({', '.join(node.__name__ for node in nodes)})")


if __name__ == "__main__":
    asyncio.run(main())
