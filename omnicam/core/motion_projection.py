"""Project animated world and object-local points into normalized screen space."""

from __future__ import annotations

import math
from dataclasses import dataclass

from .camera_math import rotate_quaternion
from .projection import project_point
from .track import OmniCamTrack, sample_object_world_transform
from .validation import ValidationError, validate_vec3


@dataclass(slots=True)
class ProjectedPoint:
    x: float | None
    y: float | None
    depth: float | None
    visible: bool


def _dimensions(width: int, height: int) -> tuple[int, int]:
    if isinstance(width, bool) or not isinstance(width, int) or width <= 0:
        raise ValidationError("width must be a positive integer")
    if isinstance(height, bool) or not isinstance(height, int) or height <= 0:
        raise ValidationError("height must be a positive integer")
    return width, height


def _frame(track: OmniCamTrack, time_seconds: float) -> float:
    try:
        time = float(time_seconds)
    except (TypeError, ValueError) as error:
        raise ValidationError("time_seconds must be finite and non-negative") from error
    if not math.isfinite(time) or time < 0:
        raise ValidationError("time_seconds must be finite and non-negative")
    return time * track.fps


def _project(
    point: list[float], track: OmniCamTrack, time_seconds: float, width: int, height: int
) -> ProjectedPoint:
    camera = track.sample(_frame(track, time_seconds))
    projected = project_point(point, camera, width, height)
    if projected is None:
        return ProjectedPoint(x=None, y=None, depth=None, visible=False)
    x = float(projected[0]) / width
    y = float(projected[1]) / height
    depth = float(projected[2])
    return ProjectedPoint(x=x, y=y, depth=depth, visible=0.0 <= x <= 1.0 and 0.0 <= y <= 1.0)


def project_world_track(
    point: list[float],
    camera_track: OmniCamTrack,
    times_seconds: list[float],
    *,
    width: int,
    height: int,
) -> list[ProjectedPoint]:
    """Project one fixed world point through an animated camera."""
    width, height = _dimensions(width, height)
    world_point = validate_vec3(point, "point")
    return [
        _project(world_point, camera_track, time_seconds, width, height)
        for time_seconds in times_seconds
    ]


def project_object_track(
    objects: list[dict],
    object_id: str,
    local_point: list[float],
    camera_track: OmniCamTrack,
    times_seconds: list[float],
    *,
    width: int,
    height: int,
) -> list[ProjectedPoint]:
    """Project an object-local point after its animated parent/world transform."""
    width, height = _dimensions(width, height)
    point = validate_vec3(local_point, "local_point")
    obj = next((item for item in objects if item.get("id") == object_id), None)
    if obj is None:
        raise ValidationError(f"unknown object id: {object_id!r}")

    projected: list[ProjectedPoint] = []
    for time_seconds in times_seconds:
        frame = _frame(camera_track, time_seconds)
        world = sample_object_world_transform(objects, obj, frame)
        scaled = [point[index] * world["size"][index] for index in range(3)]
        rotated = rotate_quaternion(scaled, world["quaternion"])
        world_point = [rotated[index] + world["position"][index] for index in range(3)]
        projected.append(_project(world_point, camera_track, time_seconds, width, height))
    return projected
