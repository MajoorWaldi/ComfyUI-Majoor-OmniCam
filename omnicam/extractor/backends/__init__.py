"""Backend registry and deterministic selection.

Neither solver is a hard dependency of OmniCam: importing this package must
succeed on a machine with no CUDA toolchain and no OpenCV, because otherwise a
missing tracker would take the whole node pack down with it. Availability is
therefore probed lazily, and the runtime classes are imported inside ``solve``.
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

METHODS = ("auto", "dpvo", "opencv_sift")

# Ordered by solve quality: `auto` walks this list and takes the first backend
# that is actually installed.
BACKEND_CLASSES: tuple[type, ...] = (DpvoBackend, OpenCvSiftBackend)
BACKENDS_BY_NAME = {backend.name: backend for backend in BACKEND_CLASSES}


def backend_availability() -> dict[str, BackendAvailability]:
    """Probe every backend. Never raises: an unavailable backend is a result, not an error."""
    report: dict[str, BackendAvailability] = {}
    for backend in BACKEND_CLASSES:
        try:
            report[backend.name] = backend.availability()
        except Exception as exc:  # noqa: BLE001 - third-party import machinery may raise anything
            report[backend.name] = BackendAvailability(False, f"availability probe failed: {exc}")
    return report


def _no_backend_message(report: dict[str, BackendAvailability]) -> str:
    lines = ["No OmniCam camera-tracking backend is available."]
    labels = {"dpvo": "DPVO", "opencv_sift": "OpenCV/SIFT"}
    for name, availability in report.items():
        lines.append(f"{labels.get(name, name)}: {availability.reason or 'unavailable'}")
    lines.append(
        "Install one of them following docs/NODES.md. OmniCam never installs Python "
        "packages for you."
    )
    return "\n".join(lines)


def select_backend(method: str) -> CameraMotionBackend:
    """Resolve a method widget value to a ready-to-run solver instance."""
    requested = str(method)
    if requested not in METHODS:
        raise BackendUnavailableError(f"Unknown extraction method {requested!r}; expected one of {list(METHODS)}")
    report = backend_availability()
    if requested == "auto":
        for backend in BACKEND_CLASSES:
            if report[backend.name].available:
                return backend()
        raise BackendUnavailableError(_no_backend_message(report))
    backend_class = BACKENDS_BY_NAME[requested]
    availability = report[requested]
    if not availability.available:
        raise BackendUnavailableError(backend_class.unavailable_message(availability.reason))
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
    "SolveError",
    "backend_availability",
    "coverage_ratio",
    "report_progress",
    "select_backend",
]
