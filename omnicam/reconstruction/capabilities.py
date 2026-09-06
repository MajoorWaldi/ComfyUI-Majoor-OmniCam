"""Reconstruction feature capabilities aggregation."""

from __future__ import annotations

from typing import Any

from omnicam.reconstruction.providers import get_provider, list_providers


def get_reconstruction_capabilities() -> dict[str, Any]:
    """Return aggregated capabilities for all registered reconstruction providers."""
    providers_list: list[dict[str, Any]] = []
    recommended_provider: str | None = None
    first_available: str | None = None

    for pid in list_providers():
        try:
            prov = get_provider(pid)
            caps = prov.capabilities()
            caps_dict = caps.to_dict()
            providers_list.append(caps_dict)

            if caps.available:
                if first_available is None:
                    first_available = pid
                if pid == "comfy_moge" or (caps.recommended and recommended_provider is None):
                    recommended_provider = pid
        except Exception:  # noqa: BLE001
            providers_list.append(
                {
                    "provider_id": pid,
                    "available": False,
                    "modes": ["geometry"],
                    "source_kinds": ["annotated_input"],
                    "reason": "Failed to query provider capabilities",
                    "recommended": False,
                    "metadata": {},
                }
            )

    if recommended_provider is None:
        recommended_provider = first_available

    return {
        "feature": "scene_reconstruction",
        "version": 1,
        "providers": providers_list,
        "recommended_provider": recommended_provider,
    }
