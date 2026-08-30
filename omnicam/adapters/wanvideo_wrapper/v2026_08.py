"""Bridge to WanVideoWrapper's ATI nodes.

Pinned against the installed contract, read from the node itself rather than
assumed (AGENTS.md §8):

    WanVideoATITracks(model, tracks: STRING, width, height, temperature, topk, ...)

and, in ATI/nodes.py:

    FIXED_LENGTH = 121
    pad_pts(tr)      -> [[p['x'], p['y'], 1] for p in tr], zero-padded to 121
    process_tracks() -> tracks - (width, height)/2, then / min(width, height) * 2

Three consequences drive everything below.

1. **Coordinates are pixels in the ATI node's own width/height**, not in the
   OmniCam track's resolution. Authoring at 1280x720 and feeding a node left at
   its 832x480 default silently offsets and rescales every trajectory, so the
   target resolution is an explicit parameter here.

2. **Visibility cannot be sent per point.** pad_pts hardcodes 1 for every
   supplied point; the only way to say "this point is gone" is to stop the list
   early and let the zero padding mark the tail invisible. Clamping an
   off-screen point to the frame border instead would tell the model to track
   something sliding along the edge, which is a strong and completely wrong
   motion signal.

3. **A point that is not visible on frame 0 cannot start a track**, because
   there is no way to express a delayed appearance.
"""

from __future__ import annotations

import json

from ...core.track import OmniCamTrack
from ..ati import project_reference_trajectories

ATI_LENGTH = 121
COMPATIBILITY = {
    "wanvideowrapper_commit": "088128b224242e110d3906c6750e9a3a348a659b",
    "node": "WanVideoATITracks",
    "input": "tracks",
    "format": "JSON list of up-to-121-sample [{x, y}] tracks, in the node's own pixel space",
}


def track_to_ati_tracks(
    track: OmniCamTrack,
    point_count: int = 16,
    distribution: str = "balanced",
    width: int | None = None,
    height: int | None = None,
) -> list[list[dict[str, float]]]:
    """Project reference points into the ATI node's pixel space.

    `width`/`height` must match the WanVideoATITracks widgets; they default to
    the track's own resolution. The projection and truncation policy is shared
    with every other trajectory adapter; ATI's contribution is the fixed 121.
    """
    return project_reference_trajectories(
        track, length=ATI_LENGTH, point_count=point_count,
        distribution=distribution, width=width, height=height,
    )


def track_to_ati_json(
    track: OmniCamTrack,
    point_count: int = 16,
    distribution: str = "balanced",
    width: int | None = None,
    height: int | None = None,
) -> str:
    tracks = track_to_ati_tracks(track, point_count, distribution=distribution, width=width, height=height)
    return json.dumps(tracks, separators=(",", ":"))
