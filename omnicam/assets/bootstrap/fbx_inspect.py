"""Read a binary FBX's node tree just enough to find its skeleton.

Kenney's *Animated Characters* packs ship a real full biped rig -- but as FBX,
not GLB. This parser walks the FBX binary node records (no third-party library,
plan section 8) and pulls out the ``LimbNode`` bones, their parent links, a
polygon count and any embedded animation-stack names, in the same
:class:`~omnicam.assets.bootstrap.glb_inspect.GlbInfo`-shaped struct so
``build_rig_evidence`` treats a GLB and an FBX identically.

ASCII FBX and FBX < 7.1 are rejected -- Kenney's are binary 7.4/7.5.
"""

from __future__ import annotations

import struct
from dataclasses import dataclass, field

from .archive import ArchiveMember, open_member
from .types import EXIT_DOWNLOAD, MAX_MEMBER_BYTES, BootstrapError

_MAGIC = b"Kaydara FBX Binary  \x00"
_MAX_NODES = 500_000
_MAX_DEPTH = 64
_BONE_SUBCLASSES = frozenset({"LimbNode", "Limb", "Root"})


def _fail(message: str) -> BootstrapError:
    return BootstrapError(message, exit_code=EXIT_DOWNLOAD)


@dataclass(frozen=True, slots=True)
class FbxInfo:
    version: int
    total_bytes: int
    node_names: tuple[str, ...]
    joint_names: tuple[str, ...]
    animation_names: tuple[str, ...]
    has_skin: bool
    vertex_count: int
    triangle_count: int
    accessor_bounds: tuple[float, float, float] | None
    joint_parents: dict[str, tuple[str, ...]] = field(default_factory=dict)


def inspect_fbx_bytes(data: bytes) -> FbxInfo:
    if len(data) < 27 or not data.startswith(_MAGIC):
        raise _fail("not a binary FBX container")
    if len(data) > MAX_MEMBER_BYTES:
        raise _fail(f"FBX is {len(data)} bytes (max {MAX_MEMBER_BYTES})")
    version = struct.unpack_from("<I", data, 23)[0]
    if version < 7100:
        raise _fail(f"FBX version {version} is too old to inspect")
    wide = version >= 7500

    models: dict[int, tuple[str, str]] = {}
    connections: list[tuple[str, int, int]] = []
    anim_stacks: list[str] = []
    geometry = {"verts": 0, "poly_indices": 0}
    seen = [0]

    _walk(data, 27, wide, 0, models, connections, anim_stacks, geometry, seen)

    bones = {oid: name for oid, (name, sub) in models.items() if sub in _BONE_SUBCLASSES}
    parent_of: dict[int, int] = {}
    for kind, src, dst in connections:
        if kind == "OO" and src in bones and dst in bones and src != dst:
            parent_of.setdefault(src, dst)

    joint_parents: dict[str, tuple[str, ...]] = {}
    for oid, name in bones.items():
        chain: list[str] = []
        cursor = parent_of.get(oid)
        visited = {oid}
        while cursor is not None and cursor not in visited:
            visited.add(cursor)
            chain.append(bones[cursor])
            cursor = parent_of.get(cursor)
        joint_parents[name] = tuple(chain)

    # PolygonVertexIndex is a flat index buffer, one negatively-encoded index
    # per polygon end. Without decoding the (possibly deflated) array we take
    # the triangulated upper bound indices/3 -- precise enough for the
    # max_triangles curation gate.
    triangles = geometry["poly_indices"] // 3
    return FbxInfo(
        version=version,
        total_bytes=len(data),
        node_names=tuple(name for name, _ in models.values()),
        joint_names=tuple(bones.values()),
        animation_names=tuple(dict.fromkeys(anim_stacks)),
        has_skin=bool(bones),
        vertex_count=geometry["verts"],
        triangle_count=triangles,
        accessor_bounds=None,
        joint_parents=joint_parents,
    )


def inspect_fbx_member(member: ArchiveMember) -> FbxInfo:
    stream = open_member(member)
    try:
        return inspect_fbx_bytes(stream.read(MAX_MEMBER_BYTES + 1))
    finally:
        stream.close()


# -- binary node walk ---------------------------------------------------------

def _u(data: bytes, pos: int, wide: bool) -> tuple[int, int, int]:
    """``(end_offset, num_properties, body_pos)`` for the node record at ``pos``."""
    if wide:
        end, nprop, _plen = struct.unpack_from("<QQQ", data, pos)
        return end, nprop, pos + 24
    end, nprop, _plen = struct.unpack_from("<III", data, pos)
    return end, nprop, pos + 12


_SCALAR = {"C": 1, "B": 1, "Y": 2, "I": 4, "F": 4, "D": 8, "L": 8}
_SCALAR_FMT = {"Y": "<h", "I": "<i", "F": "<f", "D": "<d", "L": "<q"}


def _read_props(data: bytes, pos: int, count: int) -> tuple[list, int]:
    out: list = []
    for _ in range(count):
        tag = chr(data[pos])
        pos += 1
        if tag in _SCALAR:
            size = _SCALAR[tag]
            if tag in ("C", "B"):
                out.append(("int", data[pos]))
            else:
                out.append(("int" if tag in "YIL" else "float",
                            struct.unpack_from(_SCALAR_FMT[tag], data, pos)[0]))
            pos += size
        elif tag in "SR":
            length = struct.unpack_from("<I", data, pos)[0]
            out.append(("str", bytes(data[pos + 4:pos + 4 + length])))
            pos += 4 + length
        elif tag in "fdlib":
            entries, _enc, comp = struct.unpack_from("<III", data, pos)
            out.append(("arr", entries))
            pos += 12 + comp
        else:
            raise _fail(f"unknown FBX property tag {tag!r}")
    return out, pos


def _walk(data, pos, wide, depth, models, connections, anim_stacks, geometry, seen):
    term = 25 if wide else 13
    limit = len(data) - term
    while pos < limit:
        if seen[0] > _MAX_NODES or depth > _MAX_DEPTH:
            raise _fail("FBX node tree is implausibly large")
        end, nprop, body = _u(data, pos, wide)
        if end == 0:
            return pos + (25 if wide else 13)
        seen[0] += 1
        name_len = data[body]
        body += 1
        name = bytes(data[body:body + name_len]).decode("latin1")
        body += name_len
        props, after_props = _read_props(data, body, nprop)
        _record(name, props, models, connections, anim_stacks, geometry)
        child = after_props
        while child < end - term + 1:
            nxt = _walk(data, child, wide, depth + 1, models, connections, anim_stacks, geometry, seen)
            if nxt is None or nxt <= child:
                break
            child = nxt
        pos = end
    return pos


def _record(name, props, models, connections, anim_stacks, geometry):
    if name == "Model" and len(props) >= 3 and props[0][0] == "int":
        label = props[1][1].split(b"\x00\x01")[0].decode("latin1") if props[1][0] == "str" else ""
        subclass = props[2][1].decode("latin1") if props[2][0] == "str" else ""
        models[props[0][1]] = (label, subclass)
    elif name == "C" and len(props) >= 3 and props[0][0] == "str" and props[1][0] == "int" and props[2][0] == "int":
        connections.append((props[0][1].decode("latin1"), props[1][1], props[2][1]))
    elif name == "AnimationStack" and len(props) >= 2 and props[1][0] == "str":
        anim_stacks.append(props[1][1].split(b"\x00\x01")[0].decode("latin1"))
    elif name == "Vertices" and props and props[0][0] == "arr":
        geometry["verts"] = max(geometry["verts"], props[0][1] // 3)
    elif name == "PolygonVertexIndex" and props and props[0][0] == "arr":
        geometry["poly_indices"] += props[0][1]
