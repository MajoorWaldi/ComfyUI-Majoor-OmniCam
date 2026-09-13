"""OpenAI-compatible adapter for LM Studio / vLLM / llama.cpp / OpenRouter-style
local servers (design spec section 3). POST /chat/completions, best-effort
GET /models -- a compatible server may not implement model discovery at all,
so a failure there returns an empty list rather than raising.
"""

from __future__ import annotations

import json

from .models import ProviderConfig, ProviderResponse
from .network import NetworkPolicyError, guarded_client_session, guarded_request

DEFAULT_BASE_URL = "http://127.0.0.1:1234/v1"


def _base_url(config: ProviderConfig) -> str:
    return (config.base_url or DEFAULT_BASE_URL).rstrip("/")


def _headers(credential: str | None) -> dict[str, str]:
    headers = {"Content-Type": "application/json"}
    if credential:
        headers["Authorization"] = f"Bearer {credential}"
    return headers


class OpenAICompatibleProvider:
    async def list_models(self, config: ProviderConfig, credential: str | None) -> list[str]:
        url = f"{_base_url(config)}/models"
        try:
            async with guarded_client_session() as session:
                response = await guarded_request(
                    session, "GET", url, is_custom_endpoint=True, headers=_headers(credential),
                    timeout_seconds=config.timeout_seconds,
                )
            if response.status >= 400:
                return []
            payload = json.loads(response.body.decode("utf-8"))
            return [item["id"] for item in payload.get("data", []) if isinstance(item.get("id"), str)]
        except (NetworkPolicyError, ValueError, OSError):
            return []

    async def probe(self, config: ProviderConfig, credential: str | None) -> None:
        """Unlike list_models(), never swallow a connectivity/policy failure
        into a false "reachable" -- a compatible server that simply doesn't
        implement /models (404/405) is still genuinely reachable, but a
        connection error, timeout, or blocked policy target is not."""
        url = f"{_base_url(config)}/models"
        async with guarded_client_session() as session:
            response = await guarded_request(
                session, "GET", url, is_custom_endpoint=True, headers=_headers(credential),
                timeout_seconds=config.timeout_seconds,
            )
        if response.status in (404, 405):
            return
        if response.status >= 400:
            raise NetworkPolicyError("PROVIDER_ERROR", f"Provider /models returned {response.status}")

    async def complete(
        self, request: str, config: ProviderConfig, credential: str | None
    ) -> ProviderResponse:
        url = f"{_base_url(config)}/chat/completions"
        body = {
            "model": config.model,
            "messages": [{"role": "user", "content": request}],
            "max_tokens": config.max_output_tokens,
        }
        async with guarded_client_session() as session:
            response = await guarded_request(
                session, "POST", url, is_custom_endpoint=True, headers=_headers(credential),
                json_body=body, timeout_seconds=config.timeout_seconds,
            )
        if response.status >= 400:
            raise NetworkPolicyError("PROVIDER_ERROR", f"Provider /chat/completions returned {response.status}")
        payload = json.loads(response.body.decode("utf-8"))
        choices = payload.get("choices") or []
        text = ""
        if choices and isinstance(choices[0].get("message"), dict):
            text = choices[0]["message"].get("content") or ""
        usage = payload.get("usage") or {}
        return ProviderResponse(
            text=text,
            model=payload.get("model", config.model),
            usage={
                "input_tokens": int(usage.get("prompt_tokens", 0) or 0),
                "output_tokens": int(usage.get("completion_tokens", 0) or 0),
            },
        )
