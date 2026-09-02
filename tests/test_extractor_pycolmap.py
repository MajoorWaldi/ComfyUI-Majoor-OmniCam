"""The optional pycolmap backend: wrapping logic against a fake pycolmap."""

from __future__ import annotations

import sys
import threading
import types

import numpy as np
import pytest

# ``PycolmapBackend.solve`` stages frames to disk with Pillow before handing the
# directory to pycolmap, so the whole suite needs PIL even though pycolmap itself
# is faked. python-core omits Pillow; python-full installs it and runs this file.
pytest.importorskip("PIL")

from omnicam.extractor.backends.base import BackendAvailability, BackendUnavailableError, SolveError
from omnicam.extractor.backends.pycolmap_vo import PycolmapBackend
from omnicam.extractor.jobs.control import SolveCancelled, SolveControl
from omnicam.extractor.types import CameraIntrinsics, VideoFrameSample


def _frames(count: int) -> list[VideoFrameSample]:
    return [
        VideoFrameSample(
            source_frame=index * 2, timestamp_seconds=index / 12.0,
            rgb=np.full((48, 64, 3), index, dtype=np.uint8),
        )
        for index in range(count)
    ]


class _FakeRotation3d:
    def __init__(self, quat):
        self.quat = np.asarray(quat, dtype=float)


class _FakeRigid3d:
    """``inverse()`` is a no-op here: the wrapping logic under test does not
    care whether the numbers are a real world-to-camera inversion -- that
    linear algebra is pycolmap's own and was checked against a real solve
    (poses.x forming an exact linear ramp across 60 real frames)."""

    def __init__(self, translation, quat):
        self.translation = np.asarray(translation, dtype=float)
        self.rotation = _FakeRotation3d(quat)

    def inverse(self):
        return self


class _FakeImage:
    def __init__(self, name: str, translation, quat):
        self.name = name
        self._pose = _FakeRigid3d(translation, quat)

    def cam_from_world(self):
        return self._pose


class _FakeReconstruction:
    def __init__(self, images: dict[int, _FakeImage]):
        self._images = images

    def num_reg_images(self) -> int:
        return len(self._images)

    def reg_image_ids(self):
        return list(self._images)

    def image(self, image_id):
        return self._images[image_id]


class _FakeCancellationToken:
    def __init__(self):
        self._cancelled = False

    def cancel(self):
        self._cancelled = True

    def is_cancelled(self):
        return self._cancelled


class _FakeImageReaderOptions:
    def __init__(self):
        self.camera_model = None
        self.camera_params = None


class _FakeMapperOptions:
    def __init__(self):
        self.abs_pose_refine_focal_length = True
        self.abs_pose_refine_extra_params = True


class _FakeIncrementalPipelineOptions:
    def __init__(self):
        self.ba_refine_focal_length = True
        self.ba_refine_extra_params = True
        self.mapper = _FakeMapperOptions()


class _FakeCameraMode:
    SINGLE = "single"


def _install_fake_pycolmap(monkeypatch, *, reconstructions, image_count=None):
    """A pycolmap stand-in whose ``incremental_mapping`` fires the caller's
    ``next_image_callback`` once per frame -- stopping early if the callback's
    own checkpoint cancelled the token, exactly like the real library would
    once ``CancellationToken.cancel()`` is observed.
    """
    calls: dict[str, object] = {"extract": 0, "match": 0, "reader_options": None}

    def extract_features(database_path, image_dir, *, camera_mode, reader_options, cancellation_token):
        calls["extract"] += 1
        calls["reader_options"] = reader_options

    def match_sequential(database_path, *, cancellation_token):
        calls["match"] += 1

    def incremental_mapping(database_path, image_dir, output_path, *, options, next_image_callback, cancellation_token):
        total = image_count if image_count is not None else sum(r.num_reg_images() for r in reconstructions.values())
        for _ in range(total):
            if cancellation_token.is_cancelled():
                break
            next_image_callback()
        return reconstructions

    module = types.ModuleType("pycolmap")
    module.ImageReaderOptions = _FakeImageReaderOptions
    module.CameraMode = _FakeCameraMode
    module.CancellationToken = _FakeCancellationToken
    module.IncrementalPipelineOptions = _FakeIncrementalPipelineOptions
    module.extract_features = extract_features
    module.match_sequential = match_sequential
    module.incremental_mapping = incremental_mapping
    monkeypatch.setitem(sys.modules, "pycolmap", module)
    return calls


def _intrinsics() -> CameraIntrinsics:
    return CameraIntrinsics(fx=64.0, fy=64.0, cx=32.0, cy=24.0, width=64, height=48, source="test")


def test_needs_at_least_two_frames():
    with pytest.raises(SolveError, match="at least 2"):
        PycolmapBackend().solve(_frames(1), _intrinsics())


def test_raises_when_unavailable(monkeypatch):
    monkeypatch.setattr(
        PycolmapBackend, "availability",
        classmethod(lambda cls: BackendAvailability(False, "not here")),
    )
    with pytest.raises(BackendUnavailableError, match="not here"):
        PycolmapBackend().solve(_frames(3), _intrinsics())


def test_unavailable_message_names_the_install_step():
    message = PycolmapBackend.unavailable_message("the pycolmap package is not installed")
    assert "pycolmap" in message
    assert "pip install pycolmap" in message
    assert "did not modify your" in message and "Python environment" in message


def test_a_healthy_solve_converts_every_registered_frame(monkeypatch):
    monkeypatch.setattr(PycolmapBackend, "availability", classmethod(lambda cls: BackendAvailability(True)))
    frames = _frames(4)
    images = {
        index: _FakeImage(f"{index:06d}.jpg", [float(index), 0.0, 0.0], [0.0, 0.0, 0.0, 1.0])
        for index in range(4)
    }
    _install_fake_pycolmap(monkeypatch, reconstructions={0: _FakeReconstruction(images)})

    result = PycolmapBackend().solve(frames, _intrinsics())

    assert result.backend == "pycolmap"
    assert result.coverage == 1.0
    assert result.warnings == []
    assert [pose.source_frame for pose in result.poses] == [0, 2, 4, 6]
    assert result.poses[1].position == [1.0, 0.0, 0.0]
    assert result.poses[1].quaternion_xyzw == [0.0, 0.0, 0.0, 1.0]


def test_the_reader_options_carry_the_given_intrinsics_as_a_locked_pinhole_camera(monkeypatch):
    monkeypatch.setattr(PycolmapBackend, "availability", classmethod(lambda cls: BackendAvailability(True)))
    images = {0: _FakeImage("000000.jpg", [0, 0, 0], [0, 0, 0, 1]), 1: _FakeImage("000001.jpg", [1, 0, 0], [0, 0, 0, 1])}
    calls = _install_fake_pycolmap(monkeypatch, reconstructions={0: _FakeReconstruction(images)})

    PycolmapBackend().solve(_frames(2), _intrinsics())

    assert calls["reader_options"].camera_model == "PINHOLE"
    assert calls["reader_options"].camera_params == "64.0,64.0,32.0,24.0"


def test_multiple_disconnected_reconstructions_warn_and_use_the_largest(monkeypatch):
    monkeypatch.setattr(PycolmapBackend, "availability", classmethod(lambda cls: BackendAvailability(True)))
    big = {i: _FakeImage(f"{i:06d}.jpg", [float(i), 0, 0], [0, 0, 0, 1]) for i in range(3)}
    small = {3: _FakeImage("000003.jpg", [9.0, 0, 0], [0, 0, 0, 1])}
    _install_fake_pycolmap(monkeypatch, reconstructions={0: _FakeReconstruction(big), 1: _FakeReconstruction(small)}, image_count=4)

    result = PycolmapBackend().solve(_frames(4), _intrinsics())

    assert len(result.poses) == 3  # only the largest reconstruction's frames
    assert result.diagnostics["reconstructions"] == 2
    assert len(result.warnings) == 1
    assert "disconnected reconstructions" in result.warnings[0]


def test_fewer_than_two_registered_poses_is_a_solve_error(monkeypatch):
    monkeypatch.setattr(PycolmapBackend, "availability", classmethod(lambda cls: BackendAvailability(True)))
    images = {0: _FakeImage("000000.jpg", [0, 0, 0], [0, 0, 0, 1])}
    _install_fake_pycolmap(monkeypatch, reconstructions={0: _FakeReconstruction(images)}, image_count=3)

    with pytest.raises(SolveError, match="fewer than two"):
        PycolmapBackend().solve(_frames(3), _intrinsics())


def test_no_registered_frames_at_all_is_a_solve_error(monkeypatch):
    monkeypatch.setattr(PycolmapBackend, "availability", classmethod(lambda cls: BackendAvailability(True)))
    _install_fake_pycolmap(monkeypatch, reconstructions={}, image_count=3)

    with pytest.raises(SolveError, match="could not register"):
        PycolmapBackend().solve(_frames(3), _intrinsics())


def test_a_stop_mid_mapping_raises_cleanly_after_the_cancellation_token_stops_it(monkeypatch):
    """Cancellation from inside the callback must never surface as a raw C++
    exception -- it signals the token, and the real, typed SolveCancelled is
    raised only once control is back in plain Python.

    Requested *during* mapping (after the third of five registrations), not
    before the solve even starts: stopping before extract_features would
    exercise the plain top-of-solve checkpoint, not the callback -> token ->
    post-mapping-checkpoint path this test exists to cover.
    """
    monkeypatch.setattr(PycolmapBackend, "availability", classmethod(lambda cls: BackendAvailability(True)))
    stop_requested = threading.Event()
    control = SolveControl(stop_requested)
    images = {i: _FakeImage(f"{i:06d}.jpg", [float(i), 0, 0], [0, 0, 0, 1]) for i in range(5)}
    calls = _install_fake_pycolmap(monkeypatch, reconstructions={0: _FakeReconstruction(images)}, image_count=5)
    real_mapping = sys.modules["pycolmap"].incremental_mapping

    def mapping_that_requests_a_stop_partway(*args, next_image_callback, **kwargs):
        seen = 0

        def counting_callback():
            nonlocal seen
            seen += 1
            if seen == 3:
                stop_requested.set()
            next_image_callback()

        return real_mapping(*args, next_image_callback=counting_callback, **kwargs)

    sys.modules["pycolmap"].incremental_mapping = mapping_that_requests_a_stop_partway

    with pytest.raises(SolveCancelled):
        PycolmapBackend().solve(_frames(5), _intrinsics(), control=control)
    assert calls["extract"] == 1  # got well past the top-of-solve checkpoints first


def test_a_frame_index_pycolmap_cannot_map_back_is_skipped_not_crashed(monkeypatch):
    """Defensive: a filename that does not parse back to a source frame index
    (should never happen, since this backend names every file itself) must
    not take the whole solve down with it."""
    monkeypatch.setattr(PycolmapBackend, "availability", classmethod(lambda cls: BackendAvailability(True)))
    images = {
        0: _FakeImage("000000.jpg", [0, 0, 0], [0, 0, 0, 1]),
        1: _FakeImage("000001.jpg", [1, 0, 0], [0, 0, 0, 1]),
        2: _FakeImage("999999.jpg", [9, 0, 0], [0, 0, 0, 1]),  # out of range
    }
    _install_fake_pycolmap(monkeypatch, reconstructions={0: _FakeReconstruction(images)}, image_count=2)

    result = PycolmapBackend().solve(_frames(2), _intrinsics())

    assert len(result.poses) == 2
