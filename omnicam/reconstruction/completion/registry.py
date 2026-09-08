"""Completion provider registry."""

from __future__ import annotations

from typing import Any

from ..errors import ReconProviderUnavailableError
from .base import CompletionProvider

_REGISTRY: dict[str, Any] = {}


def register_completion_provider(provider_id: str, provider: Any) -> None:
    _REGISTRY[provider_id] = provider


def get_completion_provider(provider_id: str) -> CompletionProvider:
    _ensure_defaults()
    if provider_id not in _REGISTRY:
        raise ReconProviderUnavailableError(
            f"Unknown completion provider {provider_id!r}. Available: {list_completion_providers()}"
        )
    target = _REGISTRY[provider_id]
    if isinstance(target, type) or callable(target):
        return target()
    return target


def list_completion_providers() -> list[str]:
    _ensure_defaults()
    return sorted(_REGISTRY.keys())


def _ensure_defaults() -> None:
    if "fake" not in _REGISTRY:
        from .fake import FakeCompletionProvider

        _REGISTRY["fake"] = FakeCompletionProvider
    if "sam3d_objects" not in _REGISTRY:
        try:
            from .sam3d_objects import Sam3dObjectsCompletionProvider
        except ImportError:
            pass
        else:
            _REGISTRY["sam3d_objects"] = Sam3dObjectsCompletionProvider
