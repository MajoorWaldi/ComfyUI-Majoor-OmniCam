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
    "format": "JSON list of 121-sample {x,y} tracks",
}


def track_to_ati_tracks(
    track: OmniCamTrack,
    point_count: int = 16,
    distribution: str = "balanced",
) -> list[list[dict[str, float]]]:
    bridge = track_to_ati_bridge(track, point_count, distribution=distribution)
    tracks = []
    for trajectory in bridge["trajectories"]:
        samples = trajectory["samples"]
        valid = [sample for sample in samples if "x_px" in sample]
        if not valid:
            continue
        points = []
        previous = valid[0]
        for index in range(ATI_LENGTH):
            source_frame = index * (len(samples) - 1) / (ATI_LENGTH - 1)
            lo = math.floor(source_frame)
            hi = min(len(samples) - 1, lo + 1)
            a = samples[lo] if "x_px" in samples[lo] else previous
            b = samples[hi] if "x_px" in samples[hi] else a
            t = source_frame - lo
            x = a["x_px"] + (b["x_px"] - a["x_px"]) * t
            y = a["y_px"] + (b["y_px"] - a["y_px"]) * t
            points.append({"x": max(0.0, min(track.width - 1.0, x)), "y": max(0.0, min(track.height - 1.0, y))})
            previous = b
        tracks.append(points)
    return tracks


def track_to_ati_json(
    track: OmniCamTrack,
    point_count: int = 16,
    distribution: str = "balanced",
) -> str:
    return json.dumps(track_to_ati_tracks(track, point_count, distribution=distribution), separators=(",", ":"))
