"""Deterministic semantic blockout: convert masked 3D evidence into closed
MotionScene primitives.

Nothing in this package holds model tensors, dense point maps or masks on its
public data types -- those stay in ``GeometryEvidence`` / provider scratch and
never enter ``BlockoutScene`` or MotionScene JSON.
"""

from __future__ import annotations

from .compiler import compile_blockout_scene
from .object_fitter import fit_blockout_object
from .room_shell import RoomProxy, build_room_proxies, wall_yaw_from_normal
from .types import (
    AxisConfidence,
    BlockoutObject,
    BlockoutScene,
    InstanceEvidence,
)

__all__ = [
    "AxisConfidence",
    "BlockoutObject",
    "BlockoutScene",
    "InstanceEvidence",
    "RoomProxy",
    "build_room_proxies",
    "compile_blockout_scene",
    "fit_blockout_object",
    "wall_yaw_from_normal",
]
