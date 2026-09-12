"""Ollama adapter: POST /api/chat, GET /api/tags (design spec section 3).

The default local provider -- no credential required, nothing leaves the
machine. ``stream`` is always false: the planner consumes one complete JSON
action per step, never a token stream.
"""

from __future__ import annotations

import json

from .models import ProviderConfig, ProviderResponse
from .network import NetworkPolicyError, guarded_request

DEFAULT_BASE_URL = "http://127.0.0.1:11434"


def _base_url(config: ProviderConfig) -> str:
    return (config.base_url or DEFAULT_BASE_URL).rstrip("/")


class OllamaProvider:
    async def list_models(self, config: ProviderConfig, credential: str | None) -> list[str]:
        import aiohttp

        url = f"{_base_url(config)}/api/tags"
        async with aiohttp.ClientSession() as session:
            response = await guarded_request(
                session, "GET", url, is_custom_endpoint=True, timeout_seconds=config.timeout_seconds,
            )
        if response.status >= 400:
            raise NetworkPolicyError("PROVIDER_ERROR", f"Ollama /api/tags returned {response.status}")
        payload = json.loads(response.body.decode("utf-8"))
        return [item["name"] for item in payload.get("models", []) if isinstance(item.get("name"), str)]

    async def complete(
        self, request: str, config: ProviderConfig, credential: str | None
    ) -> ProviderResponse:
        import aiohttp

        url = f"{_base_url(config)}/api/chat"
        body = {
            "model": config.model,
            "messages": [{"role": "user", "content": request}],
            "stream": False,
        }
        async with aiohttp.ClientSession() as session:
            response = await guarded_request(
                session, "POST", url, is_custom_endpoint=True, json_body=body,
                timeout_seconds=config.timeout_seconds,
            )
        if response.status >= 400:
            raise NetworkPolicyError("PROVIDER_ERROR", f"Ollama /api/chat returned {response.status}")
        payload = json.loads(response.body.decode("utf-8"))
        text = (payload.get("message") or {}).get("content", "")
        return ProviderResponse(
            text=text,
            model=payload.get("model", config.model),
            usage={
                "input_tokens": int(payload.get("prompt_eval_count", 0) or 0),
                "output_tokens": int(payload.get("eval_count", 0) or 0),
            },
        )
