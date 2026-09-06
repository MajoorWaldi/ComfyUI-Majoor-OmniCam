"""Tests for provider registry and capabilities aggregation."""

from __future__ import annotations

import pytest

from omnicam.reconstruction.capabilities import get_reconstruction_capabilities
from omnicam.reconstruction.errors import ReconProviderUnavailableError
from omnicam.reconstruction.providers import (
    get_provider,
    list_providers,
    register_provider,
)
from omnicam.reconstruction.providers.base import ProviderCapabilities
from omnicam.reconstruction.providers.comfy_moge import ComfyMoGeProvider


def test_registry_contains_comfy_moge():
    providers = list_providers()
    assert "comfy_moge" in providers
    provider = get_provider("comfy_moge")
    assert isinstance(provider, ComfyMoGeProvider)


def test_unknown_provider_raises():
    with pytest.raises(ReconProviderUnavailableError) as exc_info:
        get_provider("unknown_provider_xyz")
    assert "unknown_provider_xyz" in str(exc_info.value)
    assert exc_info.value.code == "RECON_PROVIDER_UNAVAILABLE"


def test_register_custom_provider():
    class CustomProvider:
        provider_id = "custom_test_provider"

        def capabilities(self):
            return ProviderCapabilities(
                provider_id=self.provider_id,
                available=True,
                modes=["geometry"],
                source_kinds=["annotated_input"],
            )

        def reconstruct(self, source, settings, **kwargs):
            raise NotImplementedError

    register_provider("custom_test_provider", CustomProvider)
    assert "custom_test_provider" in list_providers()
    inst = get_provider("custom_test_provider")
    assert inst.provider_id == "custom_test_provider"


def test_aggregate_capabilities_shape(monkeypatch):
    caps = get_reconstruction_capabilities()
    assert caps["feature"] == "scene_reconstruction"
    assert caps["version"] == 1
    assert isinstance(caps["providers"], list)
    assert any(p["provider_id"] == "comfy_moge" for p in caps["providers"])
    assert "recommended_provider" in caps


def test_recommended_provider_fallback(monkeypatch):
    # Mock all providers unavailable
    class UnavailableProvider:
        provider_id = "comfy_moge"

        def capabilities(self):
            return ProviderCapabilities(
                provider_id="comfy_moge",
                available=False,
                modes=["geometry"],
                source_kinds=["annotated_input"],
                reason="missing checkpoint",
            )

        def reconstruct(self, source, settings, **kwargs):
            raise NotImplementedError

    class AvailableFallback:
        provider_id = "fallback_prov"

        def capabilities(self):
            return ProviderCapabilities(
                provider_id="fallback_prov",
                available=True,
                modes=["geometry"],
                source_kinds=["annotated_input"],
                recommended=True,
            )

        def reconstruct(self, source, settings, **kwargs):
            raise NotImplementedError

    from omnicam.reconstruction import providers as prov_mod

    monkeypatch.setattr(
        prov_mod,
        "_REGISTRY",
        {
            "comfy_moge": UnavailableProvider(),
            "fallback_prov": AvailableFallback(),
        },
    )

    caps = get_reconstruction_capabilities()
    assert caps["recommended_provider"] == "fallback_prov"
