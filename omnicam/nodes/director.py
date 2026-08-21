from __future__ import annotations

import json
from typing import Any

from comfy_api.latest import IO, UI

from ..core.editor_state import editor_state_to_track
from ..core.director_shot import build_director_shot, build_shot_collection
from ..core.track import OmniCamTrack
from ..core.video_sampling import sample_video_frames
from .base import OMNICAM_SHOT_COLLECTION, OMNICAM_TRACK, resolve_video


class MajoorOmniCamDirector(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamDirector",
            display_name="OmniCam Director",
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
                IO.Audio.Output(display_name="audio"),
                OMNICAM_SHOT_COLLECTION.Output(display_name="shot_collection"),
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
        cameras = raw_state.get("cameras")
        selected_camera_id = track.metadata.get("camera_id")
        selected_camera = next(
            (camera for camera in cameras if isinstance(camera, dict) and camera.get("id") == selected_camera_id),
            None,
        ) if isinstance(cameras, list) else None
        active_recording_path = str(selected_camera.get("recording_path") or recording_path) if selected_camera else recording_path
        track.metadata = dict(track.metadata)
        track.metadata.update({"card_asset": card_asset, "recording_path": active_recording_path, "generator": "ComfyUI-Majoor-OmniCam"})

        # Export every authored camera as a runtime shot packet. Missing proxies
        # remain explicit so consumers can report exactly which camera is offline.
        collection_shots = []
        if isinstance(cameras, list) and cameras:
            for cam in cameras:
                if not isinstance(cam, dict):
                    continue
                cam_id = cam.get("id")
                cam_track_dict = editor_state_to_track(raw_state, camera_id=cam_id, validate=True)
                cam_track = OmniCamTrack.from_dict(cam_track_dict)
                cam_track.width = track.width
                cam_track.height = track.height
                cam_track.fps = track.fps
                cam_track.duration_frames = track.duration_frames
                cam_track.render_mode = track.render_mode
                cam_track.metadata = dict(cam_track.metadata)
                camera_recording_path = str(cam.get("recording_path") or "")
                if cam_id == raw_state.get("playblast_camera_id") and not camera_recording_path:
                    camera_recording_path = recording_path
                cam_track.metadata.update({"card_asset": card_asset, "recording_path": camera_recording_path, "generator": "ComfyUI-Majoor-OmniCam"})
                camera_name = str(cam.get("name") or cam_id or f"Shot {len(collection_shots) + 1}")
                camera_video = resolve_video(camera_recording_path)
                if camera_video is None and cam_id == raw_state.get("playblast_camera_id"):
                    camera_video = video
                collection_shots.append(build_director_shot(
                    shot_id=str(cam_id or f"camera_{len(collection_shots) + 1}"),
                    name=camera_name,
                    video=camera_video,
                    audio=audio if cam_id == raw_state.get("playblast_camera_id") else None,
                    camera_track=cam_track.to_dict(),
                    metadata={
                        "source": "MajoorOmniCamDirector",
                        "recording_path": camera_recording_path,
                        "card_asset": card_asset,
                        "proxy_ready": camera_video is not None,
                    },
                ))

        proxy_video = resolve_video(active_recording_path)
        if proxy_video is None:
            proxy_video = video
        primary_shot = build_director_shot(
            shot_id=str(track.metadata.get("camera_id") or "director_shot"),
            name=str(track.metadata.get("camera_name") or "Director Shot"),
            video=proxy_video,
            audio=audio,
            camera_track=track.to_dict(),
            metadata={
                "source": "MajoorOmniCamDirector",
                "recording_path": active_recording_path,
                "card_asset": card_asset,
                "proxy_ready": proxy_video is not None,
            },
        )
        if not collection_shots:
            collection_shots = [primary_shot]
        missing_proxy_camera_ids = [shot["id"] for shot in collection_shots if shot.get("video") is None]
        shot_collection = build_shot_collection(collection_shots, {
            "source": "MajoorOmniCamDirector",
            "camera_count": len(collection_shots),
            "ready_count": len(collection_shots) - len(missing_proxy_camera_ids),
            "missing_proxy_camera_ids": missing_proxy_camera_ids,
        })
        preview = image[:32] if image is not None else None
        if preview is None and proxy_video is not None:
            sampled = sample_video_frames(proxy_video, max_frames=32, mode="uniform")
            preview = sampled if sampled.shape[0] else None
        ui = UI.PreviewImage(preview, cls=cls) if preview is not None else None
        return IO.NodeOutput(track.to_dict(), proxy_video, audio, shot_collection, ui=ui)
