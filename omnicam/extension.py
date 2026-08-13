from __future__ import annotations

from comfy_api.latest import ComfyExtension
from typing_extensions import override

from .nodes import ALL_NODES


class MajoorOmniCamExtension(ComfyExtension):
    @override
    async def get_node_list(self):
        return ALL_NODES


async def comfy_entrypoint() -> MajoorOmniCamExtension:
    return MajoorOmniCamExtension()
