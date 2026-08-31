"""Lifecycle integration with the ComfyUI-owned aiohttp application."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from .server import PromptServer


def register_shutdown_callback(name: str, callback: Callable[[], None], *, server: Any = None) -> bool:
    """Run ``callback`` once when ComfyUI tears down its aiohttp application.

    ComfyUI exposes the application on ``PromptServer.instance.app``.  The
    aiohttp ``on_shutdown`` signal is stable across our supported ComfyUI
    versions and keeps worker cleanup owned by the process lifecycle.
    """
    prompt_server = server if server is not None else getattr(PromptServer, "instance", None)
    app = getattr(prompt_server, "app", None)
    shutdown_hooks = getattr(app, "on_shutdown", None)
    if shutdown_hooks is None:
        return False

    registrations = getattr(app, "_majoor_omnicam_shutdown_callbacks", set())  # type: ignore[var-annotated]
    if name in registrations:
        return True

    async def _shutdown(_: Any) -> None:
        callback()

    shutdown_hooks.append(_shutdown)
    registrations.add(name)
    app._majoor_omnicam_shutdown_callbacks = registrations  # type: ignore[union-attr]
    return True
