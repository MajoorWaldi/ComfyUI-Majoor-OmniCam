"""Semantic instance segmentation providers for the blockout pipeline."""

from __future__ import annotations

from .base import SegmentationCapabilities, SegmentationProvider
from .registry import (
    get_segmentation_provider,
    list_segmentation_providers,
    register_segmentation_provider,
)
from .taxonomy import DEFAULT_BLOCKOUT_LABELS, resolve_semantic_labels

__all__ = [
    "DEFAULT_BLOCKOUT_LABELS",
    "SegmentationCapabilities",
    "SegmentationProvider",
    "get_segmentation_provider",
    "list_segmentation_providers",
    "register_segmentation_provider",
    "resolve_semantic_labels",
]
