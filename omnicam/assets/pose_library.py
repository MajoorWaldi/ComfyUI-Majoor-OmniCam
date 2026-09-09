"""Source-rig-independent FK pose presets, targeting ``OMNICAM_HUMANOID_V1``.

A pose is a sparse map of canonical joint -> local rotation quaternion
``[x, y, z, w]`` plus an optional root offset (design spec section 26). Presets
live one-per-file under ``<library>/poses/<pose_id>.json``; built-in presets are
served from code.

Only ``neutral`` (the rest pose, no joint overrides) ships as real data. The
other target presets from the spec are authored by the user -- this module must
never fabricate final pose rotations (design spec section 26).
"""

from __future__ import annotations

import json
import math
import re
from pathlib import Path
from typing import Any

from .errors import (
    AssetError,
    PoseInvalidQuaternionError,
    PoseLimitExceededError,
    PoseNotFoundError,
    PoseProfileMismatchError,
)
from .storage import ensure_library_tree, resolve_library_root, resolve_within

HUMANOID_PROFILE = "omnicam_humanoid_v1"
MAX_POSE_JOINTS = 128
MAX_JOINT_ID_CHARS = 64
MAX_POSE_ID_CHARS = 80
_QUAT_NORM_TOLERANCE = 1e-3

_SLUG = re.compile(r"^[a-z0-9][a-z0-9_-]*$")

#: Rest pose: an empty override map is the asset's own bind pose.
BUILTIN_POSES: tuple[dict[str, Any], ...] = (
    {
        "id": "neutral",
        "name": "Standing Neutral",
        "profile": HUMANOID_PROFILE,
        "root_offset": [0.0, 0.0, 0.0],
        "joints": {},
        "builtin": True,
    },
)
_BUILTIN_IDS = frozenset(p["id"] for p in BUILTIN_POSES)


def _poses_dir(input_root: Path | str | None) -> Path:
    return resolve_library_root(input_root) / "poses"


def _normalised_quaternion(joint: str, raw: Any) -> list[float]:
    if not isinstance(raw, (list, tuple)) or len(raw) != 4:
        raise PoseInvalidQuaternionError(f"joint {joint!r}: quaternion must be [x, y, z, w]")
    try:
        values = [float(v) for v in raw]
    except (TypeError, ValueError) as exc:
        raise PoseInvalidQuaternionError(f"joint {joint!r}: non-numeric quaternion") from exc
    if any(not math.isfinite(v) for v in values):
        raise PoseInvalidQuaternionError(f"joint {joint!r}: non-finite quaternion")
    length = math.sqrt(sum(v * v for v in values))
    if length <= 1e-8:
        raise PoseInvalidQuaternionError(f"joint {joint!r}: zero-length quaternion")
    # Accept a slightly off-unit quaternion by renormalising below; reject one
    # that is grossly non-unit (a sign the client sent the wrong thing).
    if abs(length - 1.0) > _QUAT_NORM_TOLERANCE and not 0.5 < length < 2.0:
        raise PoseInvalidQuaternionError(f"joint {joint!r}: quaternion is not close to unit length")
    return [v / length for v in values]


def validate_pose(raw: Any) -> dict[str, Any]:
    """Structurally validate a pose payload and return a canonical copy."""
    if not isinstance(raw, dict):
        raise AssetError("pose must be an object", code="POSE_INVALID_QUATERNION")
    pose_id = str(raw.get("id", "")).strip().lower()
    if not pose_id or not _SLUG.match(pose_id) or len(pose_id) > MAX_POSE_ID_CHARS:
        raise AssetError(f"pose id is not a slug: {raw.get('id')!r}", code="POSE_NOT_FOUND")
    profile = str(raw.get("profile", HUMANOID_PROFILE)).strip().lower()
    if profile != HUMANOID_PROFILE:
        raise PoseProfileMismatchError(f"pose targets {profile!r}, expected {HUMANOID_PROFILE!r}")

    offset_raw = raw.get("root_offset", [0.0, 0.0, 0.0])
    if not isinstance(offset_raw, (list, tuple)) or len(offset_raw) != 3:
        raise AssetError("root_offset must be [x, y, z]", code="POSE_INVALID_QUATERNION")
    try:
        root_offset = [float(v) for v in offset_raw]
    except (TypeError, ValueError) as exc:
        raise AssetError("root_offset must be numeric", code="POSE_INVALID_QUATERNION") from exc
    if any(not math.isfinite(v) for v in root_offset):
        raise AssetError("root_offset must be finite", code="POSE_INVALID_QUATERNION")

    joints_raw = raw.get("joints", {})
    if not isinstance(joints_raw, dict):
        raise AssetError("joints must be an object", code="POSE_INVALID_QUATERNION")
    if len(joints_raw) > MAX_POSE_JOINTS:
        raise PoseLimitExceededError(f"pose has more than {MAX_POSE_JOINTS} joints")
    joints: dict[str, list[float]] = {}
    for joint, quat in joints_raw.items():
        joint_id = str(joint).strip().lower()
        if not joint_id or not _SLUG.match(joint_id) or len(joint_id) > MAX_JOINT_ID_CHARS:
            raise AssetError(f"invalid joint id: {joint!r}", code="POSE_INVALID_QUATERNION")
        joints[joint_id] = _normalised_quaternion(joint_id, quat)

    return {
        "id": pose_id,
        "name": str(raw.get("name", "")).strip() or pose_id,
        "profile": HUMANOID_PROFILE,
        "root_offset": root_offset,
        "joints": joints,
        "builtin": False,
    }


def list_poses(input_root: Path | str | None = None) -> list[dict[str, Any]]:
    """Built-in presets first, then custom poses sorted by id."""
    out: list[dict[str, Any]] = [dict(p) for p in BUILTIN_POSES]
    poses_dir = _poses_dir(input_root)
    if poses_dir.is_dir():
        for path in sorted(poses_dir.glob("*.json")):
            try:
                stored = json.loads(path.read_text(encoding="utf-8"))
                out.append(validate_pose(stored))
            except (OSError, ValueError, AssetError):
                continue
    return out


def get_pose(input_root: Path | str | None, pose_id: str) -> dict[str, Any]:
    for pose in list_poses(input_root):
        if pose["id"] == pose_id:
            return pose
    raise PoseNotFoundError(f"no pose with id {pose_id!r}")


def save_pose(input_root: Path | str | None, raw: Any) -> dict[str, Any]:
    pose = validate_pose(raw)
    if pose["id"] in _BUILTIN_IDS:
        raise AssetError(f"pose id {pose['id']!r} is reserved for a built-in preset",
                         code="POSE_PROFILE_MISMATCH")
    ensure_library_tree(input_root)
    path = resolve_within(_poses_dir(input_root), f"{pose['id']}.json")
    tmp = path.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(pose, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)
    return pose


def delete_pose(input_root: Path | str | None, pose_id: str) -> None:
    if pose_id in _BUILTIN_IDS:
        raise AssetError(f"pose {pose_id!r} is a built-in preset and cannot be deleted",
                         code="POSE_PROFILE_MISMATCH")
    path = resolve_within(_poses_dir(input_root), f"{pose_id}.json")
    try:
        path.unlink()
    except FileNotFoundError as exc:
        raise PoseNotFoundError(f"no pose with id {pose_id!r}") from exc
