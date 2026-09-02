from __future__ import annotations

import logging
from typing import Any

from ..capabilities import detect_capabilities
from ..comfy_compat import IO
from ..core.motion_scene import MotionScene
from ..core.validation import ValidationError
from ..monitor.result import panel_payload, raise_on_blocked
from ..profiles.base import CompileRequest
from ..profiles.capability_gate import capability_check
from ..profiles.catalog import PROFILE_REGISTRY
from .base import OMNICAM_MOTION_SCENE
from .media import as_video, media_input

logger = logging.getLogger(__name__)


def _publish(unique_id: Any, payload: dict[str, Any]) -> None:
    """Push the panel over the socket the way a completed execution would.

    A binding preflight that stops the run also stops ComfyUI from delivering
    any ``ui``, so the one place that explains *why* it stopped would go blank
    at exactly the moment it is needed. Sending it here keeps the panel and the
    error telling the same story.
    """
    if unique_id is None:
        return
    try:
        from ..comfy_compat.server import PromptServer

        instance = getattr(PromptServer, "instance", None)
        if instance is None:
            return
        instance.send_sync(
            "executed",
            {"node": str(unique_id), "display_node": str(unique_id), "output": payload},
        )
    except Exception as exc:  # noqa: BLE001 - the panel is diagnostics, never the gate
        logger.debug("OmniCam Monitor could not publish its preflight panel: %s", exc)


class MajoorOmniCamMonitor(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamMonitor",
            display_name="OmniCam Monitor",
            category="Majoor/OmniCam",
            description="Monitor, validate, preview and route an OmniCam MotionScene to supported AI-video models.",
            search_aliases=["camera monitor", "camera health", "camera preflight", "camera adapter", "camera prompt", "ati preview", "ltx guide", "wan camera"],
            inputs=[
                OMNICAM_MOTION_SCENE.Input("motion_scene"),
                media_input("playblast_video", optional=True, tooltip="The playblast this scene describes, as a VIDEO or an IMAGE batch."),
                IO.String.Input("base_prompt", default="", multiline=True, optional=True),
                IO.Combo.Input(
                    "target_profile",
                    options=list(PROFILE_REGISTRY.ids),
                    default=PROFILE_REGISTRY.ids[0] if PROFILE_REGISTRY.ids else "",
                ),
                IO.Int.Input("target_width", default=832, min=64, max=4096, step=8, advanced=True),
                IO.Int.Input("target_height", default=480, min=64, max=4096, step=8, advanced=True),
                IO.Float.Input("duration_seconds", default=2.0, min=0.1, max=600.0, step=0.1, advanced=True),
                IO.Float.Input("target_fps", default=24.0, min=1.0, max=120.0, step=1.0, advanced=True),
            ],
            hidden=[IO.Hidden.unique_id],
            outputs=[
                IO.String.Output(display_name="final_prompt"),
                IO.Video.Output(display_name="reference_video"),
                IO.Image.Output(display_name="reference_frames"),
                IO.WanCameraEmbedding.Output(display_name="camera_embedding"),
                IO.Custom("TRACKS").Output(display_name="native_tracks"),
                IO.String.Output(display_name="tracks_json"),
                IO.Int.Output(display_name="target_width"),
                IO.Int.Output(display_name="target_height"),
                IO.Int.Output(display_name="target_length"),
            ],
        )

    @classmethod
    def execute(
        cls, motion_scene: dict[str, Any], playblast_video=None, base_prompt: str = "",
        target_profile: str = "", target_width: int = 832, target_height: int = 480,
        duration_seconds: float = 2.0, target_fps: float = 24.0,
    ) -> IO.NodeOutput:
        try:
            scene = MotionScene.from_dict(motion_scene)
        except (TypeError, ValueError, ValidationError) as error:
            raise ValueError(f"Invalid MotionScene: {error}") from error

        playblast_video = as_video(playblast_video)
        profile = PROFILE_REGISTRY.require(target_profile)

        request = CompileRequest(
            motion_scene=scene,
            playblast_video=playblast_video,
            base_prompt=base_prompt or "",
            target_width=target_width,
            target_height=target_height,
            duration_seconds=duration_seconds,
            target_fps=target_fps,
        )
        # Detected before compiling: a downstream that cannot receive this output
        # is a preflight failure the panel has to show, not a surprise at queue
        # time. Only the selected profile's contract is binding -- a missing LTX
        # install says nothing about a Wan Camera compile.
        capabilities = detect_capabilities()
        downstream = capability_check(target_profile, capabilities)

        # Binding, not decorative. Compiling a payload for a node that is not
        # installed, or whose socket contract no longer matches, produces a
        # workflow that fails the moment it is queued -- with an error pointing
        # at the wrong node. capability_check returns None outside a running
        # ComfyUI, so headless compiles are unaffected.
        unique_id = getattr(getattr(cls, "hidden", None), "unique_id", None)

        def stop(error_checks) -> None:
            """Show the panel, then fail. In that order."""
            _publish(unique_id, panel_payload(error_checks, capabilities, target_profile))
            raise_on_blocked(error_checks)

        if downstream is not None and downstream.state == "BLOCKED":
            # preflight() is only consulted on the failing path, so a healthy
            # compile still pays for exactly one pass.
            try:
                scene_checks = list(profile.preflight(request))
            except Exception:  # noqa: BLE001 - a panel is worth less than the real error
                scene_checks = []
            stop([*scene_checks, downstream])

        try:
            result = profile.compile(request)
        except ValueError:
            try:
                blocked = [*profile.preflight(request)]
            except Exception:  # noqa: BLE001
                blocked = []
            if downstream is not None:
                blocked.append(downstream)
            _publish(unique_id, panel_payload(blocked, capabilities, target_profile))
            raise

        checks = [*result.checks, downstream] if downstream is not None else list(result.checks)
        ui = panel_payload(checks, capabilities, target_profile)
        ordered = (
            result.final_prompt,
            result.reference_video,
            result.reference_frames,
            result.camera_embedding,
            result.native_tracks,
            result.tracks_json,
            result.timeline.width,
            result.timeline.height,
            result.timeline.frame_count,
        )
        return IO.NodeOutput(*ordered, ui=ui)
