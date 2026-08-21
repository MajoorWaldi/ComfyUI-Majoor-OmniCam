"""Resolution and aspect ratio normalization for multi-shot assembly."""

from __future__ import annotations

from typing import Any


def normalize_video_frames(
    frames: Any,
    target_width: int,
    target_height: int,
    fit_mode: str = "contain",
) -> Any:
    """Normalize video frames tensor [N, H, W, C] to target resolution and fit mode."""
    if frames is None:
        return None

    try:
        import torch
        import torch.nn.functional as F

        if not isinstance(frames, torch.Tensor) or frames.ndim != 4:
            return frames

        n, h, w, c = frames.shape
        tw = int(target_width)
        th = int(target_height)

        if h == th and w == tw:
            return frames

        mode = fit_mode.lower().strip()
        # Permute from [N, H, W, C] to [N, C, H, W] for PyTorch operations
        x = frames.permute(0, 3, 1, 2)

        if mode == "stretch":
            out = F.interpolate(x, size=(th, tw), mode="bilinear", align_corners=False)
            return out.permute(0, 2, 3, 1)

        elif mode == "contain":
            # Scale uniformly to fit inside target box, padding letterbox/pillarbox with 0
            scale = min(tw / w, th / h)
            nw = max(1, int(round(w * scale)))
            nh = max(1, int(round(h * scale)))
            scaled = F.interpolate(x, size=(nh, nw), mode="bilinear", align_corners=False)

            pad_left = (tw - nw) // 2
            pad_right = tw - nw - pad_left
            pad_top = (th - nh) // 2
            pad_bottom = th - nh - pad_top

            out = F.pad(scaled, (pad_left, pad_right, pad_top, pad_bottom), value=0.0)
            return out.permute(0, 2, 3, 1)

        elif mode == "cover":
            # Scale uniformly to cover target box, then center-crop
            scale = max(tw / w, th / h)
            nw = max(1, int(round(w * scale)))
            nh = max(1, int(round(h * scale)))
            scaled = F.interpolate(x, size=(nh, nw), mode="bilinear", align_corners=False)

            x_start = max(0, (nw - tw) // 2)
            y_start = max(0, (nh - th) // 2)
            cropped = scaled[:, :, y_start : y_start + th, x_start : x_start + tw]
            return cropped.permute(0, 2, 3, 1)

        elif mode == "center_crop":
            # Direct crop or pad without scaling
            if w >= tw and h >= th:
                x_start = (w - tw) // 2
                y_start = (h - th) // 2
                cropped = x[:, :, y_start : y_start + th, x_start : x_start + tw]
                return cropped.permute(0, 2, 3, 1)
            else:
                pad_l = max(0, (tw - w) // 2)
                pad_r = max(0, tw - w - pad_l)
                pad_t = max(0, (th - h) // 2)
                pad_b = max(0, th - h - pad_t)
                padded = F.pad(x, (pad_l, pad_r, pad_t, pad_b), value=0.0)
                return padded[:, :, :th, :tw].permute(0, 2, 3, 1)

        else:
            # Default fallback contain
            scale = min(tw / w, th / h)
            nw = max(1, int(round(w * scale)))
            nh = max(1, int(round(h * scale)))
            scaled = F.interpolate(x, size=(nh, nw), mode="bilinear", align_corners=False)
            pad_left = (tw - nw) // 2
            pad_right = tw - nw - pad_left
            pad_top = (th - nh) // 2
            pad_bottom = th - nh - pad_top
            out = F.pad(scaled, (pad_left, pad_right, pad_top, pad_bottom), value=0.0)
            return out.permute(0, 2, 3, 1)

    except Exception:
        return frames
