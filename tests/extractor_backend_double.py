"""A deterministic stand-in solver, so the pipeline is testable without footage."""

from omnicam.extractor.types import BackendSolveResult, PoseSample


class RecordingBackend:
    """Solves a straight dolly in OpenCV axes and records what it was given."""

    name = "fake"
    basis = "opencv"

    def __init__(self, basis="opencv", coverage=0.9, warnings=("solver said so",)):
        self.basis = basis
        self.coverage, self._warnings = coverage, list(warnings)
        self.seen_intrinsics = None
        self.seen_frames = None
        self.seen_control = None
        self.seen_observer = None

    def solve(self, frames, intrinsics, *, progress=None, control=None, observer=None):
        self.seen_intrinsics, self.seen_frames = intrinsics, list(frames)
        self.seen_control, self.seen_observer = control, observer
        poses = [
            PoseSample(
                source_frame=frame.source_frame,
                timestamp_seconds=frame.timestamp_seconds,
                # Starts away from the origin so origin normalization has
                # something to actually undo.
                position=[1.0, 2.0, 3.0 + 0.25 * index],
                quaternion_xyzw=[0.0, 0.0, 0.0, 1.0],
            )
            for index, frame in enumerate(frames)
        ]
        return BackendSolveResult(
            poses=poses, backend="fake", coverage=self.coverage, warnings=list(self._warnings)
        )
