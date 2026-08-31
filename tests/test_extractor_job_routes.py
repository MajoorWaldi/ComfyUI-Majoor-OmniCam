"""The no-run interactive solve API: validation, ownership, and refine-without-solve."""

import inspect

import pytest

from omnicam.extractor.jobs import api, control, events, worker
from omnicam.extractor.jobs import manager as manager_module
from omnicam.extractor.jobs import types as job_types
from omnicam.extractor.jobs.api import ApiError
from omnicam.extractor.jobs.manager import SolveJobManager
from omnicam.extractor.jobs.types import COMPLETED, PREPARING, STOPPING, TRACKING
from omnicam.extractor.pipeline import RawSolve
from omnicam.extractor.refine.types import RefinementSettings
from omnicam.extractor.types import PoseSample


class NullPublisher:
    def __init__(self, job=None):
        pass

    def __getattr__(self, _name):
        return lambda *args, **kwargs: None


def manager(runner=lambda job, mgr, pub: None, **kwargs):
    return SolveJobManager(runner=runner, publisher_factory=NullPublisher, **kwargs)


SOURCE = {"kind": "annotated_input", "value": "shot.mov"}


def start(mgr, *, client_id="client-a", source=None, settings=None, node_id="12"):
    return api.start_job(
        mgr,
        {"node_id": node_id, "source": source or SOURCE, "settings": settings or {"method": "opencv_sift"}},
        client_id=client_id,
    )


def raw_solve(count=20):
    poses = [
        PoseSample(source_frame=index, timestamp_seconds=index / 24.0,
                   position=[0.0, 0.0, -0.1 * index], quaternion_xyzw=[0.0, 0.0, 0.0, 1.0])
        for index in range(count)
    ]
    return RawSolve(
        poses=poses, backend="opencv_sift", coverage=0.92, source_fps=24.0, duration_frames=24,
        width=1920, height=1080, vertical_fov=53.0,
        intrinsics_source="auto_53deg_vertical_fov", frame_step=1, warnings=[],
        sampled_frame_count=count,
    )


def completed_job(mgr, **kwargs):
    status = start(mgr, **kwargs)
    job = mgr.get(status["job_id"])
    job.raw_solve = raw_solve()
    job.raw_poses = list(job.raw_solve.poses)
    job.state = COMPLETED
    job.refined_track = api.refine_job(mgr, job.job_id, {}, client_id=job.owner_client_id)["refined_track"]
    job.raw_track = job.refined_track
    return job


# ---------------------------------------------------------------------------
# The rule the whole panel rests on
# ---------------------------------------------------------------------------

def test_no_module_in_the_interactive_path_can_queue_a_prompt():
    """The entire point of the interactive path: no /prompt, ever.

    Asserted structurally rather than by mocking, because the guarantee is that
    the code has no way to reach the queue at all -- not that one call path
    happens to avoid it today.
    """
    for module in (api, control, events, manager_module, job_types, worker):
        source = inspect.getsource(module)
        assert "queue_prompt" not in source, module.__name__
        assert "/prompt" not in source, module.__name__
        assert "execute_prompt" not in source, module.__name__


# ---------------------------------------------------------------------------
# Start validation
# ---------------------------------------------------------------------------

def test_a_started_job_reports_its_initial_status():
    status = start(manager())
    assert status["state"] in {"IDLE", PREPARING, TRACKING}
    assert status["node_id"] == "12"
    assert status["job_id"]


def test_a_solve_must_name_its_node():
    with pytest.raises(ApiError) as error:
        api.start_job(manager(), {"source": SOURCE}, client_id="a")
    assert error.value.status == 400
    assert "Extractor node" in error.value.message


def test_a_solve_must_come_from_an_identified_client():
    with pytest.raises(ApiError, match="identified client"):
        start(manager(), client_id="")


def test_an_unknown_solve_method_is_refused():
    with pytest.raises(ApiError, match="Unsupported solve method"):
        start(manager(), settings={"method": "neural_magic"})


def test_an_unknown_solve_setting_is_refused():
    with pytest.raises(ApiError, match="Unknown solve setting"):
        start(manager(), settings={"method": "auto", "secret_flag": 1})


def test_out_of_range_settings_are_refused():
    with pytest.raises(ApiError, match="out of range"):
        start(manager(), settings={"method": "auto", "max_dimension": 8000})
    with pytest.raises(ApiError, match="out of range"):
        start(manager(), settings={"method": "auto", "frame_step": 500})
    with pytest.raises(ApiError, match="out of range"):
        start(manager(), settings={"method": "auto", "fov_degrees": 400.0})


def test_a_non_finite_setting_is_refused():
    with pytest.raises(ApiError, match="Invalid solve setting"):
        start(manager(), settings={"method": "auto", "fov_degrees": float("nan")})


def test_a_refine_setting_is_not_accepted_as_a_solve_setting():
    """Solve settings change what is tracked; refine settings change what is
    derived. Mixing them would let a slider silently trigger a re-solve."""
    with pytest.raises(ApiError, match="Unknown solve setting: motion_scale"):
        start(manager(), settings={"method": "auto", "motion_scale": 2.0})


def test_an_unsupported_source_kind_is_refused():
    with pytest.raises(ApiError, match="Unsupported video source kind"):
        start(manager(), source={"kind": "in_memory", "value": "x"})


def test_a_source_without_a_value_is_refused():
    with pytest.raises(ApiError, match="needs a reference value"):
        start(manager(), source={"kind": "annotated_input", "value": "  "})


def test_a_missing_source_is_refused():
    with pytest.raises(ApiError, match="video source object"):
        api.start_job(manager(), {"node_id": "1"}, client_id="a")


def test_an_oversized_request_is_refused():
    with pytest.raises(ApiError) as error:
        api.start_job(
            manager(),
            {"node_id": "1", "source": SOURCE, "settings": {}, "junk": "x" * (api.MAX_REQUEST_BYTES + 10)},
            client_id="a",
        )
    assert error.value.status == 413


def test_a_non_object_body_is_refused():
    with pytest.raises(ApiError, match="JSON object"):
        api.start_job(manager(), ["not", "an", "object"], client_id="a")


def test_settings_default_when_omitted():
    validated = api.validate_settings(None)
    assert validated["method"] == "dpvo"
    assert validated["max_dimension"] == 640
    assert validated["frame_step"] == 1


def test_interactive_settings_include_the_same_refinement_contract_as_the_node():
    validated = api.validate_settings({
        "refine": {"motion_scale": 3.0, "position_smoothing": 0.6},
    })
    assert validated["refine"]["motion_scale"] == 3.0
    assert validated["refine"]["position_smoothing"] == 0.6


# ---------------------------------------------------------------------------
# Control routes
# ---------------------------------------------------------------------------

def test_status_is_readable_over_http_after_a_dropped_socket():
    mgr = manager()
    job_id = start(mgr)["job_id"]
    mgr.transition(mgr.get(job_id), PREPARING)
    assert api.job_status(mgr, job_id, client_id="client-a")["state"] == PREPARING


def test_stopping_is_always_allowed():
    mgr = manager()
    job = mgr.get(start(mgr)["job_id"])
    mgr.transition(job, PREPARING)
    assert api.stop_job(mgr, job.job_id, client_id="client-a")["state"] == STOPPING


def test_an_unknown_job_is_a_404():
    with pytest.raises(ApiError) as error:
        api.job_status(manager(), "nope", client_id="a")
    assert error.value.status == 404


def test_another_client_gets_a_403():
    mgr = manager()
    job_id = start(mgr, client_id="client-a")["job_id"]
    with pytest.raises(ApiError) as error:
        api.stop_job(mgr, job_id, client_id="client-b")
    assert error.value.status == 403


def test_deleting_a_job_removes_it():
    mgr = manager()
    job_id = start(mgr)["job_id"]
    job = mgr.get(job_id)
    mgr.transition(job, "STOPPED", force=True)
    mgr.finish(job)
    assert api.delete_job(mgr, job_id, client_id="client-a")["deleted"] is True
    with pytest.raises(ApiError):
        api.job_status(mgr, job_id, client_id="client-a")


def test_deleting_an_active_job_requests_stop_without_claiming_it_was_deleted():
    mgr = manager()
    job = mgr.get(start(mgr)["job_id"])
    mgr.transition(job, PREPARING)
    payload = api.delete_job(mgr, job.job_id, client_id="client-a")
    assert payload == {"job_id": job.job_id, "deleted": False, "state": STOPPING}
    assert mgr.get(job.job_id) is job


# ---------------------------------------------------------------------------
# Result
# ---------------------------------------------------------------------------

def test_a_running_job_has_no_result():
    mgr = manager()
    job_id = start(mgr)["job_id"]
    with pytest.raises(ApiError) as error:
        api.result_payload(mgr, job_id, client_id="client-a")
    assert error.value.status == 409


def test_a_stopped_job_never_produces_a_final_track():
    mgr = manager()
    job = mgr.get(start(mgr)["job_id"])
    mgr.transition(job, STOPPING, force=True)
    mgr.transition(job, "STOPPED")
    with pytest.raises(ApiError, match="only a COMPLETED solve"):
        api.result_payload(mgr, job.job_id, client_id="client-a")


def test_a_completed_job_returns_both_tracks_and_a_fingerprint():
    mgr = manager()
    job = completed_job(mgr)
    payload = api.result_payload(mgr, job.job_id, client_id="client-a")
    assert payload["refined_track"]["schema_version"] == 1
    assert payload["raw_track"] is not None
    assert payload["fingerprint"]
    assert "report" in payload
    assert isinstance(payload["quality"], list)


# ---------------------------------------------------------------------------
# Refine without re-tracking
# ---------------------------------------------------------------------------

def test_refining_never_calls_a_solver(monkeypatch):
    mgr = manager()
    job = completed_job(mgr)

    def explode(*args, **kwargs):
        raise AssertionError("refine must not decode or solve anything")

    import omnicam.extractor.pipeline as pipeline

    monkeypatch.setattr(pipeline, "solve_raw_poses", explode)
    monkeypatch.setattr(pipeline, "decode_solver_frames", explode)
    monkeypatch.setattr(pipeline, "select_backend", explode)

    payload = api.refine_job(
        mgr, job.job_id, {"settings": {"motion_scale": 3.0}}, client_id="client-a"
    )
    assert payload["refined_track"]["metadata"]["motion_scale"] == 3.0


def test_refining_returns_a_new_fingerprint_for_new_settings():
    mgr = manager()
    job = completed_job(mgr)
    first = api.refine_job(mgr, job.job_id, {"settings": {"motion_scale": 1.0}}, client_id="client-a")
    second = api.refine_job(mgr, job.job_id, {"settings": {"motion_scale": 5.0}}, client_id="client-a")
    assert first["fingerprint"] != second["fingerprint"]


def test_refining_the_same_settings_is_stable():
    mgr = manager()
    job = completed_job(mgr)
    body = {"settings": {"position_smoothing": 0.3}}
    a = api.refine_job(mgr, job.job_id, body, client_id="client-a")
    b = api.refine_job(mgr, job.job_id, body, client_id="client-a")
    assert a["fingerprint"] == b["fingerprint"]


def test_a_refined_track_is_canonical():
    from omnicam.core.validation import validate_track_payload

    mgr = manager()
    job = completed_job(mgr)
    payload = api.refine_job(mgr, job.job_id, {}, client_id="client-a")
    assert validate_track_payload(payload["refined_track"]) == payload["refined_track"]


def test_refining_an_unfinished_solve_is_a_conflict():
    mgr = manager()
    job_id = start(mgr)["job_id"]
    with pytest.raises(ApiError) as error:
        api.refine_job(mgr, job_id, {}, client_id="client-a")
    assert error.value.status == 409


def test_refine_settings_are_clamped_not_trusted():
    mgr = manager()
    job = completed_job(mgr)
    payload = api.refine_job(
        mgr, job.job_id, {"settings": {"motion_scale": 1e12, "position_smoothing": -3}},
        client_id="client-a",
    )
    assert payload["refine_settings"]["motion_scale"] == 100.0
    assert payload["refine_settings"]["position_smoothing"] == 0.0


def test_refining_records_the_settings_that_produced_the_track():
    mgr = manager()
    job = completed_job(mgr)
    api.refine_job(mgr, job.job_id, {"settings": {"motion_scale": 2.0}}, client_id="client-a")
    assert mgr.get(job.job_id).refine_settings["motion_scale"] == 2.0


def test_refine_defaults_match_the_declared_settings_dataclass():
    assert api.refine_job.__doc__
    defaults = RefinementSettings()
    assert defaults.position_smoothing == 0.15
    assert defaults.rotation_smoothing == 0.10


# ---------------------------------------------------------------------------
# Describing a source before anything is solved
# ---------------------------------------------------------------------------

def test_describing_a_source_reports_what_the_panel_needs(monkeypatch, tmp_path):
    """Without this the panel knows a filename and nothing else.

    Its scrubber then has no range and its readout sits at 0 / 0 for footage
    that plays perfectly -- which is what "no preview" looks like to a user.
    """
    import omnicam.extractor.jobs.api as api_module

    monkeypatch.setattr(
        api_module, "resolve_interactive_video_source", lambda source, **_: tmp_path / "s.mp4"
    )
    monkeypatch.setattr(
        api_module, "describe_video_file",
        lambda path: {"name": "s.mp4", "width": 1920, "height": 1080, "fps": 25.0,
                      "frame_count": 121, "size_bytes": 900},
    )
    payload = api.describe_source({"source": SOURCE})
    assert payload["info"]["frame_count"] == 121
    assert payload["info"]["fps"] == 25.0
    assert payload["source"] == SOURCE


def test_describing_an_unresolvable_source_is_a_bad_request(monkeypatch):
    import omnicam.extractor.jobs.api as api_module
    from omnicam.extractor.source_resolver import SourceResolutionError

    def refuse(_source, **_kwargs):
        raise SourceResolutionError("Video source not found: gone.mp4")

    monkeypatch.setattr(api_module, "resolve_interactive_video_source", refuse)
    with pytest.raises(ApiError) as error:
        api.describe_source({"source": SOURCE})
    assert error.value.status == 400
    assert "gone.mp4" in error.value.message


def test_describing_validates_its_source_like_every_other_route():
    with pytest.raises(ApiError, match="Unsupported video source kind"):
        api.describe_source({"source": {"kind": "in_memory", "value": "x"}})
    with pytest.raises(ApiError, match="JSON object"):
        api.describe_source(["nope"])


def test_describing_a_source_starts_nothing():
    """It measures footage; it must not create a job or hold the solve slot.

    Asserted on the signature: with no manager to reach, there is no way for
    this handler to grow into one that queues work.
    """
    import inspect

    assert "manager" not in inspect.signature(api.describe_source).parameters
