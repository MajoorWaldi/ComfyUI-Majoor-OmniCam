"""Wan prompt renderers, shared by all four native Wan profiles.

Each Wan profile's motion is already fully carried by a non-text control --
``wan_camera_native``'s embedding, ``wan_move_native``/``wan_track_native``'s
screen tracks, ``wanvideo_ati``'s unified object/local/camera trajectories.
These renderers stay semantic and short (Wan's own prompt-extension guidance:
compact, roughly 100 words), never a coordinate or degree restatement that
would compete with the literal control signal instead of clarifying it.
"""

from __future__ import annotations

from ..guides.prompt_ir import PromptCompileIR


def _joined_camera_phrase(ir: PromptCompileIR) -> str:
    if not ir.camera_phases:
        return ""
    phrases = [phase.phrase for phase in ir.camera_phases]
    return phrases[0] if len(phrases) == 1 else ", then ".join(phrases)


def _with_scene(scene: str, sentence: str) -> str:
    return f"{scene}\n\n{sentence}" if scene else sentence


def build_wan_camera_prompt(ir: PromptCompileIR) -> str:
    """``wan_camera_native``: the camera embedding carries the literal move.

    This adds only a short semantic description of what the move
    accomplishes -- never the degrees/positions the embedding already encodes.
    """
    scene = ir.base_prompt.strip()
    phrase = _joined_camera_phrase(ir)
    if not phrase:
        return ir.base_prompt
    sentence = f"The shot develops as one continuous take: the camera {phrase}."
    return _with_scene(scene, sentence).strip()


def build_wan_trajectory_prompt(ir: PromptCompileIR) -> str:
    """``wan_move_native`` / ``wan_track_native`` / ``wanvideo_ati``: tracks carry the path.

    Uses the artist's verbatim action text when one exists; otherwise a
    generic continuity sentence -- never a coordinate restatement, and never
    an invented verb.
    """
    scene = ir.base_prompt.strip()
    if ir.action_cues:
        sentence = "; ".join(cue.text for cue in ir.action_cues).rstrip(".") + "."
    elif ir.subject_trajectories:
        sentence = (
            "The subject follows the authored trajectory continuously, with natural "
            "acceleration and deceleration and no teleporting or path reversal."
        )
    else:
        return ir.base_prompt
    return _with_scene(scene, sentence).strip()


__all__ = ["build_wan_camera_prompt", "build_wan_trajectory_prompt"]
