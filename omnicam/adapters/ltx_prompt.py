"""LTX 2.5 Motion Track prompt renderer.

Separate from ``adapters/ltx.py`` (the camera-conditioning bridge/LoRA
selection, an unrelated concern). This module has no reference-video or
token conditioning to describe -- the motion track carries the literal
trajectory data via ``tracks_json``. The prompt is therefore pure prose
(LTX's documented shot -> scene -> action -> camera -> audio flow), never a
numeric schedule, a token reference, or a restatement of coordinates the
track already encodes.
"""

from __future__ import annotations

from ..guides.prompt_ir import PromptCompileIR


def _camera_clause(ir: PromptCompileIR) -> str:
    if not ir.camera_phases:
        return ""
    phrases = [phase.phrase for phase in ir.camera_phases]
    if len(phrases) == 1:
        return f"The camera {phrases[0]}"
    return "The camera " + ", then ".join(phrases)


def _action_clause(ir: PromptCompileIR) -> str:
    if not ir.action_cues:
        return ""
    return "; ".join(cue.text for cue in ir.action_cues)


def build_ltx_prompt(ir: PromptCompileIR) -> str:
    """A short flowing scene -> action -> camera paragraph, or just base_prompt.

    Every clause is sourced from the IR alone: the scene from ``base_prompt``,
    the action only when the artist authored one, the camera only from the
    shot's own stable-motion phases -- nothing here is invented.
    """
    clauses = [ir.base_prompt.strip().rstrip("."), _action_clause(ir).rstrip("."), _camera_clause(ir).rstrip(".")]
    clauses = [clause for clause in clauses if clause]
    if not clauses:
        return ir.base_prompt
    return ". ".join(clauses) + "."


__all__ = ["build_ltx_prompt"]
