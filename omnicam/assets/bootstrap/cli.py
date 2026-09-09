"""``bootstrap_asset_library`` command orchestration (plan sections 7, 43).

Wires the stages together: select sources -> resolve / fetch or locate archives
-> inventory + inspect GLBs -> curate -> install -> lock + provenance + report.
Network access happens *only* when ``--download`` is given; ``--verify`` and
``--dry-run`` never touch it. Human logs go to stderr; ``--json`` puts the
machine report on stdout.
"""

from __future__ import annotations

import argparse
import contextlib
import json
import sys
from pathlib import Path
from urllib.request import urlopen

from .archive import list_glb_members
from .curation import (
    InspectedMember,
    SourceInventory,
    load_selection_document,
    select_starter_assets,
)
from .download import download_archive
from .glb_inspect import inspect_glb_member
from .installer import InstalledAsset, install_selected_asset
from .kenney import resolve_kenney_archive
from .lockfile import LockSource, verify_lockfile, write_lockfile
from .report import build_report, render_report_text, write_report, write_sources_md
from .source_registry import SourceDefinition, select_sources
from .types import (
    EXIT_CONFIG,
    EXIT_CURATION,
    EXIT_OK,
    BootstrapError,
)


def _log(message: str) -> None:
    print(message, file=sys.stderr)


def _force_utf8() -> None:
    """Windows consoles default to cp1252; the report + logs are UTF-8."""
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure is not None:
            with contextlib.suppress(ValueError, OSError):
                reconfigure(encoding="utf-8", errors="backslashreplace")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="bootstrap_asset_library",
        description="Install OmniCam's CC0 starter asset library from official Kenney packs.",
    )
    parser.add_argument("--preset", default="starter",
                        help="starter | characters | characters-extra | props | vehicles | environment | environments-extra")
    parser.add_argument("--download", action="store_true", help="resolve + fetch pack archives from kenney.nl")
    parser.add_argument("--from-dir", type=Path, default=None, help="use already-downloaded pack ZIPs in this folder")
    parser.add_argument("--dest", type=Path, default=None, help="ComfyUI input root (library goes under <dest>/omnicam/library)")
    parser.add_argument("--source", action="append", default=[], metavar="SOURCE_ID", help="restrict to these source ids (repeatable)")
    parser.add_argument("--dry-run", action="store_true", help="resolve / inventory / select only; write nothing")
    parser.add_argument("--verify", action="store_true", help="verify the installed lock offline; no network")
    parser.add_argument("--update", action="store_true", help="allow replacing installed files whose source changed")
    parser.add_argument("--keep-cache", action="store_true", help="keep downloaded ZIPs after a successful install")
    parser.add_argument("--json", action="store_true", dest="as_json", help="emit the machine report on stdout")
    parser.add_argument("--verbose", action="store_true", help="per-member diagnostics")
    return parser


def run(argv: list[str] | None = None, *, opener=urlopen, resolver=resolve_kenney_archive) -> int:
    _force_utf8()
    args = build_parser().parse_args(argv)
    try:
        if args.verify:
            return _run_verify(args)
        if not args.download and args.from_dir is None:
            raise BootstrapError(
                "nothing to do: pass --download to fetch packs or --from-dir with local ZIPs",
                exit_code=EXIT_CONFIG,
            )
        return _run_install(args, opener=opener, resolver=resolver)
    except BootstrapError as exc:
        _log(f"error: {exc}")
        return exc.exit_code


# -- verify ---------------------------------------------------------------

def _run_verify(args) -> int:
    result = verify_lockfile(args.dest)
    report = build_report(
        preset=args.preset, sources_total=0, sources_resolved=0,
        archives_downloaded=0, archives_verified=0,
        selection=_empty_selection(), installed=[], verify=result,
    )
    _emit(args, report)
    if not result.ok:
        for issue in result.issues:
            _log(f"  ! {issue.kind}: {issue.detail}")
        return 7
    write_report(args.dest, report)
    return EXIT_OK


# -- install ------------------------------------------------------------

def _run_install(args, *, opener, resolver) -> int:
    sources = select_sources(args.preset, set(args.source) or None)
    _log(f"preset {args.preset!r}: {len(sources)} source(s)")

    cache_dir = _resolve_library(args.dest) / ".bootstrap" / "cache"
    archives: dict[str, tuple[Path, LockSource]] = {}
    try:
        for source in sources:
            located = _acquire_archive(source, args, cache_dir, opener=opener, resolver=resolver)
            if located is not None:
                archives[source.id] = located

        inventories = _inventory(archives, verbose=args.verbose)
        selection = select_starter_assets(inventories, load_selection_document())
        for warning in selection.warnings:
            _log(f"  ~ {warning}")

        if args.dry_run:
            report = _report(args, sources, archives, selection, [])
            _emit(args, report)
            _log("dry run: nothing written")
            return EXIT_OK if not selection.missing_required else EXIT_CURATION

        installed = _install_all(args, sources, archives, selection)
        _finalize(args, sources, archives, selection, installed)
        report = _report(args, sources, archives, selection, installed)
        write_report(args.dest, report)
        _emit(args, report)

        if selection.missing_required:
            return EXIT_CURATION
        if args.preset == "starter" and not _rigged(installed):
            _log("error: starter preset installed zero rig-verified characters")
            return EXIT_CURATION
        return EXIT_OK
    finally:
        if not args.keep_cache and cache_dir.is_dir():
            _wipe(cache_dir)


def _acquire_archive(source, args, cache_dir, *, opener, resolver):
    if args.from_dir is not None:
        match = _match_local_zip(source, args.from_dir)
        if match is None:
            _log(f"  ~ {source.id}: no local ZIP in {args.from_dir}")
            return None
        _log(f"  {source.id}: {match.name}")
        return match, LockSource(source.page_url, "", _sha256(match), source.license)

    archive_url = resolver(source.page_url, opener)
    cache_dir.mkdir(parents=True, exist_ok=True)
    target = cache_dir / Path(archive_url).name
    _log(f"  {source.id}: {archive_url}")
    result = download_archive(archive_url, target, opener=opener)
    return result.path, LockSource(source.page_url, result.final_url, result.sha256, source.license)


def _match_local_zip(source: SourceDefinition, folder: Path) -> Path | None:
    from .curation import normalize_stem

    needle = normalize_stem(source.name)
    hits = [
        zip_path for zip_path in sorted(folder.glob("*.zip"))
        if needle and needle in normalize_stem(zip_path.stem)
    ]
    if len(hits) > 1:
        raise BootstrapError(
            f"{source.id}: {len(hits)} local ZIPs match {source.name!r}: {[h.name for h in hits]}",
            exit_code=EXIT_CONFIG,
        )
    return hits[0] if hits else None


def _inventory(archives, *, verbose: bool) -> dict[str, SourceInventory]:
    out: dict[str, SourceInventory] = {}
    for source_id, (archive_path, lock_source) in archives.items():
        inspected: list[InspectedMember] = []
        for member in list_glb_members(archive_path):
            try:
                inspected.append(InspectedMember(member, inspect_glb_member(member)))
            except BootstrapError as exc:
                if verbose:
                    _log(f"    skip {member.name}: {exc}")
        out[source_id] = SourceInventory(source_id, lock_source.page_url, tuple(inspected))
        _log(f"  {source_id}: {len(inspected)} GLB member(s)")
    return out


def _install_all(args, sources, archives, selection) -> list[InstalledAsset]:
    page_by_id = {s.id: s.page_url for s in sources}
    installed: list[InstalledAsset] = []
    for asset in selection.selected:
        result = install_selected_asset(
            args.dest, asset, update=args.update,
            source_page_url=page_by_id.get(asset.source_id, ""),
        )
        installed.append(result)
        _log(f"  {result.status:<9} {asset.asset_id}  <- {asset.member.name}")
    return installed


def _finalize(args, sources, archives, selection, installed) -> None:
    from datetime import datetime, timezone

    lock_sources = {sid: lock for sid, (_, lock) in archives.items()}
    write_lockfile(args.dest, lock_sources, installed)
    write_sources_md(
        args.dest, lock_sources, installed,
        install_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        source_names={s.id: s.name for s in sources},
    )


def _report(args, sources, archives, selection, installed) -> dict:
    return build_report(
        preset=args.preset,
        sources_total=len(sources),
        sources_resolved=len(archives),
        archives_downloaded=len(archives) if args.download else 0,
        archives_verified=len(archives),
        selection=selection,
        installed=installed,
    )


def _emit(args, report: dict) -> None:
    if args.as_json:
        print(json.dumps(report, ensure_ascii=False))
    else:
        print(render_report_text(report))


# -- helpers ------------------------------------------------------------

def _resolve_library(dest) -> Path:
    from ..storage import resolve_library_root

    return resolve_library_root(dest)


def _rigged(installed) -> int:
    return sum(1 for a in installed if a.rig_status == "rigged")


def _empty_selection():
    from .curation import SelectionResult

    return SelectionResult(selected=(), warnings=(), missing_required=())


def _sha256(path: Path) -> str:
    import hashlib

    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _wipe(folder: Path) -> None:
    import shutil

    shutil.rmtree(folder, ignore_errors=True)


def main(argv: list[str] | None = None) -> int:
    return run(argv)
