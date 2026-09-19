"""Model-agnostic guide-compiler layer: OmniIR (P0-P2)."""

from .analysis import build_camera_motion_block, build_shot_compile_ir, camera_phases_from_track
from .conflicts import detect_role_conflicts
from .health import guide_health_checks
from .model import (
    MAPPING_QUALITIES,
    REFERENCE_ROLES,
    CameraPhase,
    ReferenceSpec,
    ShotCompileIR,
    ShotIntent,
    omnicam_guide_reference,
    parse_reference_plan,
    validate_mapping_quality,
    validate_reference_role,
)

__all__ = [
    "MAPPING_QUALITIES",
    "REFERENCE_ROLES",
    "CameraPhase",
    "ReferenceSpec",
    "ShotCompileIR",
    "ShotIntent",
    "build_camera_motion_block",
    "build_shot_compile_ir",
    "camera_phases_from_track",
    "detect_role_conflicts",
    "guide_health_checks",
    "omnicam_guide_reference",
    "parse_reference_plan",
    "validate_mapping_quality",
    "validate_reference_role",
]
