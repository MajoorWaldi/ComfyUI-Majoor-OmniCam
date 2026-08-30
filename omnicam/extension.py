from __future__ import annotations

from typing_extensions import override

from .comfy_compat import IO, ComfyAPI, ComfyExtension, register_shutdown_callback
from .extractor.jobs.manager import solve_manager
from .extractor.materialize import cleanup_runtime_videos
from .node_registry import get_registered_nodes


def _shutdown_extractor_runtime() -> None:
    solve_manager().shutdown()
    cleanup_runtime_videos()


class MajoorOmniCamExtension(ComfyExtension):
    async def on_load(self) -> None:
        cleanup_runtime_videos()
        register_shutdown_callback("extractor-workers", _shutdown_extractor_runtime)
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
