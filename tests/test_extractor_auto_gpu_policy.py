"""`auto` reserves the GPU only when its resolved backend actually needs it."""
from __future__ import annotations

from omnicam.extractor.backends.base import BackendAvailability
from omnicam.extractor.jobs.manager import SolveJobManager, SolveSlotBusyError


class NullPublisher:
    def __init__(self, job=None):
        pass

    def state_changed(self, _state):
        pass

    def progress(self, **_kwargs):
        pass

    def flush(self):
        pass


def _start(manager: SolveJobManager, method: str = "auto"):
    return manager.start(
        client_id="client-a",
        node_id="1",
        source_ref={"kind": "annotated_input", "value": "shot.mov"},
        settings={"method": method},
    )


def test_auto_fallback_to_cpu_backend_can_start_while_comfyui_executes(monkeypatch):
    from omnicam.extractor import backends

    monkeypatch.setattr(
        backends,
        "backend_availability",
        lambda: {
            "dpvo": BackendAvailability(False, "missing"),
            "pycolmap": BackendAvailability(True, ""),
            "opencv_sift": BackendAvailability(True, ""),
        },
    )
    manager = SolveJobManager(
        runner=lambda job, mgr, pub: None,
        publisher_factory=NullPublisher,
        execution_probe=lambda: True,
    )

    job = _start(manager, "auto")

    assert job.settings["method"] == "auto"


def test_auto_resolving_to_dpvo_still_blocks_during_comfyui_execution(monkeypatch):
    from omnicam.extractor import backends

    monkeypatch.setattr(
        backends,
        "backend_availability",
        lambda: {
            "dpvo": BackendAvailability(True, ""),
            "pycolmap": BackendAvailability(True, ""),
            "opencv_sift": BackendAvailability(True, ""),
        },
    )
    manager = SolveJobManager(
        runner=lambda job, mgr, pub: None,
        publisher_factory=NullPublisher,
        execution_probe=lambda: True,
    )

    try:
        _start(manager, "auto")
    except SolveSlotBusyError:
        pass
    else:
        raise AssertionError("auto->DPVO must reserve the GPU slot")
