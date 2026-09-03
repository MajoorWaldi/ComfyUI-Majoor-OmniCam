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
