"""Resolve every enabled MotionScene layer to normalized screen samples."""

from __future__ import annotations

from .motion_projection import ProjectedPoint, project_object_track, project_world_track
from .motion_sampling import SampledTrack, sample_motion_layer, sample_times
from .motion_scene import MotionLayer, MotionScene
from .track import OmniCamTrack
from .validation import ValidationError

_AUTHORED_SCREEN_SOURCES = frozenset({"manual_2d", "static_anchor"})
_WORLD_SOURCES = frozenset({"world_point", "camera_field"})


def _camera_track(scene: MotionScene) -> OmniCamTrack:
    camera = next(
        (item for item in scene.cameras if item.id == scene.playblast_camera_id),
        None,
    )
    if camera is None:
        raise ValidationError("MotionScene has no selected playblast camera")
    return camera.track


def _projected_sample(
    layer: MotionLayer,
    projected: list[ProjectedPoint],
    authored: SampledTrack,
) -> SampledTrack:
    return SampledTrack(
        id=layer.id,
        label=layer.label,
        xy=[
            (
                0.0 if point.x is None else point.x,
                0.0 if point.y is None else point.y,
            )
            for point in projected
        ],
        visible=[
            authored.visible[index] and point.visible
            for index, point in enumerate(projected)
        ],
    )


def _resolve_projected_layer(
    scene: MotionScene,
    layer: MotionLayer,
    authored: SampledTrack,
    times: list[float],
    *,
    width: int,
    height: int,
) -> SampledTrack:
    camera_track = _camera_track(scene)
    if layer.source_kind in _WORLD_SOURCES:
        point = layer.source.get("point")
        if not isinstance(point, list):
            raise ValidationError(f"motion layer {layer.id!r} world source requires point")
        projected = project_world_track(
            point,
            camera_track,
            times,
            width=width,
            height=height,
        )
    elif layer.source_kind == "object_point":
        object_id = layer.source.get("object_id")
        local_point = layer.source.get("local_point")
        if not isinstance(object_id, str) or not object_id:
            raise ValidationError(f"motion layer {layer.id!r} object source requires object_id")
        if not isinstance(local_point, list):
            raise ValidationError(f"motion layer {layer.id!r} object source requires local_point")
        projected = project_object_track(
            scene.objects,
            object_id,
            local_point,
            camera_track,
            times,
            width=width,
            height=height,
        )
    else:
        raise ValidationError(f"unsupported motion source kind: {layer.source_kind!r}")
    return _projected_sample(layer, projected, authored)


def resolve_motion_scene_tracks(
    scene: MotionScene,
    *,
    sample_count: int,
    out_seconds: float,
    in_seconds: float = 0.0,
    width: int | None = None,
    height: int | None = None,
) -> list[SampledTrack]:
    """Sample enabled layers in scene order without applying model semantics."""
    times = sample_times(sample_count, in_seconds, out_seconds)
    target_width = scene.canvas.width if width is None else width
    target_height = scene.canvas.height if height is None else height
    resolved: list[SampledTrack] = []
    for layer in scene.motion_layers:
        if not layer.enabled:
            continue
        authored = sample_motion_layer(
            layer,
            sample_count=sample_count,
            in_seconds=in_seconds,
            out_seconds=out_seconds,
        )
        if layer.source_kind in _AUTHORED_SCREEN_SOURCES:
            resolved.append(authored)
        else:
            resolved.append(
                _resolve_projected_layer(
                    scene,
                    layer,
                    authored,
                    times,
                    width=target_width,
                    height=target_height,
                )
            )
    return resolved
