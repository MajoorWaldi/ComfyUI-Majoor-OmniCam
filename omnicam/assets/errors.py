"""Stable error catalogue for the unified OmniCam asset layer.

Every failure the catalog / rig / pose / character code can surface carries a
wire-stable ``code`` (design spec section 37) so the frontend and the future
Semantic Director API can branch on the reason without string-matching a
message. ``AssetError`` mirrors the shape of
:class:`omnicam.reconstruction.errors.ReconstructionError` -- one base class, a
``to_dict`` that serialises ``{"error": {"code", "message"}}``.
"""

from __future__ import annotations


class AssetError(Exception):
    """Base for every unified-asset failure with a stable error code."""

    code: str = "ASSET_ERROR"

    def __init__(self, message: str, *, code: str | None = None) -> None:
        super().__init__(message)
        if code:
            self.code = code

    def to_dict(self) -> dict[str, dict[str, str]]:
        return {"error": {"code": self.code, "message": str(self)}}


# -- catalog -------------------------------------------------------------- #
class AssetCatalogInvalidError(AssetError):
    code = "ASSET_CATALOG_INVALID"


class AssetNotFoundError(AssetError):
    code = "ASSET_NOT_FOUND"


class AssetFileMissingError(AssetError):
    code = "ASSET_FILE_MISSING"


class AssetFileInvalidError(AssetError):
    code = "ASSET_FILE_INVALID"


class AssetImportTooLargeError(AssetError):
    code = "ASSET_IMPORT_TOO_LARGE"


class AssetLicenseInvalidError(AssetError):
    code = "ASSET_LICENSE_INVALID"


# -- tags / annotation -------------------------------------------------- #
class TagInvalidError(AssetError):
    code = "TAG_INVALID"


class TagLimitExceededError(AssetError):
    code = "TAG_LIMIT_EXCEEDED"


class AnnotationInvalidError(AssetError):
    code = "ANNOTATION_INVALID"


# -- rig / pose / character (populated by later phases) ---------------- #
class RigNotFoundError(AssetError):
    code = "RIG_NOT_FOUND"


class RigProfileUnsupportedError(AssetError):
    code = "RIG_PROFILE_UNSUPPORTED"


class RigMappingIncompleteError(AssetError):
    code = "RIG_MAPPING_INCOMPLETE"


class RigMappingInvalidError(AssetError):
    code = "RIG_MAPPING_INVALID"


class RigJointUnmappedError(AssetError):
    code = "RIG_JOINT_UNMAPPED"


class PoseNotFoundError(AssetError):
    code = "POSE_NOT_FOUND"


class PoseProfileMismatchError(AssetError):
    code = "POSE_PROFILE_MISMATCH"


class PoseInvalidQuaternionError(AssetError):
    code = "POSE_INVALID_QUATERNION"


class PoseLimitExceededError(AssetError):
    code = "POSE_LIMIT_EXCEEDED"


class CharacterNotRiggedError(AssetError):
    code = "CHARACTER_NOT_RIGGED"


class CharacterMotionNotFoundError(AssetError):
    code = "CHARACTER_MOTION_NOT_FOUND"


class CharacterMotionInvalidRangeError(AssetError):
    code = "CHARACTER_MOTION_INVALID_RANGE"
