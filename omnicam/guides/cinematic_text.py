"""Optional, model-neutral wording for derived shot semantics."""

from __future__ import annotations

from typing import Any

from .prompt_ir import PromptCompileIR

SHOT_LABELS = {
    "extreme_close_up": "extreme close-up", "close_up": "close-up", "medium_close_up": "medium close-up",
    "medium_shot": "medium shot", "medium_long_shot": "medium long shot", "full_shot": "full shot",
    "wide_shot": "wide shot", "extreme_wide_shot": "extreme wide shot",
}


def camera_setup_sentence(ir: PromptCompileIR) -> str:
    start = ir.camera_start
    if start is None:
        return ""
    shot = SHOT_LABELS.get(start.framing.shot_type, "") if start.framing else ""
    pieces = [shot, start.viewpoint.replace("_", " "), start.vertical_angle.replace("_", " "), f"{start.focal_length_mm:.0f} mm perspective"]
    return ", ".join(piece for piece in pieces if piece)


def framing_transition_sentence(ir: PromptCompileIR) -> str:
    start, end = ir.camera_start, ir.camera_end
    if not start or not end or not start.framing or not end.framing:
        return ""
    first, last = start.framing.coverage_y, end.framing.coverage_y
    if first is None or last is None or abs(last - first) < 0.08:
        return ""
    return f"The subject changes from {first * 100:.0f}% to {last * 100:.0f}% of frame height."


def lighting_sentence(ir: PromptCompileIR) -> str:
    lighting = ir.lighting
    if lighting is None:
        return ""
    clauses = []
    if lighting.key_direction:
        clauses.append(f"{lighting.key_direction} key")
    if lighting.fill_direction:
        clauses.append(f"{lighting.fill_direction} fill")
    if lighting.rim_direction:
        clauses.append(f"{lighting.rim_direction} rim")
    return "Lighting is led by " + ", ".join(clauses) + "." if clauses else ""


def semantic_panel(ir: PromptCompileIR) -> dict[str, Any] | None:
    """The Monitor's PART F ``semantics`` readout, built from the same IR the
    compiled prompt uses -- diagnostics only, never a second Monitor socket."""
    start = ir.camera_start
    panel: dict[str, Any] = {}
    if start is not None:
        if start.framing:
            panel["shot"] = SHOT_LABELS.get(start.framing.shot_type, start.framing.shot_type)
        panel["viewpoint"] = start.viewpoint.replace("_", " ")
        panel["vertical_angle"] = start.vertical_angle.replace("_", " ")
        panel["lens"] = f"{start.focal_length_mm:.0f} mm"
    if ir.camera_phases:
        panel["motion"] = ir.camera_phases[0].phrase
    if ir.lighting is not None:
        sentence = lighting_sentence(ir)
        if sentence:
            panel["lighting"] = sentence
    return panel or None