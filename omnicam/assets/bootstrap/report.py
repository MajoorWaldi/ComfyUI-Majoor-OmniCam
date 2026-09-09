"""Machine + human bootstrap report and the ``SOURCES.md`` provenance doc.

``build_report`` folds the selection / install / verify results into a dict;
``write_report`` persists it to
``<input>/omnicam/library/.bootstrap/last-report.json``; ``render_report_text``
is the CLI summary from plan section 21. ``write_sources_md`` writes the
human-readable provenance file (plan section 20) -- attribution is not required
by Kenney's CC0 but provenance is still recorded.
"""

from __future__ import annotations

import json
from pathlib import Path

from ..storage import ensure_library_tree, resolve_library_root
from .curation import SelectionResult
from .installer import InstalledAsset
from .lockfile import LockSource, VerifyResult

REPORT_RELATIVE = Path(".bootstrap") / "last-report.json"
SOURCES_RELATIVE = Path("SOURCES.md")

_CATEGORY_LABELS = {
    "characters": "Characters",
    "props": "Props",
    "environments": "Environments",
    "vehicles": "Vehicles",
}


def build_report(
    *,
    preset: str,
    sources_total: int,
    sources_resolved: int,
    archives_downloaded: int,
    archives_verified: int,
    selection: SelectionResult,
    installed: list[InstalledAsset],
    verify: VerifyResult | None = None,
    extra_warnings: tuple[str, ...] = (),
) -> dict:
    by_category: dict[str, int] = {}
    for asset in installed:
        if asset.status == "conflict":
            continue
        category = _category_for(asset)
        by_category[category] = by_category.get(category, 0) + 1
    rigged = sum(1 for a in installed if a.rig_status == "rigged")
    animations = sorted({clip for a in installed for clip in a.animation_ids})
    conflicts = [a.asset_id for a in installed if a.status == "conflict"]
    warnings = list(selection.warnings) + list(extra_warnings)
    if conflicts:
        warnings.append(f"{len(conflicts)} asset(s) conflicted and were left unchanged: {conflicts}")

    report = {
        "preset": preset,
        "sources": {"total": sources_total, "resolved": sources_resolved},
        "archives": {"downloaded": archives_downloaded, "verified": archives_verified},
        "installed": {
            "total": sum(by_category.values()),
            "by_category": by_category,
            "rigged_characters": rigged,
        },
        "animations_discovered": len(animations),
        "thumbnails_pending": sum(by_category.values()),
        "missing_required": list(selection.missing_required),
        "warnings": warnings,
        "assets": [
            {
                "id": a.asset_id,
                "file": a.output,
                "status": a.status,
                "source": a.source_id,
                "rig_status": a.rig_status,
                "animations": list(a.animation_ids),
            }
            for a in sorted(installed, key=lambda a: a.asset_id)
        ],
    }
    if verify is not None:
        report["verify"] = {
            "ok": verify.ok,
            "checked": verify.checked,
            "issues": [
                {"id": i.asset_id, "kind": i.kind, "detail": i.detail} for i in verify.issues
            ],
        }
    return report


def write_report(input_root: Path | str | None, report: dict) -> Path:
    ensure_library_tree(input_root)
    path = resolve_library_root(input_root) / REPORT_RELATIVE
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_bytes(json.dumps(report, ensure_ascii=False, indent=2).encode("utf-8"))
    tmp.replace(path)
    return path


def render_report_text(report: dict) -> str:
    lines = ["OmniCam Starter Asset Bootstrap", "─" * 40]
    src, arc, inst = report["sources"], report["archives"], report["installed"]
    lines.append(f"Sources resolved        {src['resolved']} / {src['total']}")
    lines.append(f"Archives downloaded     {arc['downloaded']}")
    lines.append(f"Archives verified       {arc['verified']}")
    lines.append("")
    lines.append(f"Installed assets       {inst['total']}")
    for category, count in sorted(inst["by_category"].items()):
        lines.append(f"  {_CATEGORY_LABELS.get(category, category):<18} {count}")
    lines.append(f"  {'Rigged':<18} {inst['rigged_characters']}")
    lines.append("")
    lines.append(f"Animations discovered  {report['animations_discovered']}")
    lines.append(f"Thumbnails pending     {report['thumbnails_pending']}")
    if report["missing_required"]:
        lines.append("")
        lines.append("Missing required")
        lines.extend(f"  - {item}" for item in report["missing_required"])
    if report["warnings"]:
        lines.append("")
        lines.append("Warnings")
        lines.extend(f"  - {item}" for item in report["warnings"])
    verify = report.get("verify")
    if verify is not None:
        lines.append("")
        lines.append(f"{'✓' if verify['ok'] else '✗'} verify {verify['checked']} asset(s)")
        lines.extend(f"  ! {i['kind']}: {i['detail']}" for i in verify["issues"])
    return "\n".join(lines)


def write_sources_md(
    input_root: Path | str | None,
    sources: dict[str, LockSource],
    installed: list[InstalledAsset],
    *,
    install_date: str,
    source_names: dict[str, str] | None = None,
) -> Path:
    ensure_library_tree(input_root)
    path = resolve_library_root(input_root) / SOURCES_RELATIVE
    names = source_names or {}
    by_source: dict[str, list[InstalledAsset]] = {}
    for asset in installed:
        if asset.status != "conflict":
            by_source.setdefault(asset.source_id, []).append(asset)

    out = [
        "# OmniCam local asset library sources",
        "",
        "The files below were installed locally by OmniCam's explicit asset "
        "bootstrap. They are not vendored in the OmniCam Git repository.",
        "",
        "## Kenney — CC0",
        "",
    ]
    for source_id in sorted(by_source):
        source = sources.get(source_id)
        label = names.get(source_id, source_id)
        page = source.page_url if source else ""
        sha = source.archive_sha256 if source else ""
        out.append(f"- {label} — {page}")
        out.append(f"  - license: {source.license if source else 'CC0-1.0'}")
        if sha:
            out.append(f"  - archive sha256: {sha}")
        out.append(f"  - installed: {install_date}")
        for asset in sorted(by_source[source_id], key=lambda a: a.output):
            out.append(f"  - {asset.output}  ({asset.asset_id})")
        out.append("")
    path.write_text("\n".join(out), encoding="utf-8")
    return path


def _category_for(asset: InstalledAsset) -> str:
    prefix = asset.output.split("/", 1)[0]
    return prefix or "props"
