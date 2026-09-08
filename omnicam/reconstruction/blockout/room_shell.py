"""Turn fitted ground/wall planes into MotionScene-ready room proxies.

The depth-mesh path builds its room proxies inline in ``scene_builder`` with a
full normal-alignment rotation. The blockout room shell is deliberately coarser
-- an axis-aligned ground slab plus yaw-only wall slabs -- because it is a
blocking aid the artist adjusts, not a measurement. The two must still agree on
the one thing that used to be wrong: ground maps XZ->XZ, walls honour their
normal.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any

from ..rotation_utils import euler_aligning_axis_to_normal

#: Thin dimension of the ground slab and wall slabs (metres, scene-scaled).
GROUND_THICKNESS = 0.03
WALL_THICKNESS = 0.02


@dataclass(slots=True)
class RoomProxy:
    object_id: str
    primitive: str
    position: tuple[float, float, float]
    rotation: tuple[float, float, float]
    size: tuple[float, float, float]
    confidence: float

    def to_dict(self) -> dict[str, Any]:
        return {
            "object_id": self.object_id,
            "primitive": self.primitive,
            "position": list(self.position),
            "rotation": list(self.rotation),
            "size": list(self.size),
            "confidence": float(max(0.0, min(1.0, self.confidence))),
        }


def wall_yaw_from_normal(normal: tuple[float, float, float]) -> float:
    """Yaw (degrees, about world up) that turns a +Z-facing slab to face ``normal``."""
    nx, _, nz = normal
    return math.degrees(math.atan2(nx, nz))


def _ground_proxy(plane: Any, index: int) -> RoomProxy:
    cx, cy, cz = (float(plane.center[0]), float(plane.center[1]), float(plane.center[2]))
    sx, sz = (float(plane.size[0]), float(plane.size[1]))
    # The ground slab is thin along its local +Y ("up") face; aligning that to
    # the fitted normal keeps a slightly tilted floor from rendering dead flat,
    # and keeps the proxy coplanar with the RANSAC plane the objects sit on.
    rx, ry, rz = euler_aligning_axis_to_normal((0.0, 1.0, 0.0), tuple(plane.normal))
    return RoomProxy(
        object_id=f"reconstruction_ground_{index}" if index else "reconstruction_ground",
        primitive="ground",
        position=(cx, cy, cz),
        rotation=(rx, ry, rz),
        # XZ -> XZ: the detected Z footprint stays the Z extent; only the thin Y
        # dimension is synthesised. The old (x, z, 1) mapping is the bug this
        # fixes.
        size=(sx, GROUND_THICKNESS, sz),
        confidence=float(getattr(plane, "confidence", 0.0)),
    )


def _wall_proxy(plane: Any, index: int) -> RoomProxy:
    cx, cy, cz = (float(plane.center[0]), float(plane.center[1]), float(plane.center[2]))
    sw, sh = (float(plane.size[0]), float(plane.size[1]))
    return RoomProxy(
        object_id=f"reconstruction_wall_{index}",
        primitive="cube",
        position=(cx, cy, cz),
        rotation=(0.0, wall_yaw_from_normal(tuple(plane.normal)), 0.0),
        size=(sw, sh, WALL_THICKNESS),
        confidence=float(getattr(plane, "confidence", 0.0)),
    )


def build_room_proxies(planes: list[Any]) -> list[RoomProxy]:
    """Convert a list of ``ReconstructedPlane`` into ordered room proxies.

    Ground planes come first, then walls numbered from 1. Input order is
    otherwise preserved so the result is deterministic.
    """
    grounds = [p for p in planes if getattr(p, "plane_type", "") == "ground"]
    walls = [p for p in planes if getattr(p, "plane_type", "") == "wall"]
    proxies: list[RoomProxy] = [_ground_proxy(p, i) for i, p in enumerate(grounds)]
    proxies.extend(_wall_proxy(p, i + 1) for i, p in enumerate(walls))
    return proxies
