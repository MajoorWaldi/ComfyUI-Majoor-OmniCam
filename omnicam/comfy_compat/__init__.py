"""The sole boundary for ComfyUI-specific APIs used by OmniCam."""

from __future__ import annotations

from typing import Any

__all__ = [
    "IO",
    "UI",
    "ComfyAPI",
    "ComfyExtension",
    "InputImpl",
    "PromptServer",
    "VideoComponents",
    "register_shutdown_callback",
]


def __getattr__(name: str) -> Any:
    """Load only the ComfyUI surface the importing module actually needs."""
    if name in {"ComfyAPI", "ComfyExtension", "IO", "InputImpl", "UI", "VideoComponents"}:
        from . import api

        return getattr(api, name)
    if name == "PromptServer":
        from .server import PromptServer

        return PromptServer
    if name == "register_shutdown_callback":
        from .lifecycle import register_shutdown_callback

        return register_shutdown_callback
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
