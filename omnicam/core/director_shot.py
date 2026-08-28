"""Pure validation helpers for the Director-to-Sequencer shot contract."""

from __future__ import annotations

import copy
from typing import Any

from .validation import validate_track_payload

SHOT_SCHEMA_VERSION = 1
SHOT_COLLECTION_SCHEMA_VERSION = 1
MAX_COLLECTION_SHOTS = 32
MAX_SHOT_TEXT_LENGTH = 4_096


def build_director_shot(
    *,
    shot_id: str,
    name: str,
    video: Any,
    audio: Any,
    camera_track: dict[str, Any],
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build a validated runtime shot packet without inspecting media objects."""
    return validate_director_shot({
        "schema_version": SHOT_SCHEMA_VERSION,
        "kind": "omnicam_shot",
        "id": shot_id,
        "name": name,
        "video": video,
        "audio": audio,
        "camera_track": camera_track,
        "metadata": metadata or {},
    })


def validate_director_shot(payload: Any) -> dict[str, Any]:
    """Validate the versioned shot envelope while preserving runtime media values."""
    if not isinstance(payload, dict):
        raise ValueError("Director shot must be an object")
    if payload.get("schema_version") != SHOT_SCHEMA_VERSION:
        raise ValueError(f"Unsupported Director shot schema_version: {payload.get('schema_version')!r}")
    if payload.get("kind") != "omnicam_shot":
        raise ValueError("Director shot kind must be 'omnicam_shot'")

    shot_id = str(payload.get("id") or "director_shot")[:MAX_SHOT_TEXT_LENGTH]
    name = str(payload.get("name") or "Director Shot")[:MAX_SHOT_TEXT_LENGTH]
    metadata = payload.get("metadata")
    return {
        "schema_version": SHOT_SCHEMA_VERSION,
        "kind": "omnicam_shot",
        "id": shot_id,
        "name": name,
        "video": payload.get("video"),
        "audio": payload.get("audio"),
        "camera_track": validate_track_payload(raw_track if isinstance(raw_track := payload.get("camera_track"), dict) else {}),
        "metadata": copy.deepcopy(metadata) if isinstance(metadata, dict) else {},
    }


def build_shot_collection(shots: list[dict[str, Any]], metadata: dict[str, Any] | None = None) -> dict[str, Any]:
    """Build the single-cable payload containing every authored camera shot."""
    return validate_shot_collection({
        "schema_version": SHOT_COLLECTION_SCHEMA_VERSION,
        "kind": "omnicam_shot_collection",
        "shots": shots,
        "metadata": metadata or {},
    })


def validate_shot_collection(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("Director shot collection must be an object")
    if payload.get("schema_version") != SHOT_COLLECTION_SCHEMA_VERSION:
        raise ValueError(f"Unsupported shot collection schema_version: {payload.get('schema_version')!r}")
    if payload.get("kind") != "omnicam_shot_collection":
        raise ValueError("Director shot collection kind must be 'omnicam_shot_collection'")
    raw_shots = payload.get("shots")
    if not isinstance(raw_shots, list) or not raw_shots:
        raise ValueError("Director shot collection must contain at least one shot")
    if len(raw_shots) > MAX_COLLECTION_SHOTS:
        raise ValueError(f"Director shot collection exceeds {MAX_COLLECTION_SHOTS} shots")
    metadata = payload.get("metadata")
    return {
        "schema_version": SHOT_COLLECTION_SCHEMA_VERSION,
        "kind": "omnicam_shot_collection",
        "shots": [validate_director_shot(shot) for shot in raw_shots],
        "metadata": copy.deepcopy(metadata) if isinstance(metadata, dict) else {},
    }
