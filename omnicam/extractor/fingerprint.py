"""A deterministic identity for one extractor result.

The Director uses this to answer one question: "is this the same solve I
already imported?". That is what lets a connected Extractor cable refresh the
camera when the solve genuinely changed, and stay out of the way when it did
not -- so a user's hand-edited keys survive every graph execution.

It is not a signature and proves nothing about provenance.
"""

from __future__ import annotations

import copy
import hashlib
import json
from typing import Any

FINGERPRINT_KEY = "extractor_fingerprint"


def track_fingerprint(track: dict[str, Any]) -> str:
    """SHA-256 over the canonical track, excluding any fingerprint already in it.

    Hashing the field that is about to hold the hash would make the value
    depend on whether it had been stamped yet, so a saved workflow and a fresh
    solve of the same footage would disagree.
    """
    payload = copy.deepcopy(track)
    metadata = payload.get("metadata")
    if isinstance(metadata, dict):
        metadata.pop(FINGERPRINT_KEY, None)
    stable = json.dumps(
        payload,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    ).encode("utf-8")
    return hashlib.sha256(stable).hexdigest()


def stamp_fingerprint(track: dict[str, Any]) -> str:
    """Write the fingerprint into ``metadata`` and return it."""
    fingerprint = track_fingerprint(track)
    metadata = track.setdefault("metadata", {})
    if not isinstance(metadata, dict):
        metadata = {}
        track["metadata"] = metadata
    metadata[FINGERPRINT_KEY] = fingerprint
    return fingerprint
