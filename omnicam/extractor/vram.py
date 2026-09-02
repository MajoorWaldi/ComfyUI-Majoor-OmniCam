"""Hand the solver child the VRAM ComfyUI is sitting on.

DPVO runs in a spawned process, so it cannot touch the caching allocator its
parent holds. On a machine where ComfyUI has models resident, the child sees
only whatever the driver still reports free -- which is how a clip that fits
comfortably on a 24 GB card dies of ``OutOfMemoryError`` two thirds of the way
through a solve.

Releasing here is deliberately explicit rather than automatic-on-import: it
unloads the user's models, so it belongs at the moment a solve is about to
start, not as a side effect of importing an extractor module.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


def cuda_free_bytes() -> int | None:
    """Device-wide free VRAM, or None when there is no CUDA device to ask.

    Deliberately ``mem_get_info`` rather than a torch allocator statistic: the
    number that matters is what a *different process* would be able to allocate,
    and torch's own reserved-vs-allocated accounting says nothing about that.
    """
    try:
        import torch

        if not torch.cuda.is_available():
            return None
        free, _total = torch.cuda.mem_get_info()
        return int(free)
    except Exception as exc:  # noqa: BLE001 - diagnostics must never break a solve
        logger.debug("Free VRAM could not be read: %s", exc)
        return None


#: Free VRAM above which unloading buys nothing worth the reload it costs.
#: DPVO at the default 640 solve resolution needs a small fraction of this.
RELEASE_THRESHOLD_BYTES = 8 * 1024 ** 3


@dataclass(frozen=True, slots=True)
class VramRelease:
    """What releasing actually recovered, for the log and for error messages."""

    attempted: bool
    free_before: int | None = None
    free_after: int | None = None

    @property
    def recovered(self) -> int | None:
        if self.free_before is None or self.free_after is None:
            return None
        return max(0, self.free_after - self.free_before)

    def describe(self) -> str:
        if not self.attempted:
            if self.free_before is not None and self.free_before >= RELEASE_THRESHOLD_BYTES:
                return (
                    f"left ComfyUI loaded ({self.free_before / 1024 ** 3:.2f} GiB was "
                    "already free)"
                )
            return "ComfyUI VRAM was not released"
        recovered = self.recovered
        if recovered is None:
            return "released ComfyUI models"
        return f"released ComfyUI models, recovering {recovered / 1024 ** 3:.2f} GiB"


def release_comfy_vram(threshold_bytes: int = RELEASE_THRESHOLD_BYTES) -> VramRelease:
    """Unload ComfyUI's resident models so a spawned solver can have the card.

    Only when it would actually help. Unloading costs the user a full reload on
    their next generation, so doing it on a card that is already empty is pure
    loss -- and an OOM raised with 21 GiB free is not a shortage, it is a
    different bug wearing a shortage's error message.

    Best effort by design. Outside ComfyUI there is nothing to unload, and a
    failure to unload is not a reason to refuse to solve.
    """
    free_before = cuda_free_bytes()
    if free_before is not None and free_before >= threshold_bytes:
        return VramRelease(attempted=False, free_before=free_before, free_after=free_before)
    try:
        import comfy.model_management as model_management

        model_management.unload_all_models()
        model_management.soft_empty_cache(force=True)
    except Exception as exc:  # noqa: BLE001 - running outside ComfyUI is supported
        logger.debug("ComfyUI VRAM could not be released: %s", exc)
        return VramRelease(attempted=False, free_before=free_before, free_after=free_before)

    release = VramRelease(
        attempted=True, free_before=free_before, free_after=cuda_free_bytes()
    )
    logger.info("OmniCam Extractor %s", release.describe())
    return release
