from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import comfy.model_management
import folder_paths
import numpy as np
import torch
from comfy_api.latest import IO, UI, InputImpl
from comfy_extras.nodes_camera_trajectory import process_pose_params

from .adapters import (
    build_blender_script,
    build_h3_prompt,
    build_unreal_python_script,
    track_to_ati_bridge,
    track_to_ati_json,
    track_to_ltx_camera_bridge,
    track_to_wan_camera_params,
)
from .adapters.ltx import ltx_camera_control_profile
from .core.camera_tools import (
    CAMERA_PRESETS,
    add_camera_shake,
    animate_fov,
    apply_camera_preset,
    apply_dolly_zoom,
    constrain_arc,
    constrain_look_at,
    follow_track_target,
    motion_speed_profile,
    smooth_camera_path,
)
from .core.sequence import build_sequence, playblast_manifest, sequence_to_json, validate_sequence
from .core.edl import edl_to_shots, otio_to_shots, sequence_to_edl, sequence_to_otio
from .core.control_passes import depth_pass, normals_pass, object_id_pass, optical_flow_pass
from .core.editor_state import editor_state_to_track
from .core.track import OmniCamTrack, camera_to_load3d

OMNICAM_TRACK = IO.Custom("MAJOOR_OMNICAM_TRACK")
OMNICAM_ATI_BRIDGE = IO.Custom("MAJOOR_OMNICAM_ATI_BRIDGE")
OMNICAM_LTX_BRIDGE = IO.Custom("MAJOOR_OMNICAM_LTX_BRIDGE")
OMNICAM_SEQUENCE = IO.Custom("MAJOOR_OMNICAM_SEQUENCE")
OMNICAM_EDITOR_STATE = IO.Custom("OMNICAM_EDITOR_STATE")


def _resolve_video(path: str | None):
    if not path:
        return None
    try:
        resolved = folder_paths.get_annotated_filepath(path)
    except ValueError:
        return None
    if not resolved or not os.path.isfile(resolved):
        return None
    return InputImpl.VideoFromFile(resolved)


def _write_output(filename: str, content: str) -> str:
    output = Path(folder_paths.get_output_directory()) / "omnicam"
    output.mkdir(parents=True, exist_ok=True)
    path = output / filename
    path.write_text(content, encoding="utf-8")
    return str(path)


class MajoorOmniCamDirector(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamDirector",
            display_name="Majoor OmniCam Director",
            category="Majoor/OmniCam",
            description=(
                "Interactive camera-authoring node. The frontend stores a canonical camera track and "
                "optional proxy playblast; execution exposes both to the ComfyUI graph."
            ),
            search_aliases=["camera director", "camera path", "omni reference camera", "playblast"],
            is_experimental=True,
            inputs=[
                IO.String.Input("state_json", default="{}", multiline=True, advanced=True),
                IO.String.Input("recording_path", default="", multiline=False, advanced=True),
                IO.String.Input("card_asset", default="", multiline=False, advanced=True),
                IO.Int.Input("width", default=1280, min=64, max=4096, step=8),
                IO.Int.Input("height", default=720, min=64, max=4096, step=8),
                IO.Int.Input("fps", default=24, min=1, max=120, step=1),
                IO.Float.Input("duration_seconds", default=5.0, min=0.25, max=120.0, step=0.25),
                IO.Combo.Input(
                    "render_mode",
                    options=["omni_ref", "graybox", "grid", "point_field", "wireframe", "card_grid"],
                ),
                IO.Image.Input("image", optional=True),
                IO.Video.Input("video", optional=True),
            ],
            outputs=[
                OMNICAM_TRACK.Output(display_name="camera_track"),
                IO.Video.Output(display_name="proxy_video"),
                IO.Load3DCamera.Output(display_name="camera_info"),
                IO.String.Output(display_name="track_json"),
                IO.Image.Output(display_name="proxy_frames"),
            ],
        )

    @classmethod
    def execute(
        cls,
        state_json: str,
        recording_path: str,
        card_asset: str,
        width: int,
        height: int,
        fps: int,
        duration_seconds: float,
        render_mode: str,
        image=None,
        video=None,
    ) -> IO.NodeOutput:
        raw_state: dict[str, Any] = {}
        try:
            parsed = json.loads(state_json) if state_json else {}
            raw_state = parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid OmniCam state JSON: {exc}") from exc
        # Explicit editor-state → primary-track conversion (playblast camera wins).
        track = OmniCamTrack.from_dict(editor_state_to_track(raw_state, validate=False))
        # Backend values are authoritative when a workflow is queued.
        track.width = int(width)
        track.height = int(height)
        track.fps = int(fps)
        track.duration_frames = max(1, round(float(duration_seconds) * track.fps))
        track.render_mode = str(render_mode)
        track.metadata = dict(track.metadata)
        track.metadata.update({"card_asset": card_asset, "recording_path": recording_path, "generator": "ComfyUI-Majoor-OmniCam"})

        final_camera = track.sample(track.duration_frames - 1)
        camera_info = camera_to_load3d(final_camera, aspect=track.width / max(1, track.height))
        proxy_video = _resolve_video(recording_path)
        proxy_frames = proxy_video.get_components().images if proxy_video is not None else None
        preview = image[:32] if image is not None else None
        if preview is None and video is not None:
            components = video.get_components()
            preview = components.images[:32] if components.images.shape[0] else None
        ui = UI.PreviewImage(preview, cls=cls) if preview is not None else None
        return IO.NodeOutput(track.to_dict(), proxy_video, camera_info, track.to_json(), proxy_frames, ui=ui)


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


class MajoorOmniCamH3Adapter(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamH3Adapter",
            display_name="OmniCam → MiniMax H3 Omni Reference",
            category="Majoor/OmniCam/Adapters",
            description="Passes the proxy camera video through and generates a camera-reference prompt fragment for H3 Omni Reference.",
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.Video.Input("proxy_video", optional=True),
                IO.String.Input("video_ref_token", default="<Video 1>", multiline=False),
            ],
            outputs=[
                IO.Video.Output(display_name="camera_reference_video"),
                IO.String.Output(display_name="prompt_fragment"),
            ],
        )

    @classmethod
    def execute(cls, camera_track: dict[str, Any], video_ref_token: str, proxy_video=None) -> IO.NodeOutput:
        track = OmniCamTrack.from_dict(camera_track)
        return IO.NodeOutput(proxy_video, build_h3_prompt(track, video_ref_token=video_ref_token))


class MajoorOmniCamWanATIAdapter(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamWanATIAdapter",
            display_name="OmniCam → Wan ATI Bridge",
            category="Majoor/OmniCam/Adapters",
            description=(
                "Projects static 3D reference points through the authored camera to create trajectory data. "
                "A version-specific WanVideoWrapper bridge should translate this canonical payload."
            ),
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.Int.Input("point_count", default=16, min=4, max=128, step=1),
            ],
            outputs=[
                OMNICAM_ATI_BRIDGE.Output(display_name="ati_bridge"),
                IO.String.Output(display_name="ati_json"),
            ],
        )

    @classmethod
    def execute(cls, camera_track: dict[str, Any], point_count: int) -> IO.NodeOutput:
        track = OmniCamTrack.from_dict(camera_track)
        bridge = track_to_ati_bridge(track, point_count)
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
        if (length - 1) % 4:
            raise ValueError("Wan camera length must be 4n+1 frames")
        track = OmniCamTrack.from_dict(camera_track)
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
            description="Produces the exact tracks STRING consumed by WanVideoATITracks at the pinned supported commit.",
            inputs=[
                OMNICAM_TRACK.Input("camera_track"),
                IO.Int.Input("point_count", default=16, min=4, max=128, step=1),
            ],
            outputs=[IO.String.Output(display_name="tracks")],
        )

    @classmethod
    def execute(cls, camera_track: dict[str, Any], point_count: int) -> IO.NodeOutput:
        return IO.NodeOutput(track_to_ati_json(OmniCamTrack.from_dict(camera_track), point_count))


class MajoorOmniCamATIPreview(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamATIPreview",
            display_name="OmniCam ATI Trajectory Preview",
            category="Majoor/OmniCam/Adapters",
            inputs=[OMNICAM_TRACK.Input("camera_track"), IO.Image.Input("image"), IO.Int.Input("point_count", default=16, min=4, max=128)],
            outputs=[IO.Image.Output(display_name="preview")],
        )

    @classmethod
    def execute(cls, camera_track: dict[str, Any], image, point_count: int) -> IO.NodeOutput:
        track = OmniCamTrack.from_dict(camera_track)
        bridge = track_to_ati_bridge(track, point_count)
        preview = image[:1].clone()
        height, width = preview.shape[1:3]
        colors = ([1.0, 0.25, 0.1], [0.1, 0.8, 1.0], [0.2, 1.0, 0.35])
        for index, trajectory in enumerate(bridge["trajectories"]):
            color = torch.tensor(colors[index % len(colors)], device=preview.device, dtype=preview.dtype)
            for sample in trajectory["samples"]:
                if not sample.get("visible"):
                    continue
                x = max(0, min(width - 1, round(sample["x_norm"] * (width - 1))))
                y = max(0, min(height - 1, round(sample["y_norm"] * (height - 1))))
                preview[0, max(0, y - 2):min(height, y + 3), max(0, x - 2):min(width, x + 3), :3] = color
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
        track = OmniCamTrack.from_dict(camera_track)
        bridge = track_to_ltx_camera_bridge(track, length or None)
        return IO.NodeOutput(bridge, json.dumps(bridge, indent=2))


class MajoorOmniCamLTXCameraGuide(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamLTXCameraGuide",
            display_name="OmniCam → LTX Camera Guide",
            category="Majoor/OmniCam/Adapters",
            description="Decodes the proxy VIDEO to IMAGE frames for LTX Add Video IC-LoRA Guide and recommends the pinned camera LoRA when available.",
            inputs=[OMNICAM_TRACK.Input("camera_track"), IO.Video.Input("proxy_video")],
            outputs=[IO.Image.Output(display_name="guide_frames"), IO.String.Output(display_name="camera_profile_json")],
        )

    @classmethod
    def execute(cls, camera_track: dict[str, Any], proxy_video) -> IO.NodeOutput:
        track = OmniCamTrack.from_dict(camera_track)
        frames = proxy_video.get_components().images
        return IO.NodeOutput(frames, json.dumps(ltx_camera_control_profile(track), indent=2))


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
            outputs=[OMNICAM_TRACK.Output(display_name="camera_track"), IO.String.Output(display_name="track_json"), IO.String.Output(display_name="motion_speed_json")],
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
        return IO.NodeOutput(result.to_dict(), result.to_json(), json.dumps(motion_speed_profile(result)))


class MajoorOmniCamSequenceBuilder(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        shots = IO.Autogrow.TemplatePrefix(OMNICAM_TRACK.Input("shot"), prefix="shot", min=1, max=32)
        return IO.Schema(
            node_id="MajoorOmniCamSequenceBuilder",
            display_name="OmniCam Sequence Builder",
            category="Majoor/OmniCam/Sequence",
            inputs=[
                IO.String.Input("shot_names", default="", multiline=True, advanced=True),
                IO.String.Input("shot_settings_json", default="[]", multiline=True, advanced=True),
                IO.Autogrow.Input("shots", template=shots),
            ],
            outputs=[OMNICAM_SEQUENCE.Output(display_name="sequence"), IO.String.Output(display_name="sequence_json")],
        )

    @classmethod
    def execute(cls, shot_names: str, shot_settings_json: str, shots: IO.Autogrow.Type) -> IO.NodeOutput:
        ordered = [shots[name] for name in sorted(shots, key=lambda value: int(value.removeprefix("shot"))) if shots[name] is not None]
        names = [name.strip() for name in shot_names.splitlines()]
        settings = json.loads(shot_settings_json)
        if not isinstance(settings, list):
            raise TypeError("shot_settings_json must contain a JSON list")
        sequence = build_sequence(ordered, names, settings)
        return IO.NodeOutput(sequence, sequence_to_json(sequence))


class MajoorOmniCamSequenceShot(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamSequenceShot",
            display_name="OmniCam Sequence Shot",
            category="Majoor/OmniCam/Sequence",
            inputs=[OMNICAM_SEQUENCE.Input("sequence"), IO.Int.Input("shot_index", default=0, min=0, max=31)],
            outputs=[OMNICAM_TRACK.Output(display_name="camera_track"), IO.String.Output(display_name="shot_name")],
        )

    @classmethod
    def execute(cls, sequence: dict[str, Any], shot_index: int) -> IO.NodeOutput:
        normalized = validate_sequence(sequence)
        shot = normalized["shots"][max(0, min(shot_index, len(normalized["shots"]) - 1))]
        return IO.NodeOutput(shot["track"], shot["name"])


class MajoorOmniCamSequenceManifest(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamSequenceManifest",
            display_name="OmniCam Sequence Playblast Manifest",
            category="Majoor/OmniCam/Sequence",
            inputs=[OMNICAM_SEQUENCE.Input("sequence")],
            outputs=[IO.String.Output(display_name="manifest_json")],
        )

    @classmethod
    def execute(cls, sequence: dict[str, Any]) -> IO.NodeOutput:
        return IO.NodeOutput(json.dumps(playblast_manifest(sequence), indent=2))


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
        script_path = _write_output(f"{safe}.blender.py", build_blender_script(track, world_scale))
        json_path = _write_output(f"{safe}.json", track.to_json())
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
        script_path = _write_output(f"{safe}.unreal.py", build_unreal_python_script(track))
        json_path = _write_output(f"{safe}.json", track.to_json())
        return IO.NodeOutput(script_path, json_path)


class MajoorOmniCamSequenceEDL(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamSequenceEDL",
            display_name="OmniCam Sequence → EDL/OTIO Export",
            category="Majoor/OmniCam/Sequence",
            description="Exports the sequence as CMX3600 EDL text and OTIO JSON for editorial interchange.",
            inputs=[OMNICAM_SEQUENCE.Input("sequence"), IO.String.Input("title", default="OmniCam Sequence", multiline=False)],
            outputs=[IO.String.Output(display_name="edl"), IO.String.Output(display_name="otio_json")],
        )

    @classmethod
    def execute(cls, sequence: dict[str, Any], title: str) -> IO.NodeOutput:
        return IO.NodeOutput(sequence_to_edl(sequence, title or "OmniCam Sequence"), json.dumps(sequence_to_otio(sequence, title or "OmniCam Sequence"), indent=2))


class MajoorOmniCamSequenceEDLImport(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamSequenceEDLImport",
            display_name="OmniCam EDL/OTIO Shot Import",
            category="Majoor/OmniCam/Sequence",
            description="Parses an EDL or OTIO JSON document into the shot skeleton list (names, order, durations) consumed by the Sequence Builder.",
            inputs=[
                IO.String.Input("document", default="", multiline=True),
                IO.Combo.Input("format", options=["auto", "edl", "otio"]),
                IO.Int.Input("fps", default=24, min=1, max=120, step=1),
            ],
            outputs=[IO.String.Output(display_name="shot_names"), IO.String.Output(display_name="durations_json")],
        )

    @classmethod
    def execute(cls, document: str, format: str, fps: int) -> IO.NodeOutput:
        text = document.strip()
        if not text:
            raise ValueError("Provide an EDL or OTIO document")
        mode = format
        if mode == "auto":
            mode = "otio" if text.startswith("{") else "edl"
        if mode == "otio":
            shots = otio_to_shots(json.loads(text), fps)
        else:
            shots = edl_to_shots(text, fps)
        names = "\n".join(shot["name"] for shot in shots)
        durations = json.dumps([shot["duration_frames"] for shot in shots])
        return IO.NodeOutput(names, durations)


class MajoorOmniCamControlPasses(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamControlPasses",
            display_name="OmniCam Control Passes",
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
        track = OmniCamTrack.from_dict(camera_track)
        if pass_type == "object_ids":
            payload = object_id_pass(track, step=step)
        elif pass_type == "depth":
            payload = depth_pass(track, step=step)
        elif pass_type == "normals":
            payload = normals_pass(track, step=step)
        else:
            payload = optical_flow_pass(track, step=step)
        return IO.NodeOutput(json.dumps(payload, indent=2))


ALL_NODES = [
    MajoorOmniCamDirector,
    MajoorOmniCamTrackSampler,
    MajoorOmniCamH3Adapter,
    MajoorOmniCamWanATIAdapter,
    MajoorOmniCamWanNativeCamera,
    MajoorOmniCamWanVideoWrapperATI,
    MajoorOmniCamATIPreview,
    MajoorOmniCamLTXAdapter,
    MajoorOmniCamLTXCameraGuide,
    MajoorOmniCamCameraTools,
    MajoorOmniCamControlPasses,
    MajoorOmniCamSequenceBuilder,
    MajoorOmniCamSequenceShot,
    MajoorOmniCamSequenceManifest,
    MajoorOmniCamSequenceEDL,
    MajoorOmniCamSequenceEDLImport,
    MajoorOmniCamBlenderExport,
    MajoorOmniCamUnrealExport,
]
