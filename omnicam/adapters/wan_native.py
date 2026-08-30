from __future__ import annotations

import numpy as np

from ..core.track import OmniCamTrack
from .wan import track_to_wan_camera_params


def build_wan_camera_embedding(track: OmniCamTrack, *, width: int, height: int, length: int):
    if (int(length) - 1) % 4:
        raise ValueError("Wan camera length must be 4n+1 frames")
    import comfy.model_management
    import torch
    from comfy_extras.nodes_camera_trajectory import process_pose_params

    params = np.asarray(track_to_wan_camera_params(track, int(length)), dtype=np.float32)
    embedding = process_pose_params(
        params, width=int(width), height=int(height),
        original_pose_width=track.width, original_pose_height=track.height,
    )
    embedding = embedding.permute([3, 0, 1, 2]).unsqueeze(0).to(device=comfy.model_management.intermediate_device())
    embedding = torch.concat([torch.repeat_interleave(embedding[:, :, 0:1], repeats=4, dim=2), embedding[:, :, 1:]], dim=2).transpose(1, 2)
    batch, frames, channels, latent_height, latent_width = embedding.shape
    embedding = embedding.contiguous().view(batch, frames // 4, 4, channels, latent_height, latent_width).transpose(2, 3)
    return embedding.contiguous().view(batch, frames // 4, channels * 4, latent_height, latent_width).transpose(1, 2)
