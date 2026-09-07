"""Compiling ReconstructionResult into canonical MotionScene v1."""

from __future__ import annotations

import math
from typing import Any

import numpy as np

from ..core.motion_scene import MotionScene
from .types import ReconstructedPlane, ReconstructionResult

#: A plane whose fitted normal deviates from its box proxy's default local
#: axis by less than this is left at rotation [0, 0, 0] -- both to skip the
#: (harmless but pointless) computation, and because RANSAC's own normal
#: has ~1 degree of noise near-vertical/near-forward that a nonzero rotation
#: would just be re-encoding.
_ALIGNED_DOT_THRESHOLD = 0.9999


def _euler_xyz_degrees_from_matrix(r: np.ndarray) -> tuple[float, float, float]:
    """Decompose a rotation matrix into MotionScene's Euler XYZ degrees.

    Matches three.js's Euler.setFromRotationMatrix(..., 'XYZ') exactly (see
    web-src's Object3D.rotation, which uses that order by default) so a
    rotation built here renders identically to one authored by hand in
    Director.
    """
    m11, m12, m13 = r[0]
    _m21, m22, m23 = r[1]
    _m31, m32, m33 = r[2]

    y = math.asin(max(-1.0, min(1.0, m13)))
    if abs(m13) < 0.9999999:
        x = math.atan2(-m23, m33)
        z = math.atan2(-m12, m11)
    else:
        x = math.atan2(m32, m22)
        z = 0.0
    return (math.degrees(x), math.degrees(y), math.degrees(z))


def _rotation_aligning_axis_to_normal(
    local_axis: tuple[float, float, float],
    normal: tuple[float, float, float],
) -> tuple[float, float, float]:
    """Euler XYZ degrees rotating ``local_axis`` (in the proxy's own local
    space) to point along ``normal`` (in world space), by the shortest path.

    Built from Rodrigues' rotation formula rather than a quaternion library:
    this project has no quaternion dependency yet, and the closed form is
    exact for the one thing callers need -- align one axis, no preference on
    rotation around it.
    """
    axis = np.asarray(local_axis, dtype=np.float64)
    n = np.asarray(normal, dtype=np.float64)
    n_len = float(np.linalg.norm(n))
    if n_len < 1e-9:
        return (0.0, 0.0, 0.0)
    n = n / n_len

    dot = float(np.clip(np.dot(axis, n), -1.0, 1.0))
    if dot >= _ALIGNED_DOT_THRESHOLD:
        return (0.0, 0.0, 0.0)
    if dot <= -_ALIGNED_DOT_THRESHOLD:
        # Antiparallel: any perpendicular axis gives a valid 180 degree flip.
        # Prefer flipping around the world X axis, matching three.js's own
        # convention for this degenerate case in Quaternion.setFromUnitVectors.
        perpendicular = np.cross(axis, [1.0, 0.0, 0.0])
        if float(np.linalg.norm(perpendicular)) < 1e-6:
            perpendicular = np.cross(axis, [0.0, 1.0, 0.0])
        perpendicular = perpendicular / np.linalg.norm(perpendicular)
        return _rotation_matrix_from_axis_angle(perpendicular, math.pi)

    rot_axis = np.cross(axis, n)
    rot_axis = rot_axis / np.linalg.norm(rot_axis)
    angle = math.acos(dot)
    matrix = _rotation_matrix_from_axis_angle(rot_axis, angle, as_matrix=True)
    return _euler_xyz_degrees_from_matrix(matrix)


def _rotation_matrix_from_axis_angle(
    axis: np.ndarray, angle: float, *, as_matrix: bool = False
):
    """Rodrigues' rotation formula: the 3x3 matrix rotating by ``angle``
    radians around unit vector ``axis``."""
    ax, ay, az = axis
    k = np.array([[0.0, -az, ay], [az, 0.0, -ax], [-ay, ax, 0.0]])
    matrix = np.eye(3) + math.sin(angle) * k + (1.0 - math.cos(angle)) * (k @ k)
    if as_matrix:
        return matrix
    return _euler_xyz_degrees_from_matrix(matrix)


def _plane_rotation_degrees(plane: ReconstructedPlane, local_up_axis: tuple[float, float, float]) -> list[float]:
    x, y, z = _rotation_aligning_axis_to_normal(local_up_axis, plane.normal)
    return [x, y, z]


def build_reconstructed_scene(
    result: ReconstructionResult,
    *,
    source_asset_ref: str = "",
    canvas_width: int | None = None,
    canvas_height: int | None = None,
    duration_seconds: float = 5.0,
    fps: float = 24.0,
) -> dict[str, Any]:
    """Compile ReconstructionResult into a fully validated MotionScene v1 dictionary."""
    # The source camera and canvas must reproduce the photo's own frame -- a
    # canvas that silently defaults to 1280x720 turns a portrait or ultrawide
    # reconstruction into a stretched landscape one. Explicit args still win,
    # for callers (or tests) that want a specific canvas regardless.
    width = int(canvas_width) if canvas_width is not None else int(result.source_width)
    height = int(canvas_height) if canvas_height is not None else int(result.source_height)

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
            # planes.py fits (size_x, size_z): the footprint on the ground
            # plane. Director's ground proxy is [width, thickness, depth] --
            # X and Z stay X and Z; only the thin Y dimension is new, not the
            # detected Z extent smuggled into it.
            ground_obj = {
                "id": "recon_ground",
                "name": "Ground Proxy",
                "type": "ground",
                "position": [float(plane.center[0]), float(plane.center[1]), float(plane.center[2])],
                # Ground's box proxy is thin along local Y (its "up" face);
                # aligning that to the fitted normal instead of hardcoding
                # [0, 0, 0] keeps a slightly tilted floor from rendering dead
                # flat.
                "rotation": _plane_rotation_degrees(plane, (0.0, 1.0, 0.0)),
                "size": [float(plane.size[0]), 0.03, float(plane.size[1])],
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
                # A wall's box proxy faces along local +Z; aligning that to
                # the fitted normal is what makes side/angled walls actually
                # face the right way instead of only working by coincidence
                # on a wall whose normal happened to already be +-Z.
                "rotation": _plane_rotation_degrees(plane, (0.0, 0.0, 1.0)),
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
        "width": width,
        "height": height,
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
                    # camera.fov is vertical FOV throughout OmniCam (see
                    # extractor/intrinsics.py's vertical_fov_from_focal_pixels
                    # and the yfov Director's own gltf export produces) --
                    # fov_x_degrees here would silently swap the axis.
                    "fov": float(result.camera.fov_y_degrees),
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
            "width": width,
            "height": height,
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
