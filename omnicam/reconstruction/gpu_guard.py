"""Per-stage GPU contention checkpoint for reconstruction providers.

The pipeline already arms ``comfy_compat.gpu_guard.GpuContentionGuard`` at
progress checkpoints. Providers that run a single long forward (VGGT, SAM3D)
want a cheaper, explicit call to make right before and right after that forward
-- never a cross-thread CUDA kill, just a cooperative raise.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from .errors import ReconCancelledError, ReconGpuContentionError
from .providers.base import CancelToken


@dataclass(slots=True)
class GpuStageGuard:
    execution_probe: Callable[[], bool]
    cancel: CancelToken | None = None

    def checkpoint(self) -> None:
        """Raise if the run was cancelled or a ComfyUI workflow took the GPU.

        Call it immediately before and immediately after each atomic provider
        forward. It never interrupts a forward that is already running.
        """
        if self.cancel is not None and self.cancel.is_cancelled():
            raise ReconCancelledError("Reconstruction cancelled")
        try:
            busy = bool(self.execution_probe())
        except Exception:  # noqa: BLE001 - a broken probe must not mask the run
            busy = False
        if busy:
            raise ReconGpuContentionError(
                "Scene reconstruction stopped because a ComfyUI workflow started using the GPU."
            )
