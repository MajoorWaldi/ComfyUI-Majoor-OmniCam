"""Scene-coverage compatibility rules for the H3 camera contract.

A pure-Python gate over :class:`~omnicam.adapters.h3_geometry.H3GeometryAnalysis`
that decides whether a camera move can be faithfully expressed as a single
continuous target-centric orbit/arc. It never claims H3 cannot generate a
move -- only that this specific prompt/options representation cannot encode
it, and that ``h3_native`` reference-video transport should be used instead.
"""

from __future__ import annotations

from dataclasses import dataclass

from .h3_geometry import H3GeometryAnalysis
from ..core.track import OmniCamTrack

USE_H3_NATIVE_RECOMMENDATION = "Use MiniMax H3 Native reference-video transport for this camera move."

_TARGET_DRIFT_WARN_RATIO = 0.01
_TARGET_DRIFT_BLOCK_RATIO = 0.05
_ROLL_DRIFT_WARN_DEGREES = 1.0
_ROLL_DRIFT_BLOCK_DEGREES = 5.0
_FOV_DRIFT_WARN_DEGREES = 2.0
_FOV_DRIFT_BLOCK_DEGREES = 10.0
_MIN_ORBIT_TRAVEL_DEGREES = 5.0
_MIN_TRANSLATION_PATH_RATIO = 0.05
_MAX_ORBIT_TRAVEL_DEGREES = 361.0
_HIGH_ELEVATION_DEGREES = 45.0


@dataclass(frozen=True)
class H3Representability:
    state: str
    reasons: tuple[str, ...]
    recommendations: tuple[str, ...]


def evaluate_h3_scene_coverage(
    track: OmniCamTrack,
    analysis: H3GeometryAnalysis,
    *,
    is_multi_shot: bool,
) -> H3Representability:
    reasons: list[str] = []

    if is_multi_shot:
        reasons.append("The motion scene contains multiple shots/cuts; scene coverage requires one continuous camera move.")
    if analysis.start_radius < 1e-6:
        reasons.append("The camera starts at its target (zero radius); scene coverage requires a real orbit distance.")
    if (
        analysis.total_orbit_degrees < _MIN_ORBIT_TRAVEL_DEGREES
        and analysis.path_length_world > _MIN_TRANSLATION_PATH_RATIO * analysis.start_radius
    ):
        reasons.append("The camera translates through the scene without orbiting around the target; this is not a target-centric arc.")
    if analysis.max_target_drift_ratio > _TARGET_DRIFT_BLOCK_RATIO:
        reasons.append(
            f"Target drift is {analysis.max_target_drift_ratio * 100:.1f}% of the starting camera radius. "
            "This path cannot be faithfully represented by the scene-coverage camera contract."
        )
    if analysis.max_roll_delta_degrees > _ROLL_DRIFT_BLOCK_DEGREES:
        reasons.append(f"Roll drift of {analysis.max_roll_delta_degrees:.1f}° exceeds the stable-roll contract for scene coverage.")
    if analysis.max_fov_delta_degrees > _FOV_DRIFT_BLOCK_DEGREES:
        reasons.append(f"FOV drift of {analysis.max_fov_delta_degrees:.1f}° exceeds the stable-lens contract for scene coverage.")
    if max(abs(analysis.net_orbit_degrees), analysis.total_orbit_degrees) > _MAX_ORBIT_TRAVEL_DEGREES:
        reasons.append("The camera travels more than one full turn; the downstream coverage arc caps at 360°.")

    if reasons:
        return H3Representability(state="BLOCKED", reasons=tuple(reasons), recommendations=(USE_H3_NATIVE_RECOMMENDATION,))

    warnings: list[str] = []
    if analysis.max_target_drift_ratio > _TARGET_DRIFT_WARN_RATIO:
        warnings.append(f"Target drift is {analysis.max_target_drift_ratio * 100:.1f}% of the starting camera radius.")
    if analysis.max_roll_delta_degrees > _ROLL_DRIFT_WARN_DEGREES:
        warnings.append(f"Roll drifts {analysis.max_roll_delta_degrees:.1f}° over the shot.")
    if analysis.max_fov_delta_degrees > _FOV_DRIFT_WARN_DEGREES:
        warnings.append(f"FOV drifts {analysis.max_fov_delta_degrees:.1f}° over the shot.")
    if any(abs(sample.elevation_degrees) >= _HIGH_ELEVATION_DEGREES for sample in analysis.samples):
        warnings.append("Elevation reaches 45° or more; verify the top/bottom-down view is intended.")
    if abs(analysis.net_orbit_degrees) >= 359.0 and not analysis.loop_closure:
        warnings.append("The endpoint is near but not eligible for automatic loop closure.")

    if warnings:
        return H3Representability(state="WARNING", reasons=tuple(warnings), recommendations=())

    return H3Representability(state="PASS", reasons=(), recommendations=())


__all__ = ["H3Representability", "evaluate_h3_scene_coverage", "USE_H3_NATIVE_RECOMMENDATION"]
