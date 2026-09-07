"""Reconstruction feature capabilities aggregation."""

from __future__ import annotations

from typing import Any

from .providers import get_provider, list_providers


def _geometry_providers() -> tuple[list[dict[str, Any]], str | None]:
    providers_list: list[dict[str, Any]] = []
    recommended_provider: str | None = None
    first_available: str | None = None

    for pid in list_providers():
        try:
            prov = get_provider(pid)
            caps = prov.capabilities()
            providers_list.append(caps.to_dict())
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
    return providers_list, recommended_provider or first_available


def _segmentation_providers() -> list[dict[str, Any]]:
    try:
        from .segmentation.registry import get_segmentation_provider, list_segmentation_providers
    except Exception:  # noqa: BLE001
        return []
    out: list[dict[str, Any]] = []
    for pid in list_segmentation_providers():
        try:
            out.append(get_segmentation_provider(pid).capabilities().to_dict())
        except Exception as exc:  # noqa: BLE001
            out.append({"provider_id": pid, "available": False, "reason": f"query failed: {exc}"})
    return out


def _completion_providers() -> list[dict[str, Any]]:
    try:
        from .completion.registry import get_completion_provider, list_completion_providers
    except Exception:  # noqa: BLE001
        return []
    out: list[dict[str, Any]] = []
    for pid in list_completion_providers():
        try:
            out.append(get_completion_provider(pid).capabilities().to_dict())
        except Exception as exc:  # noqa: BLE001
            out.append({"provider_id": pid, "available": False, "reason": f"query failed: {exc}"})
    return out


def get_reconstruction_capabilities() -> dict[str, Any]:
    """Aggregated capabilities across geometry, segmentation and completion.

    ``providers`` stays the geometry list for backward compatibility; the panel
    reads ``segmentation`` and ``completion`` to enable/disable the Blockout,
    Scan and Completion options with a reason instead of hiding them.
    """
    geometry, recommended_provider = _geometry_providers()
    return {
        "feature": "scene_reconstruction",
        "version": 2,
        "providers": geometry,
        "geometry": geometry,
        "segmentation": _segmentation_providers(),
        "completion": _completion_providers(),
        "recommended_provider": recommended_provider,
    }
