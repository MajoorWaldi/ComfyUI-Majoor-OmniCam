"""Internal scene-motion analysis over projected object samples.

These are computed from the canonical track geometry (object bounds projected
through the camera), not from rendered pixels — the WebGL viewport already
shows the geometry; adapters consume these compact per-frame payloads.
"""

from __future__ import annotations

import math
from typing import Any

from .projection import basis, project_point
from .track import OmniCamTrack, sample_object_world_transform


def _object_center(objects: list[dict[str, Any]], object_payload: dict[str, Any], frame: int) -> list[float]:
    return sample_object_world_transform(objects, object_payload, frame)["position"]


def object_id_pass(track: OmniCamTrack, *, step: int = 1) -> dict[str, Any]:
    """Stable integer ID per scene object + projected screen footprint per frame."""
    objects = [obj for obj in track.objects if isinstance(obj, dict)]
    ids = {obj.get("id", f"object_{index}"): index + 1 for index, obj in enumerate(objects)}
    frames = []
    for frame, camera in track.samples(step):
        footprints = []
        for obj in objects:
            projected = project_point(_object_center(objects, obj, frame), camera, track.width, track.height)
            footprints.append(
                {
                    "id": ids[obj.get("id", "")],
                    "name": obj.get("id"),
                    "visible": projected is not None and 0 <= projected[0] < track.width and 0 <= projected[1] < track.height,
                    "center": projected[:2] if projected else None,
                }
            )
        frames.append({"frame": frame, "objects": footprints})
    return {
        "format": "majoor.omnicam.id-pass.v1",
        "fps": track.fps,
        "width": track.width,
        "height": track.height,
        "object_ids": ids,
        "frames": frames,
    }


def depth_pass(track: OmniCamTrack, *, step: int = 1, near: float | None = None, far: float | None = None) -> dict[str, Any]:
    """Per-frame normalized depth (0 near → 1 far) of each object center."""
    objects = [obj for obj in track.objects if isinstance(obj, dict)]
    frames = []
    for frame, camera in track.samples(step):
        near_plane = near if near is not None else camera.near
        far_plane = far if far is not None else camera.far
        entries = []
        for obj in objects:
            projected = project_point(_object_center(objects, obj, frame), camera, track.width, track.height)
            if projected is None:
                entries.append({"name": obj.get("id"), "depth": None})
                continue
            normalized = (projected[2] - near_plane) / max(1e-9, far_plane - near_plane)
            entries.append({"name": obj.get("id"), "depth": max(0.0, min(1.0, normalized))})
        frames.append({"frame": frame, "depths": entries})
    return {"format": "majoor.omnicam.depth-pass.v1", "fps": track.fps, "width": track.width, "height": track.height, "frames": frames}


def normals_pass(track: OmniCamTrack, *, step: int = 1) -> dict[str, Any]:
    """Per-frame camera-space normals of each card/object facing direction."""
    frames = []
    for frame, camera in track.samples(step):
        right, up, forward = basis(camera)
        entries = []
        for obj in track.objects:
            if not isinstance(obj, dict):
                continue
            rotation = sample_object_world_transform(track.objects, obj, frame)["rotation"]
            rx, ry, rz = (math.radians(float(rotation[i])) for i in range(3))
            # Object's local +Z (card normal) in world space.
            nx, ny, nz = 0.0, 0.0, 1.0
            ny, nz = ny * math.cos(rx) - nz * math.sin(rx), ny * math.sin(rx) + nz * math.cos(rx)
            nx, nz = nx * math.cos(ry) + nz * math.sin(ry), -nx * math.sin(ry) + nz * math.cos(ry)
            nx, ny = nx * math.cos(rz) - ny * math.sin(rz), nx * math.sin(rz) + ny * math.cos(rz)
            normal = [nx, ny, nz]
            # World → camera space (RGB normal-map convention: right, up, -forward).
            entries.append(
                {
                    "name": obj.get("id"),
                    "normal_camera": [
                        sum(normal[i] * right[i] for i in range(3)),
                        sum(normal[i] * up[i] for i in range(3)),
                        -sum(normal[i] * forward[i] for i in range(3)),
                    ],
                }
            )
        frames.append({"frame": frame, "normals": entries})
    return {"format": "majoor.omnicam.normals-pass.v1", "fps": track.fps, "frames": frames}


def optical_flow_pass(track: OmniCamTrack, *, step: int = 1) -> dict[str, Any]:
    """Per-frame screen-space motion vectors of each object center between samples."""
    objects = [obj for obj in track.objects if isinstance(obj, dict)]
    previous: dict[str, list[float] | None] = {}
    frames = []
    for frame, camera in track.samples(step):
        vectors = []
        for obj in objects:
            name = obj.get("id")
            projected = project_point(_object_center(objects, obj, frame), camera, track.width, track.height)
            current = projected[:2] if projected else None
            last = previous.get(name)  # type: ignore[arg-type]
            vectors.append(
                {
                    "name": name,
                    "flow": [current[0] - last[0], current[1] - last[1]] if current and last else None,
                    "visible": current is not None,
                }
            )
            previous[name] = current  # type: ignore[index]
        frames.append({"frame": frame, "vectors": vectors})
    return {"format": "majoor.omnicam.flow-pass.v1", "fps": track.fps, "width": track.width, "height": track.height, "frames": frames}
