"""Backend availability, deterministic selection and the classical solver."""

import math

import numpy as np
import pytest

from omnicam.extractor import backends as backend_registry
from omnicam.extractor.backends import (
    BackendAvailability,
    BackendUnavailableError,
    DpvoBackend,
    OpenCvSiftBackend,
    SolveError,
    backend_availability,
    coverage_ratio,
    select_backend,
)
from omnicam.extractor.backends.opencv_vo import rotation_matrix_to_quaternion
from omnicam.extractor.intrinsics import resolve_intrinsics
from omnicam.extractor.types import VideoFrameSample


def force(monkeypatch, *, dpvo: bool, opencv: bool):
    monkeypatch.setattr(
        DpvoBackend, "availability",
        classmethod(lambda cls: BackendAvailability(dpvo, "" if dpvo else "no DPVO here")),
    )
    monkeypatch.setattr(
        OpenCvSiftBackend, "availability",
        classmethod(lambda cls: BackendAvailability(opencv, "" if opencv else "no OpenCV here")),
    )


# ---------------------------------------------------------------------------
# Selection
# ---------------------------------------------------------------------------

def test_auto_prefers_dpvo_when_available(monkeypatch):
    force(monkeypatch, dpvo=True, opencv=True)
    assert select_backend("auto").name == "dpvo"


def test_auto_falls_back_to_opencv(monkeypatch):
    force(monkeypatch, dpvo=False, opencv=True)
    assert select_backend("auto").name == "opencv_sift"


def test_requested_unavailable_dpvo_has_actionable_reason(monkeypatch):
    force(monkeypatch, dpvo=False, opencv=True)
    with pytest.raises(BackendUnavailableError) as error:
        select_backend("dpvo")
    message = str(error.value)
    assert "no DPVO here" in message
    assert "models/omnicam/dpvo/dpvo.pth" in message
    assert "opencv_sift" in message
    assert "did not modify your Python environment" in message


def test_requested_unavailable_opencv_points_at_the_install(monkeypatch):
    force(monkeypatch, dpvo=True, opencv=False)
    with pytest.raises(BackendUnavailableError) as error:
        select_backend("opencv_sift")
    assert "no OpenCV here" in str(error.value)
    assert "opencv-python-headless" in str(error.value)


def test_no_backend_reports_both_failures(monkeypatch):
    force(monkeypatch, dpvo=False, opencv=False)
    with pytest.raises(BackendUnavailableError) as error:
        select_backend("auto")
    message = str(error.value)
    assert "DPVO: no DPVO here" in message
    assert "OpenCV/SIFT: no OpenCV here" in message


def test_unknown_method_is_rejected():
    with pytest.raises(BackendUnavailableError, match="Unknown extraction method"):
        select_backend("neural_magic")


def test_availability_probe_never_raises(monkeypatch):
    def explode(cls):
        raise RuntimeError("broken import machinery")

    monkeypatch.setattr(DpvoBackend, "availability", classmethod(explode))
    report = backend_availability()
    assert report["dpvo"].available is False
    assert "broken import machinery" in report["dpvo"].reason


def test_every_backend_declares_a_known_basis():
    for backend in backend_registry.BACKEND_CLASSES:
        assert backend.basis in {"opencv", "omnicam"}


def test_dpvo_checkpoint_path_is_managed_and_not_configurable():
    from omnicam.extractor.backends.dpvo import checkpoint_path

    path = checkpoint_path().replace("\\", "/")
    assert path.endswith("omnicam/dpvo/dpvo.pth")


def test_coverage_ratio_is_bounded():
    assert coverage_ratio(0, 0) == 0.0
    assert coverage_ratio(5, 10) == 0.5
    assert coverage_ratio(20, 10) == 1.0


def test_rotation_matrix_to_quaternion_round_trips():
    angle = math.radians(37.0)
    matrix = [
        [math.cos(angle), 0.0, math.sin(angle)],
        [0.0, 1.0, 0.0],
        [-math.sin(angle), 0.0, math.cos(angle)],
    ]
    x, y, z, w = rotation_matrix_to_quaternion(matrix)
    assert math.sqrt(x * x + y * y + z * z + w * w) == pytest.approx(1.0, abs=1e-9)
    assert 2.0 * math.acos(min(1.0, abs(w))) == pytest.approx(angle, abs=1e-6)


# ---------------------------------------------------------------------------
# DPVO adapter, without CUDA
# ---------------------------------------------------------------------------

def frames(count, width=64, height=48, seed=0):
    generator = np.random.default_rng(seed)
    return [
        VideoFrameSample(
            source_frame=index * 2,
            timestamp_seconds=index * 2 / 24.0,
            rgb=generator.integers(0, 255, (height, width, 3), dtype=np.uint8),
        )
        for index in range(count)
    ]


def test_dpvo_adapter_maps_solver_indices_back_onto_source_frames():
    poses = np.array([[0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1], [2, 0, 0, 0, 0, 0, 1]], dtype=float)
    result = DpvoBackend._poses_to_samples(np, poses, np.array([0, 1, 2]), frames(3))
    assert [pose.source_frame for pose in result.poses] == [0, 2, 4]
    assert result.backend == "dpvo"
    assert result.coverage == 1.0


def test_dpvo_adapter_reads_the_documented_column_order():
    poses = np.array([[1, 2, 3, 0.1, 0.2, 0.3, 0.9], [1, 2, 4, 0.1, 0.2, 0.3, 0.9]], dtype=float)
    result = DpvoBackend._poses_to_samples(np, poses, np.array([0, 1]), frames(2))
    assert result.poses[0].position == [1.0, 2.0, 3.0]
    assert result.poses[0].quaternion_xyzw == [0.1, 0.2, 0.3, 0.9]


def test_dpvo_adapter_reports_partial_coverage():
    poses = np.array([[0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1]], dtype=float)
    result = DpvoBackend._poses_to_samples(np, poses, np.array([0, 3]), frames(10))
    assert result.coverage == pytest.approx(0.2)
    assert any("coverage" in warning for warning in result.warnings)


def test_dpvo_adapter_rejects_a_malformed_trajectory():
    with pytest.raises(SolveError, match="unexpected trajectory"):
        DpvoBackend._poses_to_samples(np, np.zeros((3, 4)), np.array([0, 1, 2]), frames(3))


def test_dpvo_adapter_rejects_a_non_finite_trajectory():
    poses = np.array([[0, 0, 0, 0, 0, 0, 1], [float("nan"), 0, 0, 0, 0, 0, 1]], dtype=float)
    with pytest.raises(SolveError, match="non-finite"):
        DpvoBackend._poses_to_samples(np, poses, np.array([0, 1]), frames(2))


def test_dpvo_adapter_rejects_a_single_pose():
    poses = np.array([[0, 0, 0, 0, 0, 0, 1]], dtype=float)
    with pytest.raises(SolveError, match="fewer than two"):
        DpvoBackend._poses_to_samples(np, poses, np.array([0]), frames(2))


def test_dpvo_solve_routes_frames_and_intrinsics_through_an_isolated_runner(monkeypatch, tmp_path):
    sampled = frames(4, width=66, height=50)
    intrinsics = resolve_intrinsics(
        width=66, height=50, lens_mode="auto",
        fov_degrees=53.0, focal_length_mm=24.0, sensor_width_mm=36.0,
    )
    poses = [[index * 0.1, 0, 0, 0, 0, 0, 1] for index in range(4)]
    seen = []

    class Runner:
        def solve(self, request, *, progress, control, on_source_frame, on_features):
            mapped = np.load(request.frames_path, mmap_mode="r")
            assert mapped.shape == (4, 50, 66, 3)
            assert request.intrinsics == intrinsics
            assert request.source_frames == (0, 2, 4, 6)
            progress(4, 4)
            on_source_frame(6)
            return poses, [0, 1, 2, 3]

        def close(self):
            raise AssertionError("a completed runner must not be force-closed")

    force(monkeypatch, dpvo=True, opencv=True)
    monkeypatch.setattr("omnicam.extractor.backends.dpvo._managed_exchange_root", lambda: tmp_path)
    result = DpvoBackend(runner_factory=Runner).solve(
        sampled, intrinsics, progress=lambda done, total: seen.append((done, total)),
    )

    assert seen == [(4, 4)]
    assert len(result.poses) == 4
    assert list(tmp_path.iterdir()) == []


def test_dpvo_solve_forwards_child_patch_diagnostics_to_the_observer(monkeypatch, tmp_path):
    sampled = frames(2)
    intrinsics = resolve_intrinsics(
        width=64, height=48, lens_mode="auto",
        fov_degrees=53.0, focal_length_mm=24.0, sensor_width_mm=36.0,
    )
    observed = []

    class Observer:
        def features(self, frame, points, state):
            observed.append((frame, points, state))

    class Runner:
        def solve(self, request, *, progress, control, on_source_frame, on_features):
            on_features(2, [{"x": 0.2, "y": 0.3, "state": "accepted"}])
            return [[0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1]], [0, 1]

    force(monkeypatch, dpvo=True, opencv=True)
    monkeypatch.setattr("omnicam.extractor.backends.dpvo._managed_exchange_root", lambda: tmp_path)
    DpvoBackend(runner_factory=Runner).solve(sampled, intrinsics, observer=Observer())

    assert observed == [(2, [{"x": 0.2, "y": 0.3, "state": "accepted"}], "good")]


def test_dpvo_solve_without_the_backend_explains_the_checkpoint(monkeypatch):
    force(monkeypatch, dpvo=False, opencv=True)
    with pytest.raises(BackendUnavailableError, match=r"dpvo\.pth"):
        DpvoBackend().solve(frames(3), resolve_intrinsics(
            width=64, height=48, lens_mode="auto",
            fov_degrees=53.0, focal_length_mm=24.0, sensor_width_mm=36.0,
        ))


def test_a_backend_refuses_a_one_frame_clip():
    with pytest.raises(SolveError, match="at least 2 usable frames"):
        DpvoBackend().solve(frames(1), resolve_intrinsics(
            width=64, height=48, lens_mode="auto",
            fov_degrees=53.0, focal_length_mm=24.0, sensor_width_mm=36.0,
        ))


# ---------------------------------------------------------------------------
# Classical OpenCV/SIFT solver
# ---------------------------------------------------------------------------

WIDTH, HEIGHT = 640, 480
FOCAL = 600.0


def synthetic_intrinsics():
    from omnicam.extractor.types import CameraIntrinsics

    return CameraIntrinsics(
        fx=FOCAL, fy=FOCAL, cx=WIDTH / 2, cy=HEIGHT / 2,
        width=WIDTH, height=HEIGHT, source="test",
    )


def render_scene(camera_positions, seed=7, point_count=260):
    """Render a random 3D point cloud as uniquely textured patches.

    Each world point carries its own noise patch, which is what makes the
    descriptors distinctive enough for the ratio test; the depth spread is what
    keeps the essential matrix well conditioned, which a flat wall would not.
    """
    generator = np.random.default_rng(seed)
    points = np.stack([
        generator.uniform(-4.0, 4.0, point_count),
        generator.uniform(-3.0, 3.0, point_count),
        generator.uniform(5.0, 16.0, point_count),
    ], axis=1)
    patches = generator.integers(40, 255, (point_count, 9, 9), dtype=np.uint8)

    rendered = []
    for camera in camera_positions:
        image = np.full((HEIGHT, WIDTH, 3), 20, dtype=np.uint8)
        relative = points - np.asarray(camera, dtype=float)
        for index in range(point_count):
            x, y, z = relative[index]
            if z <= 0.5:
                continue
            u = round(FOCAL * x / z + WIDTH / 2)
            v = round(FOCAL * y / z + HEIGHT / 2)
            if not (5 <= u < WIDTH - 5 and 5 <= v < HEIGHT - 5):
                continue
            image[v - 4:v + 5, u - 4:u + 5] = patches[index][:, :, None]
        rendered.append(image)
    return rendered


def synthetic_frames(camera_positions, **kwargs):
    images = render_scene(camera_positions, **kwargs)
    return [
        VideoFrameSample(source_frame=index, timestamp_seconds=index / 24.0, rgb=image)
        for index, image in enumerate(images)
    ]


@pytest.fixture(scope="module")
def opencv():
    return pytest.importorskip("cv2")


def test_opencv_solves_a_lateral_dolly_along_the_right_axis(opencv):
    positions = [[0.06 * index, 0.0, 0.0] for index in range(6)]
    result = OpenCvSiftBackend().solve(synthetic_frames(positions), synthetic_intrinsics())

    assert result.backend == "opencv_sift"
    assert len(result.poses) == len(positions)
    assert result.coverage == 1.0
    assert result.poses[0].position == [0.0, 0.0, 0.0]
    assert any("relative, not metric" in warning for warning in result.warnings)

    travel = np.asarray(result.poses[-1].position, dtype=float)
    assert np.isfinite(travel).all()
    # Monocular scale is arbitrary, so only the direction can be asserted.
    direction = travel / np.linalg.norm(travel)
    assert abs(direction[0]) > 0.9, f"expected a sideways move, got {direction}"


def test_opencv_solve_produces_finite_unit_quaternions(opencv):
    positions = [[0.0, 0.0, -0.08 * index] for index in range(5)]
    result = OpenCvSiftBackend().solve(synthetic_frames(positions), synthetic_intrinsics())
    for sample in result.poses:
        assert all(math.isfinite(value) for value in sample.position)
        length = math.sqrt(sum(component ** 2 for component in sample.quaternion_xyzw))
        assert length == pytest.approx(1.0, abs=1e-6)


def test_opencv_keeps_a_locked_off_camera_still(opencv):
    """A tripod has no parallax, so no translation may be invented for it."""
    identical = synthetic_frames([[0.0, 0.0, 0.0]] * 4)
    result = OpenCvSiftBackend().solve(identical, synthetic_intrinsics())
    for sample in result.poses:
        assert sample.position == pytest.approx([0.0, 0.0, 0.0], abs=1e-12)


def test_opencv_reports_an_actionable_failure_on_a_blank_wall(opencv):
    blank = [
        VideoFrameSample(source_frame=index, timestamp_seconds=index / 24.0,
                         rgb=np.full((HEIGHT, WIDTH, 3), 128, dtype=np.uint8))
        for index in range(3)
    ]
    with pytest.raises(SolveError) as error:
        OpenCvSiftBackend().solve(blank, synthetic_intrinsics())
    message = str(error.value)
    assert "Camera tracking lost near frame" in message
    assert "one continuous shot" in message


def test_opencv_reports_a_hard_cut(opencv):
    """Two unrelated shots share no geometry, so the pair must be refused."""
    first = synthetic_frames([[0.0, 0.0, 0.0], [0.05, 0.0, 0.0]], seed=7)
    second = synthetic_frames([[0.0, 0.0, 0.0], [0.05, 0.0, 0.0]], seed=99)
    cut = first + [
        VideoFrameSample(source_frame=2 + index, timestamp_seconds=(2 + index) / 24.0, rgb=frame.rgb)
        for index, frame in enumerate(second)
    ]
    with pytest.raises(SolveError, match="Camera tracking lost near frame 2"):
        OpenCvSiftBackend().solve(cut, synthetic_intrinsics())


def test_opencv_progress_is_reported_for_every_frame(opencv):
    positions = [[0.05 * index, 0.0, 0.0] for index in range(4)]
    seen = []
    OpenCvSiftBackend().solve(
        synthetic_frames(positions), synthetic_intrinsics(), progress=lambda done, total: seen.append(done)
    )
    assert seen == [1, 2, 3, 4]


def test_a_broken_progress_callback_cannot_lose_a_solve(opencv):
    def explode(done, total):
        raise RuntimeError("the UI went away")

    positions = [[0.05 * index, 0.0, 0.0] for index in range(3)]
    result = OpenCvSiftBackend().solve(synthetic_frames(positions), synthetic_intrinsics(), progress=explode)
    assert len(result.poses) == 3


# ---------------------------------------------------------------------------
# Overlay telemetry
# ---------------------------------------------------------------------------

def test_features_are_sampled_across_the_frame_not_taken_from_the_front():
    """A bounded sample has to describe the whole frame.

    Slicing the first N matches would draw a dense cluster wherever the
    detector happened to start, which reads as "the tracker only sees the top
    left" -- a claim about the footage that is not true.
    """
    from omnicam.extractor.backends.base import MAX_OBSERVED_FEATURES, sample_features

    points = [(index / 1000.0, 0.5) for index in range(1000)]
    sampled = sample_features(points, [True] * 1000)
    assert len(sampled) <= MAX_OBSERVED_FEATURES
    assert sampled[0]["x"] == 0.0
    assert sampled[-1]["x"] > 0.9, "the sample must reach the far side of the frame"


def test_features_report_rejected_matches_as_rejected():
    from omnicam.extractor.backends.base import sample_features

    sampled = sample_features([(0.1, 0.1), (0.2, 0.2)], [True, False])
    assert [item["state"] for item in sampled] == ["accepted", "rejected"]


def test_a_shorter_inlier_mask_marks_the_remainder_rejected_rather_than_accepted():
    """An overlay must never claim more inliers than the solver found."""
    from omnicam.extractor.backends.opencv_vo import OpenCvSiftBackend

    camera_matrix = [[100.0, 0.0, 160.0], [0.0, 100.0, 90.0], [0.0, 0.0, 1.0]]
    features = OpenCvSiftBackend._observable_features(
        np, [[10.0, 20.0], [30.0, 40.0], [50.0, 60.0]], np.array([1]), camera_matrix
    )
    assert [item["state"] for item in features] == ["accepted", "rejected", "rejected"]


def test_features_are_normalized_into_the_unit_square():
    from omnicam.extractor.backends.opencv_vo import OpenCvSiftBackend

    camera_matrix = [[100.0, 0.0, 160.0], [0.0, 100.0, 90.0], [0.0, 0.0, 1.0]]
    features = OpenCvSiftBackend._observable_features(
        np, [[160.0, 90.0], [999.0, 999.0]], None, camera_matrix
    )
    assert features[0]["x"] == pytest.approx(0.5)
    assert features[0]["y"] == pytest.approx(0.5)
    # Out-of-frame coordinates are clamped, never sent as > 1: the overlay maps
    # the unit square onto the stage and would otherwise draw off-canvas.
    assert features[1]["x"] == 1.0 and features[1]["y"] == 1.0


def test_building_the_overlay_sample_never_fails_a_solve():
    from omnicam.extractor.backends.opencv_vo import OpenCvSiftBackend

    assert OpenCvSiftBackend._observable_features(np, "not points", None, None) == []
