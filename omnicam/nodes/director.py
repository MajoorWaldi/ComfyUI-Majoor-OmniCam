from __future__ import annotations

from ..comfy_compat import IO, UI
from ..core.director_compile import compile_director_motion_scene, parse_director_state
from ..core.motion_scene import MotionScene
from .base import OMNICAM_MOTION_SCENE, resolve_video
from .media import as_image_batch, as_video, media_input


class MajoorOmniCamDirector(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamDirector",
            display_name="OmniCam Director",
            category="Majoor/OmniCam",
            description=(
                "Interactive motion-scene authoring node. The frontend stores cameras, scene objects, "
                "motion tracks and an optional model-control playblast."
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
                    options=["omni_ref", "graybox", "grid", "point_field", "wireframe", "card_grid", "beauty"],
                ),
                media_input("image", optional=True, tooltip="Reference stills, or a clip sampled for them."),
                media_input("video", optional=True, tooltip="A proxy clip, or an IMAGE batch read at the node fps."),
                IO.Audio.Input("audio", optional=True),
                IO.Custom("*").Input("scene_3d", optional=True),
                OMNICAM_MOTION_SCENE.Input(
                    "solved_scene",
                    optional=True,
                    tooltip=(
                        "A solved scene from OmniCam Extractor. Only its playblast camera is "
                        "imported: motion layers, objects and cuts on the upstream scene are not "
                        "merged. The Director imports each new extractor fingerprint once and then "
                        "leaves your edits alone; disconnect the cable to freeze what you imported."
                    ),
                ),
            ],
            outputs=[
                OMNICAM_MOTION_SCENE.Output(display_name="motion_scene"),
                IO.Video.Output(display_name="playblast_video"),
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
        solved_scene=None,
    ) -> IO.NodeOutput:
        # Both media sockets take either type: a clip connected to `image` is
        # sampled for stills, and stills connected to `video` become a proxy
        # read at this node's own frame rate.
        image = as_image_batch(image, max_frames=32)
        video = as_video(video, fps=float(fps))
        raw_state = parse_director_state(state_json)

        upstream_track = None
        # Deliberately only the camera. The socket is named solved_scene rather
        # than motion_scene because that is all it imports: a full MotionScene
        # merge -- layers, objects, cuts, other cameras -- is a feature, not a
        # cable, and calling it motion_scene promised one.
        if isinstance(solved_scene, dict):
            upstream_scene = MotionScene.from_dict(solved_scene)
            upstream_camera = next(
                camera
                for camera in upstream_scene.cameras
                if camera.id == upstream_scene.playblast_camera_id
            )
            upstream_track = upstream_camera.track.to_dict()

        # A connected Extractor is authoritative once per solve, never on every
        # queue: compile_director_motion_scene() compares fingerprints so local
        # edits survive a cable that is still plugged in.
        validated_scene, active_recording_path = compile_director_motion_scene(
            raw_state,
            width=width,
            height=height,
            fps=fps,
            duration_seconds=duration_seconds,
            render_mode=render_mode,
            card_asset=card_asset,
            recording_path=recording_path,
            upstream_track=upstream_track,
        )
        playblast_video = resolve_video(active_recording_path) or video
        ui = UI.PreviewImage(image, cls=cls) if image is not None else None
        return IO.NodeOutput(validated_scene.to_dict(), playblast_video, audio, ui=ui)
