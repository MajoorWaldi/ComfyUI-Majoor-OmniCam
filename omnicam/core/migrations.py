"""Versioned migration registry for OmniCam payloads.

Every versioned schema (MAJOOR_OMNICAM_TRACK, OMNICAM_EDITOR_STATE,
MAJOOR_OMNICAM_SEQUENCE) registers one migration per version step here.
Migrations receive a deep-copied payload and return the payload upgraded by
one schema version. Unknown fields are preserved verbatim so older or richer
documents never silently lose data; canonical serialization decides later
which fields belong to the wire format.
"""

from __future__ import annotations

import copy
from collections.abc import Callable
from typing import Any

Migration = Callable[[dict[str, Any]], dict[str, Any]]

# {(schema_name, from_version): migration to from_version + 1}
MIGRATIONS: dict[tuple[str, int], Migration] = {}

TRACK_SCHEMA = "MAJOOR_OMNICAM_TRACK"
EDITOR_STATE_SCHEMA = "OMNICAM_EDITOR_STATE"
SEQUENCE_SCHEMA = "MAJOOR_OMNICAM_SEQUENCE"

CURRENT_VERSIONS = {
    TRACK_SCHEMA: 1,
    EDITOR_STATE_SCHEMA: 1,
    SEQUENCE_SCHEMA: 1,
}


def register_migration(schema: str, from_version: int, migration: Migration) -> None:
    if (schema, from_version) in MIGRATIONS:
        raise ValueError(f"Duplicate migration for {schema} v{from_version}")
    MIGRATIONS[(schema, from_version)] = migration


def migrate_payload(payload: dict[str, Any], schema: str = TRACK_SCHEMA, target_version: int | None = None) -> dict[str, Any]:
    """Upgrade a payload to the current schema version, preserving unknown fields."""
    if not isinstance(payload, dict):
        raise TypeError(f"{schema} payload must be a JSON object")
    target = target_version if target_version is not None else CURRENT_VERSIONS[schema]
    migrated = copy.deepcopy(payload)
    snake_version = migrated.get("schema_version")
    camel_version = migrated.get("schemaVersion")
    if snake_version is not None and camel_version is not None and int(snake_version or 0) != int(camel_version or 0):
        raise ValueError(f"{schema} payload has conflicting schema versions")
    version = int(snake_version if snake_version is not None else (camel_version or 0) or 0)
    if version > target:
        raise ValueError(f"{schema} schema v{version} is newer than supported v{target}")
    while version < target:
        migration = MIGRATIONS.get((schema, version))
        if migration is None:
            raise ValueError(f"No migration registered for {schema} v{version} → v{version + 1}")
        migrated = migration(migrated)
        next_version = int(migrated.get("schema_version", version) or version)
        if next_version <= version:
            raise ValueError(f"Migration for {schema} v{version} did not advance the schema version")
        version = next_version
    return migrated


def _migrate_track_0_to_1(payload: dict[str, Any]) -> dict[str, Any]:
    """Legacy unversioned payloads: normalize camelCase keys and flag the version."""
    migrated = dict(payload)
    if "durationFrames" in migrated and "duration_frames" not in migrated:
        migrated["duration_frames"] = migrated.pop("durationFrames")
    if "renderMode" in migrated and "render_mode" not in migrated:
        migrated["render_mode"] = migrated.pop("renderMode")
    if "schemaVersion" in migrated and "schema_version" not in migrated:
        migrated.pop("schemaVersion")
    migrated["schema_version"] = 1
    return migrated


def _migrate_sequence_0_to_1(payload: dict[str, Any]) -> dict[str, Any]:
    """Normalize an unversioned legacy camera-sequence envelope."""
    migrated = dict(payload)
    migrated.pop("schemaVersion", None)
    if "durationFrames" in migrated and "duration_frames" not in migrated:
        migrated["duration_frames"] = migrated.pop("durationFrames")
    migrated.setdefault("shots", [])
    migrated.setdefault("metadata", {})
    migrated["schema_version"] = 1
    return migrated


register_migration(TRACK_SCHEMA, 0, _migrate_track_0_to_1)
register_migration(EDITOR_STATE_SCHEMA, 0, _migrate_track_0_to_1)
register_migration(SEQUENCE_SCHEMA, 0, _migrate_sequence_0_to_1)
