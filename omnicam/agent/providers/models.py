"""Normalized provider contract shared by every adapter.

Provider-native request/response shapes (OpenAI's Responses API, Anthropic's
Messages API, Ollama's /api/chat, ...) must never escape this module -- every
adapter translates into/out of ProviderConfig/ProviderResponse so the planner
never has to know which provider it is talking to.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Protocol

ProviderId = Literal["openai", "openai_compatible", "anthropic", "ollama"]

PROVIDER_IDS: tuple[ProviderId, ...] = ("openai", "openai_compatible", "anthropic", "ollama")


@dataclass(frozen=True, slots=True)
class ProviderConfig:
    provider_id: ProviderId
    model: str
    base_url: str
    max_output_tokens: int = 4096
    timeout_seconds: int = 120


@dataclass(frozen=True, slots=True)
class ProviderResponse:
    text: str
    model: str
    usage: dict[str, int]


class AgentProvider(Protocol):
    async def list_models(self, config: ProviderConfig, credential: str | None) -> list[str]: ...

    async def complete(
        self, request: str, config: ProviderConfig, credential: str | None
    ) -> ProviderResponse: ...

    async def probe(self, config: ProviderConfig, credential: str | None) -> None:
        """Raise on policy/connectivity/auth failure; return None on success.

        Unlike ``list_models`` (which may degrade a discovery failure to an
        empty list for a nicer model-picker UX), ``probe`` answers only one
        question -- "did we reach the configured endpoint under the current
        network policy?" -- and must never swallow a real failure."""
        ...
