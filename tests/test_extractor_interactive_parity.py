"""The interactive and queued paths must produce the same camera.

If they could diverge, the panel would be a preview of something other than
what the workflow renders, and every cleanup decision made in it would be a
guess. So the two paths are asserted to share their arithmetic, not merely to
look similar.
"""

import pathlib
import threading
import time

import pytest
from extractor_backend_double import RecordingBackend

from omnicam.extractor.jobs.manager import SolveJobManager
from omnicam.extractor.jobs.types import COMPLETED, FAILED, STOPPED
from omnicam.extractor.jobs.worker import job_result, run_solve_job
from omnicam.extractor.pipeline import extract_camera_track, refine_raw_solve, solve_raw_poses
from omnicam.extractor.refine.types import RefinementSettings

pytest.importorskip("av")


SETTINGS = {
    "method": "opencv_sift", "lens_mode": "auto", "fov_degrees": 53.0,
    "focal_length_mm": 24.0, "sensor_width_mm": 36.0, "max_dimension": 320, "frame_step": 1,
}
REFINE = {
    "position_smoothing": 0.15, "rotation_smoothing": 0.1, "motion_scale": 1.0,
    "normalize_origin": True, "simplify_keys": True,
    "position_tolerance": 0.01, "rotation_tolerance_deg": 0.25,
}


def copy_clip(clip, tmp_path):
    """The worker reads a path, so the fixture clip is copied where it can."""
    source = tmp_path / "shot.mp4"
    source.write_bytes(pathlib.Path(clip.get_stream_source()).read_bytes())
    return source


def interactive_track(clip, backend, **overrides):
    """The panel's route: solve once, then derive a track from the raw solve."""
    raw = solve_raw_poses(video=clip, backend=backend, **{**SETTINGS, **overrides})
    return refine_raw_solve(raw, RefinementSettings(**REFINE))


def queued_track(clip, backend, **overrides):
    """The graph's route: one call, widgets straight through."""
    return extract_camera_track(video=clip, backend=backend, **{**SETTINGS, **REFINE, **overrides}).track


def test_the_same_clip_and_settings_produce_the_same_track(clip):
    interactive = interactive_track(clip, RecordingBackend())
    queued = queued_track(clip, RecordingBackend())
    assert interactive["keyframes"] == queued["keyframes"]
    assert interactive["fps"] == queued["fps"]
    assert interactive["duration_frames"] == queued["duration_frames"]


def test_the_same_clip_and_settings_produce_the_same_fingerprint(clip):
    interactive = interactive_track(clip, RecordingBackend())
    queued = queued_track(clip, RecordingBackend())
    assert (
        interactive["metadata"]["extractor_fingerprint"]
        == queued["metadata"]["extractor_fingerprint"]
    )


def test_parity_survives_a_non_default_cleanup(clip):
    overrides = {"motion_scale": 3.5, "position_smoothing": 0.6, "simplify_keys": False}
    raw = solve_raw_poses(video=clip, backend=RecordingBackend(), **SETTINGS)
    interactive = refine_raw_solve(raw, RefinementSettings(**{**REFINE, **overrides}))
    queued = queued_track(clip, RecordingBackend(), **overrides)
    assert interactive["keyframes"] == queued["keyframes"]


def test_parity_survives_a_frame_step(clip):
    raw = solve_raw_poses(video=clip, backend=RecordingBackend(), **{**SETTINGS, "frame_step": 3})
    interactive = refine_raw_solve(raw, RefinementSettings(**REFINE))
    queued = queued_track(clip, RecordingBackend(), frame_step=3)
    assert [key["frame"] for key in interactive["keyframes"]] == [
        key["frame"] for key in queued["keyframes"]
    ]


# ---------------------------------------------------------------------------
# End-to-end, through the real worker
# ---------------------------------------------------------------------------

class ImmediatePublisher:
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


def run_job(monkeypatch, source_path, *, settings=None, backend=None):
    """Drive a real job to completion on the calling thread."""
    from omnicam.extractor.jobs import worker

    monkeypatch.setattr(worker, "resolve_interactive_video_source", lambda ref: source_path)
    if backend is not None:
        original = worker.solve_raw_poses
        monkeypatch.setattr(
            worker, "solve_raw_poses",
            lambda **kwargs: original(**{**kwargs, "backend": backend}),
        )

    done = threading.Event()
    manager = SolveJobManager(
        runner=lambda job, mgr, pub: (run_solve_job(job, mgr, pub), done.set()),
        publisher_factory=ImmediatePublisher,
    )
    job = manager.start(
        client_id="client-a", node_id="1",
        source_ref={"kind": "annotated_input", "value": source_path.name},
        settings={**SETTINGS, **(settings or {})},
    )
    assert done.wait(60), "the solve worker did not finish"
    return manager, job


def test_a_real_interactive_solve_completes_and_matches_the_queued_path(monkeypatch, tmp_path, clip):
    source = copy_clip(clip, tmp_path)

    _manager, job = run_job(monkeypatch, source, backend=RecordingBackend())
    assert job.state == COMPLETED, job.error
    result = job_result(job)

    queued = queued_track(clip, RecordingBackend())
    assert result["refined_track"]["keyframes"] == queued["keyframes"]
    assert result["raw_track"] is not None
    assert result["fingerprint"] == queued["metadata"]["extractor_fingerprint"]


def test_a_real_solve_records_the_raw_solve_for_later_refinement(monkeypatch, tmp_path, clip):
    source = copy_clip(clip, tmp_path)
    _manager, job = run_job(monkeypatch, source, backend=RecordingBackend())

    assert job.raw_solve is not None
    assert len(job.raw_poses) >= 2
    # Re-refining uses only what the job already holds.
    scaled = refine_raw_solve(job.raw_solve, RefinementSettings(motion_scale=4.0))
    assert scaled["metadata"]["motion_scale"] == 4.0


def test_a_solve_that_cannot_resolve_its_source_fails_with_a_message(monkeypatch, tmp_path):
    from omnicam.extractor.jobs import worker
    from omnicam.extractor.source_resolver import SourceResolutionError

    def refuse(_ref):
        raise SourceResolutionError("Video source not found: missing.mov")

    monkeypatch.setattr(worker, "resolve_interactive_video_source", refuse)
    done = threading.Event()
    manager = SolveJobManager(
        runner=lambda job, mgr, pub: (run_solve_job(job, mgr, pub), done.set()),
        publisher_factory=ImmediatePublisher,
    )
    job = manager.start(
        client_id="a", node_id="1",
        source_ref={"kind": "annotated_input", "value": "missing.mov"}, settings=SETTINGS,
    )
    assert done.wait(30)
    assert job.state == FAILED
    assert "missing.mov" in job.error


def test_stopping_a_solve_leaves_it_reviewable_but_not_shippable(monkeypatch, tmp_path, clip):
    """A stop mid-solve must land in STOPPED, never in COMPLETED."""
    source = copy_clip(clip, tmp_path)

    from omnicam.extractor.jobs import worker

    monkeypatch.setattr(worker, "resolve_interactive_video_source", lambda ref: source)

    started = threading.Event()
    done = threading.Event()

    class SlowBackend(RecordingBackend):
        """Never finishes on its own, so the stop is what ends this solve."""

        def solve(self, frames, intrinsics, *, progress=None, control=None, observer=None):
            started.set()
            while True:
                control.checkpoint()
                time.sleep(0.005)

    original = worker.solve_raw_poses
    monkeypatch.setattr(
        worker, "solve_raw_poses", lambda **kwargs: original(**{**kwargs, "backend": SlowBackend()}),
    )
    manager = SolveJobManager(
        runner=lambda job, mgr, pub: (run_solve_job(job, mgr, pub), done.set()),
        publisher_factory=ImmediatePublisher,
    )
    job = manager.start(
        client_id="a", node_id="1",
        source_ref={"kind": "annotated_input", "value": "shot.mp4"}, settings=SETTINGS,
    )
    assert started.wait(30), "the solve never began"
    manager.stop(job)
    assert done.wait(30), "the worker ignored the stop"

    assert job.state == STOPPED, job.error
    with pytest.raises(ValueError, match="only a COMPLETED solve"):
        job_result(job)


def test_a_stop_landing_as_the_solve_finishes_still_reports_stopped(monkeypatch, tmp_path, clip):
    """The race the state machine used to lose.

    A stop arriving between the solver returning and the next stage transition
    must read as STOPPED, not as an internal state-machine error dressed up as
    a failed solve.
    """
    source = copy_clip(clip, tmp_path)

    from omnicam.extractor.jobs import worker

    monkeypatch.setattr(worker, "resolve_interactive_video_source", lambda ref: source)

    done = threading.Event()
    manager = SolveJobManager(
        runner=lambda job, mgr, pub: (run_solve_job(job, mgr, pub), done.set()),
        publisher_factory=ImmediatePublisher,
    )

    class StopOnReturn(RecordingBackend):
        def solve(self, frames, intrinsics, *, progress=None, control=None, observer=None):
            result = super().solve(frames, intrinsics)
            manager.stop(pending["job"])
            return result

    original = worker.solve_raw_poses
    monkeypatch.setattr(
        worker, "solve_raw_poses", lambda **kwargs: original(**{**kwargs, "backend": StopOnReturn()}),
    )
    pending = {}
    pending["job"] = job = manager.start(
        client_id="a", node_id="1",
        source_ref={"kind": "annotated_input", "value": "shot.mp4"}, settings=SETTINGS,
    )
    assert done.wait(30)
    assert job.state == STOPPED, job.error
    assert job.error == "", "a deliberate stop is not an error"
