"""Domain types shared by every extractor stage.

These are plain dataclasses on purpose: the solver backends, the coordinate
conversion and the track builder all speak this vocabulary, and none of them
may depend on ComfyUI, torch or OpenCV to be importable.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True, frozen=True)
class CameraIntrinsics:
    """Pinhole intrinsics in pixels, for one specific image resolution."""

    fx: float
    fy: float
    cx: float
    cy: float
    width: int
    height: int
    source: str

    def scaled(self, scale_x: float, scale_y: float) -> CameraIntrinsics:
        """Intrinsics for a resized image. Focal and principal point scale together."""
        return CameraIntrinsics(
            fx=self.fx * scale_x,
            fy=self.fy * scale_y,
            cx=self.cx * scale_x,
            cy=self.cy * scale_y,
            width=max(1, round(self.width * scale_x)),
            height=max(1, round(self.height * scale_y)),
            source=self.source,
        )


@dataclass(slots=True)
class VideoFrameSample:
    """One decoded frame, tagged with its position on the *source* timeline."""

    source_frame: int
    timestamp_seconds: float
    rgb: Any  # numpy uint8 HxWx3; typed loosely so NumPy stays an optional import


@dataclass(slots=True)
class PoseSample:
    """A camera-to-world pose on the source timeline.

    ``quaternion_xyzw`` rotates a local-space direction into world space, with
    the camera looking down its local -Z once the sequence has been converted
    into OmniCam coordinates.
    """

    source_frame: int
    timestamp_seconds: float
    position: list[float]
    quaternion_xyzw: list[float]
    valid: bool = True


@dataclass(slots=True)
class BackendSolveResult:
    """What a solver hands back: camera-to-world poses plus solver health."""

    poses: list[PoseSample]
    backend: str
    coverage: float
    warnings: list[str] = field(default_factory=list)
    diagnostics: dict[str, Any] = field(default_factory=dict)
    #: Optional solver geometry for inspection only; never required for a solve.
    landmarks_3d: list[dict[str, float]] = field(default_factory=list)


@dataclass(slots=True)
class ExtractionResult:
    """The canonical track plus the metadata the node and frontend need."""

    track: dict[str, Any]
    confidence: float
    report: str
    fingerprint: str
