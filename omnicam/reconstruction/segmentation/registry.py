"""Segmentation provider registry (mirrors ``reconstruction.providers``)."""

from __future__ import annotations

from typing import Any

from ..errors import ReconProviderUnavailableError
from .base import SegmentationProvider

_REGISTRY: dict[str, Any] = {}


def register_segmentation_provider(provider_id: str, provider: Any) -> None:
    _REGISTRY[provider_id] = provider


def get_segmentation_provider(provider_id: str) -> SegmentationProvider:
    _ensure_defaults()
    if provider_id not in _REGISTRY:
        raise ReconProviderUnavailableError(
            f"Unknown segmentation provider {provider_id!r}. Available: {list_segmentation_providers()}"
        )
    target = _REGISTRY[provider_id]
    if isinstance(target, type) or callable(target):
        return target()
    return target


def list_segmentation_providers() -> list[str]:
    _ensure_defaults()
    return sorted(_REGISTRY.keys())


def _ensure_defaults() -> None:
    if "fake" not in _REGISTRY:
        from .fake import FakeSegmentationProvider

        _REGISTRY["fake"] = FakeSegmentationProvider
    if "comfy_sam3" not in _REGISTRY:
        try:
            from .comfy_sam3 import ComfySam3Provider
        except ImportError:  # adapter not present yet / optional deps missing
            pass
        else:
            _REGISTRY["comfy_sam3"] = ComfySam3Provider
