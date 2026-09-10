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
    lines = ["OmniCam Starter Asset Bootstrap", "-" * 40]
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
        lines.append(f"[{'OK ' if verify['ok'] else 'FAIL'}] verify {verify['checked']} asset(s)")
        lines.extend(f"  ! {i['kind']}: {i['detail']}" for i in verify["issues"])
    return "\n".join(lines)


def write_sources_md(
    input_root: Path | str | None,
    sources: dict[str, LockSource],  # kept for signature compatibility; unused
    installed: list[InstalledAsset],  # kept for signature compatibility; unused
    *,
    install_date: str,
    source_names: dict[str, str] | None = None,
) -> Path:
    """Regenerate ``SOURCES.md`` from the full lockfile so a later
    ``--character-dir`` import never clobbers the Kenney provenance."""
    from .lockfile import load_lockfile

    ensure_library_tree(input_root)
    path = resolve_library_root(input_root) / SOURCES_RELATIVE
    names = source_names or {}
    try:
        lock = load_lockfile(input_root)
    except Exception:  # noqa: BLE001 -- a missing lock just yields an empty file
        lock = {"sources": {}, "assets": {}}

    lock_sources = lock.get("sources") or {}
    by_source: dict[str, list[dict]] = {}
    for asset_id, entry in (lock.get("assets") or {}).items():
        by_source.setdefault(str(entry.get("source", "?")), []).append({**entry, "id": asset_id})

    out = [
        "# OmniCam local asset library sources",
        "",
        "Installed locally by OmniCam's explicit asset bootstrap "
        f"(regenerated {install_date}). Not vendored in the Git repository.",
        "",
    ]
    for source_id in sorted(by_source):
        meta = lock_sources.get(source_id, {})
        label = names.get(source_id, meta.get("page_url") or source_id)
        page = meta.get("page_url") or ""
        out.append(f"## {label}{f' — {page}' if page else ''}")
        if meta.get("license"):
            out.append(f"- license: {meta['license']}")
        if meta.get("archive_sha256"):
            out.append(f"- archive sha256: {meta['archive_sha256']}")
        for asset in sorted(by_source[source_id], key=lambda a: a["file"]):
            out.append(f"- {asset['file']}  ({asset['id']})")
        out.append("")
    path.write_text("\n".join(out), encoding="utf-8")
    return path


def _category_for(asset: InstalledAsset) -> str:
    prefix = asset.output.split("/", 1)[0]
    return prefix or "props"
