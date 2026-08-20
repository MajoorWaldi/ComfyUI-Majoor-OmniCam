"""Strict validation and clamping for OmniCam canonical tracks and editor state.

The parsing layer (track.py) is lenient and coerces values so old workflows keep
loading. This module is the strict layer used before queueing, importing external
captures, or persisting migrated documents:

- rejects NaN and Infinity in every numeric field;
- clamps FOV, roll, zoom, near/far, fps, dimensions and duration;
- whitelists projection, interpolation, render, object and material modes;
- validates object ids, names, transforms, keyframes and media annotations;
- clamps out-of-range keyframes to the track duration;
- enforces configurable limits on cameras, objects, keys and payload size.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass
from typing import Any

INTERPOLATION_MODES = frozenset({"ease", "smooth", "bezier", "linear", "ease_in", "ease_out"})
RENDER_MODES = frozenset({"omni_ref", "card_grid", "graybox", "grid", "point_field", "wireframe"})
CAMERA_TYPES = frozenset({"perspective", "orthographic"})
OBJECT_TYPES = frozenset({"card", "cube", "sphere", "human", "null", "ground", "model", "glb"})
MATERIAL_MODES = frozenset({"textured", "checker", "neutral", "wireframe"})
PROJECTION_MODES = CAMERA_TYPES
TANGENT_MODES = frozenset({"auto", "vector", "free", "aligned", "flat"})

FOV_RANGE = (5.0, 150.0)
ROLL_RANGE = (-180.0, 180.0)
FPS_RANGE = (1, 120)
DIMENSION_RANGE = (64, 4096)
MIN_NEAR = 1e-4


class ValidationError(ValueError):
    """Raised when an OmniCam payload cannot be repaired safely."""


@dataclass(slots=True)
class TrackLimits:
    max_cameras: int = 16
    max_objects: int = 256
    max_keys_per_track: int = 10000
    max_state_bytes: int = 2 * 1024 * 1024
    max_duration_frames: int = 120 * 120  # two minutes at 120 fps


DEFAULT_LIMITS = TrackLimits()


def require_finite(value: Any, path: str) -> float:
    try:
        number = float(value)
    except (TypeError, ValueError) as exc:
        raise ValidationError(f"{path} must be a number, got {value!r}") from exc
    if not math.isfinite(number):
        raise ValidationError(f"{path} must be finite, got {value!r}")
    return number


def clamp_number(value: Any, lo: float, hi: float, path: str) -> float:
    return max(lo, min(hi, require_finite(value, path)))


def _clamp_int(value: Any, lo: int, hi: int, path: str) -> int:
    return int(max(lo, min(hi, round(clamp_number(value, lo, hi, path)))))


def validate_vec3(value: Any, path: str) -> list[float]:
    if not isinstance(value, (list, tuple)) or len(value) != 3:
        raise ValidationError(f"{path} must be a [x, y, z] vector")
    return [require_finite(component, f"{path}[{index}]") for index, component in enumerate(value)]


def whitelist(value: Any, allowed: frozenset[str], path: str) -> str:
    text = str(value)
    if text not in allowed:
        raise ValidationError(f"{path} must be one of {sorted(allowed)}, got {text!r}")
    return text


def validate_camera(payload: dict[str, Any], path: str = "camera") -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValidationError(f"{path} must be an object")
    camera = dict(payload)
    camera["position"] = validate_vec3(camera.get("position", [6.0, 4.0, 6.0]), f"{path}.position")
    camera["target"] = validate_vec3(camera.get("target", [0.0, 1.5, 0.0]), f"{path}.target")
    camera["fov"] = clamp_number(camera.get("fov", 35.0), *FOV_RANGE, f"{path}.fov")
    camera["roll"] = clamp_number(camera.get("roll", 0.0), *ROLL_RANGE, f"{path}.roll")
    camera["zoom"] = max(0.01, require_finite(camera.get("zoom", 1.0), f"{path}.zoom"))
    near = max(MIN_NEAR, require_finite(camera.get("near", 0.01), f"{path}.near"))
    camera["near"] = near
    camera["far"] = max(near + MIN_NEAR, require_finite(camera.get("far", 10000.0), f"{path}.far"))
    camera["camera_type"] = whitelist(camera.get("camera_type", "perspective"), CAMERA_TYPES, f"{path}.camera_type")
    if "up" in camera:
        camera["up"] = validate_vec3(camera["up"], f"{path}.up")
    return camera


def validate_tangents(payload: Any, path: str) -> dict[str, Any] | None:
    """Editable Bézier handles: normalized segment offsets around the key value (per-key or per-channel)."""
    if payload is None:
        return None
    if not isinstance(payload, dict):
        raise ValidationError(f"{path} must be an object")
    validated: dict[str, Any] = {
        "mode": whitelist(payload.get("mode", "auto"), TANGENT_MODES, f"{path}.mode"),
        "out_x": clamp_number(payload.get("out_x", 1 / 3), 0.01, 0.99, f"{path}.out_x"),
        "out_y": require_finite(payload.get("out_y", 0.0), f"{path}.out_y"),
        "in_x": clamp_number(payload.get("in_x", -1 / 3), -0.99, -0.01, f"{path}.in_x"),
        "in_y": require_finite(payload.get("in_y", 0.0), f"{path}.in_y"),
    }
    channels = payload.get("channels")
    if isinstance(channels, dict):
        validated_channels = {}
        for ch_id, ch_payload in channels.items():
            if isinstance(ch_payload, dict):
                validated_channels[str(ch_id)[:40]] = {
                    "mode": whitelist(ch_payload.get("mode", validated["mode"]), TANGENT_MODES, f"{path}.channels[{ch_id}].mode"),
                    "out_x": clamp_number(ch_payload.get("out_x", 1 / 3), 0.01, 0.99, f"{path}.channels[{ch_id}].out_x"),
                    "out_y": require_finite(ch_payload.get("out_y", 0.0), f"{path}.channels[{ch_id}].out_y"),
                    "in_x": clamp_number(ch_payload.get("in_x", -1 / 3), -0.99, -0.01, f"{path}.channels[{ch_id}].in_x"),
                    "in_y": require_finite(ch_payload.get("in_y", 0.0), f"{path}.channels[{ch_id}].in_y"),
                }
        if validated_channels:
            validated["channels"] = validated_channels
    return validated


def validate_reference(payload: Any, path: str) -> dict[str, Any]:
    """An image/card reference influencing a frame or frame range."""
    if not isinstance(payload, dict):
        raise ValidationError(f"{path} must be an object")
    asset = payload.get("asset")
    if not isinstance(asset, str) or not asset:
        raise ValidationError(f"{path}.asset must be a media annotation string")
    if len(asset) > 512:
        raise ValidationError(f"{path}.asset annotation is too long")
    role = payload.get("role", "range")
    if role not in {"start", "middle", "end", "range"}:
        raise ValidationError(f"{path}.role must be start/middle/end/range")
    return {
        "asset": asset,
        "role": role,
        "influence": clamp_number(payload.get("influence", 1.0), 0.0, 1.0, f"{path}.influence"),
        "fade_frames": max(0, _clamp_int(payload.get("fade_frames", 0), 0, 100000, f"{path}.fade_frames")),
    }


def validate_camera_keyframes(keyframes: Any, duration_frames: int, path: str, limits: TrackLimits) -> list[dict[str, Any]]:
    if not isinstance(keyframes, list):
        raise ValidationError(f"{path} must be a list")
    if len(keyframes) > limits.max_keys_per_track:
        raise ValidationError(f"{path} has {len(keyframes)} keys, above the {limits.max_keys_per_track} limit")
    validated = []
    for index, key in enumerate(keyframes):
        if not isinstance(key, dict):
            raise ValidationError(f"{path}[{index}] must be an object")
        frame = _clamp_int(key.get("frame", 0), 0, max(0, duration_frames - 1), f"{path}[{index}].frame")
        references = key.get("references")
        validated.append(
            {
                "frame": frame,
                "camera": validate_camera(key.get("camera") if isinstance(key.get("camera"), dict) else key, f"{path}[{index}].camera"),
                "interpolation": whitelist(key.get("interpolation", "ease"), INTERPOLATION_MODES, f"{path}[{index}].interpolation"),
                **({"tangents": tangents} if (tangents := validate_tangents(key.get("tangents"), f"{path}[{index}].tangents")) else {}),
                **({"references": [validate_reference(ref, f"{path}[{index}].references[{r}]") for r, ref in enumerate(references)]} if isinstance(references, list) else {}),
            }
        )
    dedup = {key["frame"]: key for key in validated}
    return [dedup[frame] for frame in sorted(dedup)]


def validate_transform(transform: Any, path: str) -> dict[str, Any]:
    if not isinstance(transform, dict):
        raise ValidationError(f"{path} must be an object")
    raw_size = transform.get("size", [1, 1, 1])
    if isinstance(raw_size, (list, tuple)) and len(raw_size) == 2:
        raw_size = [raw_size[0], raw_size[1], 0.01]
    size = validate_vec3(raw_size, f"{path}.size")
    return {
        "position": validate_vec3(transform.get("position", [0, 0, 0]), f"{path}.position"),
        "rotation": validate_vec3(transform.get("rotation", [0, 0, 0]), f"{path}.rotation"),
        "size": [max(0.01, component) for component in size],
    }


def validate_object(payload: dict[str, Any], duration_frames: int, path: str, limits: TrackLimits) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValidationError(f"{path} must be an object")
    obj = dict(payload)
    object_id = str(obj.get("id") or "")
    if not object_id or len(object_id) > 80:
        raise ValidationError(f"{path}.id must be a non-empty id of at most 80 characters")
    obj["id"] = object_id
    obj["name"] = str(obj.get("name") or object_id)[:80]
    obj["type"] = whitelist(obj.get("type", "card"), OBJECT_TYPES, f"{path}.type")
    obj["material_mode"] = whitelist(obj.get("material_mode", "textured"), MATERIAL_MODES, f"{path}.material_mode")
    transform = validate_transform(obj, path)
    obj["position"], obj["rotation"], obj["size"] = transform["position"], transform["rotation"], transform["size"]
    keys = obj.get("keyframes") or []
    if not isinstance(keys, list):
        raise ValidationError(f"{path}.keyframes must be a list")
    if len(keys) > limits.max_keys_per_track:
        raise ValidationError(f"{path}.keyframes exceeds the {limits.max_keys_per_track} key limit")
    validated_keys = []
    for index, key in enumerate(keys):
        if not isinstance(key, dict):
            raise ValidationError(f"{path}.keyframes[{index}] must be an object")
        validated_keys.append(
            {
                "frame": _clamp_int(key.get("frame", 0), 0, max(0, duration_frames - 1), f"{path}.keyframes[{index}].frame"),
                "transform": validate_transform(key.get("transform", {}), f"{path}.keyframes[{index}].transform"),
                "interpolation": whitelist(key.get("interpolation", "ease"), INTERPOLATION_MODES, f"{path}.keyframes[{index}].interpolation"),
                **({"tangents": tangents} if (tangents := validate_tangents(key.get("tangents"), f"{path}.keyframes[{index}].tangents")) else {}),
            }
        )
    deduped = {key["frame"]: key for key in validated_keys}
    obj["keyframes"] = [deduped[frame] for frame in sorted(deduped)]
    asset = obj.get("asset")
    if asset is not None and not isinstance(asset, str):
        raise ValidationError(f"{path}.asset must be a media annotation string")
    if isinstance(asset, str) and len(asset) > 512:
        raise ValidationError(f"{path}.asset annotation is too long")
    return obj


def validate_track_payload(payload: dict[str, Any], limits: TrackLimits | None = None) -> dict[str, Any]:
    """Validate and clamp a canonical MAJOOR_OMNICAM_TRACK payload. Returns a cleaned copy."""
    limits = limits or DEFAULT_LIMITS
    if not isinstance(payload, dict):
        raise ValidationError("OmniCam track must be a JSON object")
    encoded = json.dumps(payload, default=str).encode("utf-8")
    if len(encoded) > limits.max_state_bytes:
        raise ValidationError(f"track payload is {len(encoded)} bytes, above the {limits.max_state_bytes} limit")
    track = dict(payload)
    track["fps"] = _clamp_int(track.get("fps", 24), *FPS_RANGE, "fps")
    track["duration_frames"] = _clamp_int(track.get("duration_frames", track["fps"] * 5), 1, limits.max_duration_frames, "duration_frames")
    track["width"] = _clamp_int(track.get("width", 1280), *DIMENSION_RANGE, "width")
    track["height"] = _clamp_int(track.get("height", 720), *DIMENSION_RANGE, "height")
    track["render_mode"] = whitelist(track.get("render_mode", "omni_ref"), RENDER_MODES, "render_mode")
    track["keyframes"] = validate_camera_keyframes(track.get("keyframes", []), track["duration_frames"], "keyframes", limits)
    objects = track.get("objects", [])
    if not isinstance(objects, list):
        raise ValidationError("objects must be a list")
    if len(objects) > limits.max_objects:
        raise ValidationError(f"objects has {len(objects)} entries, above the {limits.max_objects} limit")
    seen_ids: set[str] = set()
    validated_objects = []
    for index, obj in enumerate(objects):
        validated = validate_object(obj, track["duration_frames"], f"objects[{index}]", limits)
        if validated["id"] in seen_ids:
            raise ValidationError(f"objects[{index}].id duplicates {validated['id']!r}")
        seen_ids.add(validated["id"])
        validated_objects.append(validated)
    track["objects"] = validated_objects
    if "camera" in track and isinstance(track["camera"], dict):
        track["camera"] = validate_camera(track["camera"], "camera")
    return track


def validate_editor_state(payload: dict[str, Any], limits: TrackLimits | None = None) -> dict[str, Any]:
    """Validate an OMNICAM_EDITOR_STATE document (multi-camera editor document)."""
    limits = limits or DEFAULT_LIMITS
    if not isinstance(payload, dict):
        raise ValidationError("OmniCam editor state must be a JSON object")
    state = validate_track_payload(payload, limits)
    cameras = payload.get("cameras")
    if cameras is not None:
        if not isinstance(cameras, list):
            raise ValidationError("cameras must be a list")
        if len(cameras) > limits.max_cameras:
            raise ValidationError(f"cameras has {len(cameras)} entries, above the {limits.max_cameras} limit")
        seen: set[str] = set()
        validated_cameras = []
        for index, camera_track in enumerate(cameras):
            if not isinstance(camera_track, dict):
                raise ValidationError(f"cameras[{index}] must be an object")
            camera_id = str(camera_track.get("id") or f"camera_{index + 1}")
            if camera_id in seen:
                raise ValidationError(f"cameras[{index}].id duplicates {camera_id!r}")
            seen.add(camera_id)
            validated_cameras.append(
                {
                    **camera_track,
                    "id": camera_id,
                    "name": str(camera_track.get("name") or f"Camera {index + 1}")[:80],
                    "camera": validate_camera(camera_track.get("camera", {}), f"cameras[{index}].camera"),
                    "keyframes": validate_camera_keyframes(
                        camera_track.get("keyframes", []), state["duration_frames"], f"cameras[{index}].keyframes", limits
                    ),
                }
            )
        state["cameras"] = validated_cameras
        ids = {camera["id"] for camera in validated_cameras}
        for role in ("active_camera_id", "playblast_camera_id"):
            if role in state and state[role] not in ids:
                raise ValidationError(f"{role} references an unknown camera {state[role]!r}")
    encoded = json.dumps(state, default=str).encode("utf-8")
    if len(encoded) > limits.max_state_bytes:
        raise ValidationError(f"editor state is {len(encoded)} bytes, above the {limits.max_state_bytes} limit")
    return state
