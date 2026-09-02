"""VRAM the parent holds is VRAM the spawned solver cannot have."""

from __future__ import annotations

import sys
import types

from omnicam.extractor.backends.dpvo_worker import describe_worker_oom
from omnicam.extractor.vram import (
    VramRelease,
    cuda_free_bytes,
    release_comfy_vram,
)

GIB = 1024 ** 3


def _fake_comfy(monkeypatch, *, unloaded: list) -> None:
    module = types.ModuleType("comfy.model_management")
    module.unload_all_models = lambda: unloaded.append("unload")
    module.soft_empty_cache = lambda force=False: unloaded.append(f"empty:{force}")
    package = types.ModuleType("comfy")
    package.model_management = module
    monkeypatch.setitem(sys.modules, "comfy", package)
    monkeypatch.setitem(sys.modules, "comfy.model_management", module)


def test_releasing_unloads_models_and_empties_the_cache(monkeypatch):
    calls: list[str] = []
    _fake_comfy(monkeypatch, unloaded=calls)
    monkeypatch.setattr("omnicam.extractor.vram.cuda_free_bytes", lambda: 1 * GIB)

    release = release_comfy_vram()

    assert calls == ["unload", "empty:True"]
    assert release.attempted is True


def test_an_already_empty_card_is_left_alone(monkeypatch):
    """Unloading costs the user a reload; on an empty card it buys nothing.

    An OOM raised with 21 GiB free is not a shortage, so answering it by
    evicting the user's models is both useless and expensive.
    """
    calls: list[str] = []
    _fake_comfy(monkeypatch, unloaded=calls)
    monkeypatch.setattr("omnicam.extractor.vram.cuda_free_bytes", lambda: 21 * GIB)

    release = release_comfy_vram()

    assert calls == []
    assert release.attempted is False
    assert "already free" in release.describe()


def test_running_outside_comfyui_is_not_a_failure(monkeypatch):
    """A headless solve has no ComfyUI to unload, and must still run."""
    monkeypatch.setitem(sys.modules, "comfy", None)

    release = release_comfy_vram()

    assert release.attempted is False


def test_free_vram_is_none_without_a_cuda_device(monkeypatch):
    torch = types.ModuleType("torch")
    torch.cuda = types.SimpleNamespace(is_available=lambda: False)
    monkeypatch.setitem(sys.modules, "torch", torch)

    assert cuda_free_bytes() is None


def test_recovered_reports_what_the_release_actually_freed():
    release = VramRelease(attempted=True, free_before=2 * GIB, free_after=20 * GIB)

    assert release.recovered == 18 * GIB
    assert "18.00 GiB" in release.describe()


def test_an_unmeasurable_release_does_not_invent_a_number():
    release = VramRelease(attempted=True, free_before=None, free_after=None)

    assert release.recovered is None
    assert release.describe() == "released ComfyUI models"


# ---------------------------------------------------------------------------
# The error the user actually reads
# ---------------------------------------------------------------------------

def test_an_oom_traceback_gains_the_cause_and_the_way_out(monkeypatch):
    monkeypatch.setattr(
        "omnicam.extractor.backends.dpvo_worker.cuda_free_bytes", lambda: 3 * GIB
    )
    raw = "Traceback...\ntorch.OutOfMemoryError: Allocation on device"

    described = describe_worker_oom(raw, VramRelease(attempted=False))

    assert raw in described  # the original traceback is never swallowed
    assert "Free VRAM now: 3.00 GiB" in described
    assert "separate process" in described
    assert "max_dimension" in described


def test_a_non_memory_failure_is_passed_through_untouched(monkeypatch):
    monkeypatch.setattr(
        "omnicam.extractor.backends.dpvo_worker.cuda_free_bytes", lambda: 3 * GIB
    )
    raw = "Traceback...\nValueError: checkpoint is corrupt"

    assert describe_worker_oom(raw, None) == raw


def test_an_oom_on_an_empty_card_is_not_blamed_on_a_shortage(monkeypatch):
    """Advice has to match the evidence.

    Telling someone to free VRAM when 21 GiB is free sends them to tune
    settings that cannot be the cause.
    """
    monkeypatch.setattr(
        "omnicam.extractor.backends.dpvo_worker.cuda_free_bytes", lambda: 21 * GIB
    )

    described = describe_worker_oom("torch.OutOfMemoryError: Allocation on device", None)

    assert "not short of memory" in described
    assert "allocator failure" in described
