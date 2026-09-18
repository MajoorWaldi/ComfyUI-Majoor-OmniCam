"""Model-agnostic guide-compiler layer: OmniIR (P0)."""

from .analysis import build_camera_motion_block, build_shot_compile_ir, camera_phases_from_track
from .model import (
    MAPPING_QUALITIES,
    REFERENCE_ROLES,
    CameraPhase,
    ReferenceSpec,
    ShotCompileIR,
    ShotIntent,
    omnicam_guide_reference,
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
    "omnicam_guide_reference",
    "validate_mapping_quality",
    "validate_reference_role",
]
