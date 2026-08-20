from __future__ import annotations

from typing import Any

from ..core.projection import make_reference_points, project_point
from ..core.track import OmniCamTrack


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
