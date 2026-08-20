"""Canonical Editor State to Track compiler entrypoint."""

from __future__ import annotations

from typing import Any

from .editor_state import editor_state_to_track
from .track import OmniCamTrack


def compile_editor_state(payload: dict[str, Any], camera_id: str | None = None) -> OmniCamTrack:
    """Migrate, validate, select the playblast camera and compile canonical data."""
    return OmniCamTrack.from_dict(editor_state_to_track(payload, camera_id=camera_id, validate=True))
