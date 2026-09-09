"""Read a GLB's JSON chunk only -- never the binary geometry (plan section 12).

The bootstrap scans hundreds of candidate GLBs to find real rigs. Parsing just
the 12-byte header + JSON chunk yields node / joint / animation names, a
skin flag and an accessor-based vertex / triangle count that matches OmniCam's
existing upload complexity check (``omnicam.routes._validate_model_complexity``).

Rig evidence is derived through the canonical mapper
(:func:`omnicam.assets.rig.auto_map_bones`) -- this module never defines its own
bone aliases (plan section 1.4).
"""

from __future__ import annotations

import json
import struct
from dataclasses import dataclass, field

from ..rig import (
    auto_map_bones,
    hierarchy_is_plausible,
    missing_required_joints,
)
from .archive import ArchiveMember, open_member
from .types import EXIT_DOWNLOAD, MAX_GLB_JSON_BYTES, BootstrapError

_GLB_MAGIC = b"glTF"
_JSON_CHUNK = b"JSON"


def _fail(message: str) -> BootstrapError:
    return BootstrapError(message, exit_code=EXIT_DOWNLOAD)


@dataclass(frozen=True, slots=True)
class GlbInfo:
    version: int
    total_bytes: int
    node_names: tuple[str, ...]
    joint_names: tuple[str, ...]
    animation_names: tuple[str, ...]
    has_skin: bool
    vertex_count: int
    triangle_count: int
    accessor_bounds: tuple[float, float, float] | None
    #: source bone name -> ancestor source bone names, nearest first. Empty when
    #: the file has no skin / node tree to walk.
    joint_parents: dict[str, tuple[str, ...]] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class RigEvidence:
    bone_map: dict[str, str]
    missing: tuple[str, ...]
    complete: bool
    hierarchy_ok: bool


def inspect_glb_stream(stream, declared_size: int) -> GlbInfo:
    """Parse ``stream`` (positioned at byte 0) as GLB v2; read only the JSON."""
    header = stream.read(12)
    if len(header) != 12:
        raise _fail("truncated GLB header")
    magic, version, total = struct.unpack("<4sII", header)
    if magic != _GLB_MAGIC or version != 2:
        raise _fail("not a GLB v2 container")
    if declared_size and total != declared_size:
        raise _fail(f"GLB total-length {total} != declared {declared_size}")

    chunk_header = stream.read(8)
    if len(chunk_header) != 8:
        raise _fail("missing GLB JSON chunk header")
    json_len, chunk_type = struct.unpack("<I4s", chunk_header)
    if chunk_type != _JSON_CHUNK:
        raise _fail("first GLB chunk is not JSON")
    if json_len > MAX_GLB_JSON_BYTES:
        raise _fail(f"GLB JSON chunk is {json_len} bytes (max {MAX_GLB_JSON_BYTES})")
    payload = stream.read(json_len)
    if len(payload) != json_len:
        raise _fail("truncated GLB JSON chunk")
    try:
        document = json.loads(payload.decode("utf-8"))
    except ValueError as exc:
        raise _fail(f"GLB JSON is not valid: {exc}") from exc

    nodes = document.get("nodes") or []
    node_names = tuple(str(n.get("name") or f"node_{i}") for i, n in enumerate(nodes))
    skins = document.get("skins") or []
    joint_indices = sorted(
        {
            int(index)
            for skin in skins
            for index in (skin.get("joints") or [])
            if isinstance(index, int) and 0 <= index < len(nodes)
        }
    )
    joint_names = tuple(node_names[i] for i in joint_indices)
    animations = tuple(
        str(anim.get("name") or f"Animation_{i + 1}")
        for i, anim in enumerate(document.get("animations") or [])
    )
    vertices, triangles = _count_geometry(document)
    bounds = _approx_accessor_bounds(document)
    parents = _joint_parents(nodes, node_names, set(joint_indices))
    return GlbInfo(
        version=version,
        total_bytes=total,
        node_names=node_names,
        joint_names=joint_names,
        animation_names=animations,
        has_skin=bool(joint_indices),
        vertex_count=vertices,
        triangle_count=triangles,
        accessor_bounds=bounds,
        joint_parents=parents,
    )


def inspect_glb_member(member: ArchiveMember) -> GlbInfo:
    stream = open_member(member)
    try:
        return inspect_glb_stream(stream, member.size)
    finally:
        stream.close()


def build_rig_evidence(info: GlbInfo) -> RigEvidence:
    """Map ``info``'s joint names through the canonical mapper and score it."""
    bone_map = auto_map_bones(list(info.joint_names)) if info.has_skin else {}
    missing = tuple(missing_required_joints(bone_map))
    hierarchy_ok = hierarchy_is_plausible(bone_map, info.joint_parents)
    complete = bool(info.has_skin) and not missing and hierarchy_ok
    return RigEvidence(
        bone_map=bone_map,
        missing=missing,
        complete=complete,
        hierarchy_ok=hierarchy_ok,
    )


# -- internals ----------------------------------------------------------------

def _count_geometry(document: dict) -> tuple[int, int]:
    """Vertex / triangle totals from accessor counts -- matches the upload
    complexity guard in ``omnicam.routes._validate_model_complexity``."""
    accessors = document.get("accessors") or []
    vertices = triangles = 0
    for mesh in document.get("meshes") or []:
        for primitive in mesh.get("primitives") or []:
            if int(primitive.get("mode", 4)) != 4:
                continue
            position_index = (primitive.get("attributes") or {}).get("POSITION")
            position_count = 0
            if isinstance(position_index, int) and 0 <= position_index < len(accessors):
                position_count = int(accessors[position_index].get("count", 0))
                vertices += position_count
            index_index = primitive.get("indices")
            if isinstance(index_index, int) and 0 <= index_index < len(accessors):
                triangles += int(accessors[index_index].get("count", 0)) // 3
            else:
                triangles += position_count // 3
    return vertices, triangles


def _approx_accessor_bounds(document: dict) -> tuple[float, float, float] | None:
    """Largest POSITION accessor bounding box as ``(dx, dy, dz)``, or ``None``."""
    accessors = document.get("accessors") or []
    best: tuple[float, float, float] | None = None
    best_volume = -1.0
    for mesh in document.get("meshes") or []:
        for primitive in mesh.get("primitives") or []:
            position_index = (primitive.get("attributes") or {}).get("POSITION")
            if not isinstance(position_index, int) or not 0 <= position_index < len(accessors):
                continue
            accessor = accessors[position_index]
            lo, hi = accessor.get("min"), accessor.get("max")
            if not (isinstance(lo, list) and isinstance(hi, list) and len(lo) == len(hi) == 3):
                continue
            try:
                extent = tuple(abs(float(h) - float(low)) for low, h in zip(lo, hi, strict=True))
            except (TypeError, ValueError):
                continue
            volume = extent[0] * extent[1] * extent[2]
            if volume > best_volume:
                best_volume = volume
                best = (extent[0], extent[1], extent[2])
    return best


def _joint_parents(
    nodes: list, node_names: tuple[str, ...], joint_indices: set[int]
) -> dict[str, tuple[str, ...]]:
    """For every skin joint, its ancestor bone names ordered nearest-first."""
    if not joint_indices:
        return {}
    parent_of: dict[int, int] = {}
    for index, node in enumerate(nodes):
        for child in node.get("children") or []:
            if isinstance(child, int) and 0 <= child < len(nodes):
                parent_of[child] = index
    out: dict[str, tuple[str, ...]] = {}
    for joint in joint_indices:
        chain: list[str] = []
        cursor = parent_of.get(joint)
        seen: set[int] = {joint}
        while cursor is not None and cursor not in seen:
            seen.add(cursor)
            chain.append(node_names[cursor])
            cursor = parent_of.get(cursor)
        out[node_names[joint]] = tuple(chain)
    return out
