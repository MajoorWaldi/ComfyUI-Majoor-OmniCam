"""release_reconstruction_models drops the per-run weight caches and is a no-op
without ComfyUI on the path."""

from __future__ import annotations

from omnicam.reconstruction.model_release import release_reconstruction_models


def test_release_is_safe_without_comfy_and_clears_provider_caches():
    from omnicam.reconstruction.providers import comfy_moge
    from omnicam.reconstruction.segmentation import comfy_sam3

    # Seed both module-level caches as a finished run would leave them.
    with comfy_moge._model_cache_lock:
        comfy_moge._model_cache["ckpt:1:1"] = object()
    comfy_sam3._SHARED_MODEL_CACHE.get_or_load("tok", lambda: ("model", "clip"))
    assert comfy_sam3._SHARED_MODEL_CACHE.peek_token() == "tok"

    # comfy.model_management is not importable in the pure suite; the call must
    # still succeed and still clear our own references.
    release_reconstruction_models(reason="unit test")

    assert comfy_moge._model_cache == {}
    assert comfy_sam3._SHARED_MODEL_CACHE.peek_token() is None
