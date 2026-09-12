"""H3 scene-coverage timing policy and H3EDIT_OPTIONS compiler.

Resolves the authored camera duration onto one of MiniMax H3's three fixed
scene-coverage frame profiles (never speeding the authored move up, only
stretching it to fill a supported horizon) and compiles the complete
downstream ``H3EDIT_OPTIONS`` dictionary from the geometry analysis.
"""

from __future__ import annotations

from dataclasses import dataclass

from ..core.track import OmniCamTrack
from .h3_geometry import H3GeometryAnalysis

H3_SCENE_PROFILES = (
    (124, "scene coverage | 124-frame camera path"),
    (243, "scene coverage | 243-frame camera path"),
    (362, "scene coverage | 362-frame camera path"),
)
H3_SCENE_FPS = 24.0
H3_GRID_SIZE = 32
_MIN_COVERAGE_ARC_DEGREES = 15.0
_MAX_COVERAGE_ARC_DEGREES = 360.0
_MIN_ORBIT_TRAVEL_DEGREES = 5.0


@dataclass(frozen=True)
class H3SceneProfile:
    frames: int
    quality_profile: str


def select_h3_scene_profile(requested_frames: int) -> H3SceneProfile:
    requested = max(1, int(requested_frames))
    for frames, quality_profile in H3_SCENE_PROFILES:
        if requested <= frames:
            return H3SceneProfile(frames=frames, quality_profile=quality_profile)
    raise ValueError(f"H3 scene coverage supports at most 362 frames; {requested} requested")


def map_h3_scene_frame(source_frame: int, source_last: int, target_last: int) -> int:
    if source_last <= 0:
        return 0
    return round((source_frame / source_last) * target_last)


def h3_grid(value: int) -> int:
    return max(H3_GRID_SIZE, round(int(value) / H3_GRID_SIZE) * H3_GRID_SIZE)


def coverage_arc(analysis: H3GeometryAnalysis) -> float:
    if analysis.total_orbit_degrees < _MIN_ORBIT_TRAVEL_DEGREES:
        return _MIN_COVERAGE_ARC_DEGREES
    return max(_MIN_COVERAGE_ARC_DEGREES, min(_MAX_COVERAGE_ARC_DEGREES, abs(analysis.net_orbit_degrees)))


def build_h3edit_scene_options(
    track: OmniCamTrack,
    analysis: H3GeometryAnalysis,
    *,
    target_frames: int,
) -> dict[str, object]:
    quality_profile = {frames: label for frames, label in H3_SCENE_PROFILES}[target_frames]
    return {
        "mode": "scene coverage | canonical camera path",
        "show_overrides": True,
        "prompt_mode": "directed | frozen scene coverage",
        "quality_profile": quality_profile,
        "primary_image_role": "edit | strong scene anchor (FL2VA)",
        "reference_mode": "none (source only)",
        "source_fit": "crop center",
        "semantic_resolution": 1024,
        "native_reference_size": "match output area",
        "coverage_views": max(2, min(24, len(track.keyframes))),
        "coverage_arc_degrees": coverage_arc(analysis),
        "coverage_direction": analysis.coverage_direction,
        "coverage_hold_frames": 1,
        "coverage_loop_closure": analysis.loop_closure,
    }


__all__ = [
    "H3_SCENE_FPS",
    "H3_SCENE_PROFILES",
    "H3SceneProfile",
    "build_h3edit_scene_options",
    "coverage_arc",
    "h3_grid",
    "map_h3_scene_frame",
    "select_h3_scene_profile",
]
