"""Backend registry and deterministic selection.

No solver is a hard dependency of OmniCam: importing this package must succeed
on a machine with no CUDA toolchain, no OpenCV and no pycolmap, because
otherwise a missing tracker would take the whole node pack down with it.
Availability is therefore probed lazily, and the runtime classes are imported
inside ``solve``.
"""

from __future__ import annotations

from .base import (
    BackendAvailability,
    BackendUnavailableError,
    CameraMotionBackend,
    SolveError,
    coverage_ratio,
    report_progress,
)
from .dpvo import DpvoBackend
from .opencv_vo import OpenCvSiftBackend
from .pycolmap_vo import PycolmapBackend

METHODS = ("auto", "dpvo", "pycolmap", "opencv_sift")

# Ordered by solve quality: `auto` walks this list and takes the first backend
# that is actually installed. pycolmap sits between the two: a stronger
# fallback than OpenCV/SIFT (bundle-adjusted Structure-from-Motion rather than
# frame-to-frame essential-matrix VO, so it does not zero out translation on a
# low-parallax segment the way OpenCV/SIFT's own module documents doing), but
# DPVO remains OmniCam's tracker of choice where it is installed.
BACKEND_CLASSES: tuple[type, ...] = (DpvoBackend, PycolmapBackend, OpenCvSiftBackend)
BACKENDS_BY_NAME = {backend.name: backend for backend in BACKEND_CLASSES}  # type: ignore[attr-defined]


def backend_availability() -> dict[str, BackendAvailability]:
    """Probe every backend. Never raises: an unavailable backend is a result, not an error."""
    report: dict[str, BackendAvailability] = {}
    for backend in BACKEND_CLASSES:
        try:
            report[backend.name] = backend.availability()  # type: ignore[attr-defined]
        except Exception as exc:  # noqa: BLE001 - third-party import machinery may raise anything
            report[backend.name] = BackendAvailability(False, f"availability probe failed: {exc}")  # type: ignore[attr-defined]
    return report


def _no_backend_message(report: dict[str, BackendAvailability]) -> str:
    lines = ["No OmniCam camera-tracking backend is available."]
    labels = {"dpvo": "DPVO", "pycolmap": "pycolmap", "opencv_sift": "OpenCV/SIFT"}
    for name, availability in report.items():
        lines.append(f"{labels.get(name, name)}: {availability.reason or 'unavailable'}")
    lines.append(
        "Install one of them following docs/NODES.md. OmniCam never installs Python "
        "packages for you."
    )
    return "\n".join(lines)


def backend_requires_gpu_slot(method: str) -> bool:
    """Whether the method that would actually run needs OmniCam's GPU slot.

    `auto` is resolved using the same ordered availability policy as
    :func:`select_backend`. This prevents a CPU-only pycolmap/OpenCV fallback
    from being blocked just because DPVO would have needed the card. When no
    backend is available we stay conservative; the worker will later report the
    useful installation error without allowing two potential GPU jobs to race.
    """
    requested = str(method)
    if requested not in METHODS:
        raise BackendUnavailableError(f"Unknown extraction method {requested!r}; expected one of {list(METHODS)}")
    if requested != "auto":
        return bool(getattr(BACKENDS_BY_NAME[requested], "gpu_exclusive", False))
    report = backend_availability()
    for backend in BACKEND_CLASSES:
        if report[backend.name].available:  # type: ignore[attr-defined]
            return bool(getattr(backend, "gpu_exclusive", False))
    return True


def select_backend(method: str) -> CameraMotionBackend:
    """Resolve a method widget value to a ready-to-run solver instance."""
    requested = str(method)
    if requested not in METHODS:
        raise BackendUnavailableError(f"Unknown extraction method {requested!r}; expected one of {list(METHODS)}")
    report = backend_availability()
    if requested == "auto":
        for backend in BACKEND_CLASSES:
            if report[backend.name].available:  # type: ignore[attr-defined]
                return backend()
        raise BackendUnavailableError(_no_backend_message(report))
    backend_class = BACKENDS_BY_NAME[requested]
    availability = report[requested]
    if not availability.available:
        raise BackendUnavailableError(backend_class.unavailable_message(availability.reason))  # type: ignore[attr-defined]
    return backend_class()


__all__ = [
    "BACKENDS_BY_NAME",
    "BACKEND_CLASSES",
    "METHODS",
    "BackendAvailability",
    "BackendUnavailableError",
    "CameraMotionBackend",
    "DpvoBackend",
    "OpenCvSiftBackend",
    "PycolmapBackend",
    "SolveError",
    "backend_availability",
    "backend_requires_gpu_slot",
    "coverage_ratio",
    "report_progress",
    "select_backend",
]
