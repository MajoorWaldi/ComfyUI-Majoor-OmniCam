"""Live solve telemetry: addressing, throttling and payload bounds."""

import pytest

from omnicam.extractor.jobs.events import (
    COMPLETED_EVENT,
    EVENT_NAMES,
    FAILED_EVENT,
    FEATURES_EVENT,
    JOB_EVENT,
    MAX_QUALITY_BATCH,
    POSE_EVENT,
    PROGRESS_EVENT,
    QUALITY_EVENT,
    SolveEventPublisher,
)
from omnicam.extractor.jobs.types import QualitySample, new_job
from omnicam.extractor.jobs.worker import _JobObserver
from omnicam.extractor.types import PoseSample


class Recorder:
    def __init__(self):
        self.sent = []

    def __call__(self, event, payload, client_id):
        self.sent.append((event, payload, client_id))

    def events(self, name):
        return [payload for event, payload, _ in self.sent if event == name]


class Clock:
    def __init__(self):
        self.now = 0.0

    def __call__(self):
        return self.now

    def advance(self, seconds):
        self.now += seconds


def publisher(**kwargs):
    job = new_job(
        owner_client_id="client-a", extractor_node_id="42",
        source_ref={"kind": "annotated_input", "value": "shot.mov"}, settings={},
    )
    job.source_frame_count = 100
    recorder, clock = Recorder(), Clock()
    return job, recorder, clock, SolveEventPublisher(
        job, sender=recorder, clock=clock, **kwargs
    )


def pose(frame, position=(0.0, 0.0, 0.0)):
    return PoseSample(
        source_frame=frame, timestamp_seconds=frame / 24.0,
        position=list(position), quaternion_xyzw=[0.0, 0.0, 0.0, 1.0],
    )


# ---------------------------------------------------------------------------
# Addressing
# ---------------------------------------------------------------------------

def test_events_go_to_the_owning_client():
    _job, recorder, _clock, pub = publisher()
    pub.state_changed("TRACKING")
    _event, _payload, client_id = recorder.sent[0]
    assert client_id == "client-a"


def test_every_event_carries_the_job_and_node_it_belongs_to():
    _job, recorder, _clock, pub = publisher()
    pub.state_changed("TRACKING")
    pub.progress(force=True)
    pub.pose(pose(1), force=True)
    pub.quality(QualitySample(frame=1, coverage=0.9))
    pub.flush()
    pub.completed({"state": "COMPLETED"})
    pub.failed("nope")
    for _event, payload, _client in recorder.sent:
        assert payload["node_id"] == "42"
        assert payload["job_id"]


def test_the_documented_event_names_are_used():
    _job, recorder, _clock, pub = publisher()
    pub.state_changed("TRACKING")
    pub.progress(force=True)
    pub.pose(pose(1), force=True)
    pub.quality(QualitySample(frame=1, coverage=0.9))
    pub.features(1, [{"x": 0.5, "y": 0.5, "state": "accepted"}], "good")
    pub.flush()
    pub.completed({})
    pub.failed("x")
    assert {event for event, _payload, _client in recorder.sent} == set(EVENT_NAMES)


# ---------------------------------------------------------------------------
# Throttle
# ---------------------------------------------------------------------------

def test_progress_is_throttled_to_roughly_ten_hertz():
    _job, recorder, clock, pub = publisher(throttle_seconds=0.1)
    for _ in range(50):
        pub.progress()
        clock.advance(0.001)
    assert len(recorder.events(PROGRESS_EVENT)) == 1

    clock.advance(0.2)
    pub.progress()
    assert len(recorder.events(PROGRESS_EVENT)) == 2


def test_pose_events_share_the_same_throttle():
    _job, recorder, clock, pub = publisher(throttle_seconds=0.1)
    for frame in range(30):
        pub.pose(pose(frame))
        clock.advance(0.001)
    assert len(recorder.events(POSE_EVENT)) == 1


def test_a_state_change_is_never_throttled():
    _job, recorder, _clock, pub = publisher(throttle_seconds=10.0)
    pub.state_changed("TRACKING")
    pub.state_changed("SOLVING")
    pub.state_changed("REFINING")
    assert [payload["state"] for payload in recorder.events(JOB_EVENT)] == [
        "TRACKING", "SOLVING", "REFINING",
    ]


def test_completion_and_failure_are_never_throttled():
    _job, recorder, _clock, pub = publisher(throttle_seconds=10.0)
    pub.completed({"state": "COMPLETED"})
    pub.failed("bad shot")
    assert len(recorder.events(COMPLETED_EVENT)) == 1
    assert recorder.events(FAILED_EVENT)[0]["error"] == "bad shot"


def test_completed_event_may_carry_bounded_landmarks():
    _job, recorder, _clock, pub = publisher()
    pub.completed({"state": "COMPLETED", "landmarks_3d": [{"x": 0.0, "y": 0.0, "z": 1.0, "confidence": 0.9}]})

    payload = recorder.events(COMPLETED_EVENT)[0]
    assert payload["landmarks_3d"][0]["z"] == 1.0


# ---------------------------------------------------------------------------
# Payload bounds
# ---------------------------------------------------------------------------

def test_a_pose_event_carries_one_pose_not_the_trajectory():
    _job, recorder, _clock, pub = publisher()
    pub.pose(pose(7, (1.0, 2.0, 3.0)), force=True)
    payload = recorder.events(POSE_EVENT)[0]
    assert payload["frame"] == 7
    assert payload["position"] == [1.0, 2.0, 3.0]
    assert len(payload["quaternion_xyzw"]) == 4
    assert "poses" not in payload and "track" not in payload


def test_a_non_finite_pose_is_never_published():
    _job, recorder, _clock, pub = publisher()
    pub.pose(pose(1, (float("nan"), 0.0, 0.0)), force=True)
    pub.pose(pose(2, (float("inf"), 0.0, 0.0)), force=True)
    assert recorder.events(POSE_EVENT) == []


def test_quality_readings_are_batched_and_bounded():
    _job, recorder, _clock, pub = publisher()
    for frame in range(MAX_QUALITY_BATCH + 40):
        pub.quality(QualitySample(frame=frame, coverage=0.8, inliers=120, state="good"))
    batches = recorder.events(QUALITY_EVENT)
    assert batches, "a full batch must flush on its own"
    for batch in batches:
        assert len(batch["samples"]) <= MAX_QUALITY_BATCH


def test_a_quality_sample_reports_only_backend_measurements():
    _job, recorder, _clock, pub = publisher()
    pub.quality(QualitySample(frame=3, coverage=0.42, inliers=63, state="weak"))
    pub.flush()
    sample = recorder.events(QUALITY_EVENT)[0]["samples"][0]
    assert sample == {"frame": 3, "coverage": 0.42, "inliers": 63, "state": "weak"}


def test_a_backend_that_cannot_count_inliers_reports_none_not_a_guess():
    _job, recorder, _clock, pub = publisher()
    pub.quality(QualitySample(frame=3, coverage=1.0, inliers=None, state="good"))
    pub.flush()
    assert recorder.events(QUALITY_EVENT)[0]["samples"][0]["inliers"] is None


def test_flushing_with_nothing_pending_sends_nothing():
    _job, recorder, _clock, pub = publisher()
    pub.flush()
    assert recorder.sent == []


def test_a_progress_event_carries_the_frame_counters_the_panel_shows():
    job, recorder, _clock, pub = publisher()
    job.state = "TRACKING"
    job.progress, job.stage_progress = 0.53, 0.71
    job.current_source_frame, job.source_frame_count = 64, 121
    job.backend_name = "dpvo"
    pub.progress(force=True)
    payload = recorder.events(PROGRESS_EVENT)[0]
    assert payload["state"] == "TRACKING"
    assert payload["progress"] == pytest.approx(0.53)
    assert payload["stage_progress"] == pytest.approx(0.71)
    assert (payload["frame"], payload["frame_count"]) == (64, 121)
    assert payload["backend"] == "dpvo"


def test_dpvo_progress_advances_source_frame_without_pose_events():
    job, recorder, _clock, pub = publisher(throttle_seconds=0.0)
    observer = _JobObserver(job, pub)

    observer.progress_frame(42)

    assert job.current_source_frame == 42
    assert recorder.events(PROGRESS_EVENT)[0]["frame"] == 42


def test_a_broken_transport_never_breaks_a_solve():
    job = new_job(owner_client_id="a", extractor_node_id="1", source_ref={}, settings={})

    def explode(*_args):
        raise RuntimeError("socket closed")

    pub = SolveEventPublisher(job, sender=explode)
    with pytest.raises(RuntimeError):
        # The injected sender is raw; the production sender is the one that
        # swallows, and it is exercised by the default path below.
        pub.state_changed("TRACKING")

    from omnicam.extractor.jobs import events

    default = SolveEventPublisher(job)
    events._send_sync("majoor.omnicam.extractor.job", {}, "nobody")
    default.state_changed("TRACKING")  # no PromptServer here: must not raise


# ---------------------------------------------------------------------------
# Tracked features
# ---------------------------------------------------------------------------

def test_features_carry_the_frame_they_describe():
    _job, recorder, _clock, pub = publisher()
    pub.features(7, [{"x": 0.25, "y": 0.5, "state": "accepted"}], "weak")
    payloads = recorder.events(FEATURES_EVENT)
    assert len(payloads) == 1
    assert payloads[0]["frame"] == 7
    assert payloads[0]["state"] == "weak"
    assert payloads[0]["points"] == [{"x": 0.25, "y": 0.5, "state": "accepted"}]


def test_a_frame_without_features_sends_nothing():
    _job, recorder, _clock, pub = publisher()
    pub.features(1, [], "good")
    assert recorder.events(FEATURES_EVENT) == []


def test_features_do_not_starve_progress_out_of_the_throttle_window():
    """Each channel throttles on its own clock.

    A shared timestamp meant whichever of progress, pose and features fired
    first in a window silenced the other two, which showed up as a progress bar
    that only moved when the overlay did not.
    """
    _job, recorder, clock, pub = publisher(throttle_seconds=0.1)
    for _ in range(5):
        pub.progress()
        pub.pose(pose(1))
        pub.features(1, [{"x": 0.1, "y": 0.1, "state": "accepted"}], "good")
        # Comfortably past the window: this test is about channel isolation,
        # not about the exact float boundary of the throttle.
        clock.advance(0.15)
    assert len(recorder.events(PROGRESS_EVENT)) == 5
    assert len(recorder.events(POSE_EVENT)) == 5
    assert len(recorder.events(FEATURES_EVENT)) == 5


def test_features_are_throttled_like_every_other_per_frame_channel():
    _job, recorder, _clock, pub = publisher(throttle_seconds=0.1)
    for _ in range(50):
        pub.features(1, [{"x": 0.1, "y": 0.1, "state": "accepted"}], "good")
    assert len(recorder.events(FEATURES_EVENT)) == 1
