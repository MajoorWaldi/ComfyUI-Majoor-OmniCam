"""Tests for reconstruction job API layer and error catalogue."""

from __future__ import annotations

import pytest

from omnicam.reconstruction.errors import (
    ReconAssetWriteFailedError,
    ReconCancelledError,
    ReconEmptyGeometryError,
    ReconGpuOomError,
    ReconInferenceFailedError,
    ReconMeshTooLargeError,
    ReconModelMissingError,
    ReconProviderUnavailableError,
    ReconResultInvalidError,
    ReconSourceInvalidError,
    ReconSourceUnsupportedError,
)
from omnicam.reconstruction.jobs.api import (
    ReconstructionApiError,
    handle_delete_job,
    handle_get_result,
    handle_get_status,
    handle_start_job,
    handle_stop_job,
    validate_start_payload,
)
from omnicam.reconstruction.jobs.manager import ReconstructionJobManager
from omnicam.reconstruction.jobs.types import DONE, FAILED, PREPARING, ReconstructionJob
from omnicam.reconstruction.pipeline import PipelineOutput
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import ReconstructionSource


def test_error_catalogue_codes():
    expected = {
        ReconSourceInvalidError: "RECON_SOURCE_INVALID",
        ReconSourceUnsupportedError: "RECON_SOURCE_UNSUPPORTED",
        ReconProviderUnavailableError: "RECON_PROVIDER_UNAVAILABLE",
        ReconModelMissingError: "RECON_MODEL_MISSING",
        ReconGpuOomError: "RECON_GPU_OOM",
        ReconInferenceFailedError: "RECON_INFERENCE_FAILED",
        ReconEmptyGeometryError: "RECON_EMPTY_GEOMETRY",
        ReconMeshTooLargeError: "RECON_MESH_TOO_LARGE",
        ReconAssetWriteFailedError: "RECON_ASSET_WRITE_FAILED",
        ReconCancelledError: "RECON_CANCELLED",
        ReconResultInvalidError: "RECON_RESULT_INVALID",
    }
    for exc_cls, expected_code in expected.items():
        err = exc_cls("test message")
        d = err.to_dict()
        assert "error" in d
        assert d["error"]["code"] == expected_code
        assert d["error"]["message"] == "test message"


def test_start_job_payload_validation():
    valid_payload = {
        "node_id": "12",
        "client_id": "test_client",
        "source": {"kind": "annotated_input", "value": "test.png"},
        "settings": {"quality": "balanced"},
    }
    validated = validate_start_payload(valid_payload)
    assert validated["node_id"] == "12"
    assert validated["client_id"] == "test_client"
    assert isinstance(validated["source"], ReconstructionSource)
    assert isinstance(validated["settings"], ReconstructionSettings)

    # Missing node_id
    with pytest.raises(ReconstructionApiError) as exc:
        validate_start_payload({**valid_payload, "node_id": ""})
    assert exc.value.status == 400

    # Invalid client_id
    with pytest.raises(ReconstructionApiError) as exc:
        validate_start_payload({**valid_payload, "client_id": "invalid client @@@"})
    assert exc.value.status == 400

    # Unknown top-level key rejected
    with pytest.raises(ReconstructionApiError) as exc:
        validate_start_payload({**valid_payload, "unknown_field": 123})
    assert exc.value.status == 400


def test_result_before_done_returns_status():
    manager = ReconstructionJobManager()
    job = manager.create_job(
        "node_1",
        "client_1",
        ReconstructionSource(kind="annotated_input", value="test.png"),
        ReconstructionSettings(),
    )
    job.transition(PREPARING)
    job.stage = PREPARING
    job.progress = 0.25

    # Should not raise 500 or error; returns status envelope
    resp = handle_get_result(manager, job.job_id, client_id="client_1")
    assert resp["job_id"] == job.job_id
    assert resp["state"] == PREPARING
    assert resp["progress"] == 0.25
    assert resp["motion_scene"] is None


def test_result_when_done_returns_scene():
    manager = ReconstructionJobManager()
    job = manager.create_job(
        "node_1",
        "client_1",
        ReconstructionSource(kind="annotated_input", value="test.png"),
        ReconstructionSettings(),
    )
    job.transition(PREPARING)
    job.result = PipelineOutput(
        motion_scene={"version": 1, "objects": []},
        summary={"provider": "fake"},
        warnings=[],
        fingerprint="fp123",
    )
    job.transition(DONE)

    resp = handle_get_result(manager, job.job_id, client_id="client_1")
    assert resp["job_id"] == job.job_id
    assert resp["state"] == DONE
    assert resp["motion_scene"] == {"version": 1, "objects": []}
    assert resp["summary"] == {"provider": "fake"}


def test_oom_failure_flow():
    from omnicam.reconstruction.jobs.runner import run_reconstruction_job

    job = ReconstructionJob(
        job_id="oom_job",
        node_id="node_1",
        client_id="client_1",
        source=ReconstructionSource(kind="annotated_input", value="room.png"),
        settings=ReconstructionSettings(),
    )

    def oom_pipeline(*args, **kwargs):
        raise ReconGpuOomError("CUDA out of memory during MoGe inference")

    run_reconstruction_job(job, pipeline_fn=oom_pipeline)

    assert job.state == FAILED
    assert job.error is not None
    assert job.error["code"] == "RECON_GPU_OOM"
    assert "CUDA out of memory" in job.error["message"]


def test_handle_start_status_stop_delete():
    manager = ReconstructionJobManager()
    payload = {
        "node_id": "node_99",
        "client_id": "client_99",
        "source": {"kind": "annotated_input", "value": "test.png"},
        "settings": {"quality": "fast"},
    }

    start_res = handle_start_job(manager, payload)
    job_id = start_res["job_id"]
    assert start_res["node_id"] == "node_99"

    # Status
    status_res = handle_get_status(manager, job_id, client_id="client_99")
    assert status_res["job_id"] == job_id

    # Stop
    stop_res = handle_stop_job(manager, job_id, client_id="client_99")
    assert stop_res["job_id"] == job_id

    # Delete
    del_res = handle_delete_job(manager, job_id, client_id="client_99")
    assert del_res["deleted"] is True

    # After delete -> 404
    with pytest.raises(ReconstructionApiError) as exc:
        handle_get_status(manager, job_id, client_id="client_99")
    assert exc.value.status == 404
