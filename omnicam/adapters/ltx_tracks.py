"""LTX-2.5 Motion Track bridge: OmniCam camera -> LTXVDrawTracks -> IC-LoRA.

Read from the installed node rather than assumed (AGENTS.md 8):

    LTXVDrawTracks(tracks: STRING, width: INT, height: INT) -> IMAGE
        _parse_tracks(tracks)          # JSON: list of point lists with x/y
        num_frames = max(len(t) ...)   # no fixed length, unlike ATI's 121

and, in iclora.py, the guide is truncated to the LTX temporal grid:

    num_frames_to_keep = ((images.shape[0] - 1) // 8) * 8 + 1

Three consequences.

1. **There is no 121.** The track length *is* the rendered guide length, so it
   must be the generation's frame count, and that count should already sit on
   the 8n+1 grid or the tail is silently dropped.
2. **Coordinates are pixels in LTXVDrawTracks' own width/height**, not in the
   OmniCam track's resolution, exactly as for ATI.
3. **Visibility cannot be sent per point.** The renderer draws every supplied
   point, so a point leaving frame ends its list rather than being clamped to
   the border -- clamping would paint a hard slide along the edge, which is a
   strong and completely wrong motion signal.

This replaces the old proxy-sampling LTX path as the primary control: the guide
frames carried whatever the playblast happened to look like, while these tracks
carry the authored camera itself.
"""

from __future__ import annotations

import json
from typing import Any

from ..core.track import OmniCamTrack
from .ati import project_reference_trajectories

LTX_TEMPORAL_FACTOR = 8


def ltx_frame_count(length: int) -> int:
    """Round a frame count down onto LTX's 8n+1 temporal grid."""
    length = max(1, int(length))
    return ((length - 1) // LTX_TEMPORAL_FACTOR) * LTX_TEMPORAL_FACTOR + 1


def is_ltx_frame_count(length: int) -> bool:
    return int(length) >= 1 and (int(length) - 1) % LTX_TEMPORAL_FACTOR == 0


def track_to_ltx_tracks(
    track: OmniCamTrack,
    *,
    length: int,
    point_count: int = 16,
    distribution: str = "balanced",
    width: int | None = None,
    height: int | None = None,
) -> list[list[dict[str, float]]]:
    """Project reference points into LTXVDrawTracks' pixel space."""
    return project_reference_trajectories(
        track, length=max(1, int(length)), point_count=point_count,
        distribution=distribution, width=width, height=height,
    )


def track_to_ltx_tracks_json(
    track: OmniCamTrack,
    *,
    length: int,
    point_count: int = 16,
    distribution: str = "balanced",
    width: int | None = None,
    height: int | None = None,
) -> str:
    tracks = track_to_ltx_tracks(
        track, length=length, point_count=point_count,
        distribution=distribution, width=width, height=height,
    )
    return json.dumps(tracks, separators=(",", ":"))


def ltx_motion_track_profile(
    track: OmniCamTrack,
    *,
    length: int,
    point_count: int = 16,
    distribution: str = "balanced",
    width: int | None = None,
    height: int | None = None,
) -> dict[str, Any]:
    """Diagnostics for the Motion Track path, including what LTX will truncate."""
    tracks = track_to_ltx_tracks(
        track, length=length, point_count=point_count,
        distribution=distribution, width=width, height=height,
    )
    requested = max(1, int(length))
    kept = ltx_frame_count(requested)
    rendered = max((len(points) for points in tracks), default=0)
    complete = sum(1 for points in tracks if len(points) >= requested)
    return {
        "format": "majoor.omnicam.ltx-motion-track.v1",
        "node": "LTXVDrawTracks",
        "width": int(width or track.width),
        "height": int(height or track.height),
        "requested_frames": requested,
        "ltx_frames": kept,
        "frames_truncated_by_ltx": requested - kept,
        "on_temporal_grid": is_ltx_frame_count(requested),
        "track_count": len(tracks),
        "requested_point_count": int(point_count),
        "rendered_frames": rendered,
        "complete_tracks": complete,
        "tracks_leaving_frame": len(tracks) - complete,
        "dropped_points": max(0, int(point_count) - len(tracks)),
        "distribution": distribution,
    }
