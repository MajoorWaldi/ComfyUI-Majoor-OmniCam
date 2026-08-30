from __future__ import annotations

import json
from typing import Any

import torch

from ..adapters import (
    build_h3_prompt,
    track_to_ati_bridge,
    track_to_ati_json,
    track_to_ati_tracks,
    track_to_ltx_camera_bridge,
)
from ..adapters.ltx_guide import build_ltx_guide_frames
from ..adapters.wan_native import build_wan_camera_embedding
from ..comfy_compat import IO
from ..core.control_passes import depth_pass, normals_pass, object_id_pass, optical_flow_pass
from .base import OMNICAM_ATI_BRIDGE, OMNICAM_LTX_BRIDGE, OMNICAM_TRACK, validated_track
from .media import as_image_batch, as_video, image_twin, media_input


class MajoorOmniCamH3Adapter(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamH3Adapter",
            display_name="OmniCam → Universal Reference & AI Prompts",
            category="Majoor/OmniCam/Legacy",
            is_deprecated=True,
            description=(
                "Deprecated compatibility node; new workflows should use OmniCam Monitor. "
                "Provides camera reference video and model-tailored cinematic prompts "
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
                media_input("proxy_video", optional=True),
                IO.String.Input("video_ref_token", default="<Video 1>", multiline=False),
                IO.Combo.Input("prompt_style", options=["h3", "universal", "kling", "luma", "hunyuan", "wan"]),
                IO.String.Input("base_prompt", default="", multiline=True, optional=True),
            ],
            outputs=[
                IO.Video.Output(display_name="camera_reference_video"),
                IO.String.Output(display_name="prompt_fragment"),
                IO.String.Output(display_name="cinematic_prompt"),
                IO.String.Output(display_name="camera_analysis_json"),
                # Appended, not inserted, so existing links keep their slot index.
                IO.Image.Output(display_name="reference_frames"),
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
        proxy_video = as_video(proxy_video)
        return IO.NodeOutput(
            proxy_video,
            build_h3_prompt(track, video_ref_token=video_ref_token),
            cinematic,
            json.dumps(analysis, indent=2),
            image_twin(proxy_video),
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
            category="Majoor/OmniCam/Legacy",
            is_deprecated=True,
            description="Deprecated compatibility node. New workflows should use OmniCam Monitor. Converts an OmniCam track to a native Wan camera embedding.",
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
        track = validated_track(camera_track)
        embedding = build_wan_camera_embedding(track, width=width, height=height, length=length)
        return IO.NodeOutput(embedding, width, height, length)


class MajoorOmniCamWanVideoWrapperATI(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamWanVideoWrapperATI",
            display_name="OmniCam → WanVideoWrapper ATI",
            category="Majoor/OmniCam/Legacy",
            is_deprecated=True,
            description=(
                "Deprecated compatibility node; new workflows should use OmniCam Monitor. "
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
                media_input("image"),
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
        preview = as_image_batch(image, max_frames=1).clone()
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
            category="Majoor/OmniCam/Legacy",
            is_deprecated=True,
            description="Deprecated compatibility node. New workflows should use OmniCam Monitor. Decodes proxy VIDEO frames for LTX camera guidance.",
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                media_input("proxy_video"),
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
        guide = build_ltx_guide_frames(
            track,
            as_video(proxy_video),
            max_frames=max_frames,
            sampling_mode=sampling_mode,
            width=resize_width,
            height=resize_height,
            start_frame=start_frame,
            end_frame=end_frame,
        )
        frames, profile = guide["frames"], guide["profile"]
        estimated = guide["plan"]["estimated_memory_bytes"]
        cinematic = build_cinematic_motion_prompt(track, base_prompt=base_prompt, style="universal")
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
