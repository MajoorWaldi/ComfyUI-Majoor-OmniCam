"""CI smoke test executed with a supported ComfyUI checkout on PYTHONPATH."""

from __future__ import annotations

import asyncio
import sys


async def main() -> None:
    if "--cpu" not in sys.argv:
        sys.argv.append("--cpu")
    from comfy.cli_args import args
    args.cpu = True
    from omnicam.extension import comfy_entrypoint

    extension = await comfy_entrypoint()
    await extension.on_load()
    nodes = await extension.get_node_list()
    assert len(nodes) == 5, [node.__name__ for node in nodes]
    for node in nodes:
        schema = node.define_schema()
        assert schema is not None, node.__name__


if __name__ == "__main__":
    asyncio.run(main())
