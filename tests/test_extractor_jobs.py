"""Interactive solve jobs: state machine, cooperative control, ownership, TTL."""

import threading

import pytest

from omnicam.extractor.jobs import types as job_types
from omnicam.extractor.jobs.control import (
    GpuContentionError,
    SolveCancelled,
    SolveControl,
)
from omnicam.extractor.jobs.manager import (
    JobAccessDeniedError,
    JobNotFoundError,
    SolveJobManager,
    SolveSlotBusyError,
)
from omnicam.extractor.jobs.types import (
    COMPLETED,
    FAILED,
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
    assert not job.stop_requested.is_set()


# ---------------------------------------------------------------------------
# Cooperative control
# ---------------------------------------------------------------------------

def control_for(job):
    return SolveControl(job.stop_requested)


def test_a_checkpoint_passes_straight_through_when_nothing_is_requested():
    job = new_job(owner_client_id="a", extractor_node_id="1", source_ref={}, settings={})
    control_for(job).checkpoint()  # must not block or raise


def test_a_stop_request_cancels_at_the_next_checkpoint():
    job = new_job(owner_client_id="a", extractor_node_id="1", source_ref={}, settings={})
    job.stop_requested.set()
    with pytest.raises(SolveCancelled):
        control_for(job).checkpoint()


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


class _JoinThread:
    """A worker-thread stand-in that records how ``shutdown()`` joins it."""

    def __init__(self, *, alive_after_join=False):
        self.name = "omnicam-test-worker"
        self.join_calls = []
        self._alive = alive_after_join

    def join(self, timeout=None):
        self.join_calls.append(timeout)

    def is_alive(self):
        return self._alive


def test_shutdown_bounds_the_worker_join_and_runs_backend_cleanup_first():
    events = []
    mgr = manager(backend_cleanup=lambda: events.append("cleanup"))
    job = start(mgr)

    fake = _JoinThread()
    mgr._threads[job.job_id] = fake

    mgr.shutdown()

    assert job.stop_requested.is_set()
    assert events == ["cleanup"]
    assert fake.join_calls, "shutdown must join the worker thread"
    assert all(timeout is not None and timeout > 0 for timeout in fake.join_calls)


def test_shutdown_warns_but_returns_when_a_worker_will_not_die(caplog):
    mgr = manager(backend_cleanup=lambda: None)
    job = start(mgr)
    mgr._threads[job.job_id] = _JoinThread(alive_after_join=True)

    with caplog.at_level("WARNING"):
        mgr.shutdown()

    assert "worker threads still alive" in caplog.text


def test_stop_signals_an_active_worker():
    mgr = manager()
    job = start(mgr)
    mgr.transition(job, PREPARING)
    mgr.transition(job, TRACKING)
    mgr.stop(job)
    assert job.state == STOPPING
    assert job.stop_requested.is_set()


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


def test_dpvo_does_not_start_while_comfyui_is_executing():
    mgr = manager(execution_probe=lambda: True)
    with pytest.raises(SolveSlotBusyError, match="currently executing a workflow"):
        start(mgr, method="dpvo")
    with pytest.raises(SolveSlotBusyError, match="currently executing a workflow"):
        start(mgr, method="auto")


def test_opencv_remains_available_while_comfyui_is_executing():
    mgr = manager(execution_probe=lambda: True)
    assert start(mgr, method="opencv_sift").settings["method"] == "opencv_sift"


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


def test_public_job_state_machine_has_no_pause_states():
    assert "PAUSING" not in job_types.STATES
    assert "PAUSED" not in job_types.STATES


class _Clock:
    """A hand-cranked monotonic clock, so contention polling is not a sleep."""

    def __init__(self) -> None:
        self.now = 1000.0

    def __call__(self) -> float:
        return self.now

    def advance(self, seconds: float) -> None:
        self.now += seconds


def _gpu_control(busy, clock=None, poll_seconds=0.5):
    clock = clock or _Clock()
    control = SolveControl(
        threading.Event(), execution_probe=busy, clock=clock, poll_seconds=poll_seconds,
    )
    control.watch_gpu_contention()
    return control, clock


def test_an_unarmed_solve_ignores_comfyui_execution_entirely():
    """OpenCV never touches the card, so a queued workflow is none of its business."""
    control = SolveControl(threading.Event(), execution_probe=lambda: True, clock=_Clock())

    control.checkpoint()  # not armed: no exception, no probe result consulted


def test_a_gpu_solve_gives_the_card_back_when_a_workflow_starts():
    """The start gate reads the queue once; this is what covers the window after it.

    OmniCam released ComfyUI's models to hand the card to the solver child, so a
    prompt queued a second later reloads a checkpoint straight into VRAM the
    solver is using. Both processes lose. The solve is the one that steps aside.
    """
    busy = False
    control, clock = _gpu_control(lambda: busy)

    clock.advance(0.6)
    control.checkpoint()  # queue still idle: the solve keeps the card

    busy = True
    clock.advance(0.6)
    with pytest.raises(GpuContentionError, match="a ComfyUI workflow started using the GPU"):
        control.checkpoint()


def test_the_queue_is_not_re_read_on_every_checkpoint():
    """The checkpoint fires ~20x a second and each probe takes the queue's lock."""
    probes = []
    control, clock = _gpu_control(lambda: probes.append(clock.now) or False)

    # 0.6s of checkpoints at the runner's real 20Hz-plus rate, over one interval.
    for _ in range(60):
        clock.advance(0.01)
        control.checkpoint()

    assert len(probes) == 1


def test_arming_does_not_re_read_the_queue_the_manager_just_read():
    control, _clock = _gpu_control(lambda: True)

    control.checkpoint()  # inside the poll interval: the idle read still stands


def test_a_broken_execution_probe_never_stops_a_healthy_solve():
    def probe():
        raise RuntimeError("ComfyUI's queue moved again")

    control, clock = _gpu_control(probe)
    clock.advance(0.6)

    control.checkpoint()


def test_a_user_stop_outranks_gpu_contention():
    """Both are true at once when someone hits Stop as a workflow starts."""
    stop = threading.Event()
    control = SolveControl(stop, execution_probe=lambda: True, clock=_Clock())
    control.watch_gpu_contention()
    stop.set()

    with pytest.raises(SolveCancelled):
        control.checkpoint()


def test_assert_gpu_free_probes_even_inside_the_throttle_window():
    """checkpoint() is rate-limited and can sail past the instant just before a
    VRAM release; assert_gpu_free() is the unthrottled check for that instant."""
    control, _clock = _gpu_control(lambda: True)

    control.checkpoint()  # throttled: the manager's idle read still stands

    with pytest.raises(GpuContentionError):
        control.assert_gpu_free()  # unthrottled: sees the workflow that just started

    # And it stays a clean no-op when the queue really is idle.
    idle, _ = _gpu_control(lambda: False)
    idle.assert_gpu_free()


def test_assert_gpu_free_needs_no_arming_and_no_probe():
    """About to hand the card to a child *is* the condition, and a headless
    solve with no probe wired must not be blocked by it."""
    armed_never = SolveControl(threading.Event(), execution_probe=lambda: True, clock=_Clock())
    with pytest.raises(GpuContentionError):
        armed_never.assert_gpu_free()

    SolveControl(threading.Event()).assert_gpu_free()  # no probe -> no-op


def test_assert_gpu_free_yields_to_a_user_stop_first():
    stop = threading.Event()
    control = SolveControl(stop, execution_probe=lambda: True, clock=_Clock())
    stop.set()

    with pytest.raises(SolveCancelled):
        control.assert_gpu_free()


def test_the_manager_exposes_its_one_execution_probe_to_running_solves():
    """Start gate and running solve must not disagree about what busy means."""
    busy = True
    mgr = manager(execution_probe=lambda: busy)

    assert mgr.execution_busy() is True
    busy = False
    assert mgr.execution_busy() is False


def test_a_manager_execution_probe_that_raises_reads_as_idle():
    def probe():
        raise RuntimeError("no PromptServer yet")

    assert manager(execution_probe=probe).execution_busy() is False
