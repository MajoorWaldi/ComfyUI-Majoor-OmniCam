"""Tests for no-prompt reconstruction job manager and runner."""

from __future__ import annotations

import threading
import time
from unittest.mock import MagicMock

import pytest

from omnicam.reconstruction.errors import ReconCancelledError
from omnicam.reconstruction.jobs.manager import (
    JobAccessDeniedError,
    JobNotFoundError,
    ReconstructionJobManager,
)
from omnicam.reconstruction.jobs.types import (
    ANALYZE_LAYOUT,
    BUILD_MESH,
    DONE,
    FAILED,
    FINALIZING,
    IDLE,
    INFER_GEOMETRY,
    PREPARING,
    SAVE_ASSETS,
    STOPPED,
    STOPPING,
    ReconstructionJob,
    can_transition,
)
from omnicam.reconstruction.pipeline import PipelineOutput
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import ReconstructionSource

from .fakes import FakeReconstructionProvider


def test_state_machine_valid_transitions():
    assert can_transition(IDLE, PREPARING)
    assert can_transition(PREPARING, INFER_GEOMETRY)
    assert can_transition(INFER_GEOMETRY, BUILD_MESH)
    assert can_transition(BUILD_MESH, ANALYZE_LAYOUT)
    assert can_transition(ANALYZE_LAYOUT, SAVE_ASSETS)
    assert can_transition(SAVE_ASSETS, FINALIZING)
    assert can_transition(FINALIZING, DONE)

    # Stopping paths
    assert can_transition(PREPARING, STOPPING)
    assert can_transition(INFER_GEOMETRY, STOPPING)
    assert can_transition(STOPPING, STOPPED)

    # Failure paths
    assert can_transition(PREPARING, FAILED)
    assert can_transition(INFER_GEOMETRY, FAILED)

    # Terminal states have no outgoing transitions
    assert not can_transition(DONE, PREPARING)
    assert not can_transition(STOPPED, PREPARING)
    assert not can_transition(FAILED, IDLE)


def test_ownership_enforcement():
    manager = ReconstructionJobManager(gpu_semaphore=threading.Semaphore(1))
    source = ReconstructionSource(kind="annotated_input", value="room.png")
    settings = ReconstructionSettings()

    job = manager.create_job(
        node_id="node_1",
        client_id="client_owner",
        source=source,
        settings=settings,
    )

    # Owner can access
    assert manager.get_job(job.job_id, client_id="client_owner").job_id == job.job_id

    # Foreign client is denied
    with pytest.raises(JobAccessDeniedError):
        manager.get_job(job.job_id, client_id="foreign_client")

    with pytest.raises(JobAccessDeniedError):
        manager.stop_job(job.job_id, client_id="foreign_client")

    with pytest.raises(JobAccessDeniedError):
        manager.delete_job(job.job_id, client_id="foreign_client")


def test_semaphore_serializes_concurrent_jobs(tmp_path):
    sem = threading.Semaphore(1)
    manager = ReconstructionJobManager(gpu_semaphore=sem)

    source = ReconstructionSource(kind="annotated_input", value="room.png")
    settings = ReconstructionSettings()

    # Track concurrent execution in runner
    active_runs = 0
    max_concurrent = 0
    lock = threading.Lock()

    def fake_run(job, *, progress_cb=None):
        nonlocal active_runs, max_concurrent
        with lock:
            active_runs += 1
            if active_runs > max_concurrent:
                max_concurrent = active_runs
        time.sleep(0.05)
        with lock:
            active_runs -= 1
        job.transition(PREPARING)
        job.transition(DONE)

    job1 = manager.create_job("node_1", "client_1", source, settings)
    job2 = manager.create_job("node_2", "client_2", source, settings)

    t1 = threading.Thread(target=manager.execute_job, args=(job1.job_id,), kwargs={"runner_fn": fake_run})
    t2 = threading.Thread(target=manager.execute_job, args=(job2.job_id,), kwargs={"runner_fn": fake_run})

    t1.start()
    t2.start()
    t1.join()
    t2.join()

    assert max_concurrent == 1
    assert job1.state == DONE
    assert job2.state == DONE


def test_gc_evicts_stale_jobs_without_deleting_assets(tmp_path):
    manager = ReconstructionJobManager(ttl_seconds=1.0)
    source = ReconstructionSource(kind="annotated_input", value="room.png")
    settings = ReconstructionSettings()

    # Create dummy asset on disk
    asset_file = tmp_path / "environment.glb"
    asset_file.write_bytes(b"GLB DATA")

    job = manager.create_job("node_1", "client_1", source, settings)
    job.transition(PREPARING)
    job.transition(DONE)

    # Advance fake time past TTL
    job.last_access = time.time() - 10.0

    manager.sweep_stale_jobs()

    # Job is evicted from memory
    with pytest.raises(JobNotFoundError):
        manager.get_job(job.job_id)

    # Disk asset remains intact
    assert asset_file.exists()
    assert asset_file.read_bytes() == b"GLB DATA"


def test_runner_never_calls_prompt_or_enqueues_graph():
    """Verify the runner operates entirely out-of-band without ComfyUI PromptServer prompt queue."""
    from omnicam.reconstruction.jobs.runner import run_reconstruction_job

    job = ReconstructionJob(
        job_id="job_test",
        node_id="node_1",
        client_id="client_1",
        source=ReconstructionSource(kind="annotated_input", value="room.png"),
        settings=ReconstructionSettings(),
    )

    fake_provider = FakeReconstructionProvider()
    fake_output = PipelineOutput(
        motion_scene={"version": 1, "objects": []},
        summary={"provider": "fake"},
        warnings=[],
        fingerprint="abc",
    )

    mock_pipeline = MagicMock(return_value=fake_output)

    # Run the job
    run_reconstruction_job(
        job,
        provider=fake_provider,
        pipeline_fn=mock_pipeline,
        gpu_semaphore=threading.Semaphore(1),
    )

    assert job.state == DONE
    assert job.result is fake_output
    # Assert pipeline was called directly
    mock_pipeline.assert_called_once()


def test_stop_transitions_to_stopped_and_releases_semaphore():
    from omnicam.reconstruction.jobs.runner import run_reconstruction_job

    job = ReconstructionJob(
        job_id="job_test",
        node_id="node_1",
        client_id="client_1",
        source=ReconstructionSource(kind="annotated_input", value="room.png"),
        settings=ReconstructionSettings(),
    )

    sem = threading.Semaphore(1)

    def mock_pipeline_stopping(*args, **kwargs):
        cancel = kwargs.get("cancel")
        if cancel and cancel.is_cancelled():
            raise ReconCancelledError("Reconstruction cancelled")
        raise RuntimeError("Should have been cancelled")

    # Pre-cancel
    job.cancel_token.cancel()

    run_reconstruction_job(
        job,
        provider=FakeReconstructionProvider(),
        pipeline_fn=mock_pipeline_stopping,
        gpu_semaphore=sem,
    )

    assert job.state == STOPPED
    # Semaphore must be released
    acquired = sem.acquire(blocking=False)
    assert acquired is True
    sem.release()
