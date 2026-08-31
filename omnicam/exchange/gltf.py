"""glTF 2.0 / GLB camera export.

glTF is the neutral choice: Blender, Maya (glTF plugin), Unreal, Unity, Houdini
and every web viewer read it, and the camera is part of the core spec rather
than a vendor extension. Written with the standard library only -- a .gltf is
JSON, and a .glb is that JSON plus one binary chunk.

Conventions, which happen to line up with OmniCam's own:
  - right-handed, +Y up, camera looks down its local -Z;
  - `yfov` is the vertical field of view in radians, which is what the track
    stores (in degrees).
"""

from __future__ import annotations

import json
import struct
from typing import Any

from ..core.track import OmniCamTrack
from .baking import CameraSample, bake_camera, is_static

GLB_MAGIC = 0x46546C67
GLB_VERSION = 2
JSON_CHUNK = 0x4E4F534A
BIN_CHUNK = 0x004E4942

FLOAT = 5126


def _pad(data: bytes, filler: bytes) -> bytes:
    remainder = len(data) % 4
    return data if remainder == 0 else data + filler * (4 - remainder)


def _accessor(buffer: bytearray, values: list[list[float]] | list[float], kind: str) -> dict[str, Any]:
    """Append `values` to the buffer and describe them for the accessor table."""
    flat: list[float] = []
    if kind == "SCALAR":
        flat = [float(value) for value in values]  # type: ignore[arg-type]
    else:
        for item in values:
            flat.extend(float(component) for component in item)  # type: ignore
    offset = len(buffer)
    buffer.extend(struct.pack(f"<{len(flat)}f", *flat))
    count = len(values)
    components = {"SCALAR": 1, "VEC3": 3, "VEC4": 4}[kind]
    columns = [flat[index::components] for index in range(components)]
    return {
        "byteOffset": offset,
        "byteLength": len(flat) * 4,
        "count": count,
        "type": kind,
        "min": [min(column) for column in columns],
        "max": [max(column) for column in columns],
    }


def _camera_definition(first: CameraSample, aspect: float, name: str) -> dict[str, Any]:
    """glTF has both projections; exporting an ortho camera as perspective would
    hand Blender, Maya and Unreal the wrong lens without saying so."""
    znear = max(1e-4, first.near)
    zfar = max(znear + 1e-3, first.far)
    if first.orthographic:
        ymag = max(1e-4, first.ortho_half_height)
        return {
            "type": "orthographic",
            "name": f"{name}_lens",
            "orthographic": {"xmag": ymag * aspect, "ymag": ymag, "znear": znear, "zfar": zfar},
        }
    return {
        "type": "perspective",
        "name": f"{name}_lens",
        "perspective": {
            "yfov": first.vertical_fov * 3.141592653589793 / 180.0,
            "znear": znear,
            "zfar": zfar,
            "aspectRatio": aspect,
        },
    }


def build_gltf(track: OmniCamTrack, name: str = "OmniCam") -> tuple[dict[str, Any], bytes]:
    """Return the glTF JSON document and its binary buffer."""
    samples: list[CameraSample] = bake_camera(track)
    first = samples[0]
    aspect = max(1e-6, track.width / max(1, track.height))

    buffer = bytearray()
    accessors: list[dict[str, Any]] = []
    views: list[dict[str, Any]] = []

    def add(values, kind: str) -> int:
        raw = _accessor(buffer, values, kind)
        views.append({"buffer": 0, "byteOffset": raw.pop("byteOffset"), "byteLength": raw.pop("byteLength")})
        accessors.append({"bufferView": len(views) - 1, "componentType": FLOAT, **raw})
        return len(accessors) - 1

    document: dict[str, Any] = {
        "asset": {"version": "2.0", "generator": "ComfyUI-Majoor-OmniCam"},
        "scene": 0,
        "scenes": [{"nodes": [0], "name": name}],
        "nodes": [{
            "name": f"{name}_camera",
            "camera": 0,
            "translation": first.translation,
            "rotation": first.rotation,
        }],
        "cameras": [_camera_definition(first, aspect, name)],
        "extras": {
            # A glTF camera node cannot express three things OmniCam relies on:
            # the look-at *distance* (only the direction survives a transform),
            # an animated field of view (the core spec has no camera animation
            # path), and the authored interpolation. The canonical track is
            # therefore carried alongside, so re-importing here is lossless
            # while every other application still reads a correct standard
            # camera from the node and animation above.
            "omnicam": {
                "schema_version": 1,
                "generator": "ComfyUI-Majoor-OmniCam",
                "baked_fps": track.fps,
                "note": "node animation is baked per frame; 'track' is the lossless original",
                "track": track.to_dict(),
            },
        },
    }

    if not is_static(samples):
        times = [sample.time for sample in samples]
        time_accessor = add(times, "SCALAR")
        translation_accessor = add([sample.translation for sample in samples], "VEC3")
        rotation_accessor = add([sample.rotation for sample in samples], "VEC4")
        document["animations"] = [{
            "name": f"{name}_move",
            # LINEAR between per-frame samples reproduces the authored curve
            # exactly, because a sample exists for every frame.
            "samplers": [
                {"input": time_accessor, "output": translation_accessor, "interpolation": "LINEAR"},
                {"input": time_accessor, "output": rotation_accessor, "interpolation": "LINEAR"},
            ],
            "channels": [
                {"sampler": 0, "target": {"node": 0, "path": "translation"}},
                {"sampler": 1, "target": {"node": 0, "path": "rotation"}},
            ],
        }]

    if buffer:
        document["bufferViews"] = views
        document["accessors"] = accessors
        document["buffers"] = [{"byteLength": len(buffer)}]
    return document, bytes(buffer)


def write_gltf(track: OmniCamTrack, name: str = "OmniCam") -> str:
    """A self-contained .gltf: the buffer is inlined as a data URI."""
    import base64

    document, buffer = build_gltf(track, name)
    if buffer:
        encoded = base64.b64encode(buffer).decode("ascii")
        document["buffers"][0]["uri"] = f"data:application/octet-stream;base64,{encoded}"
    return json.dumps(document, indent=1)


def write_glb(track: OmniCamTrack, name: str = "OmniCam") -> bytes:
    """A binary .glb, which is what most applications expect to be handed."""
    document, buffer = build_gltf(track, name)
    json_chunk = _pad(json.dumps(document, separators=(",", ":")).encode("utf-8"), b" ")
    chunks = struct.pack("<II", len(json_chunk), JSON_CHUNK) + json_chunk
    if buffer:
        binary_chunk = _pad(buffer, b"\x00")
        chunks += struct.pack("<II", len(binary_chunk), BIN_CHUNK) + binary_chunk
    header = struct.pack("<III", GLB_MAGIC, GLB_VERSION, 12 + len(chunks))
    return header + chunks
