"""Native OpenAI adapter: POST /responses, GET /models (design spec section 3).

Native OpenAI traffic never goes through the OpenAI-compatible adapter --
that one exists for third-party servers that only approximate this API.
"""

from __future__ import annotations

import json

from .models import ProviderConfig, ProviderResponse
from .network import NetworkPolicyError, guarded_request

DEFAULT_BASE_URL = "https://api.openai.com/v1"


def _base_url(config: ProviderConfig) -> str:
    return (config.base_url or DEFAULT_BASE_URL).rstrip("/")


def _headers(credential: str | None) -> dict[str, str]:
    headers = {"Content-Type": "application/json"}
    if credential:
        headers["Authorization"] = f"Bearer {credential}"
    return headers


def _extract_text(payload: dict) -> str:
    if isinstance(payload.get("output_text"), str):
        return payload["output_text"]

    chunks: list[str] = []
    for item in payload.get("output") or []:
        for part in item.get("content") or []:
            if isinstance(part.get("text"), str):
                chunks.append(part["text"])
    return "".join(chunks)


class OpenAIProvider:
    async def list_models(self, config: ProviderConfig, credential: str | None) -> list[str]:
        import aiohttp

        url = f"{_base_url(config)}/models"
        async with aiohttp.ClientSession() as session:
            response = await guarded_request(
                session, "GET", url, is_custom_endpoint=False, headers=_headers(credential),
                timeout_seconds=config.timeout_seconds,
            )
        if response.status >= 400:
            raise NetworkPolicyError("PROVIDER_ERROR", f"OpenAI /models returned {response.status}")
        payload = json.loads(response.body.decode("utf-8"))
        return [item["id"] for item in payload.get("data", []) if isinstance(item.get("id"), str)]

    async def complete(
        self, request: str, config: ProviderConfig, credential: str | None
    ) -> ProviderResponse:
        import aiohttp

        url = f"{_base_url(config)}/responses"
        body = {
            "model": config.model,
            "input": [{"role": "user", "content": request}],
            "max_output_tokens": config.max_output_tokens,
        }
        async with aiohttp.ClientSession() as session:
            response = await guarded_request(
                session, "POST", url, is_custom_endpoint=False, headers=_headers(credential),
                json_body=body, timeout_seconds=config.timeout_seconds,
            )
        if response.status >= 400:
            raise NetworkPolicyError("PROVIDER_ERROR", f"OpenAI /responses returned {response.status}")
        payload = json.loads(response.body.decode("utf-8"))
        usage = payload.get("usage") or {}
        return ProviderResponse(
            text=_extract_text(payload),
            model=payload.get("model", config.model),
            usage={
                "input_tokens": int(usage.get("input_tokens", 0) or 0),
                "output_tokens": int(usage.get("output_tokens", 0) or 0),
            },
        )
