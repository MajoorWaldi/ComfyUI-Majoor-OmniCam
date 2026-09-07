"""Load the blockout asset library and resolve a semantic class to a placement.

Library layout (all under ComfyUI's ``input`` folder so the Director can load
the GLBs with the annotated-reference scheme it already uses):

    <input>/majoor_omnicam/blockout_library/
        library.json
        interior/*.glb
        exterior/*.glb
        human/*.glb

``library.json``::

    {
      "version": 1,
      "name": "OmniCam default (Kenney, CC0)",
      "assets": {
        "chair":  {"category": "interior", "glb": "interior/chair.glb"},
        "person": {"category": "human", "fit": "upright",
                   "poses": {"standing": "human/standing.glb",
                             "sitting":  "human/sitting.glb"}}
      }
    }

The GLBs themselves are *not* shipped in the repo; ``scripts/fetch_blockout_library.py``
downloads and normalises them. Until it is run, :meth:`AssetLibrary.status`
reports the library as unavailable with a reason, and requesting it raises
:class:`ReconAssetLibraryUnavailableError` rather than silently doing nothing.
"""

from __future__ import annotations

import dataclasses
import hashlib
import json
import math
from pathlib import Path
from typing import Any

from ..errors import ReconAssetLibraryInvalidError
from .poses import select_pose
from .types import AssetEntry, AssetPlacement

LIBRARY_SUBDIR = ("majoor_omnicam", "blockout_library")
MANIFEST_NAME = "library.json"
_ANNOTATED_PREFIX = "majoor_omnicam/blockout_library"
#: Max ratio a single ``stretch`` axis may deviate from the geometric mean of
#: the three box/base ratios -- keeps a planar prop (window/door) from being
#: stretched 20x along an unreliable OBB depth.
_STRETCH_CLAMP = 3.0


def resolve_library_root(input_root: Path | str | None = None) -> Path:
    """``<input>/majoor_omnicam/blockout_library``. ``input_root`` overrides the
    ComfyUI input directory (used by tests)."""
    if input_root is not None:
        base = Path(input_root)
        # Allow callers to pass either the input dir or the library dir itself.
        if base.name == LIBRARY_SUBDIR[-1]:
            return base.resolve()
        return base.joinpath(*LIBRARY_SUBDIR).resolve()
    try:
        import folder_paths

        return Path(folder_paths.get_input_directory()).joinpath(*LIBRARY_SUBDIR).resolve()
    except Exception as exc:  # pragma: no cover - only when run outside ComfyUI
        raise ReconAssetLibraryInvalidError(
            "ComfyUI folder_paths is unavailable; cannot locate the asset library"
        ) from exc


class AssetLibrary:
    """A loaded ``library.json`` plus its on-disk root."""

    @classmethod
    def _rooted(cls, root: Path, template: AssetLibrary) -> AssetLibrary:
        """A copy of ``template`` with a different on-disk root (for staging)."""
        obj = cls.__new__(cls)
        obj.root = root
        obj.name = template.name
        obj.version = template.version
        obj.entries = template.entries
        return obj

    def __init__(self, root: Path, manifest: dict[str, Any]) -> None:
        self.root = root
        self.name = str(manifest.get("name", "asset library"))
        self.version = int(manifest.get("version", 1))
        raw_assets = manifest.get("assets")
        if not isinstance(raw_assets, dict) or not raw_assets:
            raise ReconAssetLibraryInvalidError(
                f"{root / MANIFEST_NAME}: 'assets' must be a non-empty object"
            )
        entries: dict[str, AssetEntry] = {}
        for semantic_class, data in raw_assets.items():
            if not isinstance(data, dict):
                raise ReconAssetLibraryInvalidError(
                    f"asset {semantic_class!r}: expected an object, got {type(data).__name__}"
                )
            try:
                entry = AssetEntry.from_dict(semantic_class, data)
            except ValueError as exc:
                raise ReconAssetLibraryInvalidError(str(exc)) from exc
            entries[entry.semantic_class.lower()] = entry
        self.entries = entries

    # -- introspection ---------------------------------------------------- #
    @property
    def entry_count(self) -> int:
        return len(self.entries)

    def categories(self) -> dict[str, int]:
        out: dict[str, int] = {}
        for entry in self.entries.values():
            out[entry.category] = out.get(entry.category, 0) + 1
        return out

    def missing_files(self) -> list[str]:
        missing: list[str] = []
        for entry in self.entries.values():
            for rel in entry.glb_candidates():
                if not (self.root / rel).is_file():
                    missing.append(rel)
        return sorted(set(missing))

    def status(self) -> tuple[bool, str]:
        """(available, reason). Available only when the manifest is valid *and*
        every referenced GLB exists on disk."""
        missing = self.missing_files()
        if not missing:
            return True, ""
        shown = ", ".join(missing[:5]) + (" …" if len(missing) > 5 else "")
        return False, (
            f"asset library at {self.root} is missing {len(missing)} GLB file(s): {shown}. "
            "Run scripts/fetch_blockout_library.py to populate it."
        )

    def identity_token(self) -> str:
        """Stable digest of the manifest, for the reconstruction cache key."""
        blob = json.dumps(
            {k: dataclasses.asdict(v) for k, v in sorted(self.entries.items())},
            sort_keys=True,
            default=str,
        )
        return "assetlib:" + hashlib.sha256(blob.encode("utf-8")).hexdigest()[:16]

    # -- resolution ----------------------------------------------------- #
    def entry_for(self, semantic_class: str) -> AssetEntry | None:
        return self.entries.get(str(semantic_class).strip().lower())

    def resolve(
        self,
        semantic_class: str,
        *,
        position: tuple[float, float, float],
        rotation: tuple[float, float, float],
        size: tuple[float, float, float],
        object_id: str,
        confidence: float = 0.0,
    ) -> AssetPlacement | None:
        """Map one fitted box to a placed GLB, or ``None`` if the class is not
        in the library or its file is missing."""
        entry = self.entry_for(semantic_class)
        if entry is None:
            return None

        box: tuple[float, float, float] = (
            max(1e-3, abs(float(size[0]))),
            max(1e-3, abs(float(size[1]))),
            max(1e-3, abs(float(size[2]))),
        )
        if entry.category == "human":
            pose = select_pose(entry, box)
            rel = entry.poses.get(pose, next(iter(entry.poses.values())))
            fit = "upright"
        else:
            pose = ""
            rel = entry.glb
            fit = entry.fit

        if not (self.root / rel).is_file():
            return None

        scale = self._scale_for(fit, box, entry.base_size, entry.unit_scale)
        yaw = float(rotation[1]) + float(entry.yaw_offset_degrees)
        return AssetPlacement(
            source_object_id=str(object_id),
            semantic_class=entry.semantic_class,
            category=entry.category,
            asset_ref=f"{_ANNOTATED_PREFIX}/{rel} [input]",
            position=(float(position[0]), float(position[1]), float(position[2])),
            rotation=(0.0, yaw, 0.0),
            size=scale,
            pose=pose,
            confidence=float(confidence),
        )

    @staticmethod
    def _scale_for(
        fit: str,
        box: tuple[float, float, float],
        base_size: tuple[float, float, float],
        unit_scale: float,
    ) -> tuple[float, float, float]:
        rx, ry, rz = (box[0] / base_size[0], box[1] / base_size[1], box[2] / base_size[2])
        if fit == "stretch":
            # A fitted OBB gives a planar object (window / door / tv) an
            # unreliable thin axis: dividing that box side by the model's own
            # ~0.1 m thickness blows the scale up 20x. Clamp every axis to a
            # sane band around the geometric mean of the three ratios so the
            # prop stays roughly the box's size without grotesque stretching.
            gmean = (max(rx, 1e-6) * max(ry, 1e-6) * max(rz, 1e-6)) ** (1.0 / 3.0)
            lo, hi = gmean / _STRETCH_CLAMP, gmean * _STRETCH_CLAMP
            sx = min(max(rx, lo), hi)
            sy = min(max(ry, lo), hi)
            sz = min(max(rz, lo), hi)
        elif fit == "upright":
            sx = sy = sz = ry
        else:  # uniform
            sx = sy = sz = min(rx, ry, rz)
        u = float(unit_scale)
        out = (sx * u, sy * u, sz * u)
        if any(not math.isfinite(v) or v <= 0.0 for v in out):
            return (max(1e-3, box[0]), max(1e-3, box[1]), max(1e-3, box[2]))
        return out


def stage_custom_library(library: AssetLibrary, input_root: Path | str | None = None) -> AssetLibrary:
    """Copy a library that lives outside the managed folder into
    ``<input>/majoor_omnicam/blockout_library/_staged/<token>/`` and return a
    handle rooted there.

    ``AssetLibrary.resolve`` always emits ``majoor_omnicam/blockout_library/<rel>
    [input]`` references, so an out-of-tree library would otherwise produce
    unloadable GLB paths (or silently hit a same-named prop in the default
    folder). Staging keeps the annotated-input contract intact and preserves the
    read restrictions -- nothing outside ``library.root`` is ever copied.
    """
    managed_default = resolve_library_root(input_root)
    try:
        library.root.relative_to(managed_default)
        return library  # already inside the managed folder
    except ValueError:
        pass
    staged_root = (managed_default / "_staged" / library.identity_token().split(":")[-1]).resolve()
    for rel in sorted({r for e in library.entries.values() for r in e.glb_candidates()}):
        src = (library.root / rel).resolve()
        try:
            src.relative_to(library.root.resolve())
        except ValueError:
            continue  # never copy a path that escapes the library root
        if not src.is_file():
            continue
        dst = staged_root / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        if not dst.is_file() or dst.stat().st_size != src.stat().st_size:
            import shutil

            shutil.copyfile(src, dst)
    return AssetLibrary._rooted(staged_root, library)


def load_asset_library(
    root: Path | str | None = None,
    *,
    input_root: Path | str | None = None,
) -> AssetLibrary:
    """Read ``library.json`` from ``root`` (or the resolved default). Raises
    :class:`ReconAssetLibraryInvalidError` when the manifest is absent or
    malformed -- callers gate on :meth:`AssetLibrary.status` for the softer
    "installed but empty" case."""
    resolved = Path(root).resolve() if root is not None else resolve_library_root(input_root)
    manifest_path = resolved / MANIFEST_NAME
    if not manifest_path.is_file():
        raise ReconAssetLibraryInvalidError(
            f"no {MANIFEST_NAME} at {resolved}. Run scripts/fetch_blockout_library.py "
            "or point recon_asset_library_path at your own library."
        )
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise ReconAssetLibraryInvalidError(f"{manifest_path}: {exc}") from exc
    if not isinstance(manifest, dict):
        raise ReconAssetLibraryInvalidError(f"{manifest_path}: top level must be an object")
    return AssetLibrary(resolved, manifest)
