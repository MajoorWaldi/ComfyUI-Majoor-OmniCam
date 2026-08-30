from __future__ import annotations

from typing import Any

from ..core.projection import make_reference_points, project_point
from ..core.track import OmniCamTrack

# ATI is trajectory-driven: it follows 2D points, so it tolerates less angular
# violence than a pure camera-conditioned model before the tracks become
# unreadable (adapter scope only; the core stays neutral).
ATI_RECOMMENDED_MOTION_LIMITS = {
    "max_speed": 5.0,
    "max_angular_speed": 70.0,
    "max_acceleration": 25.0,
    "max_jerk": 250.0,
    "max_fov_change": 15.0,
    "allow_framing_loss": False,
    # Share of the reference points that must stay inside the frame. ATI has
    # nothing to follow on a frame where every point has left the image.
    "min_visible_point_ratio": 0.35,
}


def ati_visibility_report(
    track: OmniCamTrack,
    point_count: int = 16,
    distribution: str = "balanced",
    min_visible_ratio: float = 0.35,
) -> dict[str, Any]:
    """Count, per frame, how many ATI reference points remain inside the image.

    The Health panel needs this separately from ``motion_health_report``: a
    trajectory can respect every speed limit and still be useless to ATI because
    its points swung out of frame. Frames below ``min_visible_ratio`` are
    reported as ranges so the timeline can paint them.
    """
    bridge = track_to_ati_bridge(track, point_count=point_count, distribution=distribution)
    total = max(1, len(bridge["trajectories"]))
    visible_counts = [0] * track.duration_frames
    for trajectory in bridge["trajectories"]:
        for sample in trajectory["samples"]:
            if sample.get("visible") and 0 <= sample["frame"] < track.duration_frames:
                visible_counts[sample["frame"]] += 1
    ratios = [count / total for count in visible_counts]
    below = [frame for frame, ratio in enumerate(ratios) if ratio < min_visible_ratio]
    ranges: list[dict[str, int]] = []
    for frame in below:
        if ranges and ranges[-1]["end"] == frame - 1:
            ranges[-1]["end"] = frame
        else:
            ranges.append({"start": frame, "end": frame})
    return {
        "point_count": total,
        "min_visible_ratio": float(min_visible_ratio),
        "visible_counts": visible_counts,
        "visible_ratios": ratios,
        "worst_ratio": min(ratios, default=1.0),
        "frames_below_threshold": len(below),
        "ranges": ranges,
        "ok": not below,
    }


def track_to_ati_bridge(
    track: OmniCamTrack,
    point_count: int = 16,
    distribution: str = "balanced",
) -> dict[str, Any]:
    """Build a deterministic 2D trajectory bridge from a 3D camera track.

    ATI's official interface is trajectory-driven. This payload intentionally stays adapter-neutral:
    it contains pixel-space and normalized trajectories that a Kijai/WanVideoWrapper-specific bridge
    can translate without coupling OmniCam core to one third-party node API.
    """
    target = track.sample(0).target if track.keyframes else [0.0, 1.5, 0.0]
    points_3d = make_reference_points(count=point_count, distribution=distribution, center=target)
    trajectories = []
    for point_id, point in enumerate(points_3d):
        samples = []
        for frame, camera in track.samples():
            projected = project_point(point, camera, track.width, track.height)
            if projected is None:
                samples.append({"frame": frame, "visible": False})
                continue
            x, y, depth = projected
            samples.append(
                {
                    "frame": frame,
                    "visible": 0 <= x < track.width and 0 <= y < track.height,
                    "x_px": x,
                    "y_px": y,
                    "x_norm": x / track.width,
                    "y_norm": y / track.height,
                    "depth": depth,
                }
            )
        trajectories.append({"id": point_id, "world_point": point, "samples": samples})

    return {
        "format": "majoor.omnicam.ati-bridge.v1",
        "source": "camera_track_projection",
        "width": track.width,
        "height": track.height,
        "fps": track.fps,
        "duration_frames": track.duration_frames,
        "trajectories": trajectories,
        "notes": (
            "Bridge payload. Convert to the exact ATI/Kijai trajectory representation in the "
            "version-specific Wan adapter; do not make OmniCam core depend on WanVideoWrapper internals."
        ),
    }
