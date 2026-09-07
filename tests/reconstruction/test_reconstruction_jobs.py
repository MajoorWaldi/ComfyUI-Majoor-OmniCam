"""Tests for no-prompt reconstruction job manager and runner."""

from __future__ import annotations

import threading
import time
from unittest.mock import MagicMock

import pytest

from omnicam.reconstruction.errors import ReconCancelledError, ReconGpuBusyError
from omnicam.reconstruction.jobs.manager import (
    JobAccessDeniedError,
    JobLimitReachedError,
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

    def fake_run(job, *, progress_cb=None, **_kwargs):
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


def test_reconstruction_refuses_gpu_when_prompt_is_running():
    """Mirrors omnicam/extractor/jobs/manager.py's own start() gate: refuse
    to even admit a GPU job while ComfyUI's queue is already running one."""
    manager = ReconstructionJobManager(execution_probe=lambda: True)

    with pytest.raises(ReconGpuBusyError, match="currently executing a workflow"):
        manager.start_job(
            "node_1",
            "client_1",
            ReconstructionSource(kind="annotated_input", value="room.png"),
            ReconstructionSettings(),
        )

    # No job was admitted; the queue stayed empty.
    assert manager._jobs == {}


def test_reconstruction_starts_normally_when_comfyui_is_idle():
    manager = ReconstructionJobManager(
        execution_probe=lambda: False,
        runner=lambda job, **kwargs: job.transition(PREPARING) or job.transition(DONE),
    )

    job = manager.start_job(
        "node_1",
        "client_1",
        ReconstructionSource(kind="annotated_input", value="room.png"),
        ReconstructionSettings(),
    )
    assert job.job_id in manager._jobs


def test_execution_probe_reaches_the_runner_for_mid_run_polling():
    """The manager's own probe -- not some independent default -- must be the
    one the runner (and therefore the pipeline's mid-run guard) polls, so an
    injected fake probe in a test is the single source of truth end to end."""
    seen_probes = []

    def fake_runner(job, *, execution_probe=None, **_kwargs):
        seen_probes.append(execution_probe)
        job.transition(PREPARING)
        job.transition(DONE)

    probe = lambda: False  # noqa: E731
    manager = ReconstructionJobManager(execution_probe=probe, runner=fake_runner)

    job = manager.create_job(
        "node_1", "client_1",
        ReconstructionSource(kind="annotated_input", value="room.png"),
        ReconstructionSettings(),
    )
    manager.execute_job(job.job_id)

    assert seen_probes == [probe]


def test_terminal_jobs_do_not_consume_active_job_limit():
    """32 finished results sitting in memory (TTL not yet elapsed) must not
    block a 33rd job when there is zero GPU work actually running -- the
    manager should evict the oldest terminal job to make room, not refuse."""
    manager = ReconstructionJobManager(max_jobs=2, ttl_seconds=1800.0)
    source = ReconstructionSource(kind="annotated_input", value="room.png")
    settings = ReconstructionSettings()

    job1 = manager.create_job("node_1", "client_1", source, settings)
    job1.transition(PREPARING)
    job1.transition(DONE)
    job1.last_access = time.time() - 100  # older

    job2 = manager.create_job("node_2", "client_2", source, settings)
    job2.transition(PREPARING)
    job2.transition(DONE)
    job2.last_access = time.time() - 10  # newer

    # Both slots are full, but both jobs are terminal (finished, not active).
    job3 = manager.create_job("node_3", "client_3", source, settings)

    # The oldest terminal job (job1) was evicted to make room; job2 (newer,
    # still terminal) and job3 (the new admission) remain.
    with pytest.raises(JobNotFoundError):
        manager.get_job(job1.job_id)
    assert manager.get_job(job2.job_id).job_id == job2.job_id
    assert manager.get_job(job3.job_id).job_id == job3.job_id


def test_active_jobs_are_never_evicted_to_make_room():
    """A job that is actually running (not terminal) must never be silently
    dropped just because the table is full -- only JobLimitReachedError, so
    the caller finds out instead of a solve vanishing mid-run."""
    manager = ReconstructionJobManager(max_jobs=1, ttl_seconds=1800.0)
    source = ReconstructionSource(kind="annotated_input", value="room.png")
    settings = ReconstructionSettings()

    active_job = manager.create_job("node_1", "client_1", source, settings)
    active_job.transition(PREPARING)  # not terminal

    with pytest.raises(JobLimitReachedError):
        manager.create_job("node_2", "client_2", source, settings)

    # The active job is untouched.
    assert manager.get_job(active_job.job_id).state == PREPARING


class _JoinThread:
    """A worker-thread stand-in that records how shutdown() joins it.

    Mirrors tests/test_extractor_jobs.py's _JoinThread for the sibling
    extractor job manager's own shutdown() coverage.
    """

    def __init__(self, *, alive_after_join: bool = False) -> None:
        self.name = "omnicam-recon-test-worker"
        self.join_calls: list[float | None] = []
        self._alive = alive_after_join

    def join(self, timeout: float | None = None) -> None:
        self.join_calls.append(timeout)

    def is_alive(self) -> bool:
        return self._alive


def test_shutdown_cancels_every_active_job():
    manager = ReconstructionJobManager()
    source = ReconstructionSource(kind="annotated_input", value="room.png")
    settings = ReconstructionSettings()
    job = manager.create_job("node_1", "client_1", source, settings)

    manager.shutdown()

    assert job.cancel_token.is_cancelled()


def test_shutdown_bounds_the_worker_join():
    manager = ReconstructionJobManager()
    source = ReconstructionSource(kind="annotated_input", value="room.png")
    settings = ReconstructionSettings()
    job = manager.create_job("node_1", "client_1", source, settings)

    fake = _JoinThread()
    manager._threads[job.job_id] = fake

    manager.shutdown()

    assert job.cancel_token.is_cancelled()
    assert fake.join_calls, "shutdown must join the worker thread"
    assert all(timeout is not None and timeout > 0 for timeout in fake.join_calls)


def test_shutdown_warns_but_returns_when_a_worker_will_not_die(caplog):
    manager = ReconstructionJobManager()
    source = ReconstructionSource(kind="annotated_input", value="room.png")
    settings = ReconstructionSettings()
    job = manager.create_job("node_1", "client_1", source, settings)
    manager._threads[job.job_id] = _JoinThread(alive_after_join=True)

    with caplog.at_level("WARNING"):
        manager.shutdown()

    assert "worker threads still alive" in caplog.text


def test_shutdown_with_no_jobs_is_a_no_op():
    manager = ReconstructionJobManager()
    manager.shutdown()  # must not raise


def test_semantic_and_scan_states_have_transitions():
    from omnicam.reconstruction.jobs.types import (
        BUILD_REFERENCE,
        COMPLETE_OBJECTS,
        FIT_BLOCKOUT,
        FUSE_VIEWS,
        REGISTER_VIEWS,
        SEGMENT_SCENE,
    )

    # single-image blockout chain
    assert can_transition(INFER_GEOMETRY, SEGMENT_SCENE)
    assert can_transition(SEGMENT_SCENE, ANALYZE_LAYOUT)
    assert can_transition(ANALYZE_LAYOUT, FIT_BLOCKOUT)
    assert can_transition(FIT_BLOCKOUT, COMPLETE_OBJECTS)
    assert can_transition(FIT_BLOCKOUT, BUILD_REFERENCE)
    assert can_transition(FIT_BLOCKOUT, SAVE_ASSETS)
    assert can_transition(COMPLETE_OBJECTS, BUILD_REFERENCE)
    assert can_transition(BUILD_REFERENCE, SAVE_ASSETS)

    # scan chain
    assert can_transition(PREPARING, REGISTER_VIEWS)
    assert can_transition(REGISTER_VIEWS, INFER_GEOMETRY)
    assert can_transition(SEGMENT_SCENE, FUSE_VIEWS)
    assert can_transition(FUSE_VIEWS, ANALYZE_LAYOUT)

    # every non-terminal semantic state can still bail out
    for s in (SEGMENT_SCENE, FIT_BLOCKOUT, COMPLETE_OBJECTS, BUILD_REFERENCE, FUSE_VIEWS, REGISTER_VIEWS):
        assert can_transition(s, STOPPING)
        assert can_transition(s, FAILED)


def test_frontend_state_list_mirrors_backend_states():
    import re
    from pathlib import Path

    from omnicam.reconstruction.jobs.types import STATES

    src = Path("web-src/extractor/reconstruction/state.js").read_text(encoding="utf-8")
    block = re.search(r"RECONSTRUCTION_STATES\s*=\s*\[(.*?)\]", src, re.S).group(1)
    js_states = set(re.findall(r'"([A-Z_]+)"', block))
    assert js_states == set(STATES), js_states.symmetric_difference(set(STATES))
