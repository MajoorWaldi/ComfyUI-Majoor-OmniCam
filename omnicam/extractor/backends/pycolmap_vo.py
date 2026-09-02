"""Optional pycolmap (COLMAP) backend: incremental Structure-from-Motion.

pycolmap (https://github.com/colmap/pycolmap, BSD-3-Clause) is COLMAP's
Python binding. It is *optional*, exactly like DPVO: nothing here imports
``pycolmap`` at module scope, and no code path installs it. Unlike DPVO it
ships prebuilt wheels for Windows with no compiled CUDA extension to match
against ComfyUI's own PyTorch build -- ``pip install pycolmap`` is the whole
installation.

Where this differs from DPVO and OpenCV/SIFT is the algorithm, not just the
implementation: both of those are sequential visual odometry, integrating one
frame at a time. pycolmap runs incremental *Structure-from-Motion* -- it
extracts and matches features globally first, then registers images one by
one against a shared 3D point cloud and re-optimizes the whole trajectory with
bundle adjustment. That tends to help exactly where OpenCV/SIFT's own module
documents its weakness: low-parallax and rotation-only segments, where
essential-matrix VO has nothing to triangulate and pins translation to zero.
It also means a hard cut in the footage can come back as more than one
disconnected reconstruction, which is reported rather than silently bridged.

Pose convention, verified against pycolmap 4.2.0's own API and confirmed
against a real solve in this repository's environment:

* ``Reconstruction.image(id).cam_from_world()`` returns a ``Rigid3d`` that is
  **world-to-camera** (COLMAP's own naming: it maps a world point into camera
  space). ``.inverse()`` gives camera-to-world, which is what OmniCam's
  backend contract requires.
* ``Rigid3d.rotation.quat`` is ``[x, y, z, w]`` -- confirmed directly:
  ``Rotation3d()`` (identity) reports ``quat == [0, 0, 0, 1]``. No reordering
  needed for ``quaternion_xyzw``.
* the basis is COLMAP's usual computer-vision one: +X right, +Y down, +Z
  forward -- the same as DPVO's, so :data:`PycolmapBackend.basis` is
  ``"opencv"`` for the same reason.

The known intrinsics OmniCam already resolved (from ``lens_mode``) are seeded
as a locked PINHOLE camera rather than left for COLMAP to self-calibrate:
self-calibration on a short clip is exactly where it is least reliable, and a
verified solve in this environment produced a physically nonsensical
``fx=3628, fy=23449`` (a camera cannot have different left-right and top-down
focal lengths on square pixels) the one time refinement was left enabled.
"""

from __future__ import annotations

import importlib.util
import shutil
import tempfile
from collections.abc import Sequence
from pathlib import Path

from ..types import BackendSolveResult, CameraIntrinsics, PoseSample, VideoFrameSample
from .base import (
    BackendAvailability,
    BackendUnavailableError,
    SolveError,
    checkpoint,
    coverage_ratio,
    observe_finalizing,
    observe_pose,
    report_progress,
)

INSTALL_HINT = (
    "Expected the pycolmap package to be installed.\n"
    "Run `python_embeded\\python.exe -m pip install pycolmap` (no compiler, no\n"
    "CUDA toolkit -- it ships prebuilt Windows wheels). Use method=opencv_sift\n"
    "if you would rather not install anything. OmniCam did not modify your\n"
    "Python environment."
)


def _managed_exchange_root() -> Path:
    try:
        import folder_paths

        root = Path(folder_paths.get_temp_directory()) / "omnicam" / "pycolmap_exchange"
    except Exception:  # noqa: BLE001 - unit tests and standalone tools have no ComfyUI
        root = Path(tempfile.gettempdir()) / "omnicam" / "pycolmap_exchange"
    root.mkdir(parents=True, exist_ok=True)
    return root


class PycolmapBackend:
    name = "pycolmap"
    basis = "opencv"
    #: The PyPI wheel is CPU-only (no bundled CUDA kernels); a self-built,
    #: CUDA-enabled pycolmap only ever uses the GPU for SIFT extraction and
    #: matching, never the whole solve the way DPVO does. Treating it as
    #: exclusive by default would serialize an essentially CPU-bound backend
    #: behind ComfyUI generation for no reason on the common install path.
    gpu_exclusive = False

    @classmethod
    def availability(cls) -> BackendAvailability:
        try:
            if importlib.util.find_spec("pycolmap") is None:
                return BackendAvailability(False, "the pycolmap package is not installed")
        except Exception as exc:  # noqa: BLE001 - a broken sys.path entry raises from find_spec
            return BackendAvailability(False, f"the pycolmap package could not be probed: {exc}")
        return BackendAvailability(True)

    @classmethod
    def unavailable_message(cls, reason: str) -> str:
        return f"OmniCam Extractor: the pycolmap backend is not available ({reason}).\n{INSTALL_HINT}"

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
        import pycolmap
        from PIL import Image as PILImage

        exchange = Path(tempfile.mkdtemp(prefix="omnicam-pycolmap-", dir=_managed_exchange_root()))
        try:
            image_dir = exchange / "images"
            image_dir.mkdir()
            # Filenames are the frame's *position* in this solve, not its
            # source_frame number: match_sequential's adjacency window relies
            # on lexicographic order being contiguous, which a frame_step-thinned
            # source_frame sequence is not.
            for index, frame in enumerate(frames):
                PILImage.fromarray(frame.rgb).save(image_dir / f"{index:06d}.jpg", quality=95)
            checkpoint(control)

            database_path = exchange / "database.db"
            reader_options = pycolmap.ImageReaderOptions()
            reader_options.camera_model = "PINHOLE"
            reader_options.camera_params = (
                f"{intrinsics.fx},{intrinsics.fy},{intrinsics.cx},{intrinsics.cy}"
            )

            token = pycolmap.CancellationToken()
            pycolmap.extract_features(
                database_path, image_dir,
                camera_mode=pycolmap.CameraMode.SINGLE,
                reader_options=reader_options,
                cancellation_token=token,
            )
            checkpoint(control)

            pycolmap.match_sequential(database_path, cancellation_token=token)
            checkpoint(control)

            observe_finalizing(observer)
            options = pycolmap.IncrementalPipelineOptions()
            # Trust the intrinsics OmniCam already resolved; see the module
            # docstring for what letting COLMAP refine them produced.
            options.ba_refine_focal_length = False
            options.ba_refine_extra_params = False
            options.mapper.abs_pose_refine_focal_length = False
            options.mapper.abs_pose_refine_extra_params = False

            registered = 0
            total = len(frames)

            def on_next_image() -> None:
                # Invoked from C++: never raise here (pybind's exception
                # propagation across a bare callback like this one is not
                # something to depend on). Signal the cancellation token
                # instead; the real, clean SolveCancelled is raised below,
                # once control returns to plain Python.
                nonlocal registered
                registered += 1
                if control is not None:
                    try:
                        checkpoint(control)
                    except BaseException:  # noqa: BLE001 - re-raised for real just below
                        token.cancel()
                report_progress(progress, min(registered, total), total)

            sparse_dir = exchange / "sparse"
            sparse_dir.mkdir()
            reconstructions = pycolmap.incremental_mapping(
                database_path, image_dir, sparse_dir,
                options=options, next_image_callback=on_next_image, cancellation_token=token,
            )
            checkpoint(control)  # the real, clean raise if on_next_image saw a stop request

            if not reconstructions:
                raise SolveError(
                    "pycolmap could not register any frames. The shot may be too short, "
                    "too dark, too flat, or have too little parallax for a solve."
                )

            best = max(reconstructions.values(), key=lambda rec: rec.num_reg_images())
            if len(reconstructions) > 1:
                total_registered = sum(rec.num_reg_images() for rec in reconstructions.values())
            else:
                total_registered = best.num_reg_images()

            samples: list[PoseSample] = []
            for image_id in best.reg_image_ids():
                image = best.image(image_id)
                index = int(Path(image.name).stem)
                if index < 0 or index >= len(frames):
                    continue
                world_from_cam = image.cam_from_world().inverse()
                position = [float(v) for v in world_from_cam.translation]
                quat = [float(v) for v in world_from_cam.rotation.quat]
                source = frames[index]
                samples.append(
                    PoseSample(
                        source_frame=source.source_frame,
                        timestamp_seconds=source.timestamp_seconds,
                        position=position,
                        quaternion_xyzw=quat,
                    )
                )
            if len(samples) < 2:
                raise SolveError("pycolmap returned fewer than two usable camera poses.")
            samples.sort(key=lambda sample: sample.source_frame)
            for sample in samples:
                observe_pose(observer, sample)

            coverage = coverage_ratio(len(samples), len(frames))
            warnings: list[str] = []
            if len(reconstructions) > 1:
                warnings.append(
                    f"The shot registered as {len(reconstructions)} disconnected reconstructions "
                    f"({total_registered} frames total); only the largest ({best.num_reg_images()} "
                    "frames) is used. This usually means a hard cut or a segment with too little "
                    "texture or parallax to bridge."
                )
            elif coverage < 0.9:
                warnings.append(
                    f"pycolmap registered {len(samples)} of {len(frames)} sampled frames "
                    "(coverage {:.0%}); the gaps are interpolated by the Director.".format(coverage)
                )

            return BackendSolveResult(
                poses=samples,
                backend="pycolmap",
                coverage=coverage,
                warnings=warnings,
                diagnostics={
                    "solved_poses": len(samples),
                    "requested_samples": len(frames),
                    "reconstructions": len(reconstructions),
                },
            )
        finally:
            shutil.rmtree(exchange, ignore_errors=True)
