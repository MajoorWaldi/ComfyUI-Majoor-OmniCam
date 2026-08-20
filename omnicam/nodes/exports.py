from __future__ import annotations

from typing import Any

from comfy_api.latest import IO

from ..adapters import (
    build_blender_script,
    build_unreal_python_script,
)
from ..core.track import OmniCamTrack
from .base import OMNICAM_TRACK, write_output


class MajoorOmniCamDCCExport(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamDCCExport",
            display_name="OmniCam → DCC Export",
            category="Majoor/OmniCam/Export",
            description="Exports an authored camera track to DCC applications (Blender, Unreal Engine) via generated Python scripts.",
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.Combo.Input("target", options=["Blender", "Unreal"]),
                IO.String.Input("filename_prefix", default="omnicam_camera", multiline=False),
                IO.Float.Input("world_scale", default=1.0, min=0.0001, max=10000.0, step=0.1),
            ],
            outputs=[
                IO.String.Output(display_name="script_path"),
                IO.String.Output(display_name="track_json_path"),
            ],
        )

    @classmethod
    def execute(cls, camera_track: dict[str, Any], target: str, filename_prefix: str, world_scale: float = 1.0) -> IO.NodeOutput:
        track = OmniCamTrack.from_dict(camera_track)
        safe = "".join(c for c in filename_prefix if c.isalnum() or c in "-_ ").strip() or "omnicam_camera"
        if target.lower() == "unreal":
            script_path = write_output(f"{safe}.unreal.py", build_unreal_python_script(track))
        else:
            script_path = write_output(f"{safe}.blender.py", build_blender_script(track, world_scale))
        json_path = write_output(f"{safe}.json", track.to_json())
        return IO.NodeOutput(script_path, json_path)


class MajoorOmniCamBlenderExport(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamBlenderExport",
            display_name="OmniCam → Blender Export",
            category="Majoor/OmniCam/Export",
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.String.Input("filename_prefix", default="omnicam_camera", multiline=False),
                IO.Float.Input("world_scale", default=1.0, min=0.0001, max=10000.0, step=0.1),
            ],
            outputs=[
                IO.String.Output(display_name="blender_script_path"),
                IO.String.Output(display_name="track_json_path"),
            ],
        )

    @classmethod
    def execute(cls, camera_track: dict[str, Any], filename_prefix: str, world_scale: float = 1.0) -> IO.NodeOutput:
        track = OmniCamTrack.from_dict(camera_track)
        safe = "".join(c for c in filename_prefix if c.isalnum() or c in "-_ ").strip() or "omnicam_camera"
        script_path = write_output(f"{safe}.blender.py", build_blender_script(track, world_scale))
        json_path = write_output(f"{safe}.json", track.to_json())
        return IO.NodeOutput(script_path, json_path)


class MajoorOmniCamUnrealExport(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamUnrealExport",
            display_name="OmniCam → Unreal Export",
            category="Majoor/OmniCam/Export",
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.String.Input("filename_prefix", default="omnicam_camera", multiline=False),
            ],
            outputs=[
                IO.String.Output(display_name="unreal_script_path"),
                IO.String.Output(display_name="track_json_path"),
            ],
        )

    @classmethod
    def execute(cls, camera_track: dict[str, Any], filename_prefix: str) -> IO.NodeOutput:
        track = OmniCamTrack.from_dict(camera_track)
        safe = "".join(c for c in filename_prefix if c.isalnum() or c in "-_ ").strip() or "omnicam_camera"
        script_path = write_output(f"{safe}.unreal.py", build_unreal_python_script(track))
        json_path = write_output(f"{safe}.json", track.to_json())
        return IO.NodeOutput(script_path, json_path)
