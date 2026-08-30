"""Optional Princeton DPVO backend.

DPVO (https://github.com/princeton-vl/DPVO, MIT) is a deep patch-based visual
odometry system and the reference solver for this node. It is *optional*: it
needs a compiled CUDA extension and a network checkpoint, and OmniCam has to
keep loading on machines that have neither. So nothing here imports ``dpvo``
at module scope, and no code path installs anything.

Pose convention, verified against the upstream sources (princeton-vl/DPVO,
``dpvo/dpvo.py`` and ``demo.py``):

* ``DPVO.terminate()`` returns ``(poses, tstamps)``;
* the internal ``poses_`` are world-to-camera and ``terminate()`` applies
  ``.inv()``, so what comes back is **camera-to-world**;
* each row is ``[tx, ty, tz, qx, qy, qz, qw]`` -- demo.py feeds columns 0:3
  straight into ``PoseTrajectory3D(positions_xyz=...)`` and reorders
  ``[6, 3, 4, 5]`` into evo's w-first quaternion, which only makes sense for a
  camera-to-world trajectory;
* the basis is the usual computer-vision one: +X right, +Y down, +Z forward.

That last point is why :data:`DpvoBackend.basis` is ``"opencv"``: the shared
conversion in :mod:`omnicam.extractor.transforms` turns it into OmniCam's
Y-up / -Z-forward world exactly once.
"""

from __future__ import annotations

import importlib.util
import os
from collections.abc import Sequence

import numpy as np

from ..types import BackendSolveResult, CameraIntrinsics, PoseSample, VideoFrameSample
from .base import (
    BackendAvailability,
    BackendUnavailableError,
    SolveError,
    checkpoint,
    coverage_ratio,
    observe_features,
    observe_pose,
    observe_progress_frame,
)
from .dpvo_worker import (
    DpvoProcessRunner,
    DpvoWorkerRequest,
    _managed_exchange_root,
    write_frame_exchange,
)

CHECKPOINT_NAME = "dpvo.pth"
MODEL_SUBDIRECTORY = os.path.join("omnicam", "dpvo")

INSTALL_HINT = (
    "Expected the DPVO Python/CUDA extension and its checkpoint at\n"
    "    ComfyUI/models/omnicam/dpvo/dpvo.pth\n"
    "Use method=opencv_sift if OpenCV is available, or install DPVO following "
    "docs/NODES.md. OmniCam did not modify your Python environment."
)

# DPVO downsamples by a fixed factor internally, so it wants both image
# dimensions to be a multiple of it.
RESOLUTION_MULTIPLE = 4


def managed_checkpoint_directory() -> str:
    """``ComfyUI/models/omnicam/dpvo``, or a local fallback when run outside ComfyUI.

    The directory is fixed on purpose: accepting a checkpoint path from a node
    widget would turn a camera node into an arbitrary-file loader.
    """
    try:
        import folder_paths

        base = folder_paths.models_dir
    except Exception:  # noqa: BLE001 - the pure pipeline is unit-tested without ComfyUI
        base = os.path.join(os.path.expanduser("~"), ".cache", "omnicam", "models")
    return os.path.join(base, MODEL_SUBDIRECTORY)


def checkpoint_path() -> str:
    return os.path.join(managed_checkpoint_directory(), CHECKPOINT_NAME)


class DpvoBackend:
    name = "dpvo"
    basis = "opencv"

    def __init__(self, *, runner_factory=DpvoProcessRunner) -> None:
        self._runner_factory = runner_factory

    @classmethod
    def availability(cls) -> BackendAvailability:
        try:
            if importlib.util.find_spec("dpvo") is None:
                return BackendAvailability(False, "the DPVO Python package is not installed")
        except Exception as exc:  # noqa: BLE001 - a broken sys.path entry raises from find_spec
            return BackendAvailability(False, f"the DPVO package could not be probed: {exc}")
        path = checkpoint_path()
        if not os.path.isfile(path):
            return BackendAvailability(False, f"the DPVO checkpoint is missing at {path}")
        return BackendAvailability(True)

    @classmethod
    def unavailable_message(cls, reason: str) -> str:
        return f"OmniCam Extractor: the DPVO backend is not available ({reason}).\n{INSTALL_HINT}"

    def solve(
        self,
        frames: Sequence[VideoFrameSample],
        intrinsics: CameraIntrinsics,
        *,
        progress=None,
        control=None,
        observer=None,
    ) -> BackendSolveResult:
        if len(frames) < 2:
            raise SolveError("OmniCam Extractor needs at least 2 usable frames.")
        availability = self.availability()
        if not availability.available:
            raise BackendUnavailableError(self.unavailable_message(availability.reason))
        checkpoint(control)
        exchange = write_frame_exchange(frames, root=_managed_exchange_root())
        request = DpvoWorkerRequest(
            frames_path=str(exchange.frames_path),
            source_frames=exchange.source_frames,
            timestamps=exchange.timestamps,
            intrinsics=intrinsics,
            checkpoint_path=checkpoint_path(),
        )
        runner = self._runner_factory()
        try:
            poses, timestamps = runner.solve(
                request,
                progress=progress,
                control=control,
                on_source_frame=lambda frame: observe_progress_frame(observer, frame),
                on_features=lambda frame, points: observe_features(observer, frame, points, "good"),
            )
            result = self._poses_to_samples(np, poses, timestamps, frames)
            for pose in result.poses:
                observe_pose(observer, pose)
            return result
        finally:
            exchange.cleanup()

    @staticmethod
    def _poses_to_samples(np, poses, tstamps, frames) -> BackendSolveResult:
        """Map the solver's own sample indices back onto the source timeline."""
        array = np.asarray(poses, dtype=float)
        if array.ndim != 2 or array.shape[1] != 7:
            raise SolveError(
                f"DPVO returned an unexpected trajectory of shape {getattr(array, 'shape', None)}; "
                "OmniCam expects rows of [tx, ty, tz, qx, qy, qz, qw]."
            )
        if array.shape[0] < 2:
            raise SolveError(
                "DPVO produced fewer than two camera poses. The shot may be too short, too dark, "
                "or too flat for a monocular solve."
            )
        if not np.isfinite(array).all():
            raise SolveError("DPVO produced a non-finite camera pose; the solve cannot be trusted.")

        indices = [round(float(value)) for value in np.asarray(tstamps, dtype=float)]
        samples: list[PoseSample] = []
        for row, index in zip(array, indices, strict=False):
            if index < 0 or index >= len(frames):
                continue
            frame = frames[index]
            samples.append(
                PoseSample(
                    source_frame=frame.source_frame,
                    timestamp_seconds=frame.timestamp_seconds,
                    position=[float(row[0]), float(row[1]), float(row[2])],
                    quaternion_xyzw=[float(row[3]), float(row[4]), float(row[5]), float(row[6])],
                )
            )
        if len(samples) < 2:
            raise SolveError("DPVO returned no usable poses for the sampled frames.")
        samples.sort(key=lambda sample: sample.source_frame)

        coverage = coverage_ratio(len(samples), len(frames))
        warnings: list[str] = []
        if coverage < 0.9:
            warnings.append(
                f"DPVO returned poses for {len(samples)} of {len(frames)} sampled frames "
                "(coverage {:.0%}); the gaps are interpolated by the Director.".format(coverage)
            )
        return BackendSolveResult(
            poses=samples,
            backend="dpvo",
            coverage=coverage,
            warnings=warnings,
            diagnostics={"solved_poses": len(samples), "requested_samples": len(frames)},
        )
