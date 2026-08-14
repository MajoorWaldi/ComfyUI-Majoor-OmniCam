from __future__ import annotations

import json
import math
from collections.abc import Iterable
from dataclasses import asdict, dataclass
from typing import Any

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


def _ease(t: float, mode: str) -> float:
    t = _clamp(t, 0.0, 1.0)
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
    schema_version: int = SCHEMA_VERSION

    @property
    def duration_seconds(self) -> float:
        return self.duration_frames / max(1, self.fps)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> OmniCamTrack:
        from .migrations import TRACK_SCHEMA, CURRENT_VERSIONS, migrate_payload

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
            "metadata": self.metadata,
        }

    def to_json(self, *, indent: int | None = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent, sort_keys=False)

    def sample(self, frame: float) -> CameraState:
        frame_f = _clamp(float(frame), 0.0, float(max(0, self.duration_frames - 1)))
        if frame_f <= self.keyframes[0].frame:
            return CameraState.from_dict(asdict(self.keyframes[0].camera))
        if frame_f >= self.keyframes[-1].frame:
            return CameraState.from_dict(asdict(self.keyframes[-1].camera))

        left = self.keyframes[0]
        right = self.keyframes[-1]
        for idx in range(len(self.keyframes) - 1):
            a, b = self.keyframes[idx], self.keyframes[idx + 1]
            if a.frame <= frame_f <= b.frame:
                left, right = a, b
                break

        span = max(1.0, float(right.frame - left.frame))
        t = _ease((frame_f - left.frame) / span, left.interpolation)
        a, b = left.camera, right.camera
        return CameraState(
            position=_lerp3(a.position, b.position, t),
            target=_lerp3(a.target, b.target, t),
            fov=_lerp(a.fov, b.fov, t),
            roll=_lerp_angle(a.roll, b.roll, t),
            # Projection changes are cuts at the right key boundary, not midpoint switches.
            camera_type=a.camera_type if t < 1.0 else b.camera_type,
            zoom=_lerp(a.zoom, b.zoom, t),
            near=_lerp(a.near, b.near, t),
            far=_lerp(a.far, b.far, t),
        )

    def samples(self, step: int = 1) -> Iterable[tuple[int, CameraState]]:
        step = max(1, int(step))
        for frame in range(0, self.duration_frames, step):
            yield frame, self.sample(frame)


def camera_to_load3d(camera: CameraState, aspect: float = 16 / 9) -> dict[str, Any]:
    """Return a LOAD3D_CAMERA-compatible payload based on current core CameraManager fields."""
    return {
        "position": {"x": camera.position[0], "y": camera.position[1], "z": camera.position[2]},
        "target": {"x": camera.target[0], "y": camera.target[1], "z": camera.target[2]},
        "zoom": camera.zoom,
        "cameraType": camera.camera_type,
        "fov": camera.fov,
        "aspect": aspect,
        "near": camera.near,
        "far": camera.far,
        "roll": camera.roll,
    }
