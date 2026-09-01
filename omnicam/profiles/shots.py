"""The shared multi-shot gate every profile has to answer to.

A MotionScene can describe an edit: several cameras, cut together on the
timeline. Only some model contracts can represent that.

* ``camera_embedding`` and ``screen_tracks`` cannot. They carry one camera
  basis, so a scene that cuts to a second camera compiles into a trajectory
  that is wrong from the first cut onwards -- and wrong *quietly*, which is the
  worst failure mode a preflight can have. These profiles are BLOCKED.
* ``reference_video`` can. The playblast already contains the cuts, frame for
  frame, so the video is a complete and truthful description of the edit. What
  such a profile must *not* do is also emit a prompt describing one camera's
  trajectory, because that prompt contradicts the video it ships with.

The rule lives here rather than in each profile so that adding a profile means
answering the question, not remembering it.
"""

from __future__ import annotations

from ..core.motion_scene import MotionScene
from ..monitor.result import Check

#: What a reference-video profile says instead of a single-camera description.
MULTI_SHOT_PROMPT = (
    "The reference video defines the camera work, framing, cuts and timing. "
    "Follow its camera motion and shot changes; do not copy its appearance."
)


def multi_shot_check(scene: MotionScene, *, display_name: str, can_represent: bool) -> Check:
    """One preflight Check reporting how this profile handles the edit."""
    cameras = scene.shot_camera_ids
    if not scene.is_multi_shot:
        return Check(
            id="multi_shot",
            label="Single-camera scene",
            state="PASS",
        )
    summary = f"{len(cameras)} cameras: {', '.join(cameras)}"
    if can_represent:
        return Check(
            id="multi_shot",
            label=f"Multi-shot edit ({summary})",
            state="WARNING",
            message=(
                "The playblast carries the cuts, so the reference video stays accurate. "
                "The camera prompt is replaced by a neutral one, because no single "
                "trajectory describes this edit."
            ),
        )
    return Check(
        id="multi_shot",
        label=f"Multi-shot edit ({summary})",
        state="BLOCKED",
        message=(
            f"{display_name} carries one camera, so it cannot represent an edit that "
            "cuts between several. Render one shot per camera, or choose a profile "
            "that takes the playblast video as its reference."
        ),
    )


def multi_shot_error(scene: MotionScene, display_name: str) -> str:
    cameras = ", ".join(scene.shot_camera_ids)
    return (
        f"{display_name} cannot compile a multi-shot edit ({cameras}). "
        "Compile one shot per camera, or use a reference-video profile."
    )
