from __future__ import annotations

from comfy_api.latest import ComfyExtension
from typing_extensions import override

from .node_registry import get_registered_nodes


class MajoorOmniCamExtension(ComfyExtension):
    @override
    async def get_node_list(self):
        return get_registered_nodes()


async def comfy_entrypoint() -> MajoorOmniCamExtension:
    return MajoorOmniCamExtension()
