"""release_reconstruction_models drops the per-run weight caches and is a no-op
without ComfyUI on the path."""

from __future__ import annotations

from omnicam.reconstruction import model_release
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


def test_release_skips_the_global_vram_unload_while_comfyui_is_executing(monkeypatch):
    # unload_all_models() is global -- calling it while ComfyUI's own queue
    # is running a *different* workflow would evict that workflow's models
    # out from under it. Our own per-run caches are still safe to clear.
    from omnicam.reconstruction.providers import comfy_moge

    with comfy_moge._model_cache_lock:
        comfy_moge._model_cache["ckpt:1:1"] = object()

    monkeypatch.setattr(model_release, "execution_busy", lambda: True)

    calls = []
    fake_model_management = type(
        "M", (), {
            "unload_all_models": staticmethod(lambda: calls.append("unload")),
            "soft_empty_cache": staticmethod(lambda force=False: calls.append("empty_cache")),
        },
    )
    import sys

    monkeypatch.setitem(sys.modules, "comfy.model_management", fake_model_management)

    release_reconstruction_models(reason="unit test")

    assert calls == []  # the global unload must never run
    assert comfy_moge._model_cache == {}  # our own reference is still dropped


def test_release_unloads_when_comfyui_is_idle(monkeypatch):
    monkeypatch.setattr(model_release, "execution_busy", lambda: False)

    calls = []
    fake_model_management = type(
        "M", (), {
            "unload_all_models": staticmethod(lambda: calls.append("unload")),
            "soft_empty_cache": staticmethod(lambda force=False: calls.append("empty_cache")),
        },
    )
    import sys

    monkeypatch.setitem(sys.modules, "comfy.model_management", fake_model_management)

    release_reconstruction_models(reason="unit test")

    assert calls == ["unload", "empty_cache"]
