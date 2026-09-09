"""Build minimal but structurally real GLB v2 bytes for bootstrap tests.

header + JSON chunk + (empty) BIN chunk. Enough nodes / skins / animations /
accessors to exercise :mod:`omnicam.assets.bootstrap.glb_inspect` and the
canonical rig mapper without shipping a binary fixture (plan section 26).
"""

from __future__ import annotations

import json
import struct

#: Canonical-alias humanoid hierarchy (plan section 26). ``root`` shares the
#: Hips bone with ``pelvis``, matching the auto-mapper.
HUMANOID_HIERARCHY: dict[str, str | None] = {
    "Hips": None,
    "Spine": "Hips",
    "Spine2": "Spine",
    "Neck": "Spine2",
    "Head": "Neck",
    "LeftShoulder": "Spine2",
    "LeftArm": "LeftShoulder",
    "LeftForeArm": "LeftArm",
    "LeftHand": "LeftForeArm",
    "RightShoulder": "Spine2",
    "RightArm": "RightShoulder",
    "RightForeArm": "RightArm",
    "RightHand": "RightForeArm",
    "LeftUpLeg": "Hips",
    "LeftLeg": "LeftUpLeg",
    "LeftFoot": "LeftLeg",
    "LeftToeBase": "LeftFoot",
    "RightUpLeg": "Hips",
    "RightLeg": "RightUpLeg",
    "RightFoot": "RightLeg",
    "RightToeBase": "RightFoot",
}


def _pack_glb(document: dict, bin_length: int = 0) -> bytes:
    json_bytes = json.dumps(document, separators=(",", ":")).encode("utf-8")
    json_pad = (-len(json_bytes)) % 4
    json_bytes += b" " * json_pad
    bin_pad = (-bin_length) % 4
    total = 12 + 8 + len(json_bytes)
    if bin_length or bin_pad:
        total += 8 + bin_length + bin_pad
    out = bytearray()
    out += struct.pack("<4sII", b"glTF", 2, total)
    out += struct.pack("<I4s", len(json_bytes), b"JSON")
    out += json_bytes
    if bin_length or bin_pad:
        out += struct.pack("<I4s", bin_length + bin_pad, b"BIN\x00")
        out += b"\x00" * (bin_length + bin_pad)
    return bytes(out)


def _nodes_from_hierarchy(hierarchy: dict[str, str | None]) -> tuple[list[dict], list[int]]:
    names = list(hierarchy)
    index_of = {name: i for i, name in enumerate(names)}
    nodes: list[dict] = [{"name": name} for name in names]
    for name, parent in hierarchy.items():
        if parent is not None:
            nodes[index_of[parent]].setdefault("children", []).append(index_of[name])
    joints = list(range(len(names)))
    return nodes, joints


def build_humanoid_glb(
    *,
    drop_joints: tuple[str, ...] = (),
    with_skin: bool = True,
    animation_names: tuple[str, ...] = (),
    vertex_count: int = 900,
    triangle_count: int = 300,
    scramble: bool = False,
) -> bytes:
    """A rigged humanoid GLB. ``drop_joints`` removes bones from the skin;
    ``with_skin=False`` yields a static mesh that merely has animations."""
    hierarchy = {k: v for k, v in HUMANOID_HIERARCHY.items() if k not in drop_joints}
    nodes, joints = _nodes_from_hierarchy(hierarchy)
    if scramble:  # joint order must not change the mapping result
        joints = list(reversed(joints))
    document: dict = {
        "asset": {"version": "2.0"},
        "scenes": [{"nodes": [0]}],
        "nodes": nodes,
        "accessors": [
            {"type": "VEC3", "componentType": 5126, "count": vertex_count,
             "min": [-0.3, 0.0, -0.2], "max": [0.3, 1.75, 0.2]},
            {"type": "SCALAR", "componentType": 5125, "count": triangle_count * 3},
        ],
        "meshes": [
            {"primitives": [{"mode": 4, "attributes": {"POSITION": 0}, "indices": 1}]}
        ],
    }
    if with_skin:
        document["skins"] = [{"joints": joints}]
    if animation_names:
        document["animations"] = [{"name": name, "channels": [], "samplers": []}
                                  for name in animation_names]
    return _pack_glb(document, bin_length=0)


def build_static_glb(
    *, vertex_count: int = 1200, triangle_count: int = 400,
    extent: tuple[float, float, float] = (1.0, 0.75, 0.7),
) -> bytes:
    """A non-rigged prop GLB (no skins, no joints)."""
    ex, ey, ez = extent
    document = {
        "asset": {"version": "2.0"},
        "nodes": [{"name": "Prop"}],
        "scenes": [{"nodes": [0]}],
        "accessors": [
            {"type": "VEC3", "componentType": 5126, "count": vertex_count,
             "min": [0.0, 0.0, 0.0], "max": [ex, ey, ez]},
            {"type": "SCALAR", "componentType": 5125, "count": triangle_count * 3},
        ],
        "meshes": [
            {"primitives": [{"mode": 4, "attributes": {"POSITION": 0}, "indices": 1}]}
        ],
    }
    return _pack_glb(document, bin_length=0)
