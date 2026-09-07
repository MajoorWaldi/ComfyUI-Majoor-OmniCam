"""Optional hidden-volume completion providers (SAM 3D Objects)."""

from __future__ import annotations

from .alignment import merge_completion_into_blockout
from .apply import CompletionOutcome, apply_completion_policy, select_completion_objects
from .base import CompletedObjectEvidence, CompletionCapabilities, CompletionProvider
from .registry import (
    get_completion_provider,
    list_completion_providers,
    register_completion_provider,
)

__all__ = [
    "CompletedObjectEvidence",
    "CompletionCapabilities",
    "CompletionOutcome",
    "CompletionProvider",
    "apply_completion_policy",
    "get_completion_provider",
    "list_completion_providers",
    "merge_completion_into_blockout",
    "register_completion_provider",
    "select_completion_objects",
]
