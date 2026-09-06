"""Managed GLB asset persistence and security boundary for reconstruction.

Upstream signature verified against ComfyUI comfy_extras.nodes_save_3d.save_glb:
save_glb(vertices, faces, filepath=None, metadata=None,
         uvs=None, vertex_colors=None, texture_image=None,
         metallic_roughness_image=None, unlit=False,
         normals=None, normal_map_image=None, tangents=None, occlusion_in_mr=False,
         material=None, emissive_image=None)
"""

from __future__ import annotations

import json
import re
import time
from collections.abc import Callable
from pathlib import Path
from typing import Any

import numpy as np
import torch
from PIL import Image

from .geometry import ProxyMesh

HEX_FINGERPRINT_PATTERN = re.compile(r"^[0-9a-fA-F]{1,64}$")


class AssetWriterSecurityError(ValueError):
    """The target path or asset parameters violate containment security."""


def _convert_texture_to_pil(texture: Any) -> Image.Image | None:
    if texture is None:
        return None
    if isinstance(texture, Image.Image):
        return texture

    arr = texture.detach().cpu().numpy() if isinstance(texture, torch.Tensor) else np.asarray(texture)

    while arr.ndim > 3:
        arr = arr[0]

    if arr.ndim != 3 or arr.shape[-1] not in (3, 4):
        return None

    if arr.dtype != np.uint8:
        arr = np.clip(arr, 0.0, 1.0)
        arr = (arr * 255.0).astype(np.uint8)

    mode = "RGBA" if arr.shape[-1] == 4 else "RGB"
    return Image.fromarray(arr, mode=mode)


def write_reconstruction_assets(
    *,
    fingerprint: str,
    mesh: ProxyMesh,
    summary: dict[str, Any],
    input_root: Path | str | None = None,
    save_glb_fn: Callable[..., Any] | None = None,
) -> tuple[str, Path, Path]:
    """Write bounded GLB proxy and reconstruction metadata under managed input directory.

    Returns (annotated_input_ref, glb_path, json_path).
    """
    fp = str(fingerprint).strip()
    if not HEX_FINGERPRINT_PATTERN.match(fp):
        raise AssetWriterSecurityError(f"Invalid reconstruction fingerprint {fingerprint!r}")

    if input_root is not None:
        input_dir = Path(input_root).resolve()
    else:
        try:
            import folder_paths

            input_dir = Path(folder_paths.get_input_directory()).resolve()
        except Exception as exc:  # pragma: no cover
            raise AssetWriterSecurityError("ComfyUI folder_paths is unavailable") from exc

    target_dir = (input_dir / "majoor_omnicam" / "reconstruction" / fp).resolve()
    # Security: assert target_dir is strictly contained inside input_dir
    if input_dir not in target_dir.parents and target_dir != input_dir:
        raise AssetWriterSecurityError(f"Target directory {target_dir} escapes input root {input_dir}")

    target_dir.mkdir(parents=True, exist_ok=True)
    glb_path = target_dir / "environment.glb"
    # Deliberately not reconstruction.json: that name belongs to the cache
    # manifest written by omnicam.reconstruction.cache, which would clobber this.
    json_path = target_dir / "asset.json"

    pil_texture = _convert_texture_to_pil(mesh.texture)

    if save_glb_fn is None:
        try:
            from comfy_extras.nodes_save_3d import save_glb

            save_glb_fn = save_glb
        except Exception as exc:  # pragma: no cover
            raise RuntimeError(f"Could not import comfy_extras.nodes_save_3d.save_glb: {exc}") from exc

    metadata = {
        "generator": "ComfyUI-Majoor-OmniCam",
        "producer": "OmniCam Scene Reconstruction",
        "fingerprint": fp,
    }

    # Ensure tensors for verts and faces
    verts = mesh.vertices if isinstance(mesh.vertices, torch.Tensor) else torch.as_tensor(mesh.vertices)
    faces = mesh.faces if isinstance(mesh.faces, torch.Tensor) else torch.as_tensor(mesh.faces)
    uvs = mesh.uvs
    if uvs is not None and not isinstance(uvs, torch.Tensor):
        uvs = torch.as_tensor(uvs)

    save_glb_fn(
        vertices=verts,
        faces=faces,
        filepath=str(glb_path),
        metadata=metadata,
        uvs=uvs,
        texture_image=pil_texture,
        unlit=True,
    )

    manifest_data = {
        **summary,
        "fingerprint": fp,
        "timestamp": time.time(),
        "asset": f"majoor_omnicam/reconstruction/{fp}/environment.glb [input]",
    }
    json_path.write_text(json.dumps(manifest_data, indent=2, sort_keys=True), encoding="utf-8")

    annotated_asset = f"majoor_omnicam/reconstruction/{fp}/environment.glb [input]"
    return annotated_asset, glb_path, json_path
