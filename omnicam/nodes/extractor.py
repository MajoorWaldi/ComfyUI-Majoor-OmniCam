"""The OmniCam Extractor node: a thin ComfyUI boundary over the solve pipeline.

Everything that could be wrong about a camera solve is decided in
:mod:`omnicam.extractor`; this file only translates widgets into that call and
the result back into a graph output plus a UI envelope the browser can read.
"""

from __future__ import annotations

import json

from ..comfy_compat import IO, UI
from ..comfy_compat.interrupt import ComfyInterruptControl
from ..comfy_compat.progress import CAMERA_TRACK_PHASES, ExecutionProgress
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
            # An output node: the solved MotionScene + PreviewText envelope is a
            # real result, and -- load-bearing for the queue-only path -- a
            # partial ComfyUI execution can only target output nodes. A plain
            # Queue Prompt still runs it once and then serves the execution
            # cache on unchanged inputs.
            is_output_node=True,
            inputs=[
                media_input(
                    "video",
                    tooltip=(
                        "One continuous shot, as a VIDEO or as an IMAGE batch. "
                        "Hard cuts are reported, not stitched."
                    ),
                ),
                IO.Combo.Input(
                    "extract_mode",
                    options=["camera_track", "scene_reconstruct"],
                    default="camera_track",
                    tooltip=(
                        "Mode: camera_track solves 6DoF camera motion from video; "
                        "scene_reconstruct recovers 3D proxy scene from a single still image."
                    ),
                ),
                IO.Combo.Input(
                    "method",
                    options=["auto", "dpvo", "pycolmap", "opencv_sift"],
                    default="auto",
                    tooltip=(
                        "auto takes the first solver actually installed: DPVO, then "
                        "pycolmap, then OpenCV/SIFT. The report names the one it ran. "
                        "Pick a solver by name to force it and get an install hint if "
                        "it is missing."
                    ),
                ),
                IO.Combo.Input("lens_mode", options=["auto", "fov", "focal_mm"], default="auto", advanced=True),
                IO.Float.Input("fov_degrees", default=53.0, min=10.0, max=140.0, step=0.1, advanced=True),
                IO.Float.Input("focal_length_mm", default=24.0, min=1.0, max=300.0, step=0.1, advanced=True),
                IO.Float.Input("sensor_width_mm", default=36.0, min=4.0, max=70.0, step=0.1, advanced=True),
                IO.Int.Input("max_dimension", default=840, min=320, max=1920, step=32),
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
                # --- Scene Reconstruct settings (advanced; the custom panel
                # mirrors these, and a queued graph run must build the exact
                # same ReconstructionSettings the panel's Start does). ---
                IO.Combo.Input(
                    "recon_mode",
                    options=["depth_mesh", "blockout", "hybrid", "scan"],
                    default="depth_mesh",
                    advanced=True,
                    tooltip="Depth Mesh (MoGe surface) / Blockout (closed primitives) / Hybrid / Scan (VGGT multi-view).",
                ),
                IO.Combo.Input(
                    "recon_source_mode",
                    options=["auto", "single_image", "multi_view", "video_scan"],
                    default="auto",
                    advanced=True,
                ),
                IO.Combo.Input(
                    "recon_geometry_provider",
                    options=["comfy_moge", "vggt", "vggt_omega_research"],
                    default="comfy_moge",
                    advanced=True,
                ),
                IO.Combo.Input(
                    "recon_segmentation_provider",
                    options=["comfy_sam3", "none", "fake"],
                    default="comfy_sam3",
                    advanced=True,
                ),
                IO.Combo.Input(
                    "recon_completion_provider",
                    options=["none", "sam3d_objects", "fake"],
                    default="none",
                    advanced=True,
                ),
                IO.Combo.Input(
                    "recon_quality",
                    options=["fast", "balanced", "high", "custom"],
                    default="balanced",
                    advanced=True,
                ),
                IO.String.Input("recon_sam3_checkpoint", default="auto", multiline=False, advanced=True),
                IO.Float.Input("recon_sam3_threshold", default=0.55, min=0.0, max=1.0, step=0.01, advanced=True),
                IO.String.Input(
                    "recon_semantic_labels",
                    default="",
                    multiline=True,
                    advanced=True,
                    tooltip="Comma/newline separated labels. Empty = default interior taxonomy.",
                ),
                IO.Int.Input("recon_max_objects", default=24, min=1, max=128, step=1, advanced=True),
                IO.String.Input("recon_vggt_checkpoint", default="auto", multiline=False, advanced=True),
                IO.Int.Input("recon_vggt_max_views", default=24, min=2, max=128, step=1, advanced=True),
                IO.Int.Input("recon_vggt_segmentation_views", default=6, min=1, max=32, step=1, advanced=True),
                IO.Combo.Input(
                    "recon_completion_policy",
                    options=["off", "low_depth_confidence", "selected", "all_bounded"],
                    default="off",
                    advanced=True,
                ),
                IO.Int.Input("recon_max_completion_objects", default=4, min=0, max=16, step=1, advanced=True),
                IO.String.Input("recon_completion_object_ids", default="", multiline=False, advanced=True),
                IO.Combo.Input(
                    "recon_blockout_assets",
                    options=["off", "proxy", "replace"],
                    default="off",
                    tooltip=(
                        "Blockout asset library: swap fitted boxes for real GLB props. "
                        "'proxy' adds the model beside the box, 'replace' hides the box. "
                        "Needs scripts/fetch_blockout_library.py to have been run."
                    ),
                    advanced=True,
                ),
                IO.String.Input(
                    "recon_asset_library_path", default="", multiline=False, advanced=True
                ),
                IO.Boolean.Input("recon_source_texture", default=True, advanced=True),
                IO.Boolean.Input("recon_detect_ground", default=True, advanced=True),
                IO.Boolean.Input("recon_detect_walls", default=False, advanced=True),
                IO.Float.Input("recon_scene_scale", default=1.0, min=0.001, max=1000.0, step=0.01, advanced=True),
            ],
            outputs=[
                OMNICAM_MOTION_SCENE.Output(display_name="motion_scene"),
                IO.Float.Output(
                    display_name="solver_coverage",
                    tooltip=(
                        "camera_track: fraction of frames with a solved pose. "
                        "scene_reconstruct: overall reconstruction confidence."
                    ),
                ),
                IO.String.Output(display_name="report"),
            ],
        )

    @classmethod
    def _execute_camera_track(
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
        # Coarse progress is reported through ComfyUI's own execution API so the
        # node bar and queue view stay authoritative. Rich diagnostics stay on
        # the separate PromptServer side channel.
        progress = ExecutionProgress()

        # A solve seeks inside its source, so an IMAGE batch is encoded into
        # managed temp storage first and solved from the same file the
        # browser previews.
        video, source_reference = solve_source(video)
        progress.phase_done(CAMERA_TRACK_PHASES["source"])

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
            progress=progress.frame_reporter(CAMERA_TRACK_PHASES["tracking"]),
            # A Comfy job cancel travels the solver's cooperative-stop path and
            # reaps any spawned DPVO child through the existing bounded
            # join / terminate / kill / cleanup.
            control=ComfyInterruptControl(),
        )
        progress.phase_done(CAMERA_TRACK_PHASES["solver"])

        motion_scene = motion_scene_from_camera_track(result.track).to_dict()
        envelope = {
            "kind": RESULT_ENVELOPE_KIND,
            "mode": "camera_track",
            "fingerprint": result.fingerprint,
            "motion_scene": motion_scene,
            "solver_coverage": result.confidence,
            "report": result.report,
            "source": source_reference,
            # The immutable raw solve, so the panel's cleanup sliders can
            # re-derive a track through POST /majoor/omnicam/extractor/refine
            # without re-running TRACK.
            "raw_solve": result.raw_solve,
        }
        preview = json.dumps(envelope, separators=(",", ":"))
        # Only now that the result has serialized cleanly is the solve done.
        progress.update(100.0, 100.0)
        return IO.NodeOutput(
            motion_scene,
            result.confidence,
            result.report,
            ui=UI.PreviewText(preview),
        )

    @classmethod
    def execute(
        cls,
        video,
        extract_mode: str = "camera_track",
        method: str = "auto",
        lens_mode: str = "auto",
        fov_degrees: float = 53.0,
        focal_length_mm: float = 24.0,
        sensor_width_mm: float = 36.0,
        max_dimension: int = 840,
        frame_step: int = 1,
        normalize_origin: bool = True,
        motion_scale: float = 1.0,
        position_smoothing: float = 0.15,
        rotation_smoothing: float = 0.10,
        simplify_keys: bool = True,
        position_tolerance: float = 0.01,
        rotation_tolerance_deg: float = 0.25,
        recon_mode: str = "depth_mesh",
        recon_source_mode: str = "auto",
        recon_geometry_provider: str = "comfy_moge",
        recon_segmentation_provider: str = "comfy_sam3",
        recon_completion_provider: str = "none",
        recon_quality: str = "balanced",
        recon_sam3_checkpoint: str = "auto",
        recon_sam3_threshold: float = 0.55,
        recon_semantic_labels: str = "",
        recon_max_objects: int = 24,
        recon_vggt_checkpoint: str = "auto",
        recon_vggt_max_views: int = 24,
        recon_vggt_segmentation_views: int = 6,
        recon_completion_policy: str = "off",
        recon_max_completion_objects: int = 4,
        recon_completion_object_ids: str = "",
        recon_blockout_assets: str = "off",
        recon_asset_library_path: str = "",
        recon_source_texture: bool = True,
        recon_detect_ground: bool = True,
        recon_detect_walls: bool = False,
        recon_scene_scale: float = 1.0,
    ) -> IO.NodeOutput:
        if extract_mode == "scene_reconstruct":
            from ..reconstruction.node_bridge import (
                execute_reconstruction,
                reconstruction_settings_from_widgets,
            )

            recon_settings = reconstruction_settings_from_widgets(
                recon_mode=recon_mode,
                recon_source_mode=recon_source_mode,
                recon_geometry_provider=recon_geometry_provider,
                recon_segmentation_provider=recon_segmentation_provider,
                recon_completion_provider=recon_completion_provider,
                recon_quality=recon_quality,
                recon_sam3_checkpoint=recon_sam3_checkpoint,
                recon_sam3_threshold=recon_sam3_threshold,
                recon_semantic_labels=recon_semantic_labels,
                recon_max_objects=recon_max_objects,
                recon_vggt_checkpoint=recon_vggt_checkpoint,
                recon_vggt_max_views=recon_vggt_max_views,
                recon_vggt_segmentation_views=recon_vggt_segmentation_views,
                recon_completion_policy=recon_completion_policy,
                recon_max_completion_objects=recon_max_completion_objects,
                recon_completion_object_ids=recon_completion_object_ids,
                recon_blockout_assets=recon_blockout_assets,
                recon_asset_library_path=recon_asset_library_path,
                recon_source_texture=recon_source_texture,
                recon_detect_ground=recon_detect_ground,
                recon_detect_walls=recon_detect_walls,
                recon_scene_scale=recon_scene_scale,
            )
            recon_progress = ExecutionProgress()
            motion_scene, confidence, report, envelope = execute_reconstruction(
                video, settings=recon_settings, progress=recon_progress
            )
            recon_preview = json.dumps(envelope, separators=(",", ":"))
            recon_progress.update(100.0, 100.0)
            return IO.NodeOutput(
                motion_scene,
                confidence,
                report,
                ui=UI.PreviewText(recon_preview),
            )
        return cls._execute_camera_track(
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
