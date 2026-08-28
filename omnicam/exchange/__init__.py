"""Application-neutral camera interchange.

OmniCam deliberately exports to formats rather than to applications. Blender,
Maya, Unreal, Unity and Houdini all read glTF and USD, and every tracker on the
planet reads .chan, so one writer per format reaches all of them -- and none of
them can drift out of date with a vendor's plugin.

Not offered, and why:
  - **OBJ** has no camera, no time and no field of view. It is a static
    geometry format; a camera cannot be represented in it at all.
  - **FBX** is a closed binary format with no usable pure-Python writer. Its
    readers are strict about version and structure, so a hand-rolled writer
    would be a maintenance trap. FBX *import* is supported, because the
    viewport already bundles a reader for it.
"""

from __future__ import annotations

from typing import Any

from ..core.track import OmniCamTrack
from .baking import CameraSample, bake_camera
from .chan import read_chan, write_chan
from .gltf import write_glb, write_gltf
from .gltf_read import read_camera_track as read_gltf
from .usda import write_usda

EXPORT_FORMATS: dict[str, dict[str, Any]] = {
    "glb": {"extension": ".glb", "binary": True, "label": "glTF binary (.glb)",
            "reads": "Blender, Maya, Unreal, Unity, Houdini, web viewers"},
    "gltf": {"extension": ".gltf", "binary": False, "label": "glTF text (.gltf)",
             "reads": "Blender, Maya, Unreal, Unity, Houdini, web viewers"},
    "usda": {"extension": ".usda", "binary": False, "label": "USD ASCII (.usda)",
             "reads": "Maya, Houdini, Unreal, Blender, usdview"},
    "chan": {"extension": ".chan", "binary": False, "label": "Camera channel (.chan)",
             "reads": "Maya, Nuke, Houdini, 3DEqualizer, SynthEyes, PFTrack"},
}

IMPORT_EXTENSIONS = (".json", ".chan", ".gltf", ".glb")
"""Server-side readers. .fbx is handled in the viewport by the bundled loader."""


def export_camera(track: OmniCamTrack, fmt: str, name: str = "OmniCam") -> bytes:
    """Serialise `track` in `fmt`. Always returns bytes so callers can just write them."""
    if fmt not in EXPORT_FORMATS:
        raise ValueError(f"unsupported export format: {fmt!r}; expected one of {sorted(EXPORT_FORMATS)}")
    if fmt == "glb":
        return write_glb(track, name)
    text = {"gltf": write_gltf, "usda": write_usda, "chan": lambda t, _n=None: write_chan(t)}[fmt](track, name)
    return text.encode("utf-8")


def import_camera(data: bytes, extension: str, fps: int = 24, width: int = 1280, height: int = 720) -> dict[str, Any]:
    """Read a camera from `data` into a canonical track payload.

    Every reader's output goes through validate_track_payload before it is
    returned. An imported file is untrusted input like any other: a .chan
    carrying `nan`, or a glTF whose OmniCam sidecar was hand-edited, would
    otherwise put non-finite values straight into the canonical contract -- and
    serialise as the bare `NaN` token, which strict JSON parsers reject.
    """
    from ..core.validation import validate_track_payload

    return validate_track_payload(_read_camera(data, extension, fps=fps, width=width, height=height))


def _read_camera(data: bytes, extension: str, fps: int, width: int, height: int) -> dict[str, Any]:
    extension = extension.lower()
    if extension == ".chan":
        return read_chan(data.decode("utf-8", errors="replace"), fps=fps, width=width, height=height)
    if extension in {".gltf", ".glb"}:
        return read_gltf(data, fps=fps, width=width, height=height)
    if extension == ".json":
        import json as _json

        from ..core.importers import import_track_json

        payload = _json.loads(data.decode("utf-8"))
        # Both an OmniCam track and a Blender-style {"frames": [...]} export land here.
        if isinstance(payload, dict) and "frames" in payload and "keyframes" not in payload:
            from ..core.importers import import_blender_camera

            return import_blender_camera(payload, fps=fps).to_dict()
        return import_track_json(payload).to_dict()
    raise ValueError(f"unsupported import extension: {extension!r}; expected one of {list(IMPORT_EXTENSIONS)}")


__all__ = [
    "EXPORT_FORMATS",
    "IMPORT_EXTENSIONS",
    "CameraSample",
    "bake_camera",
    "export_camera",
    "import_camera",
    "read_chan",
    "read_gltf",
    "write_chan",
    "write_glb",
    "write_gltf",
    "write_usda",
]
