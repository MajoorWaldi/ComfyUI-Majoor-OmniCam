"""Shared visible-prefix JSON encoding for upstream trajectory sockets."""

from __future__ import annotations

import json

from ..core.motion_sampling import SampledTrack


def visible_prefix_tracks(
    tracks: list[SampledTrack],
    *,
    width: int,
    height: int,
) -> list[list[dict[str, float]]]:
    """Encode visibility using the only representation the JSON sockets have.

    Upstream marks every supplied point visible and zero-pads the missing tail.
    Consequently an invisible first sample cannot be represented, and the first
    later invisible sample must end the list. Repeating the last visible point
    would invent continued visibility and is deliberately forbidden here.
    """
    encoded: list[list[dict[str, float]]] = []
    for track in tracks:
        if not track.visible or not track.visible[0]:
            continue
        points: list[dict[str, float]] = []
        for (x, y), visible in zip(track.xy, track.visible, strict=True):
            if not visible:
                break
            points.append({"x": x * width, "y": y * height})
        if points:
            encoded.append(points)
    return encoded


def tracks_json(tracks: list[list[dict[str, float]]]) -> str:
    return json.dumps(tracks, separators=(",", ":"))

