"""The Provider Registry: maps a provider id to its adapter instance and
publishes safe (credential-free) capability metadata (design spec section 11).
"""

from __future__ import annotations

from .anthropic import AnthropicProvider
from .models import AgentProvider
from .ollama import DEFAULT_BASE_URL as OLLAMA_DEFAULT_BASE_URL
from .ollama import OllamaProvider
from .openai import DEFAULT_BASE_URL as OPENAI_DEFAULT_BASE_URL
from .openai import OpenAIProvider
from .openai_compat import DEFAULT_BASE_URL as OPENAI_COMPAT_DEFAULT_BASE_URL
from .openai_compat import OpenAICompatibleProvider

PROVIDERS: dict[str, AgentProvider] = {
    "openai": OpenAIProvider(),
    "openai_compatible": OpenAICompatibleProvider(),
    "anthropic": AnthropicProvider(),
    "ollama": OllamaProvider(),
}

_CAPABILITIES: dict[str, dict] = {
    "ollama": {
        "id": "ollama",
        "label": "Ollama / local",
        "requires_credential": False,
        "supports_model_discovery": True,
        "default_base_url": OLLAMA_DEFAULT_BASE_URL,
    },
    "openai": {
        "id": "openai",
        "label": "OpenAI",
        "requires_credential": True,
        "supports_model_discovery": True,
        "default_base_url": OPENAI_DEFAULT_BASE_URL,
    },
    "openai_compatible": {
        "id": "openai_compatible",
        "label": "OpenAI-compatible / local",
        "requires_credential": False,
        "supports_model_discovery": True,
        "default_base_url": OPENAI_COMPAT_DEFAULT_BASE_URL,
    },
    "anthropic": {
        "id": "anthropic",
        "label": "Anthropic",
        "requires_credential": True,
        "supports_model_discovery": True,
        "default_base_url": "https://api.anthropic.com",
    },
}


def provider_capabilities() -> list[dict]:
    """Safe, credential-free capability metadata for every known provider,
    in a stable order matching Settings > OmniCam > Agent > Provider."""
    return [dict(_CAPABILITIES[provider_id]) for provider_id in ("ollama", "openai", "openai_compatible", "anthropic")]


def get_provider(provider_id: str) -> AgentProvider:
    provider = PROVIDERS.get(provider_id)
    if provider is None:
        raise KeyError(f"Unknown provider: {provider_id!r}")
    return provider
