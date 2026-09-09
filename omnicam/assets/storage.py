"""Managed on-disk layout for the unified asset library.

    <ComfyUI input>/omnicam/library/
        catalog.json          -- writable user catalog (design spec section 8)
        characters/  props/  environments/  vehicles/
        poses/  animations/  thumbnails/

Every path the catalog or the routes touch is resolved through
:func:`resolve_within`, which refuses anything that escapes the library root.
No absolute path is ever serialised into a catalog row (design spec section 7).
"""

from __future__ import annotations

from pathlib import Path

from .errors import AssetError

LIBRARY_SUBDIR = ("omnicam", "library")
USER_CATALOG_NAME = "catalog.json"
#: Sub-folders created on demand under the library root.
LIBRARY_FOLDERS = (
    "characters",
    "props",
    "environments",
    "vehicles",
    "poses",
    "animations",
    "thumbnails",
)


def resolve_library_root(input_root: Path | str | None = None) -> Path:
    """``<input>/omnicam/library``. ``input_root`` overrides the ComfyUI input
    directory (tests, and callers that already hold it). Accepts either the
    input dir or the library dir itself."""
    if input_root is not None:
        base = Path(input_root)
        if base.name == LIBRARY_SUBDIR[-1] and base.parent.name == LIBRARY_SUBDIR[0]:
            return base.resolve()
        return base.joinpath(*LIBRARY_SUBDIR).resolve()
    try:
        import folder_paths

        return Path(folder_paths.get_input_directory()).joinpath(*LIBRARY_SUBDIR).resolve()
    except Exception as exc:  # pragma: no cover - only outside ComfyUI
        raise AssetError(
            "ComfyUI folder_paths is unavailable; cannot locate the asset library",
            code="ASSET_CATALOG_INVALID",
        ) from exc


def resolve_within(root: Path, relative: str | Path) -> Path:
    """Resolve ``relative`` under ``root`` or raise. The result is guaranteed to
    be ``root`` itself or a descendant -- symlinks and ``..`` cannot escape."""
    root = root.resolve()
    candidate = (root / Path(str(relative).replace("\\", "/"))).resolve()
    if candidate != root and root not in candidate.parents:
        raise AssetError(
            f"path escapes the managed asset library: {relative!r}",
            code="ASSET_FILE_INVALID",
        )
    return candidate


def user_catalog_path(input_root: Path | str | None = None) -> Path:
    return resolve_library_root(input_root) / USER_CATALOG_NAME


def ensure_library_tree(input_root: Path | str | None = None) -> Path:
    """Create the library root and its category folders if absent; return the
    root. Never touches or moves anything that already exists."""
    root = resolve_library_root(input_root)
    root.mkdir(parents=True, exist_ok=True)
    for folder in LIBRARY_FOLDERS:
        (root / folder).mkdir(exist_ok=True)
    return root


def asset_file_path(
    definition_file: str, input_root: Path | str | None = None
) -> Path:
    """Absolute path of a catalog row's ``file`` inside the managed library."""
    return resolve_within(resolve_library_root(input_root), definition_file)
