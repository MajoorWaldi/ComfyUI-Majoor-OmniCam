"""Pure-geometry orbit/elevation/radius analysis for the H3 scene-coverage profile.

This module reduces an ``OmniCamTrack`` to the spherical camera facts a
target-centric orbit contract needs: signed azimuth travel, elevation and
radius change, parallax, reversals and loop closure. It never imports
ComfyUI so it stays testable in the model-agnostic lane.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from itertools import pairwise

from ..core.track import CameraState, OmniCamTrack

SIGNIFICANT_ORBIT_DELTA_DEGREES = 0.25

# Loop-closure tolerances (see plan section 3): a returned camera must match
# the opening view within these bands before the downstream coverage option
# is allowed to claim closure.
_LOOP_CLOSURE_POSITION_ERROR_RATIO = 0.02
_LOOP_CLOSURE_TARGET_ERROR_RATIO = 0.01
_LOOP_CLOSURE_ELEVATION_DEGREES = 0.5
_LOOP_CLOSURE_RADIUS_RATIO_DELTA = 0.01
_LOOP_CLOSURE_ROLL_DEGREES = 0.5
_LOOP_CLOSURE_FOV_DEGREES = 1.0
_LOOP_CLOSURE_REMAINDER_DEGREES = 1.0


@dataclass(frozen=True)
class H3OrbitSample:
    frame: int
    time_seconds: float
    azimuth_degrees: float
    elevation_degrees: float
    radius_ratio: float
    fov_degrees: float


@dataclass(frozen=True)
class H3OrbitSegment:
    start_frame: int
    end_frame: int
    start_seconds: float
    end_seconds: float
    delta_azimuth_degrees: float
    delta_elevation_degrees: float
    delta_radius_ratio: float
    rotation_degrees_per_second: float
    parallax_frame_widths: float
    direction: str
    speed_curve: str
    reverses_after: bool


@dataclass(frozen=True)
class H3GeometryAnalysis:
    samples: tuple[H3OrbitSample, ...]
    segments: tuple[H3OrbitSegment, ...]
    net_orbit_degrees: float
    total_orbit_degrees: float
    path_length_world: float
    max_target_drift_ratio: float
    max_roll_delta_degrees: float
    max_fov_delta_degrees: float
    start_radius: float
    horizontal_fov_degrees: float
    coverage_direction: str
    loop_closure: bool
    endpoint_position_error_ratio: float
    endpoint_target_error_ratio: float


def horizontal_fov(vertical_fov_degrees: float, aspect: float) -> float:
    half = math.radians(vertical_fov_degrees) * 0.5
    return math.degrees(2.0 * math.atan(math.tan(half) * aspect))


def _unwrap_degrees(previous_raw: float, previous_unwrapped: float, current_raw: float) -> float:
    delta = (current_raw - previous_raw + 180.0) % 360.0 - 180.0
    return previous_unwrapped + delta


def _spherical(position: list[float], anchor: list[float], start_radius: float) -> tuple[float, float, float, float]:
    dx = position[0] - anchor[0]
    dy = position[1] - anchor[1]
    dz = position[2] - anchor[2]
    radius = math.sqrt(dx * dx + dy * dy + dz * dz)
    azimuth = math.degrees(math.atan2(dx, dz))
    elevation = math.degrees(math.atan2(dy, math.hypot(dx, dz)))
    radius_ratio = radius / start_radius
    return radius, azimuth, elevation, radius_ratio


def _direction_for(net_degrees: float) -> str:
    return "counterclockwise / camera left" if net_degrees >= 0.0 else "clockwise / camera right"


def _speed_curve(delta_a: float, delta_b: float) -> str:
    if delta_b == 0.0 or abs(delta_a) < 1e-9:
        return "linear"
    ratio = delta_b / delta_a
    if ratio > 1.05:
        return "accelerating"
    if ratio < 0.95:
        return "decelerating"
    return "linear"


def analyze_h3_geometry(track: OmniCamTrack) -> H3GeometryAnalysis:
    duration = max(1, track.duration_frames)
    cameras: list[CameraState] = [track.sample(frame) for frame in range(duration)]
    anchor = list(cameras[0].target)
    start_radius = math.sqrt(sum((cameras[0].position[i] - anchor[i]) ** 2 for i in range(3)))
    if start_radius < 1e-6:
        raise ValueError("H3 scene coverage requires a non-degenerate start radius (camera at target)")

    aspect = (track.width / track.height) if track.height else 16.0 / 9.0

    samples: list[H3OrbitSample] = []
    unwrapped = 0.0
    raw_previous = 0.0
    max_target_drift_ratio = 0.0
    max_roll_delta_degrees = 0.0
    max_fov_delta_degrees = 0.0
    path_length_world = 0.0
    fov_total = 0.0

    for index, camera in enumerate(cameras):
        radius, raw_azimuth, elevation, radius_ratio = _spherical(camera.position, anchor, start_radius)
        if index == 0:
            unwrapped = raw_azimuth
        else:
            unwrapped = _unwrap_degrees(raw_previous, unwrapped, raw_azimuth)
            path_length_world += math.sqrt(sum((camera.position[i] - cameras[index - 1].position[i]) ** 2 for i in range(3)))
        raw_previous = raw_azimuth

        target_drift = math.sqrt(sum((camera.target[i] - anchor[i]) ** 2 for i in range(3))) / start_radius
        max_target_drift_ratio = max(max_target_drift_ratio, target_drift)
        max_roll_delta_degrees = max(max_roll_delta_degrees, abs(camera.roll - cameras[0].roll))
        max_fov_delta_degrees = max(max_fov_delta_degrees, abs(camera.fov - cameras[0].fov))
        fov_total += camera.fov

        samples.append(
            H3OrbitSample(
                frame=index,
                time_seconds=index / track.fps,
                azimuth_degrees=unwrapped,
                elevation_degrees=elevation,
                radius_ratio=radius_ratio,
                fov_degrees=camera.fov,
            )
        )

    avg_fov = fov_total / len(samples)
    horizontal_fov_degrees = horizontal_fov(avg_fov, aspect)

    keyframe_frames = sorted({key.frame for key in track.keyframes}) if track.keyframes else [0, duration - 1]
    if keyframe_frames[0] != 0:
        keyframe_frames.insert(0, 0)
    if keyframe_frames[-1] != duration - 1:
        keyframe_frames.append(duration - 1)

    segments: list[H3OrbitSegment] = []
    total_orbit_degrees = 0.0
    previous_delta_azimuth: float | None = None
    for index, (start_frame, end_frame) in enumerate(pairwise(keyframe_frames)):
        if end_frame == start_frame:
            continue
        start_sample = samples[start_frame]
        end_sample = samples[end_frame]
        delta_azimuth = end_sample.azimuth_degrees - start_sample.azimuth_degrees
        delta_elevation = end_sample.elevation_degrees - start_sample.elevation_degrees
        delta_radius = end_sample.radius_ratio - start_sample.radius_ratio
        duration_seconds = (end_frame - start_frame) / track.fps
        rotation_speed = abs(delta_azimuth) / duration_seconds if duration_seconds > 0 else 0.0
        parallax = abs(delta_azimuth) / max(horizontal_fov_degrees, 1e-6)
        total_orbit_degrees += abs(delta_azimuth)

        reverses_after = False
        if (
            previous_delta_azimuth is not None
            and abs(previous_delta_azimuth) >= SIGNIFICANT_ORBIT_DELTA_DEGREES
            and abs(delta_azimuth) >= SIGNIFICANT_ORBIT_DELTA_DEGREES
            and (previous_delta_azimuth > 0) != (delta_azimuth > 0)
        ):
            segments[-1] = _with_reversal(segments[-1])

        mid_frame = (start_frame + end_frame) // 2
        first_half_delta = samples[mid_frame].azimuth_degrees - start_sample.azimuth_degrees if mid_frame > start_frame else delta_azimuth
        second_half_delta = end_sample.azimuth_degrees - samples[mid_frame].azimuth_degrees if mid_frame > start_frame else 0.0

        segments.append(
            H3OrbitSegment(
                start_frame=start_frame,
                end_frame=end_frame,
                start_seconds=start_sample.time_seconds,
                end_seconds=end_sample.time_seconds,
                delta_azimuth_degrees=delta_azimuth,
                delta_elevation_degrees=delta_elevation,
                delta_radius_ratio=delta_radius,
                rotation_degrees_per_second=rotation_speed,
                parallax_frame_widths=parallax,
                direction=_direction_for(delta_azimuth) if abs(delta_azimuth) >= SIGNIFICANT_ORBIT_DELTA_DEGREES else "static",
                speed_curve=_speed_curve(first_half_delta, second_half_delta),
                reverses_after=False,
            )
        )
        previous_delta_azimuth = delta_azimuth if abs(delta_azimuth) >= SIGNIFICANT_ORBIT_DELTA_DEGREES else previous_delta_azimuth

    net_orbit_degrees = samples[-1].azimuth_degrees - samples[0].azimuth_degrees
    coverage_direction = _direction_for(net_orbit_degrees)

    endpoint_position_error_ratio = math.sqrt(
        sum((cameras[-1].position[i] - cameras[0].position[i]) ** 2 for i in range(3))
    ) / start_radius
    endpoint_target_error_ratio = math.sqrt(
        sum((cameras[-1].target[i] - cameras[0].target[i]) ** 2 for i in range(3))
    ) / start_radius

    loop_closure = _evaluate_loop_closure(
        net_orbit_degrees=net_orbit_degrees,
        endpoint_position_error_ratio=endpoint_position_error_ratio,
        endpoint_target_error_ratio=endpoint_target_error_ratio,
        elevation_delta=abs(samples[-1].elevation_degrees - samples[0].elevation_degrees),
        radius_ratio_delta=abs(samples[-1].radius_ratio - samples[0].radius_ratio),
        roll_delta=abs(cameras[-1].roll - cameras[0].roll),
        fov_delta=abs(cameras[-1].fov - cameras[0].fov),
    )

    return H3GeometryAnalysis(
        samples=tuple(samples),
        segments=tuple(segments),
        net_orbit_degrees=net_orbit_degrees,
        total_orbit_degrees=total_orbit_degrees,
        path_length_world=path_length_world,
        max_target_drift_ratio=max_target_drift_ratio,
        max_roll_delta_degrees=max_roll_delta_degrees,
        max_fov_delta_degrees=max_fov_delta_degrees,
        start_radius=start_radius,
        horizontal_fov_degrees=horizontal_fov_degrees,
        coverage_direction=coverage_direction,
        loop_closure=loop_closure,
        endpoint_position_error_ratio=endpoint_position_error_ratio,
        endpoint_target_error_ratio=endpoint_target_error_ratio,
    )


def _with_reversal(segment: H3OrbitSegment) -> H3OrbitSegment:
    return H3OrbitSegment(
        start_frame=segment.start_frame,
        end_frame=segment.end_frame,
        start_seconds=segment.start_seconds,
        end_seconds=segment.end_seconds,
        delta_azimuth_degrees=segment.delta_azimuth_degrees,
        delta_elevation_degrees=segment.delta_elevation_degrees,
        delta_radius_ratio=segment.delta_radius_ratio,
        rotation_degrees_per_second=segment.rotation_degrees_per_second,
        parallax_frame_widths=segment.parallax_frame_widths,
        direction=segment.direction,
        speed_curve=segment.speed_curve,
        reverses_after=True,
    )


def _evaluate_loop_closure(
    *,
    net_orbit_degrees: float,
    endpoint_position_error_ratio: float,
    endpoint_target_error_ratio: float,
    elevation_delta: float,
    radius_ratio_delta: float,
    roll_delta: float,
    fov_delta: float,
) -> bool:
    magnitude = abs(net_orbit_degrees)
    if magnitude < 360.0 - _LOOP_CLOSURE_REMAINDER_DEGREES:
        return False
    remainder = magnitude % 360.0
    remainder_error = min(remainder, 360.0 - remainder)
    if remainder_error > _LOOP_CLOSURE_REMAINDER_DEGREES:
        return False
    return (
        endpoint_position_error_ratio <= _LOOP_CLOSURE_POSITION_ERROR_RATIO
        and endpoint_target_error_ratio <= _LOOP_CLOSURE_TARGET_ERROR_RATIO
        and elevation_delta <= _LOOP_CLOSURE_ELEVATION_DEGREES
        and radius_ratio_delta <= _LOOP_CLOSURE_RADIUS_RATIO_DELTA
        and roll_delta <= _LOOP_CLOSURE_ROLL_DEGREES
        and fov_delta <= _LOOP_CLOSURE_FOV_DEGREES
    )


__all__ = [
    "H3OrbitSample",
    "H3OrbitSegment",
    "H3GeometryAnalysis",
    "analyze_h3_geometry",
    "horizontal_fov",
]
