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
            sx, sy, sz = rx, ry, rz
        elif fit == "upright":
            sx = sy = sz = ry
        else:  # uniform
            sx = sy = sz = min(rx, ry, rz)
        u = float(unit_scale)
        out = (sx * u, sy * u, sz * u)
        if any(not math.isfinite(v) or v <= 0.0 for v in out):
            return (max(1e-3, box[0]), max(1e-3, box[1]), max(1e-3, box[2]))
        return out


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
