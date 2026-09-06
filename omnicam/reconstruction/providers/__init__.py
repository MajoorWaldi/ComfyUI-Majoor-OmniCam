"""Reconstruction providers package and registry."""

from __future__ import annotations

from typing import Any

from omnicam.reconstruction.errors import ReconProviderUnavailableError

from .base import CancelToken, ProgressSink, ProviderCapabilities, ReconstructionProvider

_REGISTRY: dict[str, Any] = {}


def register_provider(provider_id: str, provider: Any) -> None:
    """Register a reconstruction provider class or instance."""
    _REGISTRY[provider_id] = provider


def get_provider(provider_id: str) -> ReconstructionProvider:
    """Retrieve and instantiate a registered reconstruction provider."""
    _ensure_defaults()
    if provider_id not in _REGISTRY:
        raise ReconProviderUnavailableError(
            f"Unknown reconstruction provider {provider_id!r}. Available providers: {list_providers()}"
        )

    target = _REGISTRY[provider_id]
    if isinstance(target, type) or callable(target):
        return target()
    return target


def list_providers() -> list[str]:
    """Return sorted list of registered provider IDs."""
    _ensure_defaults()
    return sorted(_REGISTRY.keys())


def _ensure_defaults() -> None:
    """Ensure built-in providers are registered."""
    if "comfy_moge" not in _REGISTRY:
        from .comfy_moge import ComfyMoGeProvider

        _REGISTRY["comfy_moge"] = ComfyMoGeProvider


__all__ = [
    "CancelToken",
    "ProgressSink",
    "ProviderCapabilities",
    "ReconstructionProvider",
    "get_provider",
    "list_providers",
    "register_provider",
]
