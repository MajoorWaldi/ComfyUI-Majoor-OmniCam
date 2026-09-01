"""Sample sparse, normalized MotionScene layers on a resolved time range."""

from __future__ import annotations

import bisect
import math
from dataclasses import dataclass

from .motion_scene import MotionKey, MotionLayer
from .validation import ValidationError


@dataclass(slots=True)
class SampledTrack:
    """One layer resolved onto a sample grid.

    ``xy`` is normalized but deliberately *not* clamped to 0..1: a point that
    leaves frame still has a real position, and an adapter that understands
    re-entry or occlusion needs it. Only ``visible`` says whether it is on
    screen.

    ``defined`` is narrower and says whether ``xy`` is a projection at all. A
    point behind the camera has no screen position, and the placeholder written
    for it would otherwise be indistinguishable from a real coordinate at the
    top-left corner.
    """

    id: str
    label: str
    xy: list[tuple[float, float]]
    visible: list[bool]
    defined: list[bool] | None = None

    def is_defined(self, index: int) -> bool:
        return True if self.defined is None else bool(self.defined[index])


def _finite(value: float, path: str) -> float:
    if isinstance(value, bool):
        raise ValidationError(f"{path} must be finite")
    try:
        number = float(value)
    except (TypeError, ValueError) as error:
        raise ValidationError(f"{path} must be finite") from error
    if not math.isfinite(number):
        raise ValidationError(f"{path} must be finite")
    return number


def media_duration_seconds(frame_count: int, fps: float) -> float:
    """How long the clip *plays*: every frame is shown for 1/fps.

    This is the media convention -- 120 frames at 24 fps is a 5 second clip --
    and it is the right number for a duration widget or a container header.
    It is NOT the timestamp of the last frame.
    """
    return _positive_frame_count(frame_count) / _positive_fps(fps)


def last_frame_time_seconds(frame_count: int, fps: float) -> float:
    """When the *last* frame is shown: (frame_count - 1) / fps.

    Frame i is displayed at i/fps, so the final frame of a 120-frame 24 fps clip
    sits at 4.958333s, not 5.0. Sampling a trajectory across [0, media_duration]
    therefore stretches it by one frame -- a systematic ~0.8% temporal dilation
    at 120 frames, and the reason every profile samples on this span instead.
    """
    return (_positive_frame_count(frame_count) - 1) / _positive_fps(fps)


def frame_times(frame_count: int, fps: float) -> list[float]:
    """The exact presentation timestamp of every frame."""
    rate = _positive_fps(fps)
    return [index / rate for index in range(_positive_frame_count(frame_count))]


def _positive_frame_count(frame_count: int) -> int:
    if isinstance(frame_count, bool) or not isinstance(frame_count, int) or frame_count < 1:
        raise ValidationError("frame_count must be a positive integer")
    return frame_count


def _positive_fps(fps: float) -> float:
    rate = _finite(fps, "fps")
    if rate <= 0:
        raise ValidationError("fps must be greater than zero")
    return rate


def sample_times(sample_count: int, in_seconds: float, out_seconds: float) -> list[float]:
    if isinstance(sample_count, bool) or not isinstance(sample_count, int) or sample_count < 1:
        raise ValidationError("sample_count must be a positive integer")
    start = _finite(in_seconds, "in_seconds")
    end = _finite(out_seconds, "out_seconds")
    if start < 0:
        raise ValidationError("in_seconds must be non-negative")
    if end < start:
        raise ValidationError("out_seconds must be greater than or equal to in_seconds")
    if sample_count == 1:
        return [start]
    step = (end - start) / (sample_count - 1)
    return [start + index * step for index in range(sample_count - 1)] + [end]


def _easing(mode: str, amount: float) -> float:
    if mode == "hold":
        return 0.0
    if mode == "smooth":
        return amount * amount * (3.0 - 2.0 * amount)
    return amount


def _sample_key(keys: list[MotionKey], key_times: list[float], time_seconds: float) -> tuple[tuple[float, float], bool]:
    if time_seconds <= key_times[0]:
        key = keys[0]
        return (key.x, key.y), key.visible
    if time_seconds >= key_times[-1]:
        key = keys[-1]
        return (key.x, key.y), key.visible

    right_index = bisect.bisect_right(key_times, time_seconds)
    left = keys[right_index - 1]
    right = keys[right_index]
    span = right.time_seconds - left.time_seconds
    if span <= 0:
        return (right.x, right.y), right.visible
    amount = _easing(left.interpolation, (time_seconds - left.time_seconds) / span)
    return (
        (left.x + (right.x - left.x) * amount, left.y + (right.y - left.y) * amount),
        left.visible,
    )


def sample_motion_layer(
    layer: MotionLayer,
    *,
    sample_count: int,
    in_seconds: float,
    out_seconds: float,
) -> SampledTrack:
    """Sample one sparse layer inclusively between in_seconds and out_seconds."""
    if not layer.keys:
        raise ValidationError(f"motion layer {layer.id!r} has no keys")
    times = sample_times(sample_count, in_seconds, out_seconds)
    key_times = [key.time_seconds for key in layer.keys]
    samples = [_sample_key(layer.keys, key_times, time_seconds) for time_seconds in times]
    return SampledTrack(
        id=layer.id,
        label=layer.label,
        xy=[sample[0] for sample in samples],
        visible=[sample[1] for sample in samples],
    )


def sample_motion_layers(
    layers: list[MotionLayer],
    *,
    sample_count: int,
    in_seconds: float,
    out_seconds: float,
) -> list[SampledTrack]:
    """Sample enabled layers in canonical scene order."""
    return [
        sample_motion_layer(
            layer,
            sample_count=sample_count,
            in_seconds=in_seconds,
            out_seconds=out_seconds,
        )
        for layer in layers
        if layer.enabled
    ]
