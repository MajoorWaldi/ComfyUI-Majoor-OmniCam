"""Release the weights a reconstruction run pinned in VRAM.

Two module-level caches keep a reconstruction's heavy weights resident so the
geometry and segmentation stages of the *same* run do not reload from disk:

* ``providers.comfy_moge._model_cache`` -- the MoGe model
* ``segmentation.comfy_sam3._SHARED_MODEL_CACHE`` -- the SAM3 checkpoint + CLIP

That is the right lifetime *inside* a run, but the interactive reconstruction
job is out-of-band from ComfyUI's own execution: nothing evicts those caches
when the job ends, so a finished reconstruction leaves ~2-4 GiB pinned and the
user's next normal workflow can OOM. ComfyUI's ``model_management`` also cannot
move the SAM3 ModelPatcher off the GPU while our cache holds a strong reference.

:func:`release_reconstruction_models` drops those references and then asks
ComfyUI to unload and empty the allocator. It is best-effort by design -- run
outside ComfyUI (the pure test suite) there is nothing to release, and a
failure to release is never a reason to fail the job that already succeeded.
"""

from __future__ import annotations

import gc
import logging

logger = logging.getLogger(__name__)


def _clear_provider_caches() -> None:
    """Drop the strong references our per-run caches hold on the weights."""
    try:
        from .providers.comfy_moge import clear_moge_model_cache

        clear_moge_model_cache()
    except Exception as exc:  # noqa: BLE001 - a missing provider is not fatal
        logger.debug("MoGe model cache not cleared: %s", exc)
    try:
        from .segmentation.comfy_sam3 import _SHARED_MODEL_CACHE

        _SHARED_MODEL_CACHE.clear()
    except Exception as exc:  # noqa: BLE001
        logger.debug("SAM3 model cache not cleared: %s", exc)


def release_reconstruction_models(*, reason: str = "") -> None:
    """Free the VRAM a reconstruction run left resident.

    Safe to call from any thread and from any job outcome (done / failed /
    cancelled). Does nothing observable outside ComfyUI.
    """
    _clear_provider_caches()
    gc.collect()
    try:
        import comfy.model_management as model_management

        model_management.unload_all_models()
        model_management.soft_empty_cache(force=True)
    except Exception as exc:  # noqa: BLE001 - running without ComfyUI is supported
        logger.debug("ComfyUI VRAM not released after reconstruction: %s", exc)
        return
    logger.info(
        "OmniCam reconstruction released resident models%s",
        f" ({reason})" if reason else "",
    )
