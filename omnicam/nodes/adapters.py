from __future__ import annotations

import json
from typing import Any

import numpy as np
import torch
from comfy_api.latest import IO

from ..adapters import (
    build_h3_prompt,
    track_to_ati_bridge,
    track_to_ati_json,
    track_to_ati_tracks,
    track_to_ltx_camera_bridge,
    track_to_wan_camera_params,
)
from ..adapters.ltx import ltx_camera_control_profile
from ..core.control_passes import depth_pass, normals_pass, object_id_pass, optical_flow_pass
from ..core.video_sampling import inspect_video, sample_video_frames, sampling_indices
from .base import OMNICAM_ATI_BRIDGE, OMNICAM_LTX_BRIDGE, OMNICAM_TRACK, validated_track


class MajoorOmniCamH3Adapter(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamH3Adapter",
            display_name="OmniCam → Universal Reference & AI Prompts",
            category="Majoor/OmniCam/Adapters",
            description=(
                "Multimodal adapter providing camera reference video and generating model-tailored cinematic prompts "
                "for MiniMax H3 Omni Reference, Kling, Luma Dream Machine, HunyuanVideo, Wan 2.1 and Universal pipelines."
            ),
            search_aliases=[
                "minimax",
                "h3",
                "omni reference",
                "universal prompt",
                "cinematic prompt",
                "camera prompt",
                "kling",
                "luma",
                "hunyuan",
                "video reference",
            ],
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.Video.Input("proxy_video", optional=True),
                IO.String.Input("video_ref_token", default="<Video 1>", multiline=False),
                IO.Combo.Input("prompt_style", options=["h3", "universal", "kling", "luma", "hunyuan", "wan"]),
                IO.String.Input("base_prompt", default="", multiline=True, optional=True),
            ],
            outputs=[
                IO.Video.Output(display_name="camera_reference_video"),
                IO.String.Output(display_name="prompt_fragment"),
                IO.String.Output(display_name="cinematic_prompt"),
                IO.String.Output(display_name="camera_analysis_json"),
            ],
        )

    @classmethod
    def execute(
        cls,
        camera_track: dict[str, Any],
        video_ref_token: str = "<Video 1>",
        prompt_style: str = "h3",
        base_prompt: str = "",
        proxy_video=None,
    ) -> IO.NodeOutput:
        from ..core.camera_tools import analyze_camera_trajectory, build_cinematic_motion_prompt
        track = validated_track(camera_track)
        analysis = analyze_camera_trajectory(track)
        cinematic = build_cinematic_motion_prompt(track, base_prompt=base_prompt, style=prompt_style)
        return IO.NodeOutput(
            proxy_video,
            build_h3_prompt(track, video_ref_token=video_ref_token),
            cinematic,
            json.dumps(analysis, indent=2),
        )


class MajoorOmniCamWanATIAdapter(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamWanATIAdapter",
            display_name="OmniCam → Wan ATI Bridge",
            category="Majoor/OmniCam/Adapters",
            description=(
                "Projects static 3D reference points through the authored camera to create trajectory data. "
                "Supports balanced, subject-focus, and ground-parallax point distributions."
            ),
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.Int.Input("point_count", default=16, min=4, max=128, step=1),
                IO.Combo.Input("distribution", options=["balanced", "subject_focus", "ground_parallax"]),
            ],
            outputs=[
                OMNICAM_ATI_BRIDGE.Output(display_name="ati_bridge"),
                IO.String.Output(display_name="ati_json"),
            ],
        )

    @classmethod
    def execute(
        cls,
        camera_track: dict[str, Any],
        point_count: int = 16,
        distribution: str = "balanced",
    ) -> IO.NodeOutput:
        track = validated_track(camera_track)
        bridge = track_to_ati_bridge(track, point_count=point_count, distribution=distribution)
        return IO.NodeOutput(bridge, json.dumps(bridge, indent=2))


class MajoorOmniCamWanNativeCamera(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamWanNativeCamera",
            display_name="OmniCam → Wan Native Camera",
            category="Majoor/OmniCam/Adapters",
            description="Converts an arbitrary OmniCam track to ComfyUI's native Wan Plücker camera embedding.",
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.Int.Input("width", default=832, min=16, max=4096, step=16),
                IO.Int.Input("height", default=480, min=16, max=4096, step=16),
                IO.Int.Input("length", default=81, min=1, max=10000, step=4),
            ],
            outputs=[
                IO.WanCameraEmbedding.Output(display_name="camera_embedding"),
                IO.Int.Output(display_name="width"),
                IO.Int.Output(display_name="height"),
                IO.Int.Output(display_name="length"),
            ],
        )

    @classmethod
    def execute(cls, camera_track: dict[str, Any], width: int, height: int, length: int) -> IO.NodeOutput:
        import comfy.model_management
        from comfy_extras.nodes_camera_trajectory import process_pose_params

        if (length - 1) % 4:
            raise ValueError("Wan camera length must be 4n+1 frames")
        track = validated_track(camera_track)
        params = np.asarray(track_to_wan_camera_params(track, length), dtype=np.float32)
        embedding = process_pose_params(params, width=width, height=height, original_pose_width=track.width, original_pose_height=track.height)
        embedding = embedding.permute([3, 0, 1, 2]).unsqueeze(0).to(device=comfy.model_management.intermediate_device())
        embedding = torch.concat([torch.repeat_interleave(embedding[:, :, 0:1], repeats=4, dim=2), embedding[:, :, 1:]], dim=2).transpose(1, 2)
        batch, frames, channels, latent_height, latent_width = embedding.shape
        embedding = embedding.contiguous().view(batch, frames // 4, 4, channels, latent_height, latent_width).transpose(2, 3)
        embedding = embedding.contiguous().view(batch, frames // 4, channels * 4, latent_height, latent_width).transpose(1, 2)
        return IO.NodeOutput(embedding, width, height, length)


class MajoorOmniCamWanVideoWrapperATI(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamWanVideoWrapperATI",
            display_name="OmniCam → WanVideoWrapper ATI",
            category="Majoor/OmniCam/Adapters",
            description=(
                "Produces the exact tracks STRING consumed by WanVideoATITracks. "
                "WanVideoATITracks normalises the coordinates with its own width/height, "
                "so wire the width and height outputs to it as well: leaving them "
                "mismatched silently offsets and rescales every trajectory."
            ),
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.Int.Input("point_count", default=16, min=4, max=128, step=1),
                IO.Combo.Input("distribution", options=["balanced", "subject_focus", "ground_parallax"]),
                IO.Int.Input("width", default=832, min=64, max=4096, step=8,
                             tooltip="Must equal the width set on WanVideoATITracks."),
                IO.Int.Input("height", default=480, min=64, max=4096, step=8,
                             tooltip="Must equal the height set on WanVideoATITracks."),
            ],
            outputs=[
                IO.String.Output(display_name="tracks"),
                IO.Int.Output(display_name="width"),
                IO.Int.Output(display_name="height"),
            ],
        )

    @classmethod
    def execute(
        cls,
        camera_track: dict[str, Any],
        point_count: int = 16,
        distribution: str = "balanced",
        width: int = 832,
        height: int = 480,
    ) -> IO.NodeOutput:
        tracks = track_to_ati_json(
            validated_track(camera_track),
            point_count=point_count,
            distribution=distribution,
            width=width,
            height=height,
        )
        return IO.NodeOutput(tracks, width, height)


def _trajectory_color(hue: float) -> list[float]:
    """A distinct colour per trajectory; 3 hard-coded colours were unreadable at 128 points."""
    import colorsys

    return list(colorsys.hsv_to_rgb((hue / 6.0) % 1.0, 0.85, 1.0))


class MajoorOmniCamATIPreview(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamATIPreview",
            display_name="OmniCam ATI Trajectory Preview",
            category="Majoor/OmniCam/Adapters",
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.Image.Input("image"),
                IO.Int.Input("point_count", default=16, min=4, max=128),
                IO.Combo.Input("distribution", options=["balanced", "subject_focus", "ground_parallax"]),
            ],
            outputs=[IO.Image.Output(display_name="preview")],
        )

    @classmethod
    def execute(
        cls,
        camera_track: dict[str, Any],
        image,
        point_count: int = 16,
        distribution: str = "balanced",
    ) -> IO.NodeOutput:
        """Draw exactly the tracks the ATI node will receive.

        This used to draw the intermediate bridge, which contains samples the
        exporter drops, so the picture disagreed with what was actually sent.
        Age is encoded the way WanVideoWrapper's own visualiser does it: the dot
        grows from oldest to newest, so direction and dwell are readable rather
        than being an undifferentiated cloud of squares.
        """
        track = validated_track(camera_track)
        preview = image[:1].clone()
        height, width = preview.shape[1:3]
        tracks = track_to_ati_tracks(
            track, point_count=point_count, distribution=distribution, width=width, height=height)

        for index, points in enumerate(tracks):
            hue = (index / max(1, len(tracks))) * 6.0
            base = _trajectory_color(hue)
            last = max(1, len(points) - 1)
            for order, point in enumerate(points):
                age = order / last
                radius = 1 + round(age * 3)
                # Older samples are dimmed so the head of the track stands out.
                shade = [channel * (0.35 + 0.65 * age) for channel in base]
                color = torch.tensor(shade, device=preview.device, dtype=preview.dtype)
                x = max(0, min(width - 1, round(point["x"])))
                y = max(0, min(height - 1, round(point["y"])))
                preview[0, max(0, y - radius):min(height, y + radius + 1),
                        max(0, x - radius):min(width, x + radius + 1), :3] = color
        return IO.NodeOutput(preview)


class MajoorOmniCamLTXAdapter(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamLTXAdapter",
            display_name="OmniCam → LTX Camera Bridge",
            category="Majoor/OmniCam/Adapters",
            description="Exports a version-neutral per-frame camera intrinsics/extrinsics payload for LTX camera conditioning.",
            inputs=[OMNICAM_TRACK.Input("camera_track"), IO.Int.Input("length", default=0, min=0, max=10000, advanced=True)],
            outputs=[
                OMNICAM_LTX_BRIDGE.Output(display_name="ltx_camera_bridge"),
                IO.String.Output(display_name="ltx_json"),
            ],
        )

    @classmethod
    def execute(cls, camera_track: dict[str, Any], length: int = 0) -> IO.NodeOutput:
        track = validated_track(camera_track)
        bridge = track_to_ltx_camera_bridge(track, length or None)
        return IO.NodeOutput(bridge, json.dumps(bridge, indent=2))


class MajoorOmniCamLTXCameraGuide(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamLTXCameraGuide",
            display_name="OmniCam → LTX Camera Guide",
            category="Majoor/OmniCam/Adapters",
            description="Decodes the proxy VIDEO to IMAGE frames for LTX Add Video IC-LoRA Guide, provides cinematic prompt and recommended camera LoRA profile.",
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.Video.Input("proxy_video"),
                IO.String.Input("base_prompt", default="", multiline=True, optional=True),
                IO.Int.Input("start_frame", default=0, min=0, max=100000, advanced=True),
                IO.Int.Input("end_frame", default=0, min=0, max=100000, advanced=True),
                IO.Int.Input("max_frames", default=121, min=1, max=1000, advanced=True),
                IO.Int.Input("resize_width", default=0, min=0, max=4096, step=8, advanced=True),
                IO.Int.Input("resize_height", default=0, min=0, max=4096, step=8, advanced=True),
                IO.Combo.Input("sampling_mode", options=["contiguous", "uniform"], advanced=True),
            ],
            outputs=[
                IO.Image.Output(display_name="guide_frames"),
                IO.String.Output(display_name="cinematic_prompt"),
                IO.String.Output(display_name="camera_profile_json"),
            ],
        )

    @classmethod
    def execute(cls, camera_track: dict[str, Any], proxy_video, base_prompt: str = "", start_frame: int = 0,
                end_frame: int = 0, max_frames: int = 121, resize_width: int = 0,
                resize_height: int = 0, sampling_mode: str = "contiguous") -> IO.NodeOutput:
        from ..core.camera_tools import build_cinematic_motion_prompt
        track = validated_track(camera_track)
        metadata = inspect_video(proxy_video)
        planned_count = len(sampling_indices(
            metadata.frame_count, start_frame, end_frame, max_frames, sampling_mode
        ))
        target_width = int(resize_width) or metadata.width
        target_height = int(resize_height) or metadata.height
        # Comfy IMAGE is normally float32 RGB; reject unsafe plans before decode.
        estimated = planned_count * target_width * target_height * 3 * 4
        if estimated > 2 * 1024**3:
            raise ValueError("LTX guide would exceed the 2 GiB decoded-frame safety limit; reduce frames or resolution")
        frames = sample_video_frames(
            proxy_video,
            start_frame=start_frame,
            end_frame=end_frame,
            max_frames=max_frames,
            mode=sampling_mode,
        )
        if not frames.shape[0]:
            raise ValueError("The LTX guide source contains no decodable video frames")
        if (target_height, target_width) != tuple(frames.shape[1:3]):
            frames = torch.nn.functional.interpolate(
                frames.permute(0, 3, 1, 2), size=(target_height, target_width), mode="bilinear", align_corners=False
            ).permute(0, 2, 3, 1)
        cinematic = build_cinematic_motion_prompt(track, base_prompt=base_prompt, style="universal")
        profile = ltx_camera_control_profile(track)
        profile["guide_diagnostics"] = {
            "guide_type": "IMAGE",
            "frames": int(frames.shape[0]),
            "resolution": [int(frames.shape[2]), int(frames.shape[1])],
            "estimated_memory_bytes": int(estimated),
            "estimated_memory_mb": round(estimated / 1024**2, 1),
        }
        return IO.NodeOutput(frames, cinematic, json.dumps(profile, indent=2))


class MajoorOmniCamControlPasses(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamControlPasses",
            display_name="OmniCam Scene Motion Analysis (Internal)",
            category="Majoor/OmniCam/Adapters",
            description="Exports geometry-derived control passes (object IDs, depth, normals, optical flow) as JSON payloads for ControlNet-style conditioning.",
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.Combo.Input("pass_type", options=["object_ids", "depth", "normals", "optical_flow"]),
                IO.Int.Input("step", default=1, min=1, max=64, advanced=True),
            ],
            outputs=[IO.String.Output(display_name="pass_json")],
        )

    @classmethod
    def execute(cls, camera_track: dict[str, Any], pass_type: str, step: int) -> IO.NodeOutput:
        track = validated_track(camera_track)
        if pass_type == "object_ids":
            payload = object_id_pass(track, step=step)
        elif pass_type == "depth":
            payload = depth_pass(track, step=step)
        elif pass_type == "normals":
            payload = normals_pass(track, step=step)
        else:
            payload = optical_flow_pass(track, step=step)
        return IO.NodeOutput(json.dumps(payload, indent=2))
