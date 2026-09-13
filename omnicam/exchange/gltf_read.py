"""Read a camera out of a glTF / GLB file.

This is the import counterpart of gltf.py, and the reason the importer is not
tied to one application: Blender, Maya, Unreal, Unity, Houdini and most trackers
can all write a glTF camera, so one reader covers them all.

Only what a camera needs is decoded -- the node that references a camera, its
transform, and any animation channels targeting it. Meshes, materials and skins
are ignored.
"""

from __future__ import annotations

import base64
import json
import math
import struct
from typing import Any

from ..core.camera_math import (  # noqa: F401  (euler_from_quaternion re-exported for callers)
    euler_from_quaternion,
    multiply_quaternions,
    rotate_quaternion,
)

GLB_MAGIC = 0x46546C67
JSON_CHUNK = 0x4E4F534A
BIN_CHUNK = 0x004E4942

MAX_SAMPLES = 200_000
COMPONENT_FORMATS = {5126: ("f", 4)}
COMPONENT_COUNTS = {"SCALAR": 1, "VEC3": 3, "VEC4": 4}


def parse_container(data: bytes) -> tuple[dict[str, Any], bytes]:
    """Accept either a .glb container or raw .gltf JSON."""
    if len(data) >= 12 and struct.unpack("<I", data[:4])[0] == GLB_MAGIC:
        total = struct.unpack("<I", data[8:12])[0]
        offset = 12
        document: dict[str, Any] | None = None
        buffer = b""
        while offset + 8 <= min(total, len(data)):
            length, kind = struct.unpack("<II", data[offset:offset + 8])
            payload = data[offset + 8:offset + 8 + length]
            if kind == JSON_CHUNK:
                document = json.loads(payload.decode("utf-8"))
            elif kind == BIN_CHUNK:
                buffer = payload
            offset += 8 + length
        if document is None:
            raise ValueError("GLB file has no JSON chunk")
        return document, buffer
    return json.loads(data.decode("utf-8")), b""


def _buffer_bytes(document: dict[str, Any], binary_chunk: bytes) -> list[bytes]:
    buffers = []
    for buffer in document.get("buffers", []):
        uri = buffer.get("uri")
        if not uri:
            buffers.append(binary_chunk)
        elif uri.startswith("data:"):
            buffers.append(base64.b64decode(uri.split(",", 1)[1]))
        else:
            # An external .bin next to the file is not available to us here.
            raise ValueError("glTF references an external buffer, which cannot be read from an upload")
    return buffers


def read_accessor(document: dict[str, Any], buffers: list[bytes], index: int) -> list[list[float]]:
    accessor = document["accessors"][index]
    fmt, size = COMPONENT_FORMATS.get(accessor["componentType"], (None, 0))
    if fmt is None:
        raise ValueError(f"unsupported glTF component type {accessor['componentType']}")
    components = COMPONENT_COUNTS.get(accessor["type"])
    if components is None:
        raise ValueError(f"unsupported glTF accessor type {accessor['type']}")
    count = int(accessor["count"])
    if count > MAX_SAMPLES:
        raise ValueError(f"glTF accessor has {count} samples, above the {MAX_SAMPLES} limit")

    view = document["bufferViews"][accessor["bufferView"]]
    data = buffers[view.get("buffer", 0)]
    start = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    stride = view.get("byteStride") or components * size
    values = []
    for element in range(count):
        offset = start + element * stride
        chunk = data[offset:offset + components * size]
        if len(chunk) < components * size:
            raise ValueError("glTF buffer is shorter than its accessor claims")
        values.append(list(struct.unpack(f"<{components}{fmt}", chunk)))
    return values


def _slerp(a: list[float], b: list[float], t: float) -> list[float]:
    """Spherical linear interpolation between two xyzw quaternions.

    A plain component-wise lerp (the previous behavior) does not move at
    constant angular velocity and can visibly swing through the wrong side
    of the rotation for a large angle between keys; slerp is what a glTF
    LINEAR rotation sampler actually specifies."""
    a = _normalize_quaternion(a)
    b = _normalize_quaternion(b)
    dot = sum(a[axis] * b[axis] for axis in range(4))
    if dot < 0.0:
        b = [-value for value in b]
        dot = -dot
    dot = max(-1.0, min(1.0, dot))
    if dot > 0.9995:
        # Nearly identical: nlerp avoids a division by a near-zero sin(theta).
        return _normalize_quaternion([a[axis] + (b[axis] - a[axis]) * t for axis in range(4)])
    theta_0 = math.acos(dot)
    theta = theta_0 * t
    sin_theta_0 = math.sin(theta_0)
    sin_theta = math.sin(theta)
    s0 = math.cos(theta) - dot * sin_theta / sin_theta_0
    s1 = sin_theta / sin_theta_0
    return _normalize_quaternion([a[axis] * s0 + b[axis] * s1 for axis in range(4)])


def _hermite(v0: list[float], out_tangent: list[float], v1: list[float], in_tangent: list[float],
             span: float, s: float) -> list[float]:
    """glTF's CUBICSPLINE Hermite basis, per the spec's animation sampler section."""
    h00 = 2 * s**3 - 3 * s**2 + 1
    h10 = span * (s**3 - 2 * s**2 + s)
    h01 = -2 * s**3 + 3 * s**2
    h11 = span * (s**3 - s**2)
    return [
        h00 * v0[axis] + h10 * out_tangent[axis] + h01 * v1[axis] + h11 * in_tangent[axis]
        for axis in range(len(v0))
    ]


def _evaluate_channel(channel: dict[str, Any], time: float, *, is_rotation: bool) -> list[float]:
    """Sample one glTF animation channel at ``time``, honoring its own
    interpolation mode (STEP holds the previous key; LINEAR interpolates,
    slerping a rotation instead of lerping its raw components; CUBICSPLINE
    evaluates the Hermite spline through its in/out tangents rather than
    discarding them)."""
    times = channel["times"]
    values = channel["values"]
    if not times:
        raise ValueError("animation sampler has no input times")

    def finish(value: list[float]) -> list[float]:
        return _normalize_quaternion(value) if is_rotation else list(value)

    if time <= times[0]:
        return finish(values[0])
    if time >= times[-1]:
        return finish(values[-1])

    interpolation = channel.get("interpolation", "LINEAR")
    for index in range(1, len(times)):
        if time > times[index]:
            continue
        t0, t1 = times[index - 1], times[index]
        if interpolation == "STEP":
            return finish(values[index - 1])
        span = t1 - t0
        s = 0.0 if span <= 0 else (time - t0) / span
        if interpolation == "CUBICSPLINE":
            result = _hermite(
                values[index - 1], channel["out_tangents"][index - 1],
                values[index], channel["in_tangents"][index],
                span, s,
            )
            return finish(result)
        a, b = values[index - 1], values[index]
        if is_rotation:
            return _slerp(a, b, s)
        return [a[axis] + (b[axis] - a[axis]) * s for axis in range(len(a))]
    return finish(values[-1])


def read_camera_track(data: bytes, fps: int = 24, width: int = 1280, height: int = 720) -> dict[str, Any]:
    """Extract the first camera in the file as a canonical OmniCam track payload."""
    document, binary_chunk = parse_container(data)
    nodes = document.get("nodes", [])
    cameras = document.get("cameras", [])
    if not cameras:
        raise ValueError("this file contains no camera")

    node_index = next((index for index, node in enumerate(nodes) if "camera" in node), None)
    if node_index is None:
        raise ValueError("the file has a camera but no node using it")
    node = nodes[node_index]
    camera = cameras[node["camera"]]

    orthographic = camera.get("type") == "orthographic" and "orthographic" in camera
    lens = camera.get("orthographic") if orthographic else (camera.get("perspective") or {})
    lens = lens or {}
    base_fov = 35.0 if orthographic else math.degrees(float(lens.get("yfov", 0.6108652381980153)))
    # projection.py defines the ortho half-height as 5 / zoom.
    zoom = 5.0 / max(1e-4, float(lens.get("ymag", 5.0))) if orthographic else 1.0
    near = float(lens.get("znear", 0.01))
    far = float(lens.get("zfar", 10000.0))

    # A file we wrote carries the canonical track verbatim, which restores the
    # look-at distance, the animated fov and the authored interpolation that a
    # standard glTF camera node simply cannot hold.
    extras = (document.get("extras") or {}).get("omnicam") or {}
    original = extras.get("track")
    if isinstance(original, dict) and original.get("keyframes"):
        return original

    fps = max(1, int(extras.get("baked_fps", fps)))

    buffers = _buffer_bytes(document, binary_chunk) if document.get("buffers") else []

    # The camera node's own transform is only half the story: a parented
    # camera (a coordinate-conversion root, a rig, an animated crane arm)
    # must compose every ancestor's transform too, not just its own local
    # translation/rotation -- otherwise the import silently drops whatever
    # the parent chain contributed.
    chain = _ancestor_chain(nodes, node_index)
    chain_channels = {index: _animation_channels(document, buffers, index) for index in chain}

    if any(chain_channels.values()):
        times = sorted({
            time
            for channels in chain_channels.values()
            for track in channels.values()
            for time in track["times"]
        })
        frames = [max(0, round(time * fps)) for time in times]
    else:
        times, frames = [0.0], [0]

    keyframes = []
    for time, frame in zip(times, frames, strict=True):
        translation, rotation = _world_transform_at(nodes, chain, chain_channels, time)
        keyframes.append({
            "frame": frame,
            "camera": _camera_from_node(translation, rotation, base_fov, near, far,
                                        orthographic=orthographic, zoom=zoom),
            "interpolation": "linear",
        })

    duration = max(frames) + 1
    return {
        "schema_version": 1,
        "fps": fps,
        "duration_frames": max(1, duration),
        "width": width,
        "height": height,
        "render_mode": "omni_ref",
        "keyframes": keyframes,
        "objects": [],
        "metadata": {"imported_from": "gltf", "camera_name": camera.get("name") or node.get("name") or "camera"},
    }


def _animation_channels(document: dict[str, Any], buffers: list[bytes], node_index: int) -> dict[str, Any]:
    """Translation/rotation animation channels targeting one node, keeping
    each sampler's own interpolation mode and (for CUBICSPLINE) its in/out
    tangents rather than only the mid-value of each in/value/out triplet."""
    channels: dict[str, Any] = {}
    for animation in document.get("animations", []):
        samplers = animation.get("samplers", [])
        for channel in animation.get("channels", []):
            target = channel.get("target") or {}
            if target.get("node") != node_index:
                continue
            path = target.get("path")
            if path not in {"translation", "rotation"} or path in channels:
                continue
            sampler = samplers[channel["sampler"]]
            times = [row[0] for row in read_accessor(document, buffers, sampler["input"])]
            raw_values = read_accessor(document, buffers, sampler["output"])
            interpolation = sampler.get("interpolation", "LINEAR")
            entry: dict[str, Any] = {"times": times, "interpolation": interpolation}
            if interpolation == "CUBICSPLINE":
                # Cubic samplers store in-tangent/value/out-tangent triplets
                # per key; keep all three instead of discarding the tangents.
                entry["in_tangents"] = raw_values[0::3]
                entry["values"] = raw_values[1::3]
                entry["out_tangents"] = raw_values[2::3]
            else:
                entry["values"] = raw_values
            channels[path] = entry
    return channels


def _build_parent_index(nodes: list[dict[str, Any]]) -> dict[int, int]:
    """Map each node index to its parent's, from every node's ``children``."""
    parent_of: dict[int, int] = {}
    for index, node in enumerate(nodes):
        for child in node.get("children") or []:
            parent_of[int(child)] = index
    return parent_of


def _ancestor_chain(nodes: list[dict[str, Any]], node_index: int) -> list[int]:
    """``[root, ..., parent, node_index]`` -- the chain of transforms that
    compose into ``node_index``'s world transform, root first."""
    parent_of = _build_parent_index(nodes)
    chain = [node_index]
    seen = {node_index}
    current = node_index
    while current in parent_of:
        current = parent_of[current]
        if current in seen:  # a malformed cyclic hierarchy; stop rather than loop forever
            break
        seen.add(current)
        chain.append(current)
    chain.reverse()
    return chain


def _decompose_matrix(matrix: list[float]) -> tuple[list[float], list[float], list[float]]:
    """A glTF node's column-major 4x4 ``matrix`` -> (translation, rotation
    quaternion xyzw, scale). Shear is not represented in TRS and is dropped,
    same as every glTF-consuming DCC does for a camera node."""
    m = matrix
    translation = [m[12], m[13], m[14]]
    col0, col1, col2 = m[0:3], m[4:7], m[8:11]
    scale = [math.sqrt(sum(c * c for c in col)) for col in (col0, col1, col2)]
    determinant = (
        col0[0] * (col1[1] * col2[2] - col1[2] * col2[1])
        - col0[1] * (col1[0] * col2[2] - col1[2] * col2[0])
        + col0[2] * (col1[0] * col2[1] - col1[1] * col2[0])
    )
    if determinant < 0:
        scale[0] = -scale[0]
    columns = (col0, col1, col2)
    rotation_matrix = [
        [(columns[col][row] / scale[col]) if scale[col] else 0.0 for col in range(3)]
        for row in range(3)
    ]
    rotation = _quaternion_from_matrix(rotation_matrix)
    return translation, rotation, scale


def _quaternion_from_matrix(r: list[list[float]]) -> list[float]:
    """Standard (Shepperd's method) 3x3 rotation matrix -> xyzw quaternion."""
    trace = r[0][0] + r[1][1] + r[2][2]
    if trace > 0:
        s = 0.5 / math.sqrt(trace + 1.0)
        return [
            (r[2][1] - r[1][2]) * s,
            (r[0][2] - r[2][0]) * s,
            (r[1][0] - r[0][1]) * s,
            0.25 / s,
        ]
    if r[0][0] > r[1][1] and r[0][0] > r[2][2]:
        s = 2.0 * math.sqrt(max(1e-12, 1.0 + r[0][0] - r[1][1] - r[2][2]))
        return [0.25 * s, (r[0][1] + r[1][0]) / s, (r[0][2] + r[2][0]) / s, (r[2][1] - r[1][2]) / s]
    if r[1][1] > r[2][2]:
        s = 2.0 * math.sqrt(max(1e-12, 1.0 + r[1][1] - r[0][0] - r[2][2]))
        return [(r[0][1] + r[1][0]) / s, 0.25 * s, (r[1][2] + r[2][1]) / s, (r[0][2] - r[2][0]) / s]
    s = 2.0 * math.sqrt(max(1e-12, 1.0 + r[2][2] - r[0][0] - r[1][1]))
    return [(r[0][2] + r[2][0]) / s, (r[1][2] + r[2][1]) / s, 0.25 * s, (r[1][0] - r[0][1]) / s]


def _node_local_trs(node: dict[str, Any]) -> tuple[list[float], list[float], list[float]]:
    """A node's own static (unanimated) translation/rotation/scale, decoding
    a ``matrix`` node the same way as an explicit TRS one."""
    if "matrix" in node:
        return _decompose_matrix([float(value) for value in node["matrix"]])
    translation = [float(value) for value in node.get("translation", [0.0, 0.0, 0.0])]
    rotation = [float(value) for value in node.get("rotation", [0.0, 0.0, 0.0, 1.0])]
    scale = [float(value) for value in node.get("scale", [1.0, 1.0, 1.0])]
    return translation, rotation, scale


def _compose_transform(
    parent: tuple[list[float], list[float], list[float]],
    local: tuple[list[float], list[float], list[float]],
) -> tuple[list[float], list[float], list[float]]:
    """``parent`` composed with a child's ``local`` TRS -> the child's TRS in
    the parent's own space (world, if ``parent`` already is)."""
    parent_t, parent_r, parent_s = parent
    local_t, local_r, local_s = local
    scaled_local_t = [local_t[axis] * parent_s[axis] for axis in range(3)]
    rotated_t = rotate_quaternion(scaled_local_t, parent_r)
    world_t = [parent_t[axis] + rotated_t[axis] for axis in range(3)]
    world_r = multiply_quaternions(parent_r, local_r)
    world_s = [parent_s[axis] * local_s[axis] for axis in range(3)]
    return world_t, world_r, world_s


_IDENTITY_TRANSFORM: tuple[list[float], list[float], list[float]] = ([0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 1.0], [1.0, 1.0, 1.0])


def _world_transform_at(
    nodes: list[dict[str, Any]],
    chain: list[int],
    chain_channels: dict[int, dict[str, Any]],
    time: float,
) -> tuple[list[float], list[float]]:
    """The world translation/rotation of ``chain[-1]`` at ``time``, composing
    every ancestor's transform in order -- static, or sampled from its own
    animation channels when it has any (an animated parent/grandparent, not
    just the camera node itself)."""
    world = _IDENTITY_TRANSFORM
    for index in chain:
        static_t, static_r, static_s = _node_local_trs(nodes[index])
        channels = chain_channels.get(index) or {}
        local_t = (
            _evaluate_channel(channels["translation"], time, is_rotation=False)
            if "translation" in channels else static_t
        )
        local_r = (
            _evaluate_channel(channels["rotation"], time, is_rotation=True)
            if "rotation" in channels else static_r
        )
        world = _compose_transform(world, (local_t, local_r, static_s))
    return world[0], world[1]


def _normalize_quaternion(quaternion: list[float]) -> list[float]:
    from ..core.camera_pose import normalize_quaternion_xyzw

    return normalize_quaternion_xyzw(quaternion)


def _camera_from_node(translation: list[float], rotation: list[float], fov: float,
                      near: float, far: float, orthographic: bool = False,
                      zoom: float = 1.0) -> dict[str, Any]:
    """A glTF camera node is a transform; OmniCam wants position + target + roll."""
    from ..core.camera_pose import camera_payload_from_pose

    return camera_payload_from_pose(
        translation,
        rotation,
        fov=fov,
        near=near,
        far=far,
        camera_type="orthographic" if orthographic else "perspective",
        zoom=zoom,
    )
