#!/usr/bin/env python3
"""Populate the OmniCam blockout asset library.

The blockout pipeline can swap each fitted box for a real GLB prop
(``recon_blockout_assets = proxy | replace``). Those GLBs are CC0 kit models
from Quaternius (quaternius.com) and Kenney (kenney.nl); they are *not* vendored
in this repo. This script builds the library folder from kit archives you
provide, so nothing is downloaded implicitly at pipeline time.

Usage
-----
1. Download the CC0 kits listed by ``--list`` (one ZIP each) into a folder.
2. Run::

       python scripts/fetch_blockout_library.py --from-dir /path/to/kits

   It extracts the members named in ``library.default.json``, writes them under
   ``<ComfyUI>/input/majoor_omnicam/blockout_library/`` and generates
   ``library.json`` + ``SOURCES.md``.

Options
-------
--from-dir DIR   Folder holding the kit ZIPs (matched by name, case-insensitive
                 substring). Repeatable.
--dest DIR       Library root. Default: <ComfyUI>/input/majoor_omnicam/blockout_library
                 (falls back to ./blockout_library when run outside ComfyUI).
--only CLASS     Restrict to these semantic classes (repeatable).
--list           Print the kits + homepages and exit.
--dry-run        Report what would be copied, write nothing.

Missing members are reported, never fatal: a partial library still works, the
pipeline just skips classes it cannot resolve.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_DEFAULT_MANIFEST = _HERE.parent / "omnicam" / "reconstruction" / "asset_library" / "library.default.json"

# Kit name -> asset page. All CC0. Download each as its "GLB" flavour ZIP.
# Kenney pages carry a direct .zip link ("Continue without donating"), so
# --download can also fetch them without a browser.
_KITS = {
    "Kenney Furniture Kit": "https://kenney.nl/assets/furniture-kit",
    "Kenney Car Kit": "https://kenney.nl/assets/car-kit",
    "Kenney City Kit (Roads)": "https://kenney.nl/assets/city-kit-roads",
    "Kenney Nature Kit": "https://kenney.nl/assets/nature-kit",
    "Kenney Blocky Characters": "https://kenney.nl/assets/blocky-characters",
}


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


def _index_zip_members(zip_dirs: list[Path]) -> list[tuple[zipfile.ZipFile, str]]:
    members: list[tuple[zipfile.ZipFile, str]] = []
    for folder in zip_dirs:
        for archive in sorted(folder.glob("*.zip")):
            try:
                zf = zipfile.ZipFile(archive)
            except zipfile.BadZipFile:
                print(f"  ! not a zip: {archive.name}", file=sys.stderr)
                continue
            for name in zf.namelist():
                if name.lower().endswith((".glb", ".gltf")):
                    members.append((zf, name))
    return members


def _download_kenney_kits(into: Path) -> list[Path]:
    """Scrape each Kenney asset page for its 'Continue without donating' .zip
    link and fetch it. Kenney assets are CC0; the link is a plain static file."""
    import re
    import urllib.request

    into.mkdir(parents=True, exist_ok=True)
    got: list[Path] = []
    for name, page in _KITS.items():
        try:
            html = urllib.request.urlopen(page, timeout=30).read().decode("utf-8", "replace")  # noqa: S310 - https kenney.nl only
        except OSError as exc:
            print(f"  ! {name}: could not open {page} ({exc})", file=sys.stderr)
            continue
        m = re.search(r"https://kenney\.nl/media/pages/assets/[^\"'\s]+\.zip", html)
        if not m:
            print(f"  ! {name}: no .zip link on the page — download it manually", file=sys.stderr)
            continue
        url = m.group(0)
        target = into / (Path(url).name)
        print(f"  downloading {name} -> {target.name}")
        try:
            urllib.request.urlretrieve(url, target)  # noqa: S310 - url is https://kenney.nl/... (regex-pinned)
            got.append(target)
        except OSError as exc:
            print(f"  ! {name}: download failed ({exc})", file=sys.stderr)
    return got


def _best_member(target_rel: str, members: list[tuple[zipfile.ZipFile, str]]):
    stem = Path(target_rel).stem.lower()
    glb = [m for m in members if m[1].lower().endswith(".glb")]
    for pool in (glb, members):
        exact = [m for m in pool if Path(m[1]).stem.lower() == stem]
        if exact:
            return exact[0]
        loose = [m for m in pool if stem in Path(m[1]).stem.lower()]
        if loose:
            return sorted(loose, key=lambda m: len(m[1]))[0]
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--from-dir", action="append", default=[], type=Path)
    parser.add_argument("--dest", type=Path, default=None)
    parser.add_argument("--only", action="append", default=[])
    parser.add_argument("--list", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--download",
        nargs="?",
        const="",
        default=None,
        metavar="DIR",
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
    members = _index_zip_members(zip_dirs)
    if not members:
        print(
            "No kit .zip archives with .glb/.gltf members found. Download the kits "
            "(see --list) and pass their folder with --from-dir.",
            file=sys.stderr,
        )
        return 2

    placed: dict[str, str] = {}
    missing: list[str] = []
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        for rel, cls in sorted(wanted.items()):
            hit = _best_member(rel, members)
            if hit is None:
                missing.append(f"{rel}  ({cls})")
                continue
            zf, name = hit
            target = dest / rel
            if args.dry_run:
                print(f"  would place {rel:<28} <- {Path(name).name}")
            else:
                extracted = zf.extract(name, tmp_path)
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(extracted, target)
                print(f"  placed {rel:<28} <- {Path(name).name}")
            placed[rel] = cls

    if args.dry_run:
        print(f"\nDry run: {len(placed)} member(s) would be placed, {len(missing)} missing.")
        return 0

    # Write library.json filtered to entries whose GLB(s) all landed.
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
