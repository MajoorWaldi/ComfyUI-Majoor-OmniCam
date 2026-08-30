"""Lens resolution for the extractor.

A monocular solve needs a focal length in pixels. Real footage rarely carries
usable metadata, so OmniCam offers three honest options: a documented default
approximation, an explicit vertical FOV, or a focal length plus sensor width.
The principal point is always the image centre -- nothing in the pipeline can
recover a decentred one, and pretending otherwise would bias the solve.
"""

from __future__ import annotations

import math

from .types import CameraIntrinsics

# The default guess when the user gives us nothing. Documented, not measured:
# 53 degrees vertical is roughly a 24 mm full-frame lens, the most common look
# for the handheld and drone footage this node is aimed at.
AUTO_VERTICAL_FOV_DEGREES = 53.0
AUTO_SOURCE = "auto_53deg_vertical_fov"

LENS_MODES = ("auto", "fov", "focal_mm")


def _focal_from_vertical_fov(height: int, vertical_fov_degrees: float) -> float:
    half = math.radians(max(1.0, min(179.0, float(vertical_fov_degrees)))) * 0.5
    return (float(height) * 0.5) / math.tan(half)


def vertical_fov_from_focal_pixels(fy: float, height: int) -> float:
    """Inverse of :func:`_focal_from_vertical_fov`, in degrees.

    OmniCam camera payloads carry a vertical FOV (Three.js semantics), so the
    track builder needs this to describe whatever lens the solve actually used.
    """
    return math.degrees(2.0 * math.atan((float(height) * 0.5) / max(1e-9, float(fy))))


def resolve_intrinsics(
    *,
    width: int,
    height: int,
    lens_mode: str,
    fov_degrees: float,
    focal_length_mm: float,
    sensor_width_mm: float,
) -> CameraIntrinsics:
    """Build source-resolution intrinsics from the node's lens widgets."""
    width = max(1, int(width))
    height = max(1, int(height))
    mode = str(lens_mode)
    if mode not in LENS_MODES:
        raise ValueError(f"lens_mode must be one of {list(LENS_MODES)}, got {lens_mode!r}")

    if mode == "focal_mm":
        # Sensor width pairs with the image width, so this path derives a
        # horizontal FOV and keeps square pixels.
        focal_mm = max(1e-6, float(focal_length_mm))
        sensor_mm = max(1e-6, float(sensor_width_mm))
        horizontal_fov = 2.0 * math.atan(sensor_mm / (2.0 * focal_mm))
        fx = (float(width) * 0.5) / math.tan(horizontal_fov * 0.5)
        fy = fx
        source = f"focal_{focal_length_mm:g}mm_sensor_{sensor_width_mm:g}mm"
    else:
        vertical_fov = AUTO_VERTICAL_FOV_DEGREES if mode == "auto" else float(fov_degrees)
        fy = _focal_from_vertical_fov(height, vertical_fov)
        fx = fy
        source = AUTO_SOURCE if mode == "auto" else f"vertical_fov_{vertical_fov:g}deg"

    return CameraIntrinsics(
        fx=fx,
        fy=fy,
        cx=width * 0.5,
        cy=height * 0.5,
        width=width,
        height=height,
        source=source,
    )
