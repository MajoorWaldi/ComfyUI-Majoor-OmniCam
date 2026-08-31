"""Best-effort access to ComfyUI's prompt execution state.

Imports stay inside the probe so the pure OmniCam test suite remains usable
without ComfyUI on ``sys.path``.
"""

from __future__ import annotations

from typing import Any


def _prompt_server_instance() -> Any | None:
    try:
        from server import PromptServer
    except (ImportError, AttributeError):
        return None
    return getattr(PromptServer, "instance", None)


def _queue_is_running(server: Any) -> bool:
    queue = getattr(server, "prompt_queue", None)
    if queue is None:
        return False
    snapshot = getattr(queue, "get_current_queue_volatile", None)
    if callable(snapshot):
        running, _queued = snapshot()
        return bool(running)
    # Compatibility with older PromptQueue implementations. Reading the
    # mapping is best-effort and never mutates the queue.
    return bool(getattr(queue, "currently_running", {}))


def execution_busy() -> bool:
    """Return whether ComfyUI is currently executing a prompt."""
    server = _prompt_server_instance()
    if server is None:
        return False
    try:
        return _queue_is_running(server)
    except (AttributeError, RuntimeError, TypeError, ValueError):
        return False
