"""Unified asset catalog domain types (``AssetDefinition`` v2).

The catalog is metadata only -- an ``AssetDefinition`` never carries model
bytes, only a managed relative ``file`` path the Director's existing loader can
resolve under ``<ComfyUI input>/omnicam/library/``. A ``character`` asset adds a
``rig`` binding (source-bone -> canonical joint) and zero or more animation
clip descriptors; both are inert for older OmniCam, which still renders the GLB
(design spec section 10).

These dataclasses are deliberately permissive on load -- structural validation
(bounds, slug charset, rig completeness) lives in :mod:`omnicam.assets.validation`
so the same rules apply to catalog files, import payloads and API operations.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

#: ``AssetDefinition`` schema version. A bump means a migration, never a silent
#: reinterpretation of an existing field.
ASSET_DEFINITION_VERSION = 2

#: Top-level asset kinds. ``helper`` covers built-in primitives (the low-poly
#: ``human``, null objects) that have no managed ``file``.
ASSET_KINDS = frozenset({"character", "prop", "environment", "vehicle", "helper"})

#: Managed sub-folders under ``<input>/omnicam/library/`` (design spec section 7).
ASSET_CATEGORIES = frozenset(
    {"characters", "props", "environments", "vehicles", "poses", "animations"}
)

#: Catalog model formats. OBJ/STL/PLY stay valid *generic* 3D imports elsewhere
#: but are not catalog/character formats (design spec section 18).
ASSET_FORMATS = frozenset({"glb", "fbx"})

#: How an instantiated asset is scaled into a target box -- shared vocabulary
#: with the reconstruction library so a promoted legacy entry keeps its meaning.
ASSET_FITS = frozenset({"stretch", "uniform", "upright"})

#: Default → derived category for a kind, when a definition omits ``category``.
_KIND_DEFAULT_CATEGORY = {
    "character": "characters",
    "prop": "props",
    "environment": "environments",
    "vehicle": "vehicles",
    "helper": "props",
}


def default_category_for_kind(kind: str) -> str:
    return _KIND_DEFAULT_CATEGORY.get(str(kind), "props")


@dataclass(slots=True)
class RigBinding:
    """Catalog-owned mapping from a model's source rig to ``OMNICAM_HUMANOID_V1``.

    Scene state never stores source bone names -- only canonical joints -- so
    this binding is the single place a Mixamo / generic-GLTF / native rig is
    reconciled (design spec section 22). ``bone_map`` is
    ``canonical joint -> runtime bone name``.
    """

    profile: str = "omnicam_humanoid_v1"
    root_bone: str = ""
    bone_map: dict[str, str] = field(default_factory=dict)
    forward_axis: str = "-Z"
    up_axis: str = "+Y"

    def to_dict(self) -> dict[str, Any]:
        return {
            "profile": self.profile,
            "root_bone": self.root_bone,
            "bone_map": dict(self.bone_map),
            "forward_axis": self.forward_axis,
            "up_axis": self.up_axis,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> RigBinding:
        return cls(
            profile=str(data.get("profile", "omnicam_humanoid_v1")),
            root_bone=str(data.get("root_bone", "")),
            bone_map={str(k): str(v) for k, v in (data.get("bone_map") or {}).items()},
            forward_axis=str(data.get("forward_axis", "-Z")),
            up_axis=str(data.get("up_axis", "+Y")),
        )


@dataclass(slots=True)
class AnimationClip:
    """One named clip embedded in the asset's model file."""

    id: str
    name: str = ""
    clip: str = ""
    tags: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {"id": self.id, "name": self.name or self.id, "clip": self.clip or self.id,
                "tags": list(self.tags)}

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> AnimationClip:
        cid = str(data.get("id", "")).strip()
        return cls(
            id=cid,
            name=str(data.get("name", "")).strip() or cid,
            clip=str(data.get("clip", "")).strip() or cid,
            tags=[str(t) for t in (data.get("tags") or [])],
        )


@dataclass(slots=True)
class AssetDefinition:
    """One catalog row: a semantic, ID-stable, licensed 3D asset."""

    id: str
    name: str
    kind: str
    file: str = ""
    format: str = "glb"
    category: str = ""
    base_size: tuple[float, float, float] = (1.0, 1.0, 1.0)
    fit: str = "upright"
    tags: list[str] = field(default_factory=list)
    thumbnail: str = ""
    rig: RigBinding | None = None
    animations: list[AnimationClip] = field(default_factory=list)
    license: dict[str, str] = field(default_factory=dict)
    version: int = ASSET_DEFINITION_VERSION
    #: Which source contributed this row ("user" | "legacy" | "default"). Set by
    #: the catalog loader, never serialised into a catalog file.
    source: str = "default"

    def __post_init__(self) -> None:
        if not self.category:
            self.category = default_category_for_kind(self.kind)
        raw = [*self.base_size, 1.0, 1.0, 1.0]
        self.base_size = (
            max(1e-4, float(raw[0])),
            max(1e-4, float(raw[1])),
            max(1e-4, float(raw[2])),
        )

    @property
    def is_character(self) -> bool:
        return self.kind == "character"

    @property
    def rig_status(self) -> str:
        """``"rigged"`` | ``"incomplete"`` | ``"none"`` -- see
        :func:`omnicam.assets.rig.rig_status`."""
        from .rig import rig_status

        return rig_status(self.rig.to_dict() if self.rig is not None else None)

    @property
    def has_rig(self) -> bool:
        """True only when the rig maps every required ``OMNICAM_HUMANOID_V1``
        joint. An incomplete mapping leaves the asset a normal model and must
        never show a RIGGED badge (design spec section 22)."""
        return self.rig_status == "rigged"

    def to_dict(self) -> dict[str, Any]:
        out: dict[str, Any] = {
            "version": self.version,
            "id": self.id,
            "name": self.name,
            "kind": self.kind,
            "category": self.category,
            "file": self.file,
            "format": self.format,
            "base_size": [float(v) for v in self.base_size],
            "fit": self.fit,
            "tags": list(self.tags),
            "thumbnail": self.thumbnail,
            "animations": [clip.to_dict() for clip in self.animations],
            "license": dict(self.license),
            "source": self.source,
        }
        if self.rig is not None:
            out["rig"] = self.rig.to_dict()
        return out

    @classmethod
    def from_dict(cls, data: dict[str, Any], *, source: str = "default") -> AssetDefinition:
        rig_data = data.get("rig")
        base = data.get("base_size") or (1.0, 1.0, 1.0)
        return cls(
            id=str(data.get("id", "")).strip(),
            name=str(data.get("name", "")).strip(),
            kind=str(data.get("kind", "prop")).strip().lower(),
            file=str(data.get("file", "")).strip(),
            format=str(data.get("format", "glb")).strip().lower(),
            category=str(data.get("category", "")).strip().lower(),
            base_size=tuple(float(v) for v in list(base)[:3]),  # type: ignore[arg-type]
            fit=str(data.get("fit", "upright")).strip().lower(),
            tags=[str(t) for t in (data.get("tags") or [])],
            thumbnail=str(data.get("thumbnail", "")).strip(),
            rig=RigBinding.from_dict(rig_data) if isinstance(rig_data, dict) else None,
            animations=[
                AnimationClip.from_dict(a)
                for a in (data.get("animations") or [])
                if isinstance(a, dict)
            ],
            license={str(k): str(v) for k, v in (data.get("license") or {}).items()},
            version=int(data.get("version", ASSET_DEFINITION_VERSION)),
            source=source,
        )
