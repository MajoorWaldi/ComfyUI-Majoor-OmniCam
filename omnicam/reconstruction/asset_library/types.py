"""Asset-library retrieval domain types.

The asset library is *not* a reconstruction model: it is a folder of GLB props
(interior / exterior furniture + posed human meshes) plus a ``library.json``
manifest that maps a semantic class to one of them. After the deterministic
blockout is fitted, each object with a semantic class can be swapped for -- or
shadowed by -- a real mesh placed inside its fitted oriented box.

Everything here is JSON-light; the GLB bytes never enter the scene, only an
annotated ComfyUI ``input`` reference string the Director already knows how to
load.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

#: Manifest categories. ``human`` entries carry a ``poses`` map instead of a
#: single ``glb`` and are placed by :mod:`.poses`.
KNOWN_ASSET_CATEGORIES = frozenset({"interior", "exterior", "human"})

#: How an entry is scaled into the fitted box.
#:  ``stretch``  -- match the box on every axis (default; furniture)
#:  ``uniform``  -- one scale factor, fit inside the box, keep proportions
#:  ``upright``  -- uniform, but only the height drives the factor (humans,
#:                  lamps, plants: things whose footprint should stay sane even
#:                  if the mask box is a bad width/depth estimate)
KNOWN_ASSET_FITS = frozenset({"stretch", "uniform", "upright"})


@dataclass(slots=True)
class AssetEntry:
    """One manifest row: a semantic class -> a GLB (or a set of posed GLBs)."""

    semantic_class: str
    category: str
    #: Path to the GLB, relative to the library root. Empty for ``human``
    #: entries, which use :attr:`poses` instead.
    glb: str = ""
    #: Pose name -> GLB relative path (``human`` only).
    poses: dict[str, str] = field(default_factory=dict)
    fit: str = "stretch"
    #: Extra yaw (degrees) applied on top of the box yaw, for assets whose
    #: modelled "front" is not -Z.
    yaw_offset_degrees: float = 0.0
    #: Uniform pre-scale baked into the source model (some kits ship in cm).
    unit_scale: float = 1.0
    #: The model's own bounding-box size in metres, as authored. The resolver
    #: divides the fitted box by this, so a chair modelled 0.9 m tall placed in
    #: a 1 m box scales to ~1.11, not to 1 m absolute. Default (1,1,1) means
    #: "already unit-normalised".
    base_size: tuple[float, float, float] = (1.0, 1.0, 1.0)
    source: str = ""
    license: str = ""

    def __post_init__(self) -> None:
        if self.category not in KNOWN_ASSET_CATEGORIES:
            raise ValueError(
                f"asset {self.semantic_class!r}: unknown category {self.category!r}; "
                f"expected one of {sorted(KNOWN_ASSET_CATEGORIES)}"
            )
        if self.fit not in KNOWN_ASSET_FITS:
            raise ValueError(
                f"asset {self.semantic_class!r}: unknown fit {self.fit!r}; "
                f"expected one of {sorted(KNOWN_ASSET_FITS)}"
            )
        if self.category == "human":
            if not self.poses:
                raise ValueError(f"human asset {self.semantic_class!r} needs a non-empty 'poses' map")
        elif not self.glb:
            raise ValueError(f"asset {self.semantic_class!r} needs a 'glb' path")
        if self.unit_scale <= 0.0:
            raise ValueError(f"asset {self.semantic_class!r}: unit_scale must be positive")
        raw = [*self.base_size, 1.0, 1.0, 1.0]
        self.base_size = (max(1e-4, float(raw[0])), max(1e-4, float(raw[1])), max(1e-4, float(raw[2])))

    def glb_candidates(self) -> list[str]:
        """Every GLB relative path this entry can resolve to (for existence
        checks and the fetch script)."""
        if self.category == "human":
            return sorted(set(self.poses.values()))
        return [self.glb]

    @classmethod
    def from_dict(cls, semantic_class: str, data: dict[str, Any]) -> AssetEntry:
        return cls(
            semantic_class=str(semantic_class),
            category=str(data.get("category", "interior")),
            glb=str(data.get("glb", "")),
            poses={str(k): str(v) for k, v in (data.get("poses") or {}).items()},
            fit=str(data.get("fit", "stretch")),
            yaw_offset_degrees=float(data.get("yaw_offset_degrees", 0.0)),
            unit_scale=float(data.get("unit_scale", 1.0)),
            base_size=tuple(  # type: ignore[arg-type]
                float(v) for v in list(data.get("base_size") or (1.0, 1.0, 1.0))[:3]
            ),
            source=str(data.get("source", "")),
            license=str(data.get("license", "")),
        )


@dataclass(slots=True)
class AssetPlacement:
    """A resolved asset ready to become a MotionScene ``glb`` object.

    ``source_object_id`` links it back to the blockout box it stands in for, so
    the compiler can hide that box in ``replace`` mode.
    """

    source_object_id: str
    semantic_class: str
    category: str
    asset_ref: str  # annotated ComfyUI input reference, e.g. "majoor_omnicam/blockout_library/interior/chair.glb [input]"
    position: tuple[float, float, float]
    rotation: tuple[float, float, float]
    size: tuple[float, float, float]
    pose: str = ""
    confidence: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        return {
            "source_object_id": self.source_object_id,
            "semantic_class": self.semantic_class,
            "category": self.category,
            "asset_ref": self.asset_ref,
            "position": [float(v) for v in self.position],
            "rotation": [float(v) for v in self.rotation],
            "size": [float(v) for v in self.size],
            "pose": self.pose,
            "confidence": float(self.confidence),
        }
