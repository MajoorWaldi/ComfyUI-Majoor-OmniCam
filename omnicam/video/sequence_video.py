"""Bounded video assembler for multi-shot timeline sequencing."""

from __future__ import annotations

from fractions import Fraction
from typing import Any

from .frame_mapper import build_timeline_frame_map
from .interpolation import interpolate_frames
from .normalize import normalize_video_frames


MAX_OUTPUT_FRAMES = 14_400
MAX_OUTPUT_PIXELS = 4096 * 4096


def _extract_video_frames(video_obj: Any) -> tuple[Any, float]:
    """Extract torch.Tensor [N, H, W, C] and fps from ComfyUI video object or tensor."""
    if video_obj is None:
        return None, 24.0

    try:
        import torch

        if isinstance(video_obj, torch.Tensor):
            return video_obj, 24.0
    except ImportError:
        pass

    if hasattr(video_obj, "get_components"):
        try:
            components = video_obj.get_components()
            frame_rate = getattr(components, "frame_rate", getattr(components, "fps", 24.0))
            fps = float(frame_rate or 24.0)
            images = getattr(components, "images", None)
            return images, fps
        except Exception as exc:
            raise ValueError(f"Could not decode the connected VIDEO source: {exc}") from exc

    raise ValueError(
        f"Unsupported connected VIDEO source type: {type(video_obj).__name__}. "
        "Connect a ComfyUI VIDEO output or a 4D image tensor."
    )


def _wrap_output_video(images_tensor: Any, fps: float) -> Any:
    """Wrap image tensor in ComfyUI VideoFromComponents if available."""
    try:
        from comfy_api.latest import InputImpl, Types

        components = Types.VideoComponents(
            images=images_tensor,
            audio=None,
            frame_rate=Fraction(float(fps)).limit_denominator(1001),
        )
        return InputImpl.VideoFromComponents(components)
    except ImportError:
        return images_tensor


def assemble_sequence_video(
    sequence_state: dict[str, Any],
    shot_inputs: dict[str, Any],
    resolution_mode: str = "first_shot",
    custom_width: int = 1280,
    custom_height: int = 720,
    fit_mode: str = "contain",
    fps_mode: str = "first_shot",
    custom_fps: int = 24,
) -> tuple[Any, dict[str, Any]]:
    """Assemble all connected video shots according to sequence state, trim, and retime maps."""
    try:
        import torch
    except ImportError:
        return None, {"fps": float(custom_fps), "width": int(custom_width), "height": int(custom_height)}

    # Extract source frames and durations for all connected slots
    raw_shot_frames: dict[str, Any] = {}
    source_durations: dict[str, int] = {}
    source_fps: dict[str, float] = {}

    first_h, first_w = None, None
    first_fps = 24.0

    for slot_name, slot_val in shot_inputs.items():
        if slot_val is None:
            continue
        frames, fps = _extract_video_frames(slot_val)
        if not isinstance(frames, torch.Tensor) or frames.ndim != 4 or frames.shape[0] == 0:
            shape = getattr(frames, "shape", None)
            raise ValueError(f"VIDEO input '{slot_name}' returned invalid frames (expected non-empty [N,H,W,C], got {shape})")
        raw_shot_frames[slot_name] = frames
        source_durations[slot_name] = frames.shape[0]
        source_fps[slot_name] = fps
        if first_h is None:
            first_h, first_w = frames.shape[1], frames.shape[2]
            first_fps = fps

    # Determine target resolution
    if resolution_mode == "strict":
        dimensions = {(int(frames.shape[2]), int(frames.shape[1])) for frames in raw_shot_frames.values()}
        if len(dimensions) > 1:
            raise ValueError("Strict resolution mode requires every shot to have identical dimensions")
        target_w, target_h = next(iter(dimensions), (int(custom_width), int(custom_height)))
    elif resolution_mode == "first_shot" and first_w is not None and first_h is not None:
        target_w, target_h = int(first_w), int(first_h)
    else:
        target_w, target_h = int(custom_width), int(custom_height)

    # Determine target FPS
    if fps_mode == "strict":
        rates = {round(rate, 6) for rate in source_fps.values()}
        if len(rates) > 1:
            raise ValueError("Strict FPS mode requires every shot to have the same frame rate")
        target_fps = next(iter(rates), float(custom_fps))
    elif fps_mode == "first_shot":
        target_fps = float(first_fps)
    else:
        target_fps = float(custom_fps)

    if target_w * target_h > MAX_OUTPUT_PIXELS:
        raise ValueError("Sequencer output resolution exceeds the safe pixel limit")

    # Actual media metadata is authoritative over stale serialized source metadata.
    for shot in sequence_state.get("shots", {}).values():
        if not isinstance(shot, dict):
            continue
        slot = str(shot.get("source_slot") or "shot1")
        if slot not in source_durations:
            continue
        old_duration = max(1, int(shot.get("source", {}).get("duration_frames", source_durations[slot])))
        actual_duration = source_durations[slot]
        trim = shot.setdefault("trim", {})
        if int(trim.get("out_frame", old_duration - 1)) >= old_duration - 1:
            trim["out_frame"] = actual_duration - 1
        trim["in_frame"] = min(actual_duration - 1, max(0, int(trim.get("in_frame", 0))))
        trim["out_frame"] = min(actual_duration - 1, max(trim["in_frame"], int(trim.get("out_frame", actual_duration - 1))))
        shot["source"] = {
            "duration_frames": actual_duration,
            "fps_num": Fraction(source_fps[slot]).limit_denominator(1001).numerator,
            "fps_den": Fraction(source_fps[slot]).limit_denominator(1001).denominator,
        }

    # Normalize all source video slots
    normalized_shots: dict[str, Any] = {}
    for slot_name, frames in raw_shot_frames.items():
        normalized_shots[slot_name] = normalize_video_frames(frames, target_w, target_h, fit_mode)

    # Map timeline frames
    samples = build_timeline_frame_map(sequence_state, source_durations, target_fps=target_fps)
    if len(samples) > MAX_OUTPUT_FRAMES:
        raise ValueError(f"Sequencer output exceeds the {MAX_OUTPUT_FRAMES}-frame safety limit")
    if not samples:
        # Return single black frame fallback if sequence is empty
        black = torch.zeros((1, target_h, target_w, 3), dtype=torch.float32)
        return _wrap_output_video(black, target_fps), {"fps": target_fps, "width": target_w, "height": target_h}

    exemplar = next(iter(normalized_shots.values()), None)
    output_device = exemplar.device if isinstance(exemplar, torch.Tensor) else None
    output_dtype = exemplar.dtype if isinstance(exemplar, torch.Tensor) else torch.float32
    stacked = torch.zeros(
        (len(samples), target_h, target_w, 3),
        dtype=output_dtype,
        device=output_device,
    )

    for output_index, sample in enumerate(samples):
        shot_tensor = normalized_shots.get(sample.source_slot)
        if shot_tensor is None or not isinstance(shot_tensor, torch.Tensor) or shot_tensor.shape[0] == 0:
            continue

        num_f = shot_tensor.shape[0]
        fa_idx = max(0, min(num_f - 1, sample.floor_frame))
        fb_idx = max(0, min(num_f - 1, sample.ceil_frame))

        fa = shot_tensor[fa_idx]
        if fa_idx == fb_idx or sample.blend_alpha <= 1e-4 or sample.interpolation_mode == "nearest":
            stacked[output_index].copy_(fa.to(device=stacked.device, dtype=stacked.dtype))
        else:
            fb = shot_tensor[fb_idx]
            rendered = interpolate_frames(fa, fb, sample.blend_alpha, sample.interpolation_mode)
            stacked[output_index].copy_(rendered.to(device=stacked.device, dtype=stacked.dtype))

    return _wrap_output_video(stacked, target_fps), {"fps": target_fps, "width": target_w, "height": target_h}
