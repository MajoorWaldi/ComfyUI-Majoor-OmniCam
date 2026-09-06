"""Compiling ReconstructionResult into canonical MotionScene v1."""

from __future__ import annotations

from typing import Any

from omnicam.core.motion_scene import MotionScene
from omnicam.reconstruction.types import ReconstructionResult


def build_reconstructed_scene(
    result: ReconstructionResult,
    *,
    source_asset_ref: str = "",
    canvas_width: int = 1280,
    canvas_height: int = 720,
    duration_seconds: float = 5.0,
    fps: float = 24.0,
) -> dict[str, Any]:
    """Compile ReconstructionResult into a fully validated MotionScene v1 dictionary."""
    objects: list[dict[str, Any]] = []

    # 1. Environment GLB proxy
    env_obj = {
        "id": "recon_environment",
        "name": "Environment Proxy",
        "type": "glb",
        "position": [0.0, 0.0, 0.0],
        "rotation": [0.0, 0.0, 0.0],
        "size": [1.0, 1.0, 1.0],
        "material_mode": "textured" if result.environment_asset.textured else "neutral",
        "keyframes": [],
        "enabled": True,
        "locked": True,
        "asset": result.environment_asset.asset_path,
        "reconstruction": {
            "version": 1,
            "role": "environment",
            "provider": result.provider,
            "source_kind": "single_image",
            "confidence": result.environment_asset.confidence,
            "geometry": {
                "kind": "depth_mesh",
                "triangle_count": result.environment_asset.triangle_count,
                "textured": result.environment_asset.textured,
            },
        },
    }
    objects.append(env_obj)

    # 2. Ground Proxy
    for plane in result.planes:
        if plane.plane_type == "ground":
            ground_obj = {
                "id": "recon_ground",
                "name": "Ground Proxy",
                "type": "ground",
                "position": [float(plane.center[0]), float(plane.center[1]), float(plane.center[2])],
                "rotation": [0.0, 0.0, 0.0],
                "size": [float(plane.size[0]), float(plane.size[1]), 1.0],
                "material_mode": "neutral",
                "keyframes": [],
                "enabled": True,
                "locked": True,
                "reconstruction": {
                    "version": 1,
                    "role": "ground",
                    "provider": result.provider,
                    "source_kind": "single_image",
                    "confidence": plane.confidence,
                },
            }
            objects.append(ground_obj)
            break

    # 3. Wall Proxies
    wall_idx = 1
    for plane in result.planes:
        if plane.plane_type == "wall":
            wall_obj = {
                "id": f"recon_wall_{wall_idx}",
                "name": f"Wall {wall_idx} Proxy",
                "type": "cube",
                "position": [float(plane.center[0]), float(plane.center[1]), float(plane.center[2])],
                "rotation": [0.0, 0.0, 0.0],
                "size": [float(plane.size[0]), float(plane.size[1]), 0.02],
                "material_mode": "neutral",
                "keyframes": [],
                "enabled": True,
                "locked": True,
                "reconstruction": {
                    "version": 1,
                    "role": "wall",
                    "provider": result.provider,
                    "source_kind": "single_image",
                    "confidence": plane.confidence,
                },
            }
            objects.append(wall_obj)
            wall_idx += 1

    # 4. Source Camera
    total_frames = max(1, round(duration_seconds * fps))
    camera_track = {
        "schema_version": 1,
        "fps": int(fps),
        "duration_frames": total_frames,
        "width": int(canvas_width),
        "height": int(canvas_height),
        "render_mode": "omni_ref",
        "keyframes": [
            {
                "frame": 0,
                "camera": {
                    "position": [
                        float(result.camera.position[0]),
                        float(result.camera.position[1]),
                        float(result.camera.position[2]),
                    ],
                    "target": [
                        float(result.camera.target[0]),
                        float(result.camera.target[1]),
                        float(result.camera.target[2]),
                    ],
                    "fov": float(result.camera.fov_x_degrees),
                    "roll": 0.0,
                    "camera_type": "perspective",
                    "zoom": 1.0,
                    "near": float(result.camera.near),
                    "far": float(result.camera.far),
                },
                "interpolation": "hold",
            }
        ],
        "objects": [],
        "metadata": {},
    }

    camera_item = {
        "id": "camera_1",
        "label": "Source Camera",
        "enabled": True,
        "track": camera_track,
    }

    capped_warnings = [str(w)[:240] for w in result.warnings[:32]]

    scene_payload = {
        "version": 1,
        "timeline": {
            "duration_seconds": float(duration_seconds),
            "authoring_fps": float(fps),
        },
        "canvas": {
            "width": int(canvas_width),
            "height": int(canvas_height),
        },
        "cameras": [camera_item],
        "active_camera_id": "camera_1",
        "playblast_camera_id": "camera_1",
        "objects": objects,
        "motion_layers": [],
        "cuts": [],
        "metadata": {
            "reconstruction": {
                "version": 1,
                "provider": result.provider,
                "source_kind": "single_image",
                "source_asset": source_asset_ref,
                "mode": result.mode,
                "coordinate_system": "gltf_y_up_z_back",
                "warnings": capped_warnings,
            }
        },
    }

    validated = MotionScene.from_dict(scene_payload)
    return validated.to_dict()
