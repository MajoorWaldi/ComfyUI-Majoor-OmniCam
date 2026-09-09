#!/usr/bin/env python3
"""Populate the OmniCam blockout asset library (legacy entry point).

The blockout pipeline can swap each fitted box for a real GLB prop
(``recon_blockout_assets = proxy | replace``). Those GLBs are CC0 kit models
from Quaternius (quaternius.com) and Kenney (kenney.nl); they are *not* vendored
in this repo. This script builds the library folder from kit archives.

Network + archive handling is shared with the unified asset bootstrap
(:mod:`omnicam.assets.bootstrap`) -- there is only one Kenney downloader in the
project. Only the *legacy* blockout destination / ``library.json`` /
``SOURCES.md`` semantics live here, until the Reconstruction migration to the
unified catalog is complete.

Usage
-----
1. Download the CC0 kits listed by ``--list`` (one ZIP each) into a folder, or
   pass ``--download`` to fetch the Kenney ones automatically.
2. Run::

       python scripts/fetch_blockout_library.py --from-dir /path/to/kits

Options
-------
--from-dir DIR   Folder holding the kit ZIPs (repeatable).
--dest DIR       Library root. Default: <ComfyUI>/input/majoor_omnicam/blockout_library
--only CLASS     Restrict to these semantic classes (repeatable).
--download [DIR] Fetch the CC0 Kenney kit ZIPs (into DIR or a temp folder) first.
--list           Print the kits + homepages and exit.
--dry-run        Report what would be copied, write nothing.

Missing members are reported, never fatal.
"""

from __future__ import annotations

import argparse
import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from omnicam.assets.bootstrap.archive import copy_member, list_glb_members
from omnicam.assets.bootstrap.download import download_archive
from omnicam.assets.bootstrap.kenney import resolve_kenney_archive
from omnicam.assets.bootstrap.types import BootstrapError

_HERE = Path(__file__).resolve().parent
_DEFAULT_MANIFEST = _HERE.parent / "omnicam" / "reconstruction" / "asset_library" / "library.default.json"

# Kit name -> official asset page. All CC0. Kenney pages are resolved through the
# shared bootstrap resolver; the two Quaternius kits must be downloaded by hand.
_KITS = {
    "Kenney Furniture Kit": "https://kenney.nl/assets/furniture-kit",
    "Kenney Car Kit": "https://kenney.nl/assets/car-kit",
    "Kenney City Kit (Roads)": "https://kenney.nl/assets/city-kit-roads",
    "Kenney Nature Kit": "https://kenney.nl/assets/nature-kit",
    "Kenney Blocky Characters": "https://kenney.nl/assets/blocky-characters",
}
_KENNEY_KITS = {name: url for name, url in _KITS.items() if "kenney.nl" in url}


def _comfy_input_dir() -> Path | None:
    for parent in _HERE.parents:
        candidate = parent / "input"
        if candidate.is_dir() and (parent / "comfy_extras").is_dir():
            return candidate
    try:
        import folder_paths  # type: ignore

        return Path(folder_paths.get_input_directory())
    except ImportError:
        return None


def _default_dest() -> Path:
    base = _comfy_input_dir()
    if base is not None:
        return base / "majoor_omnicam" / "blockout_library"
    return Path.cwd() / "blockout_library"


def _load_manifest() -> dict:
    return json.loads(_DEFAULT_MANIFEST.read_text(encoding="utf-8"))


def _wanted_glbs(manifest: dict, only: set[str] | None) -> dict[str, str]:
    """Relative glb path -> the semantic class asking for it."""
    out: dict[str, str] = {}
    for cls, entry in manifest["assets"].items():
        if only and cls not in only:
            continue
        rels = list(entry.get("poses", {}).values()) if entry.get("category") == "human" else [entry["glb"]]
        for rel in rels:
            out.setdefault(rel, cls)
    return out


def _index_members(zip_dirs: list[Path]) -> list:
    """Every safe ``.glb`` member across every archive in ``zip_dirs``."""
    members: list = []
    for folder in zip_dirs:
        for archive in sorted(folder.glob("*.zip")):
            try:
                members.extend(list_glb_members(archive))
            except BootstrapError as exc:
                print(f"  ! skipping {archive.name}: {exc}", file=sys.stderr)
    return members


def _download_kenney_kits(into: Path) -> list[Path]:
    """Resolve + fetch each Kenney kit ZIP through the shared bootstrap core."""
    into.mkdir(parents=True, exist_ok=True)
    got: list[Path] = []
    for name, page in _KENNEY_KITS.items():
        try:
            url = resolve_kenney_archive(page)
            target = into / Path(url).name
            print(f"  downloading {name} -> {target.name}")
            got.append(download_archive(url, target).path)
        except (BootstrapError, OSError) as exc:
            print(f"  ! {name}: {exc}", file=sys.stderr)
    return got


def _best_member(target_rel: str, members: list):
    stem = Path(target_rel).stem.lower()
    exact = [m for m in members if m.stem.lower() == stem]
    if exact:
        return sorted(exact, key=lambda m: len(m.name))[0]
    loose = [m for m in members if stem in m.stem.lower()]
    if loose:
        return sorted(loose, key=lambda m: len(m.name))[0]
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--from-dir", action="append", default=[], type=Path)
    parser.add_argument("--dest", type=Path, default=None)
    parser.add_argument("--only", action="append", default=[])
    parser.add_argument("--list", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--download", nargs="?", const="", default=None, metavar="DIR",
        help="fetch the CC0 Kenney kit ZIPs into DIR (default: a temp folder) before building",
    )
    args = parser.parse_args()

    if args.list:
        print("CC0 kits used by the default library (download the glTF/GLB flavour):\n")
        for name, url in _KITS.items():
            print(f"  {name}\n      {url}")
        return 0

    manifest = _load_manifest()
    dest = (args.dest or _default_dest()).resolve()
    only = set(args.only) or None
    wanted = _wanted_glbs(manifest, only)

    download_tmp: tempfile.TemporaryDirectory | None = None
    zip_dirs = [Path(d).resolve() for d in args.from_dir]
    if args.download is not None:
        if args.download:
            dl_dir = Path(args.download).resolve()
        else:
            download_tmp = tempfile.TemporaryDirectory(prefix="omnicam_kits_")
            dl_dir = Path(download_tmp.name)
        print(f"Fetching CC0 kits into: {dl_dir}")
        _download_kenney_kits(dl_dir)
        zip_dirs.append(dl_dir)
    if not zip_dirs:
        zip_dirs = [Path.cwd()]
    print(f"Scanning for kit archives in: {', '.join(str(d) for d in zip_dirs)}")
    members = _index_members(zip_dirs)
    if not members:
        print(
            "No kit .zip archives with .glb members found. Download the kits "
            "(see --list) and pass their folder with --from-dir.",
            file=sys.stderr,
        )
        return 2

    placed: dict[str, str] = {}
    missing: list[str] = []
    for rel, cls in sorted(wanted.items()):
        hit = _best_member(rel, members)
        if hit is None:
            missing.append(f"{rel}  ({cls})")
            continue
        target = dest / rel
        if args.dry_run:
            print(f"  would place {rel:<28} <- {Path(hit.name).name}")
        else:
            copy_member(hit, target)
            print(f"  placed {rel:<28} <- {Path(hit.name).name}")
        placed[rel] = cls

    if download_tmp is not None:
        download_tmp.cleanup()

    if args.dry_run:
        print(f"\nDry run: {len(placed)} member(s) would be placed, {len(missing)} missing.")
        return 0

    kept: dict = {}
    for cls, entry in manifest["assets"].items():
        rels = list(entry.get("poses", {}).values()) if entry.get("category") == "human" else [entry["glb"]]
        if all((dest / r).is_file() for r in rels):
            kept[cls] = entry
    out_manifest = {**{k: v for k, v in manifest.items() if k != "assets"}, "assets": kept}
    (dest / "library.json").write_text(json.dumps(out_manifest, indent=2), encoding="utf-8")

    sources = sorted({e.get("source", "") for e in kept.values() if e.get("source")})
    (dest / "SOURCES.md").write_text(
        "# Blockout asset library sources\n\n"
        "All models are CC0 (Creative Commons Zero). Credit is appreciated:\n\n"
        + "".join(f"- {s}\n" for s in sources)
        + "\nKit homepages:\n\n"
        + "".join(f"- {n}: {u}\n" for n, u in _KITS.items()),
        encoding="utf-8",
    )

    print(f"\nLibrary written to {dest}")
    print(f"  {len(kept)} class(es) usable, {len(missing)} member(s) missing.")
    if missing:
        print("  missing (class will fall back to the plain box):")
        for m in missing:
            print(f"    - {m}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
