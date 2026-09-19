"""Deterministic camera-metadata compiler shared by every target dialect.

``segment_motion_phases`` (``omnicam.core.motion_phases``) is already
model-neutral description, not payload -- this module wraps it into the typed
``CameraPhase``/``ShotCompileIR`` values every adapter compiles from, and owns
the English shot-list renderer that used to live in ``adapters/h3.py``. H3 and
Seedance both call ``build_camera_motion_block``; neither owns it.
"""

from __future__ import annotations

from typing import Any

from ..core.motion_phases import segment_motion_phases
from ..core.track import OmniCamTrack
from .model import CameraPhase, ReferenceSpec, ShotCompileIR, ShotIntent


def camera_phases_from_track(track: OmniCamTrack, *, max_phases: int = 4) -> tuple[CameraPhase, ...]:
    """The track's motion phases as typed IR values (doc section 8.1)."""
    return tuple(
        CameraPhase(
            start_seconds=phase["start_seconds"],
            end_seconds=phase["end_seconds"],
            axis=phase["axis"],
            phrase=phase["phrase"],
            pace=phase["pace"],
            magnitudes=dict(phase.get("magnitudes") or {}),
            peak_speed=phase["peak_speed"],
        )
        for phase in segment_motion_phases(track, max_phases=max_phases)
    )


def _phase_sentence(phase: dict[str, Any], *, first: bool, only: bool) -> str:
    subject = "The camera" if first else "It"
    if only:
        subject = "The camera"
    pace = {
        "accelerating": " and gradually gains speed",
        "decelerating": " and eases to a stop",
        "steady": "",
    }[phase["pace"]]
    magnitudes = phase.get("magnitudes") or {}
    detail = ""
    if phase["axis"] in {"truck_left", "truck_right"} and abs(magnitudes.get("pan_degrees", 0.0)) > 5.0:
        detail = ", producing increasing background parallax"
    elif phase["axis"] in {"dolly_in", "dolly_out"} and abs(magnitudes.get("fov_degrees", 0.0)) > 2.0:
        detail = ", with the focal length changing at the same time"
    return f"{subject} {phase['phrase']}{detail}{pace}."


def build_camera_motion_block(track: OmniCamTrack, *, max_phases: int = 4) -> str:
    """Timecoded shot list, or one sentence when the move is single-phase.

    A track that really is one continuous push-in gets one line: inventing four
    phases for it would describe a shot the author never authored.
    """
    phases = segment_motion_phases(track, max_phases=max_phases)
    if len(phases) == 1:
        return _phase_sentence(phases[0], first=True, only=True)
    lines = []
    for index, phase in enumerate(phases):
        span = f"[{phase['start_seconds']:.1f}-{phase['end_seconds']:.1f}s]"
        lines.append(f"{span} {_phase_sentence(phase, first=index == 0, only=False)}")
    return "\n".join(lines)


def build_shot_compile_ir(
    track: OmniCamTrack,
    *,
    guide_reference: ReferenceSpec,
    intent: ShotIntent,
    mapping_quality: dict[str, str],
    max_phases: int = 4,
    additional_references: tuple[ReferenceSpec, ...] = (),
) -> ShotCompileIR:
    """Assemble the transient compiler IR for one shot (doc section 8.5).

    ``additional_references`` are declared references OmniCam does not own
    the media for (doc section 8.5's P2 extension, e.g. a Reference Role
    Matrix entry) -- the OmniCam guide always occupies the first slot.
    """
    return ShotCompileIR(
        camera_phases=camera_phases_from_track(track, max_phases=max_phases),
        references=(guide_reference, *additional_references),
        intent=intent,
        mapping_quality=dict(mapping_quality),
    )
