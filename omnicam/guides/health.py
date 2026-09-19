"""Guide Health: quality warnings computable purely from authored track data.

Deliberately scoped to what a compile can see today (doc section 20). Guide
Health's own appearance/overlay-contamination checks need capture-time
manifest flags (``contains_overlays``, ``contains_authored_textures``) that
do not exist yet -- P1's playblast manifest stops at ``guide_style`` -- so
this module covers only geometry/motion readability, derived from the same
``camera_phases_from_track`` analysis the prompt compilers already use.
"""

from __future__ import annotations

from ..core.track import OmniCamTrack
from ..monitor.result import Check
from .analysis import camera_phases_from_track

#: Below this peak speed (world units/s) across every phase, the move reads
#: as a hold rather than a described camera motion.
MIN_MEANINGFUL_SPEED = 0.05
#: Above this, a pan/tilt rate is likely to read as a whip once the
#: destination model reinterprets the guide.
MAX_RECOMMENDED_ANGULAR_DEGREES_PER_SECOND = 180.0
#: Above this, a within-phase FOV swing is one of the harder moves for a
#: reference-video guide to convey.
MAX_RECOMMENDED_FOV_DELTA_DEGREES = 30.0


def guide_health_checks(track: OmniCamTrack, *, guide_style: str) -> list[Check]:
    """Non-blocking quality warnings about the guide's own motion content."""
    phases = camera_phases_from_track(track)
    checks: list[Check] = []

    peak_speed = max((phase.peak_speed for phase in phases), default=0.0)
    if peak_speed < MIN_MEANINGFUL_SPEED and guide_style != "beauty_reference":
        checks.append(Check(
            id="guide_health_peak_speed",
            label="Guide motion readability",
            state="WARNING",
            message=(
                f"Peak camera speed across the shot is {peak_speed:.3f} units/s -- close to a "
                "static hold. A model reading this guide has very little motion to follow."
            ),
        ))

    # magnitudes.pan_degrees/tilt_degrees are the *total* degrees turned across
    # the phase (camera_phases_from_track sums per-frame rates, not a rate
    # itself) -- divide by the phase's own duration to get degrees/second.
    def _phase_rate(phase, key: str) -> float:
        duration = phase.end_seconds - phase.start_seconds
        return abs(phase.magnitudes.get(key, 0.0)) / duration if duration > 0 else 0.0

    fastest_rotation = max(
        (max(_phase_rate(phase, "pan_degrees"), _phase_rate(phase, "tilt_degrees")) for phase in phases),
        default=0.0,
    )
    if fastest_rotation > MAX_RECOMMENDED_ANGULAR_DEGREES_PER_SECOND:
        checks.append(Check(
            id="guide_health_angular_velocity",
            label="Guide angular velocity",
            state="WARNING",
            message=(
                f"A phase pans/tilts at up to {fastest_rotation:.0f} deg/s, above the "
                f"{MAX_RECOMMENDED_ANGULAR_DEGREES_PER_SECOND:.0f} deg/s a reference video reads "
                "cleanly at. The destination model may see it as a whip or a cut."
            ),
        ))

    max_fov_delta = max((abs(phase.magnitudes.get("fov_degrees", 0.0)) for phase in phases), default=0.0)
    if max_fov_delta > MAX_RECOMMENDED_FOV_DELTA_DEGREES:
        checks.append(Check(
            id="guide_health_focal_length",
            label="Guide focal-length change",
            state="WARNING",
            message=(
                f"FOV changes by up to {max_fov_delta:.1f} deg within one phase. A large, fast "
                "zoom is one of the harder camera motions for a reference-video guide to convey."
            ),
        ))

    if guide_style == "beauty_reference":
        checks.append(Check(
            id="guide_health_appearance",
            label="Appearance reference (intentional)",
            state="PASS",
            message=(
                "beauty_reference is a declared appearance-transfer role, not a contamination "
                "risk -- materials, lighting and color are meant to carry through (doc 18.1)."
            ),
        ))

    return checks
