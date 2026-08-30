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

from ..core.camera_math import euler_from_quaternion  # noqa: F401  (re-exported for callers)

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


def _sample_at(times: list[float], values: list[list[float]], time: float) -> list[float]:
    """Linear lookup, with quaternion-aware blending handled by the caller."""
    if not times:
        raise ValueError("animation sampler has no input times")
    if time <= times[0]:
        return values[0]
    if time >= times[-1]:
        return values[-1]
    for index in range(1, len(times)):
        if time <= times[index]:
            span = times[index] - times[index - 1]
            ratio = 0.0 if span <= 0 else (time - times[index - 1]) / span
            a, b = values[index - 1], values[index]
            return [a[axis] + (b[axis] - a[axis]) * ratio for axis in range(len(a))]
    return values[-1]


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
    channels = _animation_channels(document, buffers, node_index)

    static_translation = [float(value) for value in node.get("translation", [0.0, 0.0, 0.0])]
    static_rotation = [float(value) for value in node.get("rotation", [0.0, 0.0, 0.0, 1.0])]

    if channels:
        times = sorted({time for track in channels.values() for time in track["times"]})
        frames = [max(0, round(time * fps)) for time in times]
    else:
        times, frames = [0.0], [0]

    keyframes = []
    for time, frame in zip(times, frames, strict=True):
        translation = static_translation
        rotation = static_rotation
        if "translation" in channels:
            translation = _sample_at(channels["translation"]["times"], channels["translation"]["values"], time)
        if "rotation" in channels:
            rotation = _normalize_quaternion(
                _sample_at(channels["rotation"]["times"], channels["rotation"]["values"], time))
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
            values = read_accessor(document, buffers, sampler["output"])
            if sampler.get("interpolation") == "CUBICSPLINE":
                # Cubic samplers store in/value/out triplets; keep the values.
                values = values[1::3]
            channels[path] = {"times": times, "values": values}
    return channels


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
