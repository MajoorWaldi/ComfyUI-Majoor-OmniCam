"""Process-isolation contract for the optional DPVO backend."""

from __future__ import annotations

import importlib
import multiprocessing.spawn as mp_spawn
import os
import pickle
import sys
import time
import types

import numpy as np
import pytest

from omnicam.extractor.backends.base import SolveError
from omnicam.extractor.backends.dpvo_worker import (
    CANONICAL_MODULE_NAME,
    DpvoProcessRunner,
    DpvoWorkerRequest,
    _isolated_child_bootstrap,
    child_sys_path,
    extract_active_patch_features,
    extract_landmarks_3d,
    MIN_LANDMARK_CONFIDENCE,
    writable_frame_copy,
    write_frame_exchange,
)
from omnicam.extractor.backends.dpvo_worker import (
    PACKAGE_ROOT as REPOSITORY_ROOT,
)
from omnicam.extractor.types import CameraIntrinsics, VideoFrameSample


def _frames(count: int) -> list[VideoFrameSample]:
    return [
        VideoFrameSample(
            source_frame=index * 2,
            timestamp_seconds=index / 12.0,
            rgb=np.full((48, 64, 3), index, dtype=np.uint8),
        )
        for index in range(count)
    ]


def _request(tmp_path) -> DpvoWorkerRequest:
    exchange = write_frame_exchange(_frames(2), root=tmp_path)
    return DpvoWorkerRequest(
        frames_path=str(exchange.frames_path),
        source_frames=exchange.source_frames,
        timestamps=exchange.timestamps,
        intrinsics=CameraIntrinsics(50.0, 51.0, 32.0, 24.0, 64, 48, "test"),
        checkpoint_path="managed/dpvo.pth",
    )


def _successful_child(connection, request) -> None:
    connection.send({"kind": "ready", "index": 0, "source_frame": request.source_frames[0]})
    if connection.recv().get("kind") != "continue":
        return
    connection.send({"kind": "progress", "done": 1, "total": 1, "source_frame": 0})
    connection.send({
        "kind": "result",
        "poses": [[0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1]],
        "timestamps": [0, 1],
    })
    connection.close()


def _feature_child(connection, request) -> None:
    connection.send({"kind": "ready", "index": 0, "source_frame": request.source_frames[0]})
    if connection.recv().get("kind") != "continue":
        return
    connection.send({
        "kind": "features",
        "source_frame": request.source_frames[0],
        "points": [{"x": 0.5, "y": 0.25, "state": "accepted"}],
    })
    connection.send({"kind": "progress", "done": 1, "total": 1, "source_frame": request.source_frames[0]})
    connection.send({
        "kind": "result",
        "poses": [[0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1]],
        "timestamps": [0, 1],
    })
    connection.close()


def _crashing_child(connection, request) -> None:
    del request
    connection.send({"kind": "error", "error": "synthetic child crash"})
    connection.close()


def _hung_child(connection, request) -> None:
    del connection, request
    time.sleep(30)


def _hung_finalization_child(connection, request) -> None:
    del request
    connection.send({"kind": "finalizing", "total": 2})
    time.sleep(30)


def _hard_exit_child(connection, request) -> None:
    del connection, request
    os._exit(1)


class _CancelledError(Exception):
    pass


class _CancellingControl:
    def checkpoint(self) -> None:
        raise _CancelledError


class _PatchTensor:
    def __init__(self, values):
        self.values = values

    def __getitem__(self, _index):
        return self

    def detach(self):
        return self

    def float(self):
        return self

    def cpu(self):
        return self

    def tolist(self):
        return self.values


class _PatchSlam:
    m = 2
    patches = _PatchTensor([[0.0, 0.0], [80.0, 60.0]])


class _GeometrySlam:
    landmarks_3d = _PatchTensor([[1.0, 2.0, 3.0], [float("nan"), 0.0, 2.0], [4.0, 5.0, 6.0], [7.0, 8.0, -1.0]])
    landmark_confidence = _PatchTensor([0.9, 1.0, MIN_LANDMARK_CONFIDENCE, 1.0])


def test_frame_exchange_round_trips_without_stacking_in_memory(tmp_path):
    exchange = write_frame_exchange(_frames(3), root=tmp_path)

    loaded = np.load(exchange.frames_path, mmap_mode="r")

    assert loaded.shape == (3, 48, 64, 3)
    assert loaded.dtype == np.uint8
    assert loaded[2, 0, 0].tolist() == [2, 2, 2]
    assert exchange.source_frames == (0, 2, 4)
    assert exchange.timestamps == pytest.approx((0.0, 1 / 12, 2 / 12))
    del loaded
    exchange.cleanup()
    assert not exchange.directory.exists()


def test_worker_copies_read_only_memmap_frames_into_writable_storage(tmp_path):
    exchange = write_frame_exchange(_frames(2), root=tmp_path)
    loaded = np.load(exchange.frames_path, mmap_mode="r")

    frame = writable_frame_copy(loaded, 0, 48, 64)

    assert frame.flags.c_contiguous
    assert frame.flags.writeable
    assert not np.shares_memory(frame, loaded)
    del loaded
    exchange.cleanup()


def test_frame_exchange_rejects_inconsistent_shapes(tmp_path):
    samples = _frames(2)
    samples[1].rgb = np.zeros((24, 32, 3), dtype=np.uint8)

    with pytest.raises(ValueError, match="same shape"):
        write_frame_exchange(samples, root=tmp_path)

    assert list(tmp_path.iterdir()) == []


def test_worker_request_rejects_an_unknown_protocol():
    with pytest.raises(ValueError, match="protocol"):
        DpvoWorkerRequest.from_dict({"protocol": 999})


def test_worker_request_uses_diagnostic_capable_protocol_version(tmp_path):
    request = _request(tmp_path)

    assert request.protocol == 2


def test_active_dpvo_patch_features_are_normalized_and_bounded():
    points = extract_active_patch_features(_PatchSlam(), width=160, height=120)

    assert points == [
        {"x": 0.0, "y": 0.0, "state": "accepted"},
        {"x": 0.5, "y": 0.5, "state": "accepted"},
    ]


def test_landmarks_are_finite_confident_and_bounded():
    points = extract_landmarks_3d(_GeometrySlam(), limit=1)

    assert len(points) == 1
    assert set(points[0]) == {"x", "y", "z", "confidence"}
    assert points[0]["z"] > 0
    assert points[0]["confidence"] >= MIN_LANDMARK_CONFIDENCE


def test_unsupported_dpvo_cloud_is_optional():
    assert extract_landmarks_3d(_PatchSlam()) == []


def test_spawned_runner_joins_successful_child(tmp_path):
    request = _request(tmp_path)
    seen = []
    runner = DpvoProcessRunner(target=_successful_child, poll_seconds=0.01)

    poses, timestamps = runner.solve(
        request,
        progress=lambda done, total: seen.append((done, total)),
    )

    assert poses[1][0] == 1
    assert timestamps == [0, 1]
    assert seen == [(1, 1)]
    assert runner.process is None


def test_spawned_runner_relays_child_feature_diagnostics(tmp_path):
    seen = []
    runner = DpvoProcessRunner(target=_feature_child, poll_seconds=0.01)

    runner.solve(_request(tmp_path), on_features=lambda frame, points: seen.append((frame, points)))

    assert seen == [(0, [{"x": 0.5, "y": 0.25, "state": "accepted"}])]


def test_spawned_runner_surfaces_child_error_and_joins(tmp_path):
    runner = DpvoProcessRunner(target=_crashing_child, poll_seconds=0.01)

    with pytest.raises(SolveError, match="synthetic child crash"):
        runner.solve(_request(tmp_path))

    assert runner.process is None


def test_spawned_runner_explains_a_native_dpvo_child_crash(tmp_path):
    runner = DpvoProcessRunner(target=_hard_exit_child, poll_seconds=0.01)

    with pytest.raises(SolveError) as error:
        runner.solve(_request(tmp_path))

    message = str(error.value)
    assert "exit code 1" in message
    assert f"pid={runner.last_pid}" in message
    assert "native extension" in message
    assert "PyTorch/CUDA" in message
    assert runner.process is None


def test_spawned_runner_terminates_a_hung_child(tmp_path):
    runner = DpvoProcessRunner(
        target=_hung_child,
        poll_seconds=0.01,
        timeout_seconds=0.15,
        stop_grace_seconds=0.05,
    )

    with pytest.raises(SolveError, match="timed out"):
        runner.solve(_request(tmp_path))

    assert runner.process is None


def test_spawned_runner_times_out_only_after_finalization_begins(tmp_path):
    finalizing = []
    runner = DpvoProcessRunner(
        target=_hung_finalization_child,
        poll_seconds=0.01,
        finalization_timeout_seconds=0.15,
        stop_grace_seconds=0.05,
    )

    with pytest.raises(SolveError, match=r"finalization timed out.*slam\.terminate"):
        runner.solve(_request(tmp_path), on_finalizing=lambda: finalizing.append(True))

    assert finalizing == [True]
    assert runner.process is None


def test_spawned_runner_sends_cooperative_stop_when_parent_is_cancelled(tmp_path):
    runner = DpvoProcessRunner(
        target=_successful_child, poll_seconds=0.01, stop_grace_seconds=0.5,
    )

    with pytest.raises(_CancelledError):
        runner.solve(_request(tmp_path), control=_CancellingControl())

    assert runner.process is None


def _load_worker_as_comfyui_does(name: str):
    """Import the worker under a path-shaped package name, the way ComfyUI loads nodes."""
    package = types.ModuleType(name)
    package.__path__ = [REPOSITORY_ROOT]
    package.__package__ = name
    sys.modules[name] = package
    try:
        return importlib.import_module(f"{name}.omnicam.extractor.backends.dpvo_worker")
    except BaseException:
        _forget_modules(name)
        raise


def _forget_modules(prefix: str) -> None:
    for key in [key for key in sys.modules if key == prefix or key.startswith(f"{prefix}.")]:
        del sys.modules[key]


def test_worker_entry_pickles_under_a_name_the_child_can_import(tmp_path):
    """ComfyUI names a custom-node package after its path; no fresh child can import that."""
    name = r"C:\comfy\custom_nodes\ComfyUI-Majoor-OmniCam"
    module = _load_worker_as_comfyui_does(name)
    try:
        assert module.run_dpvo_child.__module__.startswith(name)

        target, payload = module.canonical_worker_entry(_request(tmp_path))

        assert target.__module__ == CANONICAL_MODULE_NAME
        assert type(payload).__module__ == CANONICAL_MODULE_NAME
        assert type(payload.intrinsics).__module__.startswith("omnicam.")
        assert importlib.import_module(target.__module__) is not module
        restored = pickle.loads(pickle.dumps(payload))
        assert restored.source_frames == payload.source_frames
        assert restored.intrinsics.fx == payload.intrinsics.fx
    finally:
        _forget_modules(name)


def test_spawn_bootstrap_does_not_re_execute_the_host_main_module():
    """Re-running ComfyUI's main.py in the child re-imports Torch and can kill it."""
    real_main = sys.modules["__main__"]
    real_path = list(sys.path)

    with _isolated_child_bootstrap():
        data = mp_spawn.get_preparation_data("omnicam-dpvo-test")

    assert not [key for key in data if key.startswith("init_main")]
    assert sys.modules["__main__"] is real_main
    assert sys.path == real_path


def test_child_sys_path_drops_other_custom_nodes_but_keeps_omnicam():
    """A stray folder on a sibling node's path shadows real packages (numba's `coverage`)."""
    foreign = os.path.join("F:", os.sep, "comfy", "custom_nodes", "majoor-assetsmanager")
    site_packages = os.path.join("F:", os.sep, "comfy", "python_embeded", "Lib", "site-packages")

    kept = child_sys_path([foreign, os.path.join(foreign, "src"), site_packages, REPOSITORY_ROOT])

    assert foreign not in kept
    assert os.path.join(foreign, "src") not in kept
    assert site_packages in kept
    assert REPOSITORY_ROOT in kept


def test_child_sys_path_always_reaches_this_repository():
    assert REPOSITORY_ROOT in child_sys_path([])
