"""Opt-in hardware regression for DPVO process-level VRAM release."""

from __future__ import annotations

import os
import time

import pytest

from omnicam.extractor.backends.dpvo import DpvoBackend, checkpoint_path
from omnicam.extractor.backends.dpvo_worker import (
    DpvoProcessRunner,
    DpvoWorkerRequest,
    write_frame_exchange,
)
from omnicam.extractor.intrinsics import resolve_intrinsics
from omnicam.extractor.video import FileVideoSource, decode_solver_frames

pytestmark = pytest.mark.skipif(
    os.environ.get("OMNICAM_TEST_DPVO_GPU") != "1",
    reason="set OMNICAM_TEST_DPVO_GPU=1 after establishing a clean CUDA baseline",
)


def test_dpvo_child_exit_returns_global_vram_to_baseline(tmp_path):
    torch = pytest.importorskip("torch")
    if not torch.cuda.is_available():
        pytest.skip("CUDA is unavailable")
    availability = DpvoBackend.availability()
    if not availability.available:
        pytest.skip(availability.reason)
    video_path = os.environ.get("OMNICAM_TEST_DPVO_VIDEO", "")
    if not video_path or not os.path.isfile(video_path):
        pytest.skip("set OMNICAM_TEST_DPVO_VIDEO to a real continuous-shot video")

    torch.cuda.empty_cache()
    baseline_free, _total = torch.cuda.mem_get_info()
    decoded = decode_solver_frames(
        FileVideoSource(video_path), frame_step=2, max_dimension=640,
    )
    frames = decoded.frames
    intrinsics = resolve_intrinsics(
        width=decoded.info.width,
        height=decoded.info.height,
        lens_mode="auto",
        fov_degrees=53.0,
        focal_length_mm=24.0,
        sensor_width_mm=36.0,
    ).scaled(decoded.scale.scale_x, decoded.scale.scale_y)
    exchange = write_frame_exchange(frames, root=tmp_path)
    request = DpvoWorkerRequest(
        frames_path=str(exchange.frames_path),
        source_frames=exchange.source_frames,
        timestamps=exchange.timestamps,
        intrinsics=intrinsics,
        checkpoint_path=checkpoint_path(),
    )
    runner = DpvoProcessRunner(timeout_seconds=600.0, stop_grace_seconds=5.0)
    try:
        poses, _timestamps = runner.solve(request)
    finally:
        exchange.cleanup()

    deadline = time.monotonic() + 10.0
    free_after = 0
    while time.monotonic() < deadline:
        free_after, _total = torch.cuda.mem_get_info()
        if free_after >= baseline_free - 512 * 1024**2:
            break
        time.sleep(0.1)

    assert runner.process is None
    assert runner.last_pid is not None
    assert len(poses) >= 2
    assert free_after >= baseline_free - 512 * 1024**2, (
        f"DPVO child {runner.last_pid} exited but retained "
        f"{(baseline_free - free_after) / 1024**3:.2f} GiB of global VRAM"
    )
