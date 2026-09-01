"""The OmniCam Extractor node: a thin ComfyUI boundary over the solve pipeline.

Everything that could be wrong about a camera solve is decided in
:mod:`omnicam.extractor`; this file only translates widgets into that call and
the result back into a graph output plus a UI envelope the browser can read.
"""

from __future__ import annotations

import json

from ..comfy_compat import IO, UI
from ..core.motion_scene import motion_scene_from_camera_track
from ..extractor.pipeline import extract_camera_track
from .base import OMNICAM_MOTION_SCENE
from .media import media_input, solve_source

#: The browser cannot reach into the executing process, so the solved track
#: travels to the Director through this preview payload.
RESULT_ENVELOPE_KIND = "omnicam_extractor_result_v2"


class MajoorOmniCamExtractor(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamExtractor",
            display_name="OmniCam Extractor",
            category="Majoor/OmniCam",
            description=(
                "Extract a relative 6DoF camera trajectory from one continuous video shot "
                "and emit a canonical OmniCam motion scene."
            ),
            search_aliases=[
                "camera extractor",
                "camera tracking",
                "camera solve",
                "matchmove",
                "visual odometry",
                "camera motion",
                "camera trajectory",
                "video camera track",
            ],
            is_experimental=True,
            inputs=[
                media_input(
                    "video",
                    tooltip=(
                        "One continuous shot, as a VIDEO or as an IMAGE batch. "
                        "Hard cuts are reported, not stitched."
                    ),
                ),
                IO.Combo.Input(
                    "method",
                    options=["auto", "dpvo", "opencv_sift"],
                    default="dpvo",
                    tooltip="DPVO is the default. auto prefers DPVO when it is installed and falls back to OpenCV/SIFT.",
                ),
                IO.Combo.Input("lens_mode", options=["auto", "fov", "focal_mm"], default="auto", advanced=True),
                IO.Float.Input("fov_degrees", default=53.0, min=10.0, max=140.0, step=0.1, advanced=True),
                IO.Float.Input("focal_length_mm", default=24.0, min=1.0, max=300.0, step=0.1, advanced=True),
                IO.Float.Input("sensor_width_mm", default=36.0, min=4.0, max=70.0, step=0.1, advanced=True),
                IO.Int.Input("max_dimension", default=640, min=320, max=1920, step=32),
                IO.Int.Input("frame_step", default=1, min=1, max=10, step=1, advanced=True),
                IO.Boolean.Input("normalize_origin", default=True),
                IO.Float.Input(
                    "motion_scale",
                    default=1.0, min=0.01, max=100.0, step=0.01,
                    tooltip="Monocular translation has no metric scale; this sizes it for your scene.",
                ),
                IO.Float.Input("position_smoothing", default=0.15, min=0.0, max=1.0, step=0.01, advanced=True),
                IO.Float.Input("rotation_smoothing", default=0.10, min=0.0, max=1.0, step=0.01, advanced=True),
                IO.Boolean.Input("simplify_keys", default=True),
                IO.Float.Input("position_tolerance", default=0.01, min=0.0, max=10.0, step=0.001, advanced=True),
                IO.Float.Input("rotation_tolerance_deg", default=0.25, min=0.0, max=20.0, step=0.05, advanced=True),
            ],
            outputs=[
                OMNICAM_MOTION_SCENE.Output(display_name="motion_scene"),
                IO.Float.Output(display_name="solver_coverage"),
                IO.String.Output(display_name="report"),
            ],
        )

    @classmethod
    def execute(
        cls,
        video,
        method: str,
        lens_mode: str,
        fov_degrees: float,
        focal_length_mm: float,
        sensor_width_mm: float,
        max_dimension: int,
        frame_step: int,
        normalize_origin: bool,
        motion_scale: float,
        position_smoothing: float,
        rotation_smoothing: float,
        simplify_keys: bool,
        position_tolerance: float,
        rotation_tolerance_deg: float,
    ) -> IO.NodeOutput:
        # A solve seeks inside its source, so an IMAGE batch is encoded into
        # managed temp storage first and solved from the same file the
        # browser previews.
        video, source_reference = solve_source(video)
        result = extract_camera_track(
            video=video,
            method=method,
            lens_mode=lens_mode,
            fov_degrees=fov_degrees,
            focal_length_mm=focal_length_mm,
            sensor_width_mm=sensor_width_mm,
            max_dimension=max_dimension,
            frame_step=frame_step,
            normalize_origin=normalize_origin,
            motion_scale=motion_scale,
            position_smoothing=position_smoothing,
            rotation_smoothing=rotation_smoothing,
            simplify_keys=simplify_keys,
            position_tolerance=position_tolerance,
            rotation_tolerance_deg=rotation_tolerance_deg,
        )
        motion_scene = motion_scene_from_camera_track(result.track).to_dict()
        envelope = {
            "kind": RESULT_ENVELOPE_KIND,
            "fingerprint": result.fingerprint,
            "motion_scene": motion_scene,
            "solver_coverage": result.confidence,
            "report": result.report,
            "source": source_reference,
        }
        return IO.NodeOutput(
            motion_scene,
            result.confidence,
            result.report,
            ui=UI.PreviewText(json.dumps(envelope, separators=(",", ":"))),
        )
