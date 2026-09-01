"""Model-independent motion scene carried between OmniCam product nodes."""

from __future__ import annotations

import copy
import json
import math
from dataclasses import dataclass
from itertools import pairwise
from typing import Any

from .track import OmniCamTrack
from .validation import ValidationError, validate_track_payload

MOTION_SCENE_VERSION = 1
MOTION_INTERPOLATIONS = frozenset({"linear", "smooth", "hold"})
MOTION_SOURCE_KINDS = frozenset(
    {"manual_2d", "static_anchor", "world_point", "object_point", "camera_field"}
)


def _object(value: Any, path: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValidationError(f"{path} must be an object")
    return value


def _list(value: Any, path: str) -> list[Any]:
    if not isinstance(value, list):
        raise ValidationError(f"{path} must be a list")
    return value


def _string(value: Any, path: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(f"{path} must be a non-empty string")
    return value


def _boolean(value: Any, path: str) -> bool:
    if not isinstance(value, bool):
        raise ValidationError(f"{path} must be a boolean")
    return value


def _finite(value: Any, path: str) -> float:
    if isinstance(value, bool):
        raise ValidationError(f"{path} must be a finite number")
    try:
        number = float(value)
    except (TypeError, ValueError) as error:
        raise ValidationError(f"{path} must be a finite number") from error
    if not math.isfinite(number):
        raise ValidationError(f"{path} must be finite")
    return number


def _positive(value: Any, path: str) -> float:
    number = _finite(value, path)
    if number <= 0:
        raise ValidationError(f"{path} must be greater than zero")
    return number


def _positive_int(value: Any, path: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise ValidationError(f"{path} must be a positive integer")
    return value


def _json_value(value: Any, path: str) -> Any:
    try:
        json.dumps(value, allow_nan=False)
    except (TypeError, ValueError) as error:
        raise ValidationError(f"{path} must contain finite JSON values") from error
    return copy.deepcopy(value)


@dataclass(slots=True)
class TimelineSpec:
    duration_seconds: float
    authoring_fps: float

    @classmethod
    def from_dict(cls, payload: Any) -> TimelineSpec:
        data = _object(payload, "timeline")
        return cls(
            duration_seconds=_positive(data.get("duration_seconds"), "timeline.duration_seconds"),
            authoring_fps=_positive(data.get("authoring_fps"), "timeline.authoring_fps"),
        )

    def to_dict(self) -> dict[str, float]:
        return {
            "duration_seconds": self.duration_seconds,
            "authoring_fps": self.authoring_fps,
        }


@dataclass(slots=True)
class CanvasSpec:
    width: int
    height: int

    @classmethod
    def from_dict(cls, payload: Any) -> CanvasSpec:
        data = _object(payload, "canvas")
        return cls(
            width=_positive_int(data.get("width"), "canvas.width"),
            height=_positive_int(data.get("height"), "canvas.height"),
        )

    def to_dict(self) -> dict[str, int]:
        return {"width": self.width, "height": self.height}


@dataclass(slots=True)
class MotionKey:
    time_seconds: float
    x: float
    y: float
    visible: bool = True
    interpolation: str = "linear"

    @classmethod
    def from_dict(cls, payload: Any, path: str) -> MotionKey:
        data = _object(payload, path)
        time_seconds = _finite(data.get("time_seconds"), f"{path}.time_seconds")
        if time_seconds < 0:
            raise ValidationError(f"{path}.time_seconds must be non-negative")
        x = _finite(data.get("x"), f"{path}.x")
        y = _finite(data.get("y"), f"{path}.y")
        if not 0.0 <= x <= 1.0:
            raise ValidationError(f"{path}.x must be within 0..1")
        if not 0.0 <= y <= 1.0:
            raise ValidationError(f"{path}.y must be within 0..1")
        interpolation = _string(data.get("interpolation", "linear"), f"{path}.interpolation")
        if interpolation not in MOTION_INTERPOLATIONS:
            raise ValidationError(
                f"{path}.interpolation must be one of {sorted(MOTION_INTERPOLATIONS)}"
            )
        return cls(
            time_seconds=time_seconds,
            x=x,
            y=y,
            visible=_boolean(data.get("visible", True), f"{path}.visible"),
            interpolation=interpolation,
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "time_seconds": self.time_seconds,
            "x": self.x,
            "y": self.y,
            "visible": self.visible,
            "interpolation": self.interpolation,
        }


@dataclass(slots=True)
class MotionLayer:
    id: str
    label: str
    enabled: bool
    semantic: str
    source_kind: str
    keys: list[MotionKey]
    source: dict[str, Any]

    @classmethod
    def from_dict(cls, payload: Any, path: str) -> MotionLayer:
        data = _object(payload, path)
        source_kind = _string(data.get("source_kind"), f"{path}.source_kind")
        if source_kind not in MOTION_SOURCE_KINDS:
            raise ValidationError(
                f"{path}.source_kind must be one of {sorted(MOTION_SOURCE_KINDS)}"
            )
        keys = [
            MotionKey.from_dict(key, f"{path}.keys[{index}]")
            for index, key in enumerate(_list(data.get("keys"), f"{path}.keys"))
        ]
        if not keys:
            raise ValidationError(f"{path}.keys must not be empty")
        if any(right.time_seconds < left.time_seconds for left, right in pairwise(keys)):
            raise ValidationError(f"{path}.keys must be ordered by time_seconds")
        source = _object(data.get("source", {}), f"{path}.source")
        return cls(
            id=_string(data.get("id"), f"{path}.id"),
            label=_string(data.get("label"), f"{path}.label"),
            enabled=_boolean(data.get("enabled"), f"{path}.enabled"),
            semantic=_string(data.get("semantic"), f"{path}.semantic"),
            source_kind=source_kind,
            keys=keys,
            source=_json_value(source, f"{path}.source"),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "enabled": self.enabled,
            "semantic": self.semantic,
            "source_kind": self.source_kind,
            "keys": [key.to_dict() for key in self.keys],
            "source": copy.deepcopy(self.source),
        }


@dataclass(slots=True)
class CameraSceneItem:
    id: str
    label: str
    enabled: bool
    track: OmniCamTrack

    @classmethod
    def from_dict(cls, payload: Any, path: str) -> CameraSceneItem:
        data = _object(payload, path)
        track_payload = _object(data.get("track"), f"{path}.track")
        return cls(
            id=_string(data.get("id"), f"{path}.id"),
            label=_string(data.get("label"), f"{path}.label"),
            enabled=_boolean(data.get("enabled"), f"{path}.enabled"),
            track=OmniCamTrack.from_dict(validate_track_payload(track_payload)),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "enabled": self.enabled,
            "track": self.track.to_dict(),
        }


@dataclass(slots=True)
class MotionScene:
    version: int
    timeline: TimelineSpec
    canvas: CanvasSpec
    cameras: list[CameraSceneItem]
    active_camera_id: str
    playblast_camera_id: str
    objects: list[dict[str, Any]]
    motion_layers: list[MotionLayer]
    cuts: list[dict[str, Any]]
    metadata: dict[str, Any]

    @classmethod
    def from_dict(cls, payload: Any) -> MotionScene:
        data = _object(payload, "motion_scene")
        version = data.get("version")
        if version != MOTION_SCENE_VERSION:
            raise ValidationError(
                f"motion_scene.version must be {MOTION_SCENE_VERSION}, got {version!r}"
            )
        timeline = TimelineSpec.from_dict(data.get("timeline"))
        canvas = CanvasSpec.from_dict(data.get("canvas"))
        cameras = [
            CameraSceneItem.from_dict(camera, f"cameras[{index}]")
            for index, camera in enumerate(_list(data.get("cameras"), "cameras"))
        ]
        if not cameras:
            raise ValidationError("cameras must not be empty")
        cls._validate_unique_ids(cameras, "camera")

        camera_ids = {camera.id for camera in cameras}
        active_camera_id = _string(data.get("active_camera_id"), "active_camera_id")
        playblast_camera_id = _string(data.get("playblast_camera_id"), "playblast_camera_id")
        if active_camera_id not in camera_ids:
            raise ValidationError(f"active_camera_id references unknown camera {active_camera_id!r}")
        if playblast_camera_id not in camera_ids:
            raise ValidationError(
                f"playblast_camera_id references unknown camera {playblast_camera_id!r}"
            )

        motion_layers = [
            MotionLayer.from_dict(layer, f"motion_layers[{index}]")
            for index, layer in enumerate(
                _list(data.get("motion_layers", []), "motion_layers")
            )
        ]
        cls._validate_unique_ids(motion_layers, "motion layer")
        for layer in motion_layers:
            if layer.keys[-1].time_seconds > timeline.duration_seconds:
                raise ValidationError(
                    f"motion layer {layer.id!r} has a key outside timeline duration"
                )

        objects = _list(data.get("objects", []), "objects")
        cuts = _list(data.get("cuts", []), "cuts")
        metadata = _object(data.get("metadata", {}), "metadata")
        scene = cls(
            version=version,
            timeline=timeline,
            canvas=canvas,
            cameras=cameras,
            active_camera_id=active_camera_id,
            playblast_camera_id=playblast_camera_id,
            objects=_json_value(objects, "objects"),
            motion_layers=motion_layers,
            cuts=_json_value(cuts, "cuts"),
            metadata=_json_value(metadata, "metadata"),
        )
        scene._validate_camera_tracks()
        return scene

    @staticmethod
    def _validate_unique_ids(items: list[Any], label: str) -> None:
        ids = [item.id for item in items]
        duplicates = sorted({item_id for item_id in ids if ids.count(item_id) > 1})
        if duplicates:
            raise ValidationError(f"duplicate {label} id: {duplicates[0]!r}")

    def _validate_camera_tracks(self) -> None:
        for camera in self.cameras:
            if camera.track.width != self.canvas.width or camera.track.height != self.canvas.height:
                raise ValidationError(
                    f"camera {camera.id!r} dimensions do not match the scene canvas"
                )
            if not math.isclose(
                camera.track.duration_seconds,
                self.timeline.duration_seconds,
                rel_tol=0.0,
                abs_tol=1e-9,
            ):
                raise ValidationError(
                    f"camera {camera.id!r} duration does not match the scene timeline"
                )

    @classmethod
    def from_json(cls, payload: str) -> MotionScene:
        try:
            data = json.loads(payload)
        except (TypeError, json.JSONDecodeError) as error:
            raise ValidationError(f"Invalid MotionScene JSON: {error}") from error
        return cls.from_dict(data)

    def to_dict(self) -> dict[str, Any]:
        return {
            "version": self.version,
            "timeline": self.timeline.to_dict(),
            "canvas": self.canvas.to_dict(),
            "cameras": [camera.to_dict() for camera in self.cameras],
            "active_camera_id": self.active_camera_id,
            "playblast_camera_id": self.playblast_camera_id,
            "objects": copy.deepcopy(self.objects),
            "motion_layers": [layer.to_dict() for layer in self.motion_layers],
            "cuts": copy.deepcopy(self.cuts),
            "metadata": copy.deepcopy(self.metadata),
        }

    def to_json(self, *, indent: int | None = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent, allow_nan=False)


def motion_scene_from_camera_track(
    payload: dict[str, Any],
    *,
    camera_id: str = "extracted_camera",
    label: str = "Extracted Camera",
) -> MotionScene:
    """Wrap one validated camera solve in the canonical scene container."""
    track = OmniCamTrack.from_dict(validate_track_payload(payload))
    track_payload = track.to_dict()
    return MotionScene.from_dict(
        {
            "version": MOTION_SCENE_VERSION,
            "timeline": {
                "duration_seconds": track.duration_seconds,
                "authoring_fps": float(track.fps),
            },
            "canvas": {"width": track.width, "height": track.height},
            "cameras": [
                {
                    "id": camera_id,
                    "label": label,
                    "enabled": True,
                    "track": track_payload,
                }
            ],
            "active_camera_id": camera_id,
            "playblast_camera_id": camera_id,
            "objects": copy.deepcopy(track_payload.get("objects", [])),
            "motion_layers": [],
            "cuts": [],
            "metadata": copy.deepcopy(track.metadata),
        }
    )
