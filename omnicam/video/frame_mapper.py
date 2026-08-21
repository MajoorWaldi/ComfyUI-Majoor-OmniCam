"""Frame mapping generator connecting timeline output frames to source shot frames."""

from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Any

from ..core.retime import build_retime_map


@dataclass
class TimelineFrameSample:
    timeline_frame: int
    shot_id: str
    source_slot: str
    source_frame_float: float
    floor_frame: int
    ceil_frame: int
    blend_alpha: float
    interpolation_mode: str  # "nearest", "blend"


def build_timeline_frame_map(
    sequence_state: dict[str, Any],
    source_durations: dict[str, int] | None = None,
    target_fps: float = 24.0,
) -> list[TimelineFrameSample]:
    """Generate the ordered list of TimelineFrameSamples for the entire sequence timeline."""
    shots = sequence_state.get("shots", {})
    shot_order = sequence_state.get("shot_order", [])
    if not shot_order and isinstance(shots, dict):
        shot_order = list(shots.keys())

    source_durations = source_durations or {}
    samples: list[TimelineFrameSample] = []
    current_timeline_frame = 0

    for shot_id in shot_order:
        shot = shots.get(shot_id) if isinstance(shots, dict) else None
        if not isinstance(shot, dict) or not shot.get("enabled", True):
            continue

        source_slot = str(shot.get("source_slot") or "shot1")
        source_meta = shot.get("source", {})
        known_src_dur = source_durations.get(source_slot, int(source_meta.get("duration_frames", 120)))
        trim = shot.get("trim", {})
        in_frame = max(0, min(known_src_dur - 1, int(trim.get("in_frame", 0))))
        out_frame = max(in_frame, min(known_src_dur - 1, int(trim.get("out_frame", known_src_dur - 1))))
        trimmed_dur = max(1, out_frame - in_frame + 1)
        source_fps = float(source_meta.get("fps_num", 24)) / max(1.0, float(source_meta.get("fps_den", 1)))
        speed_scale = source_fps / max(1.0, float(target_fps))

        retime_cfg = shot.get("retime", {})
        retime_enabled = bool(retime_cfg.get("enabled", False))
        retime_interp = str(retime_cfg.get("interpolation", "blend"))
        retime_mode = str(retime_cfg.get("mode", "absolute_speed"))

        if retime_enabled:
            rmap = build_retime_map(
                retime_cfg.get("curve"),
                source_duration=trimmed_dur,
                target_duration=shot.get("timeline", {}).get("duration_frames"),
                mode=retime_mode,
                speed_scale=speed_scale,
            )
            for f in range(rmap.output_duration):
                src_rel = rmap.source_frames[f]
                src_abs = in_frame + src_rel
                floor_f = max(in_frame, min(out_frame, int(math.floor(src_abs))))
                ceil_f = max(in_frame, min(out_frame, int(math.ceil(src_abs))))
                alpha = src_abs - floor_f
                samples.append(
                    TimelineFrameSample(
                        timeline_frame=current_timeline_frame,
                        shot_id=shot_id,
                        source_slot=source_slot,
                        source_frame_float=src_abs,
                        floor_frame=floor_f,
                        ceil_frame=ceil_f,
                        blend_alpha=alpha,
                        interpolation_mode=retime_interp,
                    )
                )
                current_timeline_frame += 1
        else:
            output_duration = max(1, int(round(trimmed_dur / speed_scale)))
            for f in range(output_duration):
                src_float = min(float(out_frame), in_frame + f * speed_scale)
                src_abs = int(round(src_float))
                samples.append(
                    TimelineFrameSample(
                        timeline_frame=current_timeline_frame,
                        shot_id=shot_id,
                        source_slot=source_slot,
                        source_frame_float=float(src_abs),
                        floor_frame=src_abs,
                        ceil_frame=src_abs,
                        blend_alpha=0.0,
                        interpolation_mode="nearest",
                    )
                )
                current_timeline_frame += 1

    return samples
