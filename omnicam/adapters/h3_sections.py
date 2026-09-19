"""Shared MiniMax Ref2VA six-section prompt assembly, used by both H3 adapters.

Both H3 dialects -- ``build_h3_prompt`` (reference-video) and
``build_h3_scene_coverage_prompt`` (geometry-only) -- render the same six
documented Ref2VA headings, in the same fixed order. This is the one place
that order and the "never assert silence" audio policy are enforced, so a
change to either applies to both renderers identically.
"""

from __future__ import annotations

#: Ref2VA's documented section order.
H3_SECTION_ORDER = (
    "subject_definitions", "summary", "retention_analysis",
    "detailed_description", "overall_soundscape", "non_diegetic_music",
)

#: Never a hardcoded "Silence." -- that can flatly contradict audio direction
#: the artist wrote into the main prompt, which is composed directly above
#: this block in the final prompt text. OmniCam has no audio signal of its
#: own to report, so it defers to the main prompt rather than asserting one.
H3_SOUNDSCAPE_FALLBACK = "Follow any audio direction given in the main prompt; OmniCam adds none of its own."

#: OmniCam only ever compiles a new shot from references, never an edit or
#: extend of existing footage (mirrors Seedance's own task_type contract).
H3_TASK_MARKER = "[reference generation]"


def render_h3_sections(sections: dict[str, str]) -> str:
    """Join ``sections`` in Ref2VA's fixed order, regardless of dict insertion order."""
    missing = [name for name in H3_SECTION_ORDER if name not in sections]
    if missing:
        raise ValueError(f"H3 prompt is missing required sections: {missing}")
    return "\n\n".join(f"{name}:\n{sections[name]}" for name in H3_SECTION_ORDER)


__all__ = ["H3_SECTION_ORDER", "H3_SOUNDSCAPE_FALLBACK", "H3_TASK_MARKER", "render_h3_sections"]
