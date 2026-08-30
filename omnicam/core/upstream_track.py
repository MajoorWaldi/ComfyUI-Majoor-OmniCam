"""Precedence between an upstream camera track and the Director's own edits.

The temptation with a cable is to make it authoritative: connected means the
upstream wins. That is wrong here, and expensively so -- it would mean every
queue silently threw away the keys the user had just hand-tuned in the
Director, and there would be no way to keep a solved trajectory *and* edit it.

So the cable is authoritative exactly once per solve, keyed on the extractor
fingerprint:

* no upstream track                     -> the Director's own state;
* upstream whose fingerprint was already imported -> the Director's own state,
  edits and all;
* upstream the Director has not imported -> the upstream camera motion, kept
  inside the Director's scene and render context.

The third case is what makes headless execution agree with the browser: the
frontend imports by fingerprint too, so a graph run before any UI sync still
produces the trajectory the user would see.
"""

from __future__ import annotations

from typing import Any

from .validation import validate_track_payload

UPSTREAM_METADATA_KEY = "upstream_camera_track"
#: Where the extractor writes its identity inside the track it emits.
FINGERPRINT_KEY = "extractor_fingerprint"


def upstream_fingerprint(track: Any) -> str:
    """The extractor fingerprint of a candidate upstream track, if it has one."""
    if not isinstance(track, dict):
        return ""
    metadata = track.get("metadata")
    if not isinstance(metadata, dict):
        return ""
    return str(metadata.get(FINGERPRINT_KEY) or "")


def imported_fingerprint(local_track: Any) -> str:
    """The fingerprint the Director has already imported, if any."""
    if not isinstance(local_track, dict):
        return ""
    metadata = local_track.get("metadata")
    if not isinstance(metadata, dict):
        return ""
    marker = metadata.get(UPSTREAM_METADATA_KEY)
    if not isinstance(marker, dict):
        return ""
    return str(marker.get("fingerprint") or "")


def should_adopt_upstream(local_track: Any, upstream_track: Any) -> bool:
    """True when the upstream track is a solve the Director has not taken yet."""
    if not isinstance(upstream_track, dict) or not upstream_track.get("keyframes"):
        return False
    fingerprint = upstream_fingerprint(upstream_track)
    if not fingerprint:
        # An upstream track with no extractor identity cannot be tracked across
        # runs, so adopting it would overwrite local edits on every execution.
        return False
    return fingerprint != imported_fingerprint(local_track)


def resolve_director_camera_track(
    *,
    local_track: dict[str, Any],
    upstream_track: dict[str, Any] | None,
    width: int,
    height: int,
    render_mode: str,
) -> dict[str, Any]:
    """The track the Director should actually execute, strictly validated."""
    if not should_adopt_upstream(local_track, upstream_track):
        return validate_track_payload(dict(local_track))

    assert upstream_track is not None  # noqa: S101 - narrowed by should_adopt_upstream
    local_metadata = local_track.get("metadata")
    upstream_metadata = upstream_track.get("metadata")
    merged_metadata = dict(local_metadata) if isinstance(local_metadata, dict) else {}
    # Namespaced rather than flattened: the Director's own metadata (camera id,
    # card asset, recording path) has to survive an import untouched.
    merged_metadata[UPSTREAM_METADATA_KEY] = {
        "fingerprint": upstream_fingerprint(upstream_track),
        "source": str((upstream_metadata or {}).get("source", "omnicam_extractor")),
        "backend": str((upstream_metadata or {}).get("backend", "")),
        "confidence": (upstream_metadata or {}).get("confidence", 0.0),
        "monocular_scale": bool((upstream_metadata or {}).get("monocular_scale", True)),
    }

    merged = {
        **local_track,
        # Camera motion, its timing and its lens come from the solve...
        "keyframes": upstream_track.get("keyframes", []),
        "fps": upstream_track.get("fps", local_track.get("fps", 24)),
        "duration_frames": upstream_track.get("duration_frames", local_track.get("duration_frames", 1)),
        # ...while the render context stays the Director's: the extractor knows
        # the source footage resolution, not what the user is rendering.
        "width": int(width),
        "height": int(height),
        "render_mode": str(render_mode),
        "objects": local_track.get("objects", []),
        "metadata": merged_metadata,
    }
    if isinstance(local_track.get("constraints"), dict):
        merged["constraints"] = local_track["constraints"]
    return validate_track_payload(merged)
