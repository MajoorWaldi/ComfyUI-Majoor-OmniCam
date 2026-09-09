"""Format-agnostic model inspection: dispatch a member to the GLB or FBX reader.

Both readers return a struct with the same fields (``has_skin``,
``joint_names``, ``joint_parents``, ``triangle_count``, ``animation_names`` …)
so curation, rig evidence and the installer never branch on format.
"""

from __future__ import annotations

from .archive import ArchiveMember
from .fbx_inspect import FbxInfo, inspect_fbx_member
from .glb_inspect import GlbInfo, inspect_glb_member
from .types import EXIT_DOWNLOAD, BootstrapError

ModelInfo = GlbInfo | FbxInfo
MODEL_SUFFIXES = (".glb", ".fbx")


def model_format(name: str) -> str:
    lowered = name.lower()
    if lowered.endswith(".glb"):
        return "glb"
    if lowered.endswith(".fbx"):
        return "fbx"
    raise BootstrapError(f"not a catalog model file: {name!r}", exit_code=EXIT_DOWNLOAD)


def inspect_member(member: ArchiveMember) -> ModelInfo:
    fmt = model_format(member.name)
    return inspect_glb_member(member) if fmt == "glb" else inspect_fbx_member(member)
