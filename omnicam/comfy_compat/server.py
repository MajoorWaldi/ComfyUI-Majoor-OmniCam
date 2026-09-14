"""ComfyUI server lifecycle and route registration boundary."""

from __future__ import annotations

import inspect

from server import PromptServer

__all__ = ["PromptServer", "create_prompt_server"]


def create_prompt_server(loop):
    """Construct the singleton `PromptServer` across supported ComfyUI versions.

    Upstream ComfyUI added a required `asset_manager` positional argument to
    `PromptServer.__init__` after this repo's oldest supported pin
    (`v0.31.0`); older/pinned versions still take only `loop`. Introspecting
    the actual constructor (rather than pinning to one shape) keeps this
    working across the whole compatibility matrix in .github/workflows/test.yml
    without a hard dependency on any one ComfyUI release.
    """
    # `PromptServer.instance` is only ever set as an instance attribute inside
    # __init__ (never declared as a class-level default across any supported
    # version), so a fresh, never-instantiated class raises AttributeError on
    # direct access -- getattr() is required here, not an optimization.
    existing = getattr(PromptServer, "instance", None)
    if existing is not None:
        return existing
    params = inspect.signature(PromptServer.__init__).parameters
    if "asset_manager" not in params:
        return PromptServer(loop)
    from app.assets.manager import default_asset_manager

    return PromptServer(loop, default_asset_manager())
