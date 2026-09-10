"""Build a minimal binary FBX (v7400) with a real bone hierarchy for tests.

Just enough structure for :mod:`omnicam.assets.bootstrap.fbx_inspect`:
``Objects`` with ``Model`` (LimbNode) records + one ``Geometry``, and
``Connections`` (``C`` "OO" child->parent). No third-party FBX writer.
"""

from __future__ import annotations

import struct
from dataclasses import dataclass, field

# canonical-alias biped + a couple of IK control bones that must be ignored.
FBX_HUMANOID: dict[str, str | None] = {
    "Hips": None,
    "Spine": "Hips",
    "Chest": "Spine",
    "UpperChest": "Chest",
    "Neck": "UpperChest",
    "Head": "Neck",
    "LeftShoulder": "UpperChest",
    "LeftArm": "LeftShoulder",
    "LeftForeArm": "LeftArm",
    "LeftHand": "LeftForeArm",
    "RightShoulder": "UpperChest",
    "RightArm": "RightShoulder",
    "RightForeArm": "RightArm",
    "RightHand": "RightForeArm",
    "LeftUpLeg": "Hips",
    "LeftLeg": "LeftUpLeg",
    "LeftFoot": "LeftLeg",
    "LeftToes": "LeftFoot",
    "RightUpLeg": "Hips",
    "RightLeg": "RightUpLeg",
    "RightFoot": "RightLeg",
    "RightToes": "RightFoot",
    # control bones -- deform_joint_names() must drop these:
    "LeftFootIK": "Hips",
    "HipsCtrl": None,
    "Head_end": "Head",
}

_NULL_RECORD = b"\x00" * 13


@dataclass
class _Node:
    name: str
    props: list[bytes] = field(default_factory=list)
    children: list[_Node] = field(default_factory=list)


def _s(value: str) -> bytes:
    raw = value.encode("latin1")
    return b"S" + struct.pack("<I", len(raw)) + raw


def _l(value: int) -> bytes:
    return b"L" + struct.pack("<q", value)


def _i_array(values: list[int]) -> bytes:
    raw = struct.pack(f"<{len(values)}i", *values)
    return b"i" + struct.pack("<III", len(values), 0, len(raw)) + raw


def _d_array(values: list[float]) -> bytes:
    raw = struct.pack(f"<{len(values)}d", *values)
    return b"d" + struct.pack("<III", len(values), 0, len(raw)) + raw


def _serialize(node: _Node, start: int) -> bytes:
    name_b = node.name.encode("latin1")
    body = b"".join(node.props)
    pos = start + 13 + len(name_b) + len(body)
    child_blobs: list[bytes] = []
    for child in node.children:
        blob = _serialize(child, pos)
        child_blobs.append(blob)
        pos += len(blob)
    if node.children:
        pos += len(_NULL_RECORD)
    end_offset = pos
    return (
        struct.pack("<III", end_offset, len(node.props), len(body))
        + struct.pack("<B", len(name_b))
        + name_b
        + body
        + b"".join(child_blobs)
        + (_NULL_RECORD if node.children else b"")
    )


def build_humanoid_fbx(
    *,
    hierarchy: dict[str, str | None] | None = None,
    vertex_count: int = 240,
    triangle_count: int = 360,
    animation_stacks: tuple[str, ...] = (),
) -> bytes:
    hierarchy = hierarchy or FBX_HUMANOID
    names = list(hierarchy)
    ids = {name: 1000 + i for i, name in enumerate(names)}

    objects = _Node("Objects")
    for name in names:
        objects.children.append(
            _Node("Model", [_l(ids[name]), _s(f"{name}\x00\x01Model"), _s("LimbNode")])
        )
    for i, stack in enumerate(animation_stacks):
        objects.children.append(
            _Node("AnimationStack", [_l(7000 + i), _s(f"{stack}\x00\x01AnimStack"), _s("")])
        )
    objects.children.append(
        _Node("Geometry", [_l(9999), _s("mesh\x00\x01Geometry"), _s("Mesh")], [
            _Node("Vertices", [_d_array([0.0] * (vertex_count * 3))]),
            _Node("PolygonVertexIndex", [_i_array([0, 1, -3] * triangle_count)]),
        ])
    )

    connections = _Node("Connections")
    for name, parent in hierarchy.items():
        if parent is not None:
            connections.children.append(
                _Node("C", [_s("OO"), _l(ids[name]), _l(ids[parent])])
            )

    header = b"Kaydara FBX Binary  \x00\x1a\x00" + struct.pack("<I", 7400)
    out = bytearray(header)
    for record in (objects, connections):
        blob = _serialize(record, len(out))
        out += blob
    out += _NULL_RECORD
    return bytes(out)
