from __future__ import annotations

from typing import Any

from ..core.camera_tools import build_cinematic_motion_prompt
from ..core.motion_phases import segment_motion_phases
from ..core.track import OmniCamTrack
from .prompts import build_camera_prompt, camera_analysis, prompt_contract
from .types import MonitorText


def _join_prompt(base_prompt: str, camera_prompt: str) -> str:
    parts = [part.strip() for part in (base_prompt, camera_prompt) if part and part.strip()]
    return "\n\n".join(parts)


def build_monitor_text(
    track: OmniCamTrack, *, adapter: str, base_prompt: str = "",
    video_ref_token: str = "auto", capabilities: dict[str, Any] | None = None,
) -> MonitorText:
    settings = {"video_ref_token": video_ref_token}
    camera_prompt = build_camera_prompt(
        track, adapter=adapter, settings=settings, capabilities=capabilities,
    )
    camera_data = camera_analysis(track, adapter)
    camera_data["phases"] = segment_motion_phases(track)
    return MonitorText(
        cinematography=build_cinematic_motion_prompt(track, base_prompt="", style="universal"),
        camera_prompt=camera_prompt,
        final_prompt=_join_prompt(base_prompt, camera_prompt),
        camera_data=camera_data,
        contract=prompt_contract(adapter, capabilities),
    )
