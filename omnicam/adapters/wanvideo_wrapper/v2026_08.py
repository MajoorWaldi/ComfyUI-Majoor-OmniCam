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
import math

from ...core.track import OmniCamTrack
from ..ati import track_to_ati_bridge

ATI_LENGTH = 121
COMPATIBILITY = {
    "wanvideowrapper_commit": "088128b224242e110d3906c6750e9a3a348a659b",
    "node": "WanVideoATITracks",
    "input": "tracks",
    "format": "JSON list of up-to-121-sample [{x, y}] tracks, in the node's own pixel space",
}


def _resample(samples: list[dict], length: int) -> list[dict | None]:
    """Resample to `length` slots, keeping None where the point is not visible."""
    if not samples:
        return [None] * length
    resampled: list[dict | None] = []
    last = len(samples) - 1
    for index in range(length):
        source = 0.0 if length == 1 else index * last / (length - 1)
        low = math.floor(source)
        high = min(last, low + 1)
        a, b = samples[low], samples[high]
        if not a.get("visible") or not b.get("visible"):
            # Straddling an invisible sample: the point is not reliably tracked.
            resampled.append(None)
            continue
        ratio = source - low
        resampled.append({
            "x": a["x_px"] + (b["x_px"] - a["x_px"]) * ratio,
            "y": a["y_px"] + (b["y_px"] - a["y_px"]) * ratio,
        })
    return resampled


def track_to_ati_tracks(
    track: OmniCamTrack,
    point_count: int = 16,
    distribution: str = "balanced",
    width: int | None = None,
    height: int | None = None,
) -> list[list[dict[str, float]]]:
    """Project reference points into the ATI node's pixel space.

    `width`/`height` must match the WanVideoATITracks widgets; they default to
    the track's own resolution.
    """
    target_width = int(width or track.width)
    target_height = int(height or track.height)
    scale_x = target_width / max(1, track.width)
    scale_y = target_height / max(1, track.height)

    bridge = track_to_ati_bridge(track, point_count, distribution=distribution)
    tracks: list[list[dict[str, float]]] = []
    for trajectory in bridge["trajectories"]:
        resampled = _resample(trajectory["samples"], ATI_LENGTH)
        if resampled[0] is None:
            continue  # cannot express a track that starts off-screen
        points = []
        for point in resampled:
            if point is None:
                break  # the zero padding downstream marks the rest invisible
            points.append({"x": point["x"] * scale_x, "y": point["y"] * scale_y})
        tracks.append(points)
    return tracks


def track_to_ati_json(
    track: OmniCamTrack,
    point_count: int = 16,
    distribution: str = "balanced",
    width: int | None = None,
    height: int | None = None,
) -> str:
    tracks = track_to_ati_tracks(track, point_count, distribution=distribution, width=width, height=height)
    return json.dumps(tracks, separators=(",", ":"))
