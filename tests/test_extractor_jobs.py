"""Interactive solve jobs: state machine, cooperative control, ownership, TTL."""

import threading

import pytest

from omnicam.extractor.jobs import types as job_types
from omnicam.extractor.jobs.control import SolveCancelled, SolveControl
from omnicam.extractor.jobs.manager import (
    JobAccessDeniedError,
    JobNotFoundError,
    SolveJobManager,
    SolveSlotBusyError,
)
from omnicam.extractor.jobs.types import (
    COMPLETED,
    FAILED,
    PAUSED,
    PAUSING,
    PREPARING,
    SOLVING,
    STOPPED,
    STOPPING,
    TRACKING,
    JobStateError,
    can_transition,
    new_job,
)


class NullPublisher:
    def __init__(self, job=None):
        self.states = []

    def state_changed(self, state):
        self.states.append(state)

    def progress(self, **_kwargs):
        pass

    def pose(self, _pose, **_kwargs):
        pass

    def quality(self, _sample):
        pass

    def flush(self):
        pass

    def completed(self, _payload):
        pass

    def failed(self, _error):
        pass


def manager(runner=lambda job, mgr, pub: None, **kwargs):
    return SolveJobManager(runner=runner, publisher_factory=NullPublisher, **kwargs)


def start(mgr, *, client_id="client-a", method="opencv_sift", node_id="1"):
    return mgr.start(
        client_id=client_id, node_id=node_id,
        source_ref={"kind": "annotated_input", "value": "shot.mov"},
        settings={"method": method},
    )


# ---------------------------------------------------------------------------
# State machine
# ---------------------------------------------------------------------------

def test_the_documented_flow_is_legal():
    assert can_transition("IDLE", PREPARING)
    assert can_transition(PREPARING, TRACKING)
    assert can_transition(TRACKING, SOLVING)
    assert can_transition(SOLVING, "REFINING")
    assert can_transition("REFINING", COMPLETED)


def test_pause_and_resume_are_legal_from_the_working_states():
    for state in (TRACKING, SOLVING):
        assert can_transition(state, PAUSING)
    assert can_transition(PAUSING, PAUSED)
    assert can_transition(PAUSED, TRACKING)
    assert can_transition(PAUSED, SOLVING)


def test_terminal_states_go_nowhere():
    assert not can_transition(STOPPED, TRACKING)
    assert not can_transition(FAILED, TRACKING)
    assert not can_transition(COMPLETED, TRACKING)
    # A completed solve may still be re-refined; that is the only way out.
    assert can_transition(COMPLETED, "REFINING")


def test_an_illegal_transition_is_refused():
    mgr = manager()
    job = new_job(owner_client_id="a", extractor_node_id="1", source_ref={}, settings={})
    mgr._jobs[job.job_id] = job  # exercising transition() directly
    with pytest.raises(JobStateError, match="Cannot move"):
        mgr.transition(job, COMPLETED)


def test_a_new_job_starts_runnable():
    job = new_job(owner_client_id="a", extractor_node_id="1", source_ref={}, settings={})
    assert job.state == "IDLE"
    assert job.resume_gate.is_set(), "the gate starts open or the worker would block immediately"
    assert not job.pause_requested.is_set()
    assert not job.stop_requested.is_set()


# ---------------------------------------------------------------------------
# Cooperative control
# ---------------------------------------------------------------------------

def control_for(job, **hooks):
    return SolveControl(
        job.pause_requested, job.resume_gate, job.stop_requested, poll_seconds=0.01, **hooks
    )


def test_a_checkpoint_passes_straight_through_when_nothing_is_requested():
    job = new_job(owner_client_id="a", extractor_node_id="1", source_ref={}, settings={})
    control_for(job).checkpoint()  # must not block or raise


def test_a_stop_request_cancels_at_the_next_checkpoint():
    job = new_job(owner_client_id="a", extractor_node_id="1", source_ref={}, settings={})
    job.stop_requested.set()
    with pytest.raises(SolveCancelled):
        control_for(job).checkpoint()


def test_pause_blocks_the_worker_and_resume_releases_it():
    job = new_job(owner_client_id="a", extractor_node_id="1", source_ref={}, settings={})
    paused, resumed = threading.Event(), threading.Event()
    control = control_for(job, on_paused=paused.set, on_resumed=resumed.set)

    passed = threading.Event()

    def worker():
        control.checkpoint()
        passed.set()

    job.pause_requested.set()
    thread = threading.Thread(target=worker, daemon=True)
    thread.start()

    assert paused.wait(2.0), "the worker must report reaching a checkpoint"
    assert not passed.is_set(), "a paused worker must not run past its checkpoint"

    job.pause_requested.clear()
    job.resume_gate.set()
    assert passed.wait(2.0)
    assert resumed.is_set()
    thread.join(2.0)


def test_a_paused_worker_still_notices_a_stop():
    job = new_job(owner_client_id="a", extractor_node_id="1", source_ref={}, settings={})
    control = control_for(job)
    cancelled = threading.Event()

    def worker():
        try:
            control.checkpoint()
        except SolveCancelled:
            cancelled.set()

    job.pause_requested.set()
    thread = threading.Thread(target=worker, daemon=True)
    thread.start()
    job.stop_requested.set()
    assert cancelled.wait(2.0), "a stop must reach a worker that is already paused"
    thread.join(2.0)


def test_a_broken_pause_listener_cannot_wedge_the_solve():
    job = new_job(owner_client_id="a", extractor_node_id="1", source_ref={}, settings={})

    def explode():
        raise RuntimeError("the manager went away")

    control = control_for(job, on_paused=explode)
    job.stop_requested.set()
    with pytest.raises(SolveCancelled):
        control.checkpoint()


# ---------------------------------------------------------------------------
# Manager lifecycle
# ---------------------------------------------------------------------------

def test_starting_a_job_runs_it_off_the_prompt_queue():
    ran = threading.Event()
    mgr = manager(runner=lambda job, m, p: ran.set())
    job = start(mgr)
    assert ran.wait(2.0)
    assert mgr.get(job.job_id) is job


def test_manager_shutdown_stops_jobs_and_reaps_backend_processes():
    cleaned = []
    mgr = manager(backend_cleanup=lambda: cleaned.append(True))
    job = start(mgr)

    mgr.shutdown()

    assert job.stop_requested.is_set()
    assert cleaned == [True]


def test_pause_reports_pausing_then_paused_only_when_the_worker_stops():
    mgr = manager()
    job = start(mgr)
    mgr.transition(job, PREPARING)
    mgr.transition(job, TRACKING)

    mgr.pause(job)
    assert job.state == PAUSING, "PAUSING means asked, not stopped"

    mgr.worker_paused(job)
    assert job.state == PAUSED


def test_resume_returns_to_the_stage_that_was_interrupted():
    mgr = manager()
    job = start(mgr)
    mgr.transition(job, PREPARING)
    mgr.transition(job, TRACKING)
    mgr.transition(job, SOLVING)

    mgr.pause(job)
    mgr.worker_paused(job)
    mgr.resume(job)
    mgr.worker_resumed(job)
    assert job.state == SOLVING, "resume must not claim to be tracking again"
    assert job.resume_gate.is_set()
    assert not job.pause_requested.is_set()


def test_resuming_a_job_that_never_reached_a_checkpoint_still_recovers():
    mgr = manager()
    job = start(mgr)
    mgr.transition(job, PREPARING)
    mgr.transition(job, TRACKING)
    mgr.pause(job)
    mgr.resume(job)
    assert job.state == TRACKING


def test_pausing_a_job_that_is_not_working_is_refused():
    mgr = manager()
    job = start(mgr)
    with pytest.raises(JobStateError, match="cannot be paused"):
        mgr.pause(job)


def test_resuming_a_running_job_is_refused():
    mgr = manager()
    job = start(mgr)
    mgr.transition(job, PREPARING)
    mgr.transition(job, TRACKING)
    with pytest.raises(JobStateError, match="cannot be resumed"):
        mgr.resume(job)


def test_stop_signals_the_worker_and_wakes_a_paused_one():
    mgr = manager()
    job = start(mgr)
    mgr.transition(job, PREPARING)
    mgr.transition(job, TRACKING)
    mgr.pause(job)
    mgr.worker_paused(job)

    mgr.stop(job)
    assert job.state == STOPPING
    assert job.stop_requested.is_set()
    assert job.resume_gate.is_set(), "a stopped worker must be woken to see the stop"


def test_stopping_a_finished_job_is_a_no_op():
    mgr = manager()
    job = start(mgr)
    mgr.transition(job, PREPARING)
    mgr.transition(job, TRACKING)
    mgr.transition(job, SOLVING)
    mgr.transition(job, "REFINING")
    mgr.transition(job, COMPLETED)
    mgr.stop(job)
    assert job.state == COMPLETED


# ---------------------------------------------------------------------------
# Result integrity
# ---------------------------------------------------------------------------

def test_a_stopped_job_has_no_final_result():
    from omnicam.extractor.jobs.worker import job_result

    mgr = manager()
    job = start(mgr)
    mgr.transition(job, STOPPING, force=True)
    mgr.transition(job, STOPPED)
    with pytest.raises(ValueError, match="only a COMPLETED solve"):
        job_result(job)


def test_a_completed_job_without_a_track_still_refuses_a_result():
    from omnicam.extractor.jobs.worker import job_result

    job = new_job(owner_client_id="a", extractor_node_id="1", source_ref={}, settings={})
    job.state = COMPLETED
    with pytest.raises(ValueError):
        job_result(job)


# ---------------------------------------------------------------------------
# Concurrency, ownership, cleanup
# ---------------------------------------------------------------------------

def test_only_one_gpu_solve_runs_at_a_time():
    mgr = manager()
    first = start(mgr, method="dpvo")
    mgr.transition(first, PREPARING)
    mgr.transition(first, TRACKING)
    with pytest.raises(SolveSlotBusyError, match="currently active"):
        start(mgr, method="dpvo")


def test_the_gpu_slot_is_released_when_the_first_solve_finishes():
    mgr = manager()
    first = start(mgr, method="dpvo")
    mgr.transition(first, STOPPING, force=True)
    mgr.transition(first, STOPPED)
    mgr.finish(first)
    second = start(mgr, method="dpvo")
    assert second.job_id != first.job_id


def test_deleting_an_active_gpu_job_keeps_the_slot_until_the_worker_finishes():
    mgr = manager()
    first = start(mgr, method="dpvo")
    mgr.transition(first, PREPARING)
    mgr.transition(first, TRACKING)

    assert mgr.delete(first.job_id) is False
    assert first.stop_requested.is_set()
    assert mgr.get(first.job_id) is first
    with pytest.raises(SolveSlotBusyError, match="currently active"):
        start(mgr, method="dpvo")

    mgr.transition(first, STOPPED, force=True)
    mgr.finish(first)
    assert mgr.delete(first.job_id) is True


def test_another_client_cannot_touch_a_job():
    mgr = manager()
    job = start(mgr, client_id="client-a")
    with pytest.raises(JobAccessDeniedError):
        mgr.get(job.job_id, client_id="client-b")
    assert mgr.get(job.job_id, client_id="client-a") is job


def test_an_unknown_job_is_reported_as_missing():
    with pytest.raises(JobNotFoundError):
        manager().get("nope")


def test_finished_jobs_are_swept_after_their_ttl():
    now = [0.0]
    mgr = manager(ttl_seconds=10.0, clock=lambda: now[0])
    job = start(mgr)
    mgr.transition(job, STOPPING, force=True)
    mgr.transition(job, STOPPED)
    mgr.finish(job)

    now[0] = 5.0
    assert mgr.sweep() == 0
    now[0] = 60.0
    assert mgr.sweep() == 1
    with pytest.raises(JobNotFoundError):
        mgr.get(job.job_id)


def test_an_active_job_is_never_swept():
    now = [0.0]
    mgr = manager(ttl_seconds=1.0, clock=lambda: now[0])
    job = start(mgr)
    mgr.transition(job, PREPARING)
    mgr.transition(job, TRACKING)
    now[0] = 10_000.0
    assert mgr.sweep() == 0
    assert mgr.get(job.job_id) is job


def test_deleting_a_job_stops_it_and_frees_its_buffers():
    mgr = manager()
    job = start(mgr)
    job.raw_poses = [object()] * 10
    job.quality_samples = [object()] * 10
    mgr.transition(job, STOPPED, force=True)
    mgr.finish(job)
    assert mgr.delete(job.job_id) is True
    assert job.raw_poses == []
    assert job.quality_samples == []
    with pytest.raises(JobNotFoundError):
        mgr.get(job.job_id)


def test_the_job_status_payload_is_recoverable_over_http():
    mgr = manager()
    job = start(mgr)
    mgr.transition(job, PREPARING)
    status = job.status()
    assert status["job_id"] == job.job_id
    assert status["state"] == PREPARING
    assert status["node_id"] == "1"
    assert set(status) >= {"progress", "stage_progress", "frame", "frame_count", "has_result"}


def test_every_state_name_is_unique():
    assert len(job_types.STATES) == len(set(job_types.STATES))
