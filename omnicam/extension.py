from __future__ import annotations

from comfy_api.latest import ComfyAPI, ComfyExtension, IO
from typing_extensions import override

from .node_registry import get_registered_nodes


class MajoorOmniCamExtension(ComfyExtension):
    async def on_load(self) -> None:
        await ComfyAPI().node_replacement.register(IO.NodeReplace(
            new_node_id="MajoorOmniCamWanVideoWrapperATI",
            old_node_id="MajoorOmniCamWanATIAdapter",
            old_widget_ids=["point_count", "distribution"],
            input_mapping=[
                {"new_id": "camera_track", "old_id": "camera_track"},
                {"new_id": "point_count", "old_id": "point_count"},
                {"new_id": "distribution", "old_id": "distribution"},
            ],
            output_mapping=[{"new_idx": 0, "old_idx": 1}],
        ))

    @override
    async def get_node_list(self):
        return get_registered_nodes()


async def comfy_entrypoint() -> MajoorOmniCamExtension:
    return MajoorOmniCamExtension()
