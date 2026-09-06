"""Deterministic fingerprint calculation for reconstruction inputs and cache keys."""

from __future__ import annotations

import hashlib
import json
from typing import Any

from omnicam.reconstruction.settings import ReconstructionSettings

GEOMETRY_SETTINGS_KEYS = (
    "detect_ground",
    "detect_walls",
    "discontinuity_threshold",
    "mode",
    "provider",
    "quality",
    "recover_fov",
    "scene_scale",
    "source_texture",
    "triangle_budget",
)


def compute_reconstruction_fingerprint(
    *,
    source_fingerprint: str,
    provider: str,
    settings: ReconstructionSettings | dict[str, Any],
    version: int = 1,
) -> str:
    """Compute a deterministic 20-character hex SHA-256 fingerprint."""
    raw_settings = (
        settings.to_dict() if isinstance(settings, ReconstructionSettings) else dict(settings)
    )

    filtered_settings = {k: raw_settings[k] for k in GEOMETRY_SETTINGS_KEYS if k in raw_settings}

    payload = {
        "filtered_settings": filtered_settings,
        "provider": str(provider),
        "source_fingerprint": str(source_fingerprint),
        "version": int(version),
    }

    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()[:20]
