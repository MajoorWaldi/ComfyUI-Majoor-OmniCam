from __future__ import annotations

from typing import Any

from ..adapters.h3 import h3_native_aligned_length
from ..capabilities import detect_capabilities
from ..comfy_compat import IO
from ..core.video_sampling import resample_video_frames
from ..monitor.execute import execute_monitor_adapter
from ..monitor.fingerprint import monitor_fingerprint
from .base import OMNICAM_TRACK, validated_track
from .media import as_video, image_twin, media_input


class MajoorOmniCamMonitor(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamMonitor",
            display_name="OmniCam Monitor",
            category="Majoor/OmniCam",
            description="Monitor, validate, preview and route an OmniCam camera track to supported AI-video camera adapters.",
            search_aliases=["camera monitor", "camera health", "camera preflight", "camera adapter", "camera prompt", "ati preview", "ltx guide", "wan camera"],
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                media_input("proxy_video", optional=True, tooltip="The shot this track describes, as a VIDEO or an IMAGE batch."),
                IO.Combo.Input(
                    "adapter",
                    options=["h3", "h3_native", "wan_native", "wan_ati", "wan_tracks_native", "ltx_motion_track", "ltx"],
                    default="h3",
                ),
                IO.String.Input("base_prompt", default="", multiline=True, optional=True),
                # Deprecated: the reference dialect is a property of the installed
                # H3 node, not of the user. Kept so pinned workflows still load;
                # "auto" resolves it from detected capabilities.
                IO.String.Input("video_ref_token", default="auto", multiline=False, advanced=True),
                IO.Int.Input("width", default=832, min=64, max=4096, step=8, advanced=True),
                IO.Int.Input("height", default=480, min=64, max=4096, step=8, advanced=True),
                IO.Int.Input("length", default=81, min=1, max=10000, step=1, advanced=True),
                IO.Int.Input("point_count", default=16, min=4, max=128, step=1, advanced=True),
                IO.Combo.Input("distribution", options=["balanced", "subject_focus", "ground_parallax"], default="balanced", advanced=True),
                IO.Int.Input("ltx_max_frames", default=121, min=1, max=1000, advanced=True),
                IO.Combo.Input("ltx_sampling_mode", options=["contiguous", "uniform"], default="contiguous", advanced=True),
            ],
            outputs=[
                IO.Video.Output(display_name="reference_video"),
                IO.String.Output(display_name="camera_prompt"),
                IO.String.Output(display_name="cinematic_prompt"),
                IO.String.Output(display_name="final_prompt"),
                IO.String.Output(display_name="camera_data_json"),
                IO.WanCameraEmbedding.Output(display_name="wan_camera"),
                IO.String.Output(display_name="tracks"),
                IO.Int.Output(display_name="adapter_width"),
                IO.Int.Output(display_name="adapter_height"),
                IO.Int.Output(display_name="adapter_length"),
                IO.Image.Output(display_name="guide_frames"),
                IO.String.Output(display_name="adapter_profile_json"),
                # Appended, not inserted, so existing links keep their slot index.
                IO.Image.Output(display_name="reference_frames"),
            ],
        )

    @classmethod
    def execute(
        cls, camera_track: dict[str, Any], proxy_video=None, adapter: str = "h3",
        base_prompt: str = "", video_ref_token: str = "auto", width: int = 832,
        height: int = 480, length: int = 81, point_count: int = 16,
        distribution: str = "balanced", ltx_max_frames: int = 121,
        ltx_sampling_mode: str = "contiguous",
    ) -> IO.NodeOutput:
        track = validated_track(camera_track)
        proxy_video = as_video(proxy_video)
        settings = {
            "base_prompt": base_prompt, "video_ref_token": video_ref_token,
            "width": width, "height": height, "length": length,
            "point_count": point_count, "distribution": distribution,
            "ltx_max_frames": ltx_max_frames, "ltx_sampling_mode": ltx_sampling_mode,
        }
        result = execute_monitor_adapter(
            adapter=adapter, track=track, proxy_video=proxy_video,
            capabilities=detect_capabilities(), **settings,  # type: ignore[arg-type]
        )
        fingerprint = monitor_fingerprint(track=track.to_dict(), adapter=adapter, settings=settings)
        reference_frames = (
            resample_video_frames(
                result["reference_video"],
                target_fps=24.0,
                max_frames=h3_native_aligned_length(length),
            )
            if adapter == "h3_native" and result["reference_video"] is not None
            else image_twin(result["reference_video"])
        )
        if adapter == "h3_native":
            result["adapter_length"] = h3_native_aligned_length(length)
        ordered = (
            result["reference_video"], result["camera_prompt"], result["cinematic_prompt"],
            result["final_prompt"], result["camera_data_json"], result["wan_camera"],
            result["tracks"], result["adapter_width"], result["adapter_height"],
            result["adapter_length"], result["guide_frames"], result["adapter_profile_json"],
            reference_frames,
        )
        return IO.NodeOutput(*ordered, ui={"monitor": {"format": "majoor.omnicam.monitor.execution.v1", "fingerprint": fingerprint}})
