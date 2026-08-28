from __future__ import annotations

import bisect
import json
import math
from collections.abc import Iterable
from dataclasses import asdict, dataclass
from typing import Any

from .camera_math import euler_from_quaternion, multiply_quaternions, quaternion_from_euler, rotate_quaternion

SCHEMA_VERSION = 1


def _finite(value: Any, default: float) -> float:
    """Coerce to a finite float; NaN and Infinity are replaced by the default."""
    try:
        number = float(value)
    except (TypeError, ValueError):
        return default
    return number if math.isfinite(number) else default


def _vec3(value: Any, default: tuple[float, float, float]) -> list[float]:
    if not isinstance(value, (list, tuple)) or len(value) != 3:
        return list(default)
    return [_finite(value[0], default[0]), _finite(value[1], default[1]), _finite(value[2], default[2])]


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def _lerp_angle(a: float, b: float, t: float) -> float:
    """Interpolate an angle in degrees over the shortest arc."""
    delta = (b - a + 540.0) % 360.0 - 180.0
    return a + delta * t


def _lerp3(a: list[float], b: list[float], t: float) -> list[float]:
    return [_lerp(a[i], b[i], t) for i in range(3)]


def _rotate_euler(vector: list[float], rotation: list[float]) -> list[float]:
    """Match the Director's X -> Y -> Z Euler transform order."""
    rx, ry, rz = (math.radians(value) for value in rotation)
    x, y, z = vector
    y, z = y * math.cos(rx) - z * math.sin(rx), y * math.sin(rx) + z * math.cos(rx)
    x, z = x * math.cos(ry) + z * math.sin(ry), -x * math.sin(ry) + z * math.cos(ry)
    x, y = x * math.cos(rz) - y * math.sin(rz), x * math.sin(rz) + y * math.cos(rz)
    return [x, y, z]


def _sample_object_transform(obj: dict[str, Any], frame: float) -> dict[str, list[float]]:
    base_position = _vec3(obj.get("position"), (0.0, 0.0, 0.0))
    base_rotation = _vec3(obj.get("rotation"), (0.0, 0.0, 0.0))
    base_size = _vec3(obj.get("size"), (1.0, 1.0, 1.0))
    keys = obj.get("keyframes") if isinstance(obj.get("keyframes"), list) else []
    if not keys:
        return {"position": base_position, "rotation": base_rotation, "size": base_size}

    def component(key: dict[str, Any], field: str, index: int, fallback: list[float]) -> float:
        raw_transform = key.get("transform")
        transform = raw_transform if isinstance(raw_transform, dict) else {}
        value = transform.get(field, fallback)
        return _finite(value[index] if isinstance(value, (list, tuple)) and len(value) > index else fallback[index], fallback[index])

    return {
        "position": [_sample_channel(keys, frame, f"pos_{axis}", lambda key, i=i: component(key, "position", i, base_position)) for i, axis in enumerate("xyz")],
        "rotation": [_sample_channel(keys, frame, f"rot_{axis}", lambda key, i=i: component(key, "rotation", i, base_rotation), is_angle=True) for i, axis in enumerate("xyz")],
        "size": [max(0.01, _sample_channel(keys, frame, f"scale_{axis}", lambda key, i=i: component(key, "size", i, base_size))) for i, axis in enumerate("xyz")],
    }


def _sample_object_world_transform(objects: dict[str, dict[str, Any]], obj: dict[str, Any], frame: float, seen: set[str] | None = None) -> dict[str, list[float]]:
    local = _sample_object_transform(obj, frame)
    local["quaternion"] = quaternion_from_euler(local["rotation"])
    object_id = str(obj.get("id") or "")
    visited = set(seen or ())
    if object_id in visited:
        return local
    visited.add(object_id)
    parent = objects.get(str(obj.get("parent_id") or ""))
    if not parent:
        return local
    parent_world = _sample_object_world_transform(objects, parent, frame, visited)
    scaled = [local["position"][i] * parent_world["size"][i] for i in range(3)]
    parent_quaternion = parent_world.get("quaternion") or quaternion_from_euler(parent_world["rotation"])
    rotated = rotate_quaternion(scaled, parent_quaternion)
    quaternion = multiply_quaternions(parent_quaternion, local["quaternion"])
    return {
        "position": [rotated[i] + parent_world["position"][i] for i in range(3)],
        "rotation": euler_from_quaternion(quaternion),
        "quaternion": quaternion,
        "size": [local["size"][i] * parent_world["size"][i] for i in range(3)],
    }


def sample_object_world_transform(objects: list[dict[str, Any]], obj: dict[str, Any], frame: float) -> dict[str, list[float]]:
    """Evaluate an object's animated transform and parent chain in world space."""
    by_id = {str(item.get("id")): item for item in objects if isinstance(item, dict) and item.get("id")}
    return _sample_object_world_transform(by_id, obj, frame)


TANGENT_MODES = frozenset({"auto", "vector", "free", "aligned", "flat"})


def _default_handles() -> dict[str, Any]:
    return {"out_x": 1.0 / 3.0, "out_y": 0.0, "in_x": -1.0 / 3.0, "in_y": 0.0, "mode": "auto"}


def _get_channel_tangents(key: Any, channel_id: str) -> dict[str, Any]:
    tangents = getattr(key, "tangents", None) if not isinstance(key, dict) else key.get("tangents")
    if not isinstance(tangents, dict):
        return {}
    channels = tangents.get("channels")
    if isinstance(channels, dict) and channel_id in channels and isinstance(channels[channel_id], dict):
        return channels[channel_id]
    return tangents


def _resolve_channel_handles(
    key: Any,
    channel_id: str,
    previous_key: Any = None,
    next_key: Any = None,
    channel_getter: Any = None,
) -> dict[str, Any]:
    stored = _get_channel_tangents(key, channel_id)
    top_tangents = getattr(key, "tangents", None) if not isinstance(key, dict) else key.get("tangents")
    fallback_mode = top_tangents.get("mode", "auto") if isinstance(top_tangents, dict) else "auto"
    mode = str(stored.get("mode", fallback_mode))
    if mode not in TANGENT_MODES:
        mode = "auto"

    cur_frame = getattr(key, "frame", 0) if not isinstance(key, dict) else key.get("frame", 0)
    prev_frame = getattr(previous_key, "frame", cur_frame - 1) if previous_key is not None and not isinstance(previous_key, dict) else (previous_key.get("frame", cur_frame - 1) if isinstance(previous_key, dict) else cur_frame - 1)
    next_frame = getattr(next_key, "frame", cur_frame + 1) if next_key is not None and not isinstance(next_key, dict) else (next_key.get("frame", cur_frame + 1) if isinstance(next_key, dict) else cur_frame + 1)

    prev_span = max(1e-6, float(cur_frame - prev_frame))
    next_span = max(1e-6, float(next_frame - cur_frame))

    cur_val = float(channel_getter(key)) if channel_getter else 0.0
    prev_val = float(channel_getter(previous_key)) if previous_key is not None and channel_getter else cur_val
    next_val = float(channel_getter(next_key)) if next_key is not None and channel_getter else cur_val

    def _get_auto() -> dict[str, Any]:
        d_prev = (cur_val - prev_val) / prev_span
        d_next = (next_val - cur_val) / next_span
        slope = (d_prev + d_next) * 0.5
        if previous_key is None:
            slope = d_next
        elif next_key is None:
            slope = d_prev
        if d_prev * d_next <= 0 and previous_key is not None and next_key is not None:
            slope = 0.0
        return {
            "out_x": 1.0 / 3.0,
            "out_y": slope * next_span * (1.0 / 3.0),
            "in_x": -1.0 / 3.0,
            "in_y": -slope * prev_span * (1.0 / 3.0),
        }

    if mode == "vector":
        in_slope = (cur_val - prev_val) / prev_span
        out_slope = (next_val - cur_val) / next_span
        return {
            "out_x": 1.0 / 3.0,
            "out_y": out_slope * next_span * (1.0 / 3.0),
            "in_x": -1.0 / 3.0,
            "in_y": -in_slope * prev_span * (1.0 / 3.0),
            "mode": mode,
        }

    if mode == "flat":
        return {"out_x": 1.0 / 3.0, "out_y": 0.0, "in_x": -1.0 / 3.0, "in_y": 0.0, "mode": mode}

    if mode == "auto":
        auto_h = _get_auto()
        return {**auto_h, "mode": mode}

    auto_fallback = _get_auto()
    out_x = _clamp(float(stored.get("out_x", auto_fallback["out_x"])), 0.01, 0.99)
    out_y = float(stored.get("out_y", auto_fallback["out_y"]))
    in_x = _clamp(float(stored.get("in_x", auto_fallback["in_x"])), -0.99, -0.01)
    in_y = float(stored.get("in_y", auto_fallback["in_y"]))

    if mode == "aligned":
        len_out = math.hypot(out_x, out_y) or 1e-6
        len_in = math.hypot(in_x, in_y) or 1e-6
        in_x = (-out_x / len_out) * len_in
        in_y = (-out_y / len_out) * len_in

    return {"out_x": out_x, "out_y": out_y, "in_x": in_x, "in_y": in_y, "mode": mode}


def _resolve_handles(key: Any, previous_key: Any = None, next_key: Any = None) -> dict[str, Any]:
    return _resolve_channel_handles(key, "default", previous_key, next_key, lambda k: getattr(k, "value", 0.0) if hasattr(k, "value") else (k.get("value", 0.0) if isinstance(k, dict) else 0.0))


def _bezier_ease_with_handles(
    t: float,
    key: Any,
    previous_key: Any = None,
    next_key: Any = None,
    span_frames: float = 1.0,
    prev_span_frames: float | None = None,
) -> float:
    handles = _resolve_handles(key, previous_key, next_key)
    p1x = _clamp(handles["out_x"], 0.01, 0.99)
    p2x = _clamp(1.0 + handles["in_x"], 0.01, 0.99)
    out_slope = handles["out_y"] / max(1e-6, handles["out_x"]) / max(1.0, float(span_frames))
    in_slope = handles["in_y"] / max(1e-6, abs(handles["in_x"])) / max(1.0, float(prev_span_frames or span_frames))
    p1y = out_slope * p1x
    p2y = 1.0 + in_slope * (p2x - 1.0)
    u = _clamp(t, 0.0, 1.0)
    v = 1.0 - u
    return 3.0 * v * v * u * p1y + 3.0 * v * u * u * p2y + u * u * u


def _sample_channel(
    keyframes: list[Any],
    frame_f: float,
    channel_id: str,
    channel_getter: Any,
    is_angle: bool = False,
    segment: tuple[int, Any, Any, Any, Any] | None = None,
) -> float:
    if not keyframes:
        return 0.0

    def _kf_frame(k: Any) -> float:
        return float(getattr(k, "frame", k.get("frame", 0.0) if isinstance(k, dict) else 0.0))

    def _kf_interp(k: Any) -> str:
        return str(getattr(k, "interpolation", k.get("interpolation", "ease") if isinstance(k, dict) else "ease"))

    first_frame = _kf_frame(keyframes[0])
    last_frame = _kf_frame(keyframes[-1])

    if frame_f <= first_frame:
        return float(channel_getter(keyframes[0]))
    if frame_f >= last_frame:
        return float(channel_getter(keyframes[-1]))

    if segment is None:
        segment = _resolve_sample_segment(keyframes, frame_f)
    _, left, right, prev, next_key = segment

    left_frame = _kf_frame(left)
    right_frame = _kf_frame(right)
    span = max(1.0, float(right_frame - left_frame))
    u = _clamp((frame_f - left_frame) / span, 0.0, 1.0)

    y0 = float(channel_getter(left))
    y1 = float(channel_getter(right))
    if is_angle:
        delta = (y1 - y0 + 540.0) % 360.0 - 180.0
        y1 = y0 + delta

    is_bezier = _kf_interp(left) == "bezier" or _kf_interp(right) == "bezier"
    if is_bezier:
        handles_left = _resolve_channel_handles(left, channel_id, prev, right, channel_getter)
        handles_right = _resolve_channel_handles(right, channel_id, left, next_key, channel_getter)
        p0 = y0
        p1 = y0 + float(handles_left.get("out_y", 0.0))
        p2 = y1 + float(handles_right.get("in_y", 0.0))
        p3 = y1
        p1x = _clamp(float(handles_left.get("out_x", 1 / 3)), 0.0, 1.0)
        p2x = _clamp(1.0 + float(handles_right.get("in_x", -1 / 3)), 0.0, 1.0)
        low, high = 0.0, 1.0
        for _ in range(32):
            s = (low + high) * 0.5
            inv = 1.0 - s
            x = 3.0 * inv * inv * s * p1x + 3.0 * inv * s * s * p2x + s * s * s
            if x < u:
                low = s
            else:
                high = s
        s = (low + high) * 0.5
        v = 1.0 - s
        return (
            v * v * v * p0 + 3.0 * v * v * s * p1 + 3.0 * v * s * s * p2 + s * s * s * p3
        )

    t = _ease(u, _kf_interp(left))
    return y0 + (y1 - y0) * t


def _resolve_sample_segment(keyframes: list[Any], frame_f: float, hint: int | None = None) -> tuple[int, Any, Any, Any, Any]:
    """Resolve neighboring keys once so every camera channel shares one lookup."""
    if len(keyframes) < 2:
        key = keyframes[0]
        return 0, key, key, None, None

    def key_frame(key: Any) -> float:
        return float(getattr(key, "frame", key.get("frame", 0.0) if isinstance(key, dict) else 0.0))

    idx = hint
    if idx is None or idx < 0 or idx >= len(keyframes) - 1 or not (
        key_frame(keyframes[idx]) <= frame_f < key_frame(keyframes[idx + 1])
    ):
        idx = bisect.bisect_right([key_frame(key) for key in keyframes], frame_f) - 1
    idx = max(0, min(len(keyframes) - 2, idx))
    return (
        idx,
        keyframes[idx],
        keyframes[idx + 1],
        keyframes[idx - 1] if idx else None,
        keyframes[idx + 2] if idx + 2 < len(keyframes) else None,
    )


def _ease(t: float, mode: str) -> float:
    t = _clamp(t, 0.0, 1.0)
    if mode == "hold":
        # Step: the value stays on the left key until the next one.
        return 0.0
    if mode == "linear":
        return t
    if mode == "ease_in":
        return t * t
    if mode == "ease_out":
        return 1.0 - (1.0 - t) * (1.0 - t)
    if mode == "smooth":
        return t * t * t * (t * (t * 6.0 - 15.0) + 10.0)
    if mode == "bezier":
        return 0.15 * (1.0 - t) * (1.0 - t) * t + 2.85 * (1.0 - t) * t * t + t * t * t
    if mode in {"ease", "ease_in_out", "smoothstep"}:
        return t * t * (3.0 - 2.0 * t)
    return t


@dataclass(slots=True)
class CameraState:
    position: list[float]
    target: list[float]
    fov: float = 35.0
    roll: float = 0.0
    camera_type: str = "perspective"
    zoom: float = 1.0
    near: float = 0.01
    far: float = 10000.0

    @classmethod
    def from_dict(cls, data: dict[str, Any] | None) -> CameraState:
        data = data or {}
        near = max(1e-4, _finite(data.get("near", 0.01), 0.01))
        far = max(near + 1e-4, _finite(data.get("far", 10000.0), 10000.0))
        return cls(
            position=_vec3(data.get("position"), (6.0, 4.0, 6.0)),
            target=_vec3(data.get("target"), (0.0, 1.5, 0.0)),
            fov=_finite(data.get("fov", 35.0), 35.0),
            roll=_finite(data.get("roll", 0.0), 0.0),
            camera_type=str(data.get("camera_type", data.get("cameraType", "perspective"))),
            zoom=_finite(data.get("zoom", 1.0), 1.0),
            near=near,
            far=far,
        )


@dataclass(slots=True)
class CameraKeyframe:
    frame: int
    camera: CameraState
    interpolation: str = "ease"
    tangents: dict[str, Any] | None = None
    references: list[dict[str, Any]] | None = None

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> CameraKeyframe:
        camera_payload = data.get("camera") if isinstance(data.get("camera"), dict) else data
        tangents = data.get("tangents")
        references = data.get("references")
        return cls(
            frame=max(0, int(_finite(data.get("frame", 0), 0))),
            camera=CameraState.from_dict(camera_payload),
            interpolation=str(data.get("interpolation", "ease")),
            tangents=dict(tangents) if isinstance(tangents, dict) else None,
            references=[dict(ref) for ref in references if isinstance(ref, dict)] if isinstance(references, list) else None,
        )


@dataclass(slots=True)
class OmniCamTrack:
    fps: int
    duration_frames: int
    width: int
    height: int
    render_mode: str
    keyframes: list[CameraKeyframe]
    objects: list[dict[str, Any]]
    metadata: dict[str, Any]
    constraints: dict[str, Any]
    schema_version: int = SCHEMA_VERSION

    @property
    def duration_seconds(self) -> float:
        return self.duration_frames / max(1, self.fps)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> OmniCamTrack:
        from .migrations import CURRENT_VERSIONS, TRACK_SCHEMA, migrate_payload

        raw_version = int(data.get("schema_version", data.get("schemaVersion", 0)) or 0)
        if raw_version > CURRENT_VERSIONS[TRACK_SCHEMA]:
            raise ValueError(f"Unsupported OmniCam track schema: {raw_version}")
        data = migrate_payload(data, TRACK_SCHEMA)
        schema_version = int(data.get("schema_version", SCHEMA_VERSION))
        fps = max(1, min(120, int(_finite(data.get("fps", 24), 24))))
        duration_frames = max(1, int(_finite(data.get("duration_frames", data.get("durationFrames", fps * 5)), fps * 5)))
        width = max(64, min(4096, int(_finite(data.get("width", 1280), 1280))))
        height = max(64, min(4096, int(_finite(data.get("height", 720), 720))))
        render_mode = str(data.get("render_mode", data.get("renderMode", "omni_ref")))

        raw_keyframes = data.get("keyframes", [])
        keyframes = [CameraKeyframe.from_dict(k) for k in raw_keyframes if isinstance(k, dict)]
        if not keyframes:
            camera = CameraState.from_dict(data.get("camera") if isinstance(data.get("camera"), dict) else None)
            keyframes = [CameraKeyframe(frame=0, camera=camera)]
        keyframes.sort(key=lambda k: k.frame)

        # Keep only the last keyframe at a duplicated frame.
        dedup: dict[int, CameraKeyframe] = {k.frame: k for k in keyframes}
        keyframes = [dedup[f] for f in sorted(dedup)]

        return cls(
            fps=fps,
            duration_frames=duration_frames,
            width=width,
            height=height,
            render_mode=render_mode,
            keyframes=keyframes,
            objects=[o for o in data.get("objects", []) if isinstance(o, dict)],
            metadata=data.get("metadata", {}) if isinstance(data.get("metadata"), dict) else {},
            constraints=data.get("constraints", {}) if isinstance(data.get("constraints"), dict) else {},
            schema_version=schema_version,
        )

    @classmethod
    def from_json(cls, payload: str | None) -> OmniCamTrack:
        if not payload:
            return cls.from_dict({})
        try:
            data = json.loads(payload)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid OmniCam state JSON: {exc}") from exc
        if not isinstance(data, dict):
            raise TypeError("OmniCam state must be a JSON object")
        return cls.from_dict(data)

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema_version": self.schema_version,
            "fps": self.fps,
            "duration_frames": self.duration_frames,
            "width": self.width,
            "height": self.height,
            "render_mode": self.render_mode,
            "keyframes": [
                {
                    "frame": k.frame,
                    "camera": asdict(k.camera),
                    "interpolation": k.interpolation,
                    **({"tangents": k.tangents} if k.tangents else {}),
                    **({"references": k.references} if k.references else {}),
                }
                for k in self.keyframes
            ],
            "objects": self.objects,
            **({"constraints": self.constraints} if self.constraints else {}),
            "metadata": self.metadata,
        }

    def to_json(self, *, indent: int | None = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent, sort_keys=False)

    def sample(self, frame: float, *, _segment_hint: int | None = None) -> CameraState:
        frame_f = _clamp(float(frame), 0.0, float(max(0, self.duration_frames - 1)))
        if not self.keyframes:
            return CameraState(position=[6.0, 4.0, 6.0], target=[0.0, 1.5, 0.0])

        segment = _resolve_sample_segment(self.keyframes, frame_f, _segment_hint)
        px = _sample_channel(self.keyframes, frame_f, "pos_x", lambda k: k.camera.position[0], segment=segment)
        py = _sample_channel(self.keyframes, frame_f, "pos_y", lambda k: k.camera.position[1], segment=segment)
        pz = _sample_channel(self.keyframes, frame_f, "pos_z", lambda k: k.camera.position[2], segment=segment)
        tx = _sample_channel(self.keyframes, frame_f, "target_x", lambda k: k.camera.target[0], segment=segment)
        ty = _sample_channel(self.keyframes, frame_f, "target_y", lambda k: k.camera.target[1], segment=segment)
        tz = _sample_channel(self.keyframes, frame_f, "target_z", lambda k: k.camera.target[2], segment=segment)

        # Resolve Look-At in world space. Invalid/disabled targets deliberately
        # fall back to the authored camera target instead of silently aiming at zero.
        look_at = self.constraints.get("look_at") if isinstance(self.constraints, dict) else None
        if not isinstance(look_at, dict) and isinstance(self.metadata, dict) and self.metadata.get("target_object_id"):
            look_at = {"object_id": self.metadata["target_object_id"], "offset": self.metadata.get("target_offset", [0, 0, 0]), "status": "active"}
        if isinstance(look_at, dict) and look_at.get("status", "active") == "active":
            objects = {str(obj.get("id")): obj for obj in self.objects if isinstance(obj, dict) and obj.get("id")}
            target_obj = objects.get(str(look_at.get("object_id") or ""))
            if target_obj and target_obj.get("enabled", True) is not False:
                world = _sample_object_world_transform(objects, target_obj, frame_f)
                offset = _vec3(look_at.get("offset"), (0.0, 0.0, 0.0))
                tx, ty, tz = (world["position"][i] + offset[i] for i in range(3))

        fov = _sample_channel(self.keyframes, frame_f, "fov", lambda k: k.camera.fov, segment=segment)
        roll = _sample_channel(self.keyframes, frame_f, "roll", lambda k: k.camera.roll, is_angle=True, segment=segment)
        zoom = _sample_channel(self.keyframes, frame_f, "zoom", lambda k: k.camera.zoom, segment=segment)
        near = _sample_channel(self.keyframes, frame_f, "near", lambda k: k.camera.near, segment=segment)
        far = _sample_channel(self.keyframes, frame_f, "far", lambda k: k.camera.far, segment=segment)
        camera_type = (segment[2] if frame_f >= segment[2].frame else segment[1]).camera.camera_type

        return CameraState(
            position=[px, py, pz],
            target=[tx, ty, tz],
            fov=_clamp(fov, 5.0, 150.0),
            roll=roll,
            camera_type=camera_type,
            zoom=max(0.01, zoom),
            near=max(1e-4, near),
            far=max(near + 1e-4, far),
        )

    def samples(self, step: int = 1) -> Iterable[tuple[int, CameraState]]:
        step = max(1, int(step))
        segment_index = 0
        for frame in range(0, self.duration_frames, step):
            while segment_index + 1 < len(self.keyframes) - 1 and frame >= self.keyframes[segment_index + 1].frame:
                segment_index += 1
            yield frame, self.sample(frame, _segment_hint=segment_index)


def camera_to_load3d(camera: CameraState, aspect: float = 16 / 9) -> dict[str, Any]:
    """Return a LOAD3D_CAMERA-compatible payload based on current core CameraManager fields."""
    from .camera_math import camera_quaternion
    payload = {
        "position": {"x": camera.position[0], "y": camera.position[1], "z": camera.position[2]},
        "target": {"x": camera.target[0], "y": camera.target[1], "z": camera.target[2]},
        "zoom": camera.zoom,
        "cameraType": camera.camera_type,
        "fov": camera.fov,
        "aspect": aspect,
        "near": camera.near,
        "far": camera.far,
        "quaternion": camera_quaternion(camera.position, camera.target, camera.roll),
    }
    if camera.camera_type == "orthographic":
        half_height = 5.0 / max(0.01, camera.zoom)
        payload["frustum"] = {"left": -half_height * aspect, "right": half_height * aspect, "top": half_height, "bottom": -half_height}
        payload.pop("fov", None)
        payload.pop("aspect", None)
    return payload
