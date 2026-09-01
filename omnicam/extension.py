from __future__ import annotations

from typing_extensions import override

from .comfy_compat import ComfyExtension, register_shutdown_callback
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

    @override
    async def get_node_list(self):
        return get_registered_nodes()


async def comfy_entrypoint() -> MajoorOmniCamExtension:
    return MajoorOmniCamExtension()
