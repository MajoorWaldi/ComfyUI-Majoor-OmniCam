"""Provider-neutral solve-health normalisation and its additive track metadata."""

from omnicam.core.validation import validate_track_payload
from omnicam.extractor.solve_health import normalize_solve_health
from omnicam.extractor.track_builder import build_omnicam_track
from omnicam.extractor.types import PoseSample

IDENTITY = [0.0, 0.0, 0.0, 1.0]


def pose(frame, z):
    return PoseSample(
        source_frame=frame,
        timestamp_seconds=frame / 24.0,
        position=[0.0, 0.0, float(z)],
        quaternion_xyzw=list(IDENTITY),
    )


def build(poses, **overrides):
    settings = dict(
        poses=poses,
        source_fps=24.0,
        duration_frames=48,
        width=1280,
        height=720,
        vertical_fov=53.0,
        backend="opencv_sift",
        confidence=0.9,
        frame_step=1,
        intrinsics_source="measured",
        motion_scale=1.0,
        raw_key_count=len(poses),
        warnings=[],
    )
    settings.update(overrides)
    return build_omnicam_track(**settings)


class FakeSample:
    """Stands in for jobs.types.QualitySample."""

    def __init__(self, frame, state="unknown", coverage=0.0, inliers=None):
        self.frame = frame
        self.state = state
        self.coverage = coverage
        self.inliers = inliers


# --- normaliser -------------------------------------------------------------

def test_no_samples_yields_no_block():
    assert normalize_solve_health(None, 48) is None
    assert normalize_solve_health([], 48) is None


def test_states_are_passed_through_and_unknown_is_the_fallback():
    block = normalize_solve_health(
        [FakeSample(0, "good", 0.98), FakeSample(1, "warning", 0.6), FakeSample(2, "bad", 0.2), FakeSample(3, "sketchy", 0.5)],
        48,
    )
    states = {entry["frame"]: entry["state"] for entry in block["frames"]}
    assert states == {0: "good", 1: "warning", 2: "bad", 3: "unknown"}
    assert block["source"] == "extractor"


def test_score_comes_from_coverage_and_clamps_to_unit_range():
    block = normalize_solve_health([FakeSample(0, "good", 1.4), FakeSample(1, "bad", -0.3)], 48)
    scored = {entry["frame"]: entry["score"] for entry in block["frames"]}
    assert scored == {0: 1.0, 1: 0.0}


def test_a_non_finite_or_missing_score_is_simply_absent():
    block = normalize_solve_health(
        [FakeSample(0, "good", float("nan")), {"frame": 1, "state": "good"}],
        48,
    )
    assert "score" not in block["frames"][0]
    assert "score" not in block["frames"][1]


def test_frames_outside_the_timeline_are_dropped_and_duplicates_keep_the_last():
    block = normalize_solve_health(
        [FakeSample(-1, "good"), FakeSample(99, "good"), FakeSample(5, "good"), FakeSample(5, "bad")],
        48,
    )
    assert [entry["frame"] for entry in block["frames"]] == [5]
    assert block["frames"][0]["state"] == "bad"


def test_a_frame_with_no_sample_is_never_invented_as_good():
    block = normalize_solve_health([FakeSample(10, "good", 0.9)], 48)
    listed = {entry["frame"] for entry in block["frames"]}
    assert listed == {10}


def test_more_than_64_readings_are_capped_and_flagged():
    block = normalize_solve_health([FakeSample(i, "good", 0.9) for i in range(80)], 200)
    assert len(block["frames"]) == 64
    assert block["truncated"] is True


# --- track integration ----------------------------------------------------

def test_build_omnicam_track_attaches_the_block_without_a_schema_bump():
    poses = [pose(i, -0.2 * i) for i in range(6)]
    samples = [FakeSample(i, "good" if i else "warning", 0.95) for i in range(6)]
    track = build(poses, solve_health=samples)

    assert track["schema_version"] == 1
    block = track["metadata"]["solve_health_v1"]
    assert block["source"] == "extractor"
    assert block["frames"][0]["state"] == "warning"
    assert block["frames"][1]["state"] == "good"
    # The additive block survives the canonical validator untouched.
    revalidated = validate_track_payload(track)
    assert revalidated["metadata"]["solve_health_v1"]["frames"] == block["frames"]


def test_build_omnicam_track_omits_the_block_when_there_is_no_health():
    track = build([pose(i, -0.2 * i) for i in range(6)])
    assert "solve_health_v1" not in track["metadata"]

    track_empty = build([pose(i, -0.2 * i) for i in range(6)], solve_health=[])
    assert "solve_health_v1" not in track_empty["metadata"]
