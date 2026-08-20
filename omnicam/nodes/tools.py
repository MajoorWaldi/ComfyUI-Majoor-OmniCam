from __future__ import annotations

import json
from typing import Any

from comfy_api.latest import IO

from ..core.camera_tools import (
    CAMERA_PRESETS,
    add_camera_shake,
    animate_fov,
    apply_camera_preset,
    apply_dolly_zoom,
    build_cinematic_motion_prompt,
    constrain_arc,
    constrain_look_at,
    follow_track_target,
    motion_speed_profile,
    smooth_camera_path,
)
from ..core.track import OmniCamTrack, camera_to_load3d
from .base import OMNICAM_TRACK


class MajoorOmniCamTrackSampler(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamTrackSampler",
            display_name="OmniCam Track Sampler",
            category="Majoor/OmniCam/Utilities",
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.Int.Input("frame", default=0, min=0, max=100000, step=1),
            ],
            outputs=[
                IO.Load3DCamera.Output(display_name="camera_info"),
                IO.String.Output(display_name="sample_json"),
            ],
        )

    @classmethod
    def execute(cls, camera_track: dict[str, Any], frame: int) -> IO.NodeOutput:
        track = OmniCamTrack.from_dict(camera_track)
        camera = track.sample(frame)
        payload = camera_to_load3d(camera, track.width / max(1, track.height))
        return IO.NodeOutput(payload, json.dumps(payload, indent=2))


class MajoorOmniCamCameraTools(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        operations = list(CAMERA_PRESETS) + ["shake", "look_at", "follow_target", "arc_constraint", "auto_orbit", "dolly_zoom", "focal_length", "smooth"]
        return IO.Schema(
            node_id="MajoorOmniCamCameraTools",
            display_name="OmniCam Camera Tools",
            category="Majoor/OmniCam/Utilities",
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.Combo.Input("operation", options=operations, default="orbit_left"),
                IO.Float.Input("amount", default=1.0, min=0.0, max=10.0, step=0.05),
                IO.Int.Input("seed", default=0, min=0, max=0x7FFFFFFF),
                IO.Float.Input("target_x", default=0.0, step=0.01, advanced=True),
                IO.Float.Input("target_y", default=1.5, step=0.01, advanced=True),
                IO.Float.Input("target_z", default=0.0, step=0.01, advanced=True),
            ],
            outputs=[
                OMNICAM_TRACK.Output(display_name="camera_track"),
                IO.String.Output(display_name="track_json"),
                IO.String.Output(display_name="motion_speed_json"),
                IO.String.Output(display_name="cinematic_prompt"),
            ],
        )

    @classmethod
    def execute(cls, camera_track: dict[str, Any], operation: str, amount: float, seed: int, target_x: float, target_y: float, target_z: float) -> IO.NodeOutput:
        track = OmniCamTrack.from_dict(camera_track)
        if operation in CAMERA_PRESETS:
            result = apply_camera_preset(track, operation, amount)
        elif operation == "shake":
            result = add_camera_shake(track, amplitude=amount * 0.03, seed=seed)
        elif operation == "look_at":
            result = constrain_look_at(track, [target_x, target_y, target_z])
        elif operation == "follow_target":
            result = follow_track_target(track)
        elif operation == "arc_constraint":
            result = constrain_arc(track, [target_x, target_y, target_z])
        elif operation == "auto_orbit":
            result = apply_camera_preset(constrain_look_at(track, [target_x, target_y, target_z]), "orbit_left", amount)
        elif operation == "dolly_zoom":
            result = apply_dolly_zoom(track)
        elif operation == "focal_length":
            result = animate_fov(track, amount)
        else:
            result = smooth_camera_path(track, radius=max(1, round(amount)))
        return IO.NodeOutput(
            result.to_dict(),
            result.to_json(),
            json.dumps(motion_speed_profile(result)),
            build_cinematic_motion_prompt(result),
        )
