"""Classical SIFT + essential-matrix visual odometry.

This is the fallback, not OmniCam's tracker of choice. It exists so the node
does something useful on a machine that will never compile a CUDA extension,
and it is honest about what that costs:

* monocular essential-matrix translation is **direction only**. ``recoverPose``
  returns a unit vector, so the trajectory has an arbitrary and per-segment
  scale. The result is a plausible camera *shape*, not a measurement.
* a pure rotation gives the essential matrix nothing to triangulate, so the
  translation it recovers is noise. Segments without real parallax are pinned
  to zero translation rather than allowed to invent a dolly.

OpenCV is an optional dependency: ``cv2`` is imported inside the methods, never
at module scope.

Poses are camera-to-world in the OpenCV basis (+X right, +Y down, +Z forward);
:mod:`omnicam.extractor.transforms` performs the single conversion to OmniCam.
"""

from __future__ import annotations

import importlib.util
import math
from collections.abc import Sequence

from ..types import BackendSolveResult, CameraIntrinsics, PoseSample, VideoFrameSample
from .base import (
    BackendAvailability,
    BackendUnavailableError,
    SolveError,
    checkpoint,
    coverage_ratio,
    observe_features,
    observe_pose,
    observe_quality,
    report_progress,
    sample_features,
)

LOWE_RATIO = 0.75
MIN_DESCRIPTORS = 30
MIN_GOOD_MATCHES = 20
MIN_INLIER_RATIO = 0.35
#: Median feature displacement, in pixels, below which a pair carries no usable
#: parallax and its translation direction is meaningless.
MIN_PARALLAX_PIXELS = 0.75

INSTALL_HINT = (
    "Install OpenCV in the ComfyUI Python environment (for example "
    "`opencv-python-headless`) or use method=dpvo. OmniCam did not modify your "
    "Python environment."
)


def _cut_message(source_frame: int, detail: str) -> str:
    return (
        f"Camera tracking lost near frame {source_frame}: {detail}.\n"
        "The shot may contain a hard cut, heavy motion blur, too little texture, or a "
        "dominant moving foreground. OmniCam Extractor V1 solves one continuous shot at "
        "a time -- trim the source or solve the shots separately."
    )


def rotation_matrix_to_quaternion(matrix) -> list[float]:
    """Rotation matrix to a unit ``[x, y, z, w]`` quaternion (Shepperd's method)."""
    m = [[float(matrix[row][column]) for column in range(3)] for row in range(3)]
    trace = m[0][0] + m[1][1] + m[2][2]
    if trace > 0.0:
        scale = math.sqrt(trace + 1.0) * 2.0
        w = 0.25 * scale
        x = (m[2][1] - m[1][2]) / scale
        y = (m[0][2] - m[2][0]) / scale
        z = (m[1][0] - m[0][1]) / scale
    elif m[0][0] > m[1][1] and m[0][0] > m[2][2]:
        scale = math.sqrt(1.0 + m[0][0] - m[1][1] - m[2][2]) * 2.0
        w = (m[2][1] - m[1][2]) / scale
        x = 0.25 * scale
        y = (m[0][1] + m[1][0]) / scale
        z = (m[0][2] + m[2][0]) / scale
    elif m[1][1] > m[2][2]:
        scale = math.sqrt(1.0 + m[1][1] - m[0][0] - m[2][2]) * 2.0
        w = (m[0][2] - m[2][0]) / scale
        x = (m[0][1] + m[1][0]) / scale
        y = 0.25 * scale
        z = (m[1][2] + m[2][1]) / scale
    else:
        scale = math.sqrt(1.0 + m[2][2] - m[0][0] - m[1][1]) * 2.0
        w = (m[1][0] - m[0][1]) / scale
        x = (m[0][2] + m[2][0]) / scale
        y = (m[1][2] + m[2][1]) / scale
        z = 0.25 * scale
    length = math.sqrt(x * x + y * y + z * z + w * w) or 1.0
    return [x / length, y / length, z / length, w / length]


class OpenCvSiftBackend:
    name = "opencv_sift"
    basis = "opencv"

    @classmethod
    def availability(cls) -> BackendAvailability:
        try:
            if importlib.util.find_spec("cv2") is None:
                return BackendAvailability(False, "OpenCV (cv2) is not installed")
        except Exception as exc:  # noqa: BLE001 - a broken sys.path entry raises from find_spec
            return BackendAvailability(False, f"OpenCV could not be probed: {exc}")
        try:
            import cv2

            if not hasattr(cv2, "SIFT_create"):
                return BackendAvailability(False, "this OpenCV build has no SIFT implementation")
        except Exception as exc:  # noqa: BLE001 - a mismatched binary wheel raises ImportError or OSError
            return BackendAvailability(False, f"OpenCV failed to import: {exc}")
        return BackendAvailability(True)

    @classmethod
    def unavailable_message(cls, reason: str) -> str:
        return f"OmniCam Extractor: the OpenCV/SIFT backend is not available ({reason}).\n{INSTALL_HINT}"

    # -- solve -------------------------------------------------------------

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
        import cv2
        import numpy as np

        camera_matrix = np.array(
            [[intrinsics.fx, 0.0, intrinsics.cx], [0.0, intrinsics.fy, intrinsics.cy], [0.0, 0.0, 1.0]],
            dtype=np.float64,
        )
        detector = cv2.SIFT_create()  # type: ignore[attr-defined]
        matcher = cv2.BFMatcher(cv2.NORM_L2)

        warnings: list[str] = []
        first = PoseSample(
            source_frame=frames[0].source_frame,
            timestamp_seconds=frames[0].timestamp_seconds,
            position=[0.0, 0.0, 0.0],
            quaternion_xyzw=[0.0, 0.0, 0.0, 1.0],
        )
        poses = [first]
        # Camera-to-world of the running camera, as a 4x4 in the OpenCV basis.
        pose_matrix = np.eye(4, dtype=np.float64)
        checkpoint(control)
        previous = self._features(cv2, detector, frames[0])
        observe_pose(observer, first)
        report_progress(progress, 1, len(frames))

        for index in range(1, len(frames)):
            # Before the pair: the cheapest possible place to notice a stop, so
            # a cancel never has to wait out a whole clip.
            checkpoint(control)
            current = self._features(cv2, detector, frames[index])
            checkpoint(control)
            step, health = self._relative_pose(
                cv2, np, matcher, camera_matrix, previous, current, frames[index].source_frame, warnings
            )
            pose_matrix = pose_matrix @ step
            pose = PoseSample(
                source_frame=frames[index].source_frame,
                timestamp_seconds=frames[index].timestamp_seconds,
                position=[float(value) for value in pose_matrix[:3, 3]],
                quaternion_xyzw=rotation_matrix_to_quaternion(pose_matrix[:3, :3]),
            )
            poses.append(pose)
            observe_pose(observer, pose)
            observe_quality(observer, pose.source_frame, health["coverage"], health["inliers"], health["state"])
            # The matched features are what the user needs to see to judge a
            # weak frame: a number saying "38% inliers" does not tell them the
            # tracker latched onto a moving foreground.
            observe_features(observer, pose.source_frame, health.get("features") or [], health["state"])
            previous = current
            report_progress(progress, index + 1, len(frames))
            checkpoint(control)

        if not np.isfinite(np.asarray([pose.position for pose in poses], dtype=float)).all():
            raise SolveError("The classical solve produced a non-finite camera position.")
        warnings.append(
            "Translation scale is relative, not metric: monocular essential-matrix "
            "translation is recovered as a direction only."
        )
        return BackendSolveResult(
            poses=poses,
            backend="opencv_sift",
            coverage=coverage_ratio(len(poses), len(frames)),
            warnings=warnings,
            diagnostics={"solved_poses": len(poses), "requested_samples": len(frames)},
        )

    # -- internals ---------------------------------------------------------

    @staticmethod
    def _features(cv2, detector, frame: VideoFrameSample):
        gray = cv2.cvtColor(frame.rgb, cv2.COLOR_RGB2GRAY)
        keypoints, descriptors = detector.detectAndCompute(gray, None)
        if descriptors is None or len(keypoints) < MIN_DESCRIPTORS:
            raise SolveError(
                _cut_message(
                    frame.source_frame,
                    f"only {0 if descriptors is None else len(keypoints)} trackable features "
                    f"(at least {MIN_DESCRIPTORS} are needed)",
                )
            )
        return {"keypoints": keypoints, "descriptors": descriptors, "frame": frame.source_frame}

    @staticmethod
    def _matched_points(cv2, np, matcher, previous, current, source_frame: int):
        matches = matcher.knnMatch(previous["descriptors"], current["descriptors"], k=2)
        good = [pair[0] for pair in matches if len(pair) == 2 and pair[0].distance < LOWE_RATIO * pair[1].distance]
        if len(good) < MIN_GOOD_MATCHES:
            raise SolveError(
                _cut_message(source_frame, f"only {len(good)} features matched the previous frame")
            )
        source = np.float64([previous["keypoints"][match.queryIdx].pt for match in good])
        target = np.float64([current["keypoints"][match.trainIdx].pt for match in good])
        return source, target

    def _relative_pose(self, cv2, np, matcher, camera_matrix, previous, current, source_frame, warnings):
        """4x4 transform taking the previous camera's frame to the current one's.

        Returns the transform plus the health numbers this pair actually
        produced -- matched features and geometric inliers. They are the
        solver's own measurements, which is the only thing the quality timeline
        is allowed to display.
        """
        source, target = self._matched_points(cv2, np, matcher, previous, current, source_frame)
        parallax = float(np.median(np.linalg.norm(target - source, axis=1)))
        if parallax < MIN_PARALLAX_PIXELS:
            # Nothing moved enough to constrain an essential matrix. Returning
            # identity is the honest answer; solving anyway would hand back a
            # unit translation pointing in a random direction.
            return np.eye(4, dtype=np.float64), {
                "coverage": 1.0, "inliers": len(source), "state": "good",
                "features": self._observable_features(np, target, None, camera_matrix),
            }

        essential, mask = cv2.findEssentialMat(
            source, target, camera_matrix, method=cv2.RANSAC, prob=0.999, threshold=1.0
        )
        if essential is None or essential.shape[0] % 3 != 0:
            raise SolveError(_cut_message(source_frame, "the essential matrix could not be estimated"))
        # A degenerate configuration makes findEssentialMat return several
        # stacked candidates; take the first, which is the best-scoring one.
        essential = essential[:3, :3]
        inliers = int(mask.sum()) if mask is not None else 0
        if inliers / max(1, len(source)) < MIN_INLIER_RATIO:
            raise SolveError(
                _cut_message(source_frame, f"only {inliers} of {len(source)} matches were geometrically consistent")
            )

        _, rotation, translation, _ = cv2.recoverPose(essential, source, target, camera_matrix, mask=mask)
        if not np.isfinite(rotation).all() or not np.isfinite(translation).all():
            raise SolveError(_cut_message(source_frame, "the recovered camera transform was not finite"))
        if abs(float(np.linalg.det(rotation)) - 1.0) > 1e-3:
            raise SolveError(_cut_message(source_frame, "the recovered rotation was not a valid rotation"))

        # recoverPose gives X_current = R @ X_previous + t, i.e. the transform
        # *into* the current camera. Camera-to-world accumulates its inverse.
        relative = np.eye(4, dtype=np.float64)
        relative[:3, :3] = rotation.T
        relative[:3, 3] = (-rotation.T @ translation).ravel()
        ratio = inliers / max(1, len(source))
        state = "good" if ratio >= 0.7 else ("weak" if ratio >= MIN_INLIER_RATIO else "bad")
        return relative, {
            "coverage": ratio, "inliers": inliers, "state": state,
            "features": self._observable_features(np, target, mask, camera_matrix),
        }

    @staticmethod
    def _observable_features(np, points, mask, camera_matrix):
        """Matched features for the overlay, normalized to the solve resolution.

        Telemetry only: nothing here feeds back into the solve, so a failure to
        build it must never be able to cost a pose. The principal point doubles
        the image half-extent closely enough for a display normalization, and
        it is the only size the backend is given.
        """
        try:
            width = float(camera_matrix[0][2]) * 2.0 or 1.0
            height = float(camera_matrix[1][2]) * 2.0 or 1.0
            normalized = [
                (min(1.0, max(0.0, float(x) / width)), min(1.0, max(0.0, float(y) / height)))
                for x, y in np.asarray(points, dtype=float)
            ]
            flags = (
                [True] * len(normalized) if mask is None
                else [bool(value) for value in np.asarray(mask).ravel()[: len(normalized)]]
            )
            if len(flags) < len(normalized):
                flags += [False] * (len(normalized) - len(flags))
            return sample_features(normalized, flags)
        except Exception:  # noqa: BLE001 - an overlay is never worth a failed solve
            return []
