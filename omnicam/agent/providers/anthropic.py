"""Native Anthropic Messages adapter (design spec section 3).

Deliberately does not force temperature/top_p/top_k from a global OmniCam
setting -- provider-specific parameter support changes between model
families, so the planner sends only model/messages/max_tokens.
"""

from __future__ import annotations

import json

from .models import ProviderConfig, ProviderResponse
from .network import NetworkPolicyError, endpoint_is_custom, guarded_client_session, guarded_request

DEFAULT_BASE_URL = "https://api.anthropic.com"
ANTHROPIC_VERSION = "2023-06-01"


def _base_url(config: ProviderConfig) -> str:
    return (config.base_url or DEFAULT_BASE_URL).rstrip("/")


def _headers(credential: str | None) -> dict[str, str]:
    headers = {"Content-Type": "application/json", "anthropic-version": ANTHROPIC_VERSION}
    if credential:
        headers["x-api-key"] = credential
    return headers


class AnthropicProvider:
    async def list_models(self, config: ProviderConfig, credential: str | None) -> list[str]:
        url = f"{_base_url(config)}/v1/models"
        is_custom = endpoint_is_custom(config.base_url, DEFAULT_BASE_URL)
        async with guarded_client_session() as session:
            response = await guarded_request(
                session, "GET", url, is_custom_endpoint=is_custom, headers=_headers(credential),
                timeout_seconds=config.timeout_seconds,
            )
        if response.status >= 400:
            raise NetworkPolicyError("PROVIDER_ERROR", f"Anthropic /v1/models returned {response.status}")
        payload = json.loads(response.body.decode("utf-8"))
        return [item["id"] for item in payload.get("data", []) if isinstance(item.get("id"), str)]

    async def probe(self, config: ProviderConfig, credential: str | None) -> None:
        url = f"{_base_url(config)}/v1/models"
        is_custom = endpoint_is_custom(config.base_url, DEFAULT_BASE_URL)
        async with guarded_client_session() as session:
            response = await guarded_request(
                session, "GET", url, is_custom_endpoint=is_custom, headers=_headers(credential),
                timeout_seconds=config.timeout_seconds,
            )
        if response.status >= 400:
            raise NetworkPolicyError("PROVIDER_ERROR", f"Anthropic /v1/models returned {response.status}")

    async def complete(
        self, request: str, config: ProviderConfig, credential: str | None
    ) -> ProviderResponse:
        url = f"{_base_url(config)}/v1/messages"
        body = {
            "model": config.model,
            "max_tokens": config.max_output_tokens,
            "messages": [{"role": "user", "content": request}],
        }
        is_custom = endpoint_is_custom(config.base_url, DEFAULT_BASE_URL)
        async with guarded_client_session() as session:
            response = await guarded_request(
                session, "POST", url, is_custom_endpoint=is_custom, headers=_headers(credential),
                json_body=body, timeout_seconds=config.timeout_seconds,
            )
        if response.status >= 400:
            raise NetworkPolicyError("PROVIDER_ERROR", f"Anthropic /v1/messages returned {response.status}")
        payload = json.loads(response.body.decode("utf-8"))
        text = "".join(
            part.get("text", "") for part in payload.get("content") or [] if part.get("type") == "text"
        )
        usage = payload.get("usage") or {}
        return ProviderResponse(
            text=text,
            model=payload.get("model", config.model),
            usage={
                "input_tokens": int(usage.get("input_tokens", 0) or 0),
                "output_tokens": int(usage.get("output_tokens", 0) or 0),
            },
        )
