"""Complete H3 scene-coverage prompt renderer.

Turns an :class:`~omnicam.adapters.h3_geometry.H3GeometryAnalysis` into the
full H3 prompt document (subject/summary/retention/detailed description/
soundscape/music sections). The ``detailed_description`` section is the
enforceable camera contract: reference anchor, camera-vs-subject framing,
target/lens stability, direction, completion, parallax, the mapped segment
schedule, closure (when eligible), forbidden changes and the artist prompt.
"""

from __future__ import annotations

from .h3_geometry import H3GeometryAnalysis, H3OrbitSegment
from .h3_scene_coverage import H3_SCENE_FPS, map_h3_scene_frame
from ..core.track import OmniCamTrack

_STATIC_ORBIT_THRESHOLD_DEGREES = 5.0


def build_h3_scene_coverage_prompt(
    track: OmniCamTrack,
    analysis: H3GeometryAnalysis,
    *,
    target_frames: int,
    base_prompt: str = "",
    max_segments: int = 12,
) -> str:
    is_static = analysis.total_orbit_degrees < _STATIC_ORBIT_THRESHOLD_DEGREES
    target_duration_seconds = target_frames / H3_SCENE_FPS

    sections = {
        "subject_definitions": (
            "<Picture 1> is the fixed scene/subject anchor. The subject identity, materials, "
            "lighting and background layout stay exactly as shown, unaltered by the camera move."
        ),
        "summary": _summary(analysis, is_static, target_duration_seconds),
        "retention_analysis": (
            "Retain the exact subject geometry, texture detail, lighting direction and background "
            "layout from <Picture 1> across every frame; only the camera's physical position changes."
        ),
        "detailed_description": _detailed_description(
            track, analysis, is_static=is_static, target_frames=target_frames,
            target_duration_seconds=target_duration_seconds, base_prompt=base_prompt, max_segments=max_segments,
        ),
        "overall_soundscape": "Silence.",
        "non_diegetic_music": "N/A",
    }

    return "\n\n".join(f"{heading}:\n{body}" for heading, body in sections.items())


def _summary(analysis: H3GeometryAnalysis, is_static: bool, target_duration_seconds: float) -> str:
    if is_static:
        return f"A locked-off shot of {target_duration_seconds:.1f} seconds; the camera does not move."
    return (
        f"A single continuous {abs(analysis.net_orbit_degrees):.1f}° {analysis.coverage_direction} camera orbit "
        f"around the fixed subject over {target_duration_seconds:.1f} seconds."
    )


def _detailed_description(
    track: OmniCamTrack,
    analysis: H3GeometryAnalysis,
    *,
    is_static: bool,
    target_frames: int,
    target_duration_seconds: float,
    base_prompt: str,
    max_segments: int,
) -> str:
    paragraphs: list[str] = []

    paragraphs.append(
        "Reference anchor: <Picture 1> is the exact opening frame. The scene and subject remain fixed "
        "in world space for the complete shot; nothing in front of the camera moves, rotates, or changes identity."
    )
    paragraphs.append(
        "Camera-versus-subject contract: only the physical camera moves through the scene. This is a physical "
        "camera path, never subject rotation, scene rotation, or a pan-in-place look-around; elevation changes are "
        "a camera arc/height change, not a subject tilt."
    )

    if is_static:
        paragraphs.append(
            "The camera remains locked to the opening viewpoint for the complete target duration. "
            f"Hold this exact framing for all {target_frames} frames at {H3_SCENE_FPS:g} fps."
        )
    else:
        paragraphs.append(
            "Target/lens contract: the camera stays aimed at the authored target for the entire shot. "
            "Field of view and roll stay stable and are not animated by this move."
        )
        side, edge = _direction_language(analysis.coverage_direction)
        paragraphs.append(
            f"Direction contract: the camera moves {side}; new background enters from the {edge} edge of frame "
            "as the camera arcs around the subject. A background that flows the opposite way is a mirrored, "
            "incorrect render of this move."
        )
        avg_speed = abs(analysis.net_orbit_degrees) / max(target_duration_seconds, 1e-6)
        final_view = "returns to the opening viewpoint" if analysis.loop_closure else "reaches the new camera angle described above"
        paragraphs.append(
            f"Completion contract: {analysis.total_orbit_degrees:.1f}° total travel "
            f"({analysis.net_orbit_degrees:.1f}° net), over {target_duration_seconds:.1f} seconds, an average of "
            f"{avg_speed:.1f} degrees per second. By the final frame the camera {final_view}."
        )
        parallax_frame_widths = sum(segment.parallax_frame_widths for segment in analysis.segments)
        paragraphs.append(
            f"Parallax contract: the background shifts by approximately {parallax_frame_widths:.1f} frame-widths "
            "of horizontal parallax as the camera arcs, driven by real physical perspective and occlusion changes "
            "between foreground and background -- never a flat 2D box translation."
        )
        paragraphs.append(_segment_schedule(track, analysis, target_frames=target_frames, max_segments=max_segments))
        if analysis.loop_closure:
            paragraphs.append(
                "Closure contract: the final viewpoint must exactly match the opening viewpoint. The source anchor "
                "image is intentionally reused at the final frame by downstream conditioning to lock this closure."
            )

    paragraphs.append(
        "Forbidden changes: no cuts, no subject rotation or animation, no scene morph, no unauthorized digital "
        "zoom, no lighting change, and no visible planning guides, markers, or overlays."
    )

    if base_prompt and base_prompt.strip():
        paragraphs.append(f"Additional art direction: {base_prompt.strip()}")

    return "\n\n".join(paragraphs)


def _direction_language(coverage_direction: str) -> tuple[str, str]:
    if coverage_direction.startswith("counterclockwise"):
        return "camera left", "right"
    return "camera right", "left"


def _compact_segments(segments: tuple[H3OrbitSegment, ...], max_segments: int) -> list[H3OrbitSegment]:
    merged = list(segments)
    while len(merged) > max_segments:
        best_index = None
        for index in range(len(merged) - 1):
            left, right = merged[index], merged[index + 1]
            if left.reverses_after:
                continue
            if left.direction != right.direction:
                continue
            if best_index is None:
                best_index = index
        if best_index is None:
            break
        left, right = merged[best_index], merged[best_index + 1]
        combined = H3OrbitSegment(
            start_frame=left.start_frame,
            end_frame=right.end_frame,
            start_seconds=left.start_seconds,
            end_seconds=right.end_seconds,
            delta_azimuth_degrees=left.delta_azimuth_degrees + right.delta_azimuth_degrees,
            delta_elevation_degrees=left.delta_elevation_degrees + right.delta_elevation_degrees,
            delta_radius_ratio=left.delta_radius_ratio + right.delta_radius_ratio,
            rotation_degrees_per_second=(left.rotation_degrees_per_second + right.rotation_degrees_per_second) / 2.0,
            parallax_frame_widths=left.parallax_frame_widths + right.parallax_frame_widths,
            direction=left.direction,
            speed_curve=left.speed_curve,
            reverses_after=right.reverses_after,
        )
        merged[best_index:best_index + 2] = [combined]
    return merged


def _segment_schedule(
    track: OmniCamTrack,
    analysis: H3GeometryAnalysis,
    *,
    target_frames: int,
    max_segments: int,
) -> str:
    source_last = max(1, track.duration_frames - 1)
    target_last = max(0, target_frames - 1)
    lines = ["Segment schedule (mapped to the resolved shot length):"]
    for segment in _compact_segments(analysis.segments, max_segments):
        start_mapped = map_h3_scene_frame(segment.start_frame, source_last, target_last)
        end_mapped = map_h3_scene_frame(segment.end_frame, source_last, target_last)
        start_t = start_mapped / H3_SCENE_FPS
        end_t = end_mapped / H3_SCENE_FPS
        reversal = " Camera reverses direction immediately after this segment (no cut)." if segment.reverses_after else ""
        lines.append(
            f"[{start_t:.2f}s-{end_t:.2f}s] {segment.delta_azimuth_degrees:+.1f}° azimuth, "
            f"{segment.delta_elevation_degrees:+.1f}° elevation, {segment.delta_radius_ratio:+.2f} radius ratio, "
            f"{segment.rotation_degrees_per_second:.1f} degrees per second, {segment.speed_curve} pacing, "
            f"{segment.direction}.{reversal}"
        )
    return "\n".join(lines)


__all__ = ["build_h3_scene_coverage_prompt"]
