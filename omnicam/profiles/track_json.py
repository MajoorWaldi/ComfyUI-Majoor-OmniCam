"""Shared visible-prefix JSON encoding for upstream trajectory sockets."""

from __future__ import annotations

import json
from dataclasses import dataclass

from ..core.motion_sampling import SampledTrack
from ..monitor.result import Check


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
@dataclass(frozen=True, slots=True)
class TrackEncodingIssue:
    """One way a layer will not survive the JSON track encoding."""

    layer_id: str
    label: str
    kind: str
    frame: int

    @property
    def message(self) -> str:
        if self.kind == "hidden_at_start":
            return (
                f"{self.label!r} is not visible on the first sample, so it is dropped "
                "entirely: the JSON format marks every supplied point visible and has "
                "no way to say 'appears later'."
            )
        return (
            f"{self.label!r} disappears at sample {self.frame} and comes back. The JSON "
            "format zero-pads after the last supplied point, so the trajectory ends "
            "there and the re-appearance is lost."
        )


def describe_track_encoding(tracks: list[SampledTrack]) -> list[TrackEncodingIssue]:
    """Report what :func:`visible_prefix_tracks` is about to discard.

    The encoder is honest about the format's limits but silent about applying
    them, and "one enabled motion layer" is not the same claim as "one layer
    that survives encoding". Without this a user sees a green preflight and a
    track that quietly vanished.
    """
    issues: list[TrackEncodingIssue] = []
    for track in tracks:
        if not track.visible:
            continue
        if not track.visible[0]:
            issues.append(TrackEncodingIssue(track.id, track.label, "hidden_at_start", 0))
            continue
        first_hidden = next(
            (index for index, visible in enumerate(track.visible) if not visible), None
        )
        if first_hidden is None:
            continue
        if any(track.visible[first_hidden:]):
            issues.append(
                TrackEncodingIssue(track.id, track.label, "visibility_gap", first_hidden)
            )
    return issues


def encoding_check(tracks: list[SampledTrack], *, display_name: str) -> Check:
    """A preflight Check naming the layers this target cannot carry."""
    issues = describe_track_encoding(tracks)
    encodable = len(visible_prefix_tracks_count(tracks))
    if not issues:
        return Check(
            id="track_encoding",
            label=f"Encodable trajectories: {encodable}",
            state="PASS",
        )
    dropped = [issue for issue in issues if issue.kind == "hidden_at_start"]
    state = "BLOCKED" if dropped and encodable == 0 else "WARNING"
    # Several layers can share a label (e.g. five "Subject Card Track" layers all
    # projecting off-screen at frame 0) and would otherwise repeat the same
    # sentence verbatim. Collapse identical text; the count still names how many
    # layers are affected.
    unique_messages = list(dict.fromkeys(issue.message for issue in issues))
    return Check(
        id="track_encoding",
        label=f"Encodable trajectories: {encodable} ({len(issues)} affected)",
        state=state,
        message=f"{display_name}: " + " ".join(unique_messages),
    )


def visible_prefix_tracks_count(tracks: list[SampledTrack]) -> list[list[dict[str, float]]]:
    """The encodable subset, measured without needing target dimensions."""
    return visible_prefix_tracks(tracks, width=1, height=1)
