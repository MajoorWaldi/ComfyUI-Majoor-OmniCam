from __future__ import annotations

import json
from typing import Any

from comfy_api.latest import IO, UI

from ..core.editor_state import editor_state_to_track
from ..core.track import OmniCamTrack, camera_to_load3d
from .base import OMNICAM_TRACK, resolve_video


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
                IO.Audio.Input("audio", optional=True),
                IO.Custom("*").Input("scene_3d", optional=True),
            ],
            outputs=[
                OMNICAM_TRACK.Output(display_name="camera_track"),
                IO.Video.Output(display_name="proxy_video"),
                IO.Load3DCamera.Output(display_name="camera_info"),
                IO.String.Output(display_name="track_json"),
                IO.Audio.Output(display_name="audio"),
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
        audio=None,
        scene_3d=None,
    ) -> IO.NodeOutput:
        raw_state: dict[str, Any] = {}
        try:
            parsed = json.loads(state_json) if state_json else {}
            raw_state = parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid OmniCam state JSON: {exc}") from exc
        # Explicit editor-state → primary-track conversion with strict boundary validation.
        track = OmniCamTrack.from_dict(editor_state_to_track(raw_state, validate=True))
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
        proxy_video = resolve_video(recording_path)
        preview = image[:32] if image is not None else None
        if preview is None and video is not None:
            components = video.get_components()
            preview = components.images[:32] if components.images.shape[0] else None
        ui = UI.PreviewImage(preview, cls=cls) if preview is not None else None
        return IO.NodeOutput(track.to_dict(), proxy_video, camera_info, track.to_json(), audio, ui=ui)
