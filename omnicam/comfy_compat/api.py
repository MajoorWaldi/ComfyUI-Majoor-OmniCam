"""The ComfyUI V3 API surface OmniCam builds on, resolved defensively.

``comfy_api.latest`` is not a stable import target. The ComfyUI docs describe it
as the newest *in-development* numbered API; the version directly below it is the
one treated as stable, and it can still change without warning. A naive pin to
either one rots: ``latest`` may drop or rename a symbol between releases, while
the stable module does not re-export every symbol the same way (``v0_0_2``
exposes ``VideoComponents`` only through ``Types``, never at top level).

So this module is the shock absorber. Each name is resolved on its own, from the
stable numbered API first and ``comfy_api.latest`` only as a fallback, so a
symbol that is missing or relocated in one place is still found in the other.
"""

from __future__ import annotations

from typing import Any

__all__ = [
    "IO",
    "UI",
    "ComfyAPI",
    "ComfyAPISync",
    "ComfyExtension",
    "InputImpl",
    "VideoComponents",
]


def _load_api_modules() -> list[Any]:
    """The V3 API modules OmniCam resolves symbols from, highest priority first.

    Plain ``import`` statements, not ``importlib.import_module`` -- a Registry
    scanner reads these as ordinary optional dependencies. ``latest`` stays the
    fallback, never the preferred source. ``v0_0_1`` is deliberately skipped:
    upstream marks it a template "no one should ever use" and it omits IO/UI.
    """
    modules: list[Any] = []
    try:
        import comfy_api.v0_0_2 as stable_api

        modules.append(stable_api)
    except ImportError:
        pass
    try:
        import comfy_api.latest as latest_api

        modules.append(latest_api)
    except ImportError:
        pass
    if not modules:
        raise ImportError(
            "OmniCam requires the ComfyUI V3 API (comfy_api). Update ComfyUI to "
            "at least the version named by `requires-comfyui` in pyproject.toml."
        )
    return modules


_API_MODULES = _load_api_modules()


def _resolve(name: str) -> Any:
    """Return ``name`` from the first API module that exposes it."""
    for module in _API_MODULES:
        found = getattr(module, name, None)
        if found is not None:
            return found
    raise ImportError(f"comfy_api exposes no {name!r}")


def _resolve_video_components() -> Any:
    """``VideoComponents`` sits at top level in ``latest`` but under ``Types`` in
    the stable module; accept either spelling from either place."""
    for module in _API_MODULES:
        for holder in (module, getattr(module, "Types", None)):
            found = getattr(holder, "VideoComponents", None)
            if found is not None:
                return found
    raise ImportError("comfy_api exposes no VideoComponents")


IO = _resolve("IO")
UI = _resolve("UI")
ComfyAPI = _resolve("ComfyAPI")
# The synchronous execution API. V3 nodes run on a worker thread, so OmniCam's
# solve code reports progress through this rather than the awaitable ComfyAPI.
ComfyAPISync = _resolve("ComfyAPISync")
ComfyExtension = _resolve("ComfyExtension")
InputImpl = _resolve("InputImpl")
VideoComponents = _resolve_video_components()
