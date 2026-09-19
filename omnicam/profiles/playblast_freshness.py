"""Is the connected playblast still a truthful recording of this scene?

The Director stamps two fingerprints into the MotionScene it compiles:

* ``metadata.playblast.motion_scene_fingerprint`` -- hashed when the playblast
  was recorded (``storePlayblastManifest`` in the frontend).
* ``metadata.motion_scene_fingerprint_live`` -- hashed from the Director's
  *current* state on every serialize (``serializeEditorState``).

Both use the same FNV-1a over the same subtractive field set, so the backend
compares two opaque strings and never re-derives the hash. When they disagree,
the scene has moved on since the recording: cameras moved, cuts changed, an
object was retimed. A reference-video profile that ships that recording anyway
is conditioning the model on footage that no longer matches the prompt.

Only meaningful when *both* fingerprints are present. A playblast recorded
before this existed has no recorded fingerprint; the answer is then "unknown",
never "stale" -- a standing false warning on every old recording would train
users to ignore the real one.
"""

from __future__ import annotations

from typing import Literal

from ..core.motion_scene import MotionScene
from ..monitor.result import Check

Staleness = Literal["stale", "fresh", "unknown"]


def playblast_staleness(scene: MotionScene) -> Staleness:
    metadata = scene.metadata if isinstance(scene.metadata, dict) else {}
    playblast = metadata.get("playblast")
    recorded = playblast.get("motion_scene_fingerprint") if isinstance(playblast, dict) else None
    live = metadata.get("motion_scene_fingerprint_live")
    if not isinstance(recorded, str) or not recorded:
        return "unknown"
    if not isinstance(live, str) or not live:
        return "unknown"
    return "fresh" if recorded == live else "stale"


def stale_playblast_check(
    scene: MotionScene, *, display_name: str, block: bool
) -> Check | None:
    """A preflight Check when the playblast is stale, else ``None``.

    ``block=True`` for a profile whose whole conditioning is the reference
    video (H3) -- a stale recording there is a wrong result, not a cosmetic
    nit. ``block=False`` for the permissive passthrough, where the ceiling is
    WARNING and the destination model is unknown.
    """
    if playblast_staleness(scene) != "stale":
        return None
    return Check(
        id="playblast_freshness",
        label="Playblast out of date",
        state="BLOCKED" if block else "WARNING",
        message=(
            "The scene has changed since this playblast was recorded"
            + (
                f", and {display_name} conditions entirely on the reference video. "
                "Re-record the playblast before compiling."
                if block
                else ". Re-record it if the reference video should match the current scene."
            )
        ),
    )


def captured_guide_style(scene: MotionScene) -> str | None:
    """The Guide Capture Style the connected playblast was actually recorded with.

    ``None`` covers both "no playblast recorded" and "recorded before Guide
    Capture Style existed" -- both are "unknown", never a false mismatch, same
    principle ``playblast_staleness`` already applies to its own fingerprint.
    """
    metadata = scene.metadata if isinstance(scene.metadata, dict) else {}
    playblast = metadata.get("playblast")
    style = playblast.get("guide_style") if isinstance(playblast, dict) else None
    return style if isinstance(style, str) and style else None


def guide_style_mismatch_check(
    scene: MotionScene, *, expected: str, display_name: str, block: bool
) -> Check | None:
    """A preflight Check when the recorded guide_style disagrees with ``expected``.

    A plain string compare, not a hash: guide_style is a small enum, not scene
    geometry, so the backend can compare it directly rather than trusting an
    opaque fingerprint the way ``stale_playblast_check`` has to.
    """
    captured = captured_guide_style(scene)
    if captured is None or captured == expected:
        return None
    return Check(
        id="guide_style_mismatch",
        label=f"Guide style: recorded {captured!r}, compiling for {expected!r}",
        state="BLOCKED" if block else "WARNING",
        message=(
            f"The connected playblast was captured with guide_style={captured!r}, but "
            f"{display_name} is compiling for guide_style={expected!r}. "
            + (
                "Re-record the playblast with the matching capture style."
                if block
                else "The reference pixels may not match what the prompt promises."
            )
        ),
    )
