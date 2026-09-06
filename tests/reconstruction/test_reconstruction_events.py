"""Tests for reconstruction WebSocket event publisher."""

from __future__ import annotations

import sys
from unittest.mock import MagicMock

from omnicam.reconstruction.jobs.events import (
    EVENT_DONE,
    EVENT_ERROR,
    EVENT_PREVIEW,
    EVENT_PROGRESS,
    EVENT_STATE,
    ReconstructionEventPublisher,
)
from omnicam.reconstruction.jobs.types import DONE, FAILED, PREPARING, ReconstructionJob
from omnicam.reconstruction.pipeline import PipelineOutput
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import ReconstructionSource


def test_events_carry_job_id_and_node_id():
    job = ReconstructionJob(
        job_id="job_abc123",
        node_id="node_456",
        client_id="client_789",
        source=ReconstructionSource(kind="annotated_input", value="test.png"),
        settings=ReconstructionSettings(),
    )

    emitted: list[tuple[str, dict, str]] = []

    def mock_sender(event: str, payload: dict, client_id: str) -> None:
        emitted.append((event, payload, client_id))

    pub = ReconstructionEventPublisher(job, sender=mock_sender)

    # 1. State event
    job.transition(PREPARING)
    job.stage = PREPARING
    job.progress = 0.1
    pub.emit_state()

    assert len(emitted) == 1
    event, payload, cid = emitted[-1]
    assert event == EVENT_STATE
    assert payload["job_id"] == "job_abc123"
    assert payload["node_id"] == "node_456"
    assert payload["state"] == PREPARING
    assert cid == "client_789"

    # 2. Progress event
    job.progress = 0.5
    job.message = "Triangulating mesh"
    pub.emit_progress()

    assert len(emitted) == 2
    event, payload, _ = emitted[-1]
    assert event == EVENT_PROGRESS
    assert payload["job_id"] == "job_abc123"
    assert payload["node_id"] == "node_456"
    assert payload["progress"] == 0.5
    assert payload["message"] == "Triangulating mesh"

    # 3. Preview event
    pub.emit_preview({"triangles": 5000, "fov_x": 53.0})

    assert len(emitted) == 3
    event, payload, _ = emitted[-1]
    assert event == EVENT_PREVIEW
    assert payload["job_id"] == "job_abc123"
    assert payload["node_id"] == "node_456"
    assert payload["triangles"] == 5000

    # 4. Done event
    job.result = PipelineOutput(
        motion_scene={"version": 1, "objects": []},
        summary={"provider": "fake"},
        warnings=["warning1"],
        fingerprint="fp1",
    )
    job.transition(DONE)
    pub.emit_done()

    assert len(emitted) == 4
    event, payload, _ = emitted[-1]
    assert event == EVENT_DONE
    assert payload["job_id"] == "job_abc123"
    assert payload["node_id"] == "node_456"
    assert payload["summary"] == {"provider": "fake"}
    assert payload["warnings"] == ["warning1"]

    # 5. Error event
    failed_job = ReconstructionJob(
        job_id="job_err",
        node_id="node_err",
        client_id="client_err",
        source=ReconstructionSource(kind="annotated_input", value="test.png"),
        settings=ReconstructionSettings(),
        error={"code": "RECON_GPU_OOM", "message": "Out of memory"},
    )
    failed_job.transition(FAILED)
    err_pub = ReconstructionEventPublisher(failed_job, sender=mock_sender)
    err_pub.emit_error()

    assert len(emitted) == 5
    event, payload, _ = emitted[-1]
    assert event == EVENT_ERROR
    assert payload["job_id"] == "job_err"
    assert payload["node_id"] == "node_err"
    assert payload["error"]["code"] == "RECON_GPU_OOM"


def test_events_emitted_via_prompt_server(monkeypatch):
    import types
    mock_prompt_server = MagicMock()
    mock_instance = MagicMock()
    mock_prompt_server.instance = mock_instance

    server_stub = types.ModuleType("server")
    server_stub.PromptServer = mock_prompt_server
    monkeypatch.setitem(sys.modules, "server", server_stub)
    monkeypatch.delitem(sys.modules, "omnicam.comfy_compat.server", raising=False)

    import omnicam.comfy_compat.server as compat_mod
    monkeypatch.setattr(compat_mod, "PromptServer", mock_prompt_server)

    job = ReconstructionJob(
        job_id="job_ps",
        node_id="node_ps",
        client_id="client_ps",
        source=ReconstructionSource(kind="annotated_input", value="test.png"),
        settings=ReconstructionSettings(),
    )

    pub = ReconstructionEventPublisher(job)
    mock_instance.send_sync.reset_mock()
    pub.emit_state()

    mock_instance.send_sync.assert_called_once()
    args, _ = mock_instance.send_sync.call_args
    assert args[0] == EVENT_STATE
    assert args[1]["job_id"] == "job_ps"
    assert args[2] == "client_ps"


def test_no_preview_event_loads_diffusion_or_video_model():
    """Verify preview emission does not import or invoke diffusion / video generation models."""
    loaded_modules_before = set(sys.modules.keys())

    job = ReconstructionJob(
        job_id="job_light",
        node_id="node_light",
        client_id="client_light",
        source=ReconstructionSource(kind="annotated_input", value="test.png"),
        settings=ReconstructionSettings(),
    )

    sent = []
    pub = ReconstructionEventPublisher(job, sender=lambda *a: sent.append(a))
    pub.emit_preview({"mesh_triangles": 12000})

    assert len(sent) == 1
    # Check that no new heavy diffusion / video models were pulled into sys.modules
    heavy_model_modules = [
        m for m in sys.modules
        if ("diffusers" in m or "wan" in m.lower() or "ltx" in m.lower() or "video_models" in m.lower())
        and m not in loaded_modules_before
    ]
    assert not heavy_model_modules
