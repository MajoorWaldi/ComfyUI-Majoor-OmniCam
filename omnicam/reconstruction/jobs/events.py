"""WebSocket event emission for reconstruction jobs via ComfyUI PromptServer."""

from __future__ import annotations

import logging
import time
from collections.abc import Callable
from typing import Any

from .types import ReconstructionJob

logger = logging.getLogger(__name__)

EVENT_STATE = "omnicam.reconstruction.state"
EVENT_PROGRESS = "omnicam.reconstruction.progress"
EVENT_PREVIEW = "omnicam.reconstruction.preview"
EVENT_DONE = "omnicam.reconstruction.done"
EVENT_ERROR = "omnicam.reconstruction.error"

EVENT_NAMES = (
    EVENT_STATE,
    EVENT_PROGRESS,
    EVENT_PREVIEW,
    EVENT_DONE,
    EVENT_ERROR,
)

THROTTLE_SECONDS = 0.1


def _send_sync(event: str, payload: dict[str, Any], client_id: str) -> None:
    """Send websocket event through ComfyUI PromptServer."""
    try:
        from ...comfy_compat.server import PromptServer

        instance = getattr(PromptServer, "instance", None)
        if instance is None:
            return
        instance.send_sync(event, payload, client_id or None)
    except Exception as exc:  # noqa: BLE001
        logger.debug("Reconstruction event %s could not be sent: %s", event, exc)


class ReconstructionEventPublisher:
    """Publishes reconstruction lifecycle events over WebSocket."""

    def __init__(
        self,
        job: ReconstructionJob,
        *,
        sender: Callable[[str, dict[str, Any], str], None] | None = None,
        clock: Callable[[], float] = time.monotonic,
        throttle_seconds: float = THROTTLE_SECONDS,
    ) -> None:
        self._job = job
        self._sender = sender or _send_sync
        self._clock = clock
        self._throttle = float(throttle_seconds)
        self._last_progress_time: float = 0.0

    def _envelope(self, extra: dict[str, Any]) -> dict[str, Any]:
        return {
            "job_id": self._job.job_id,
            "node_id": self._job.node_id,
            **extra,
        }

    def _emit(self, event: str, payload: dict[str, Any]) -> None:
        self._sender(event, self._envelope(payload), self._job.client_id)

    def emit_state(self) -> None:
        """Emit state change (not throttled)."""
        self._emit(
            EVENT_STATE,
            {
                "state": self._job.state,
                "stage": self._job.stage,
                "progress": round(float(self._job.progress), 4),
                "message": self._job.message,
            },
        )

    def emit_progress(self, *, force: bool = False) -> None:
        """Emit progress update (throttled)."""
        now = self._clock()
        if not force and (now - self._last_progress_time < self._throttle):
            return
        self._last_progress_time = now
        self._emit(
            EVENT_PROGRESS,
            {
                "state": self._job.state,
                "stage": self._job.stage,
                "progress": round(float(self._job.progress), 4),
                "message": self._job.message,
            },
        )

    def emit_preview(self, preview_data: dict[str, Any]) -> None:
        """Emit proxy preview metadata (never triggers model loads)."""
        self._emit(EVENT_PREVIEW, preview_data)

    def emit_done(self) -> None:
        """Emit job completion."""
        summary = self._job.result.summary if self._job.result else {}
        warnings = (
            list(self._job.result.warnings)
            if self._job.result is not None
            else list(self._job.warnings)
        )
        self._emit(
            EVENT_DONE,
            {
                "state": self._job.state,
                "summary": summary,
                "warnings": warnings,
            },
        )

    def emit_error(self) -> None:
        """Emit job failure."""
        self._emit(
            EVENT_ERROR,
            {
                "state": self._job.state,
                "error": self._job.error or {},
            },
        )

    def as_event_callback(self) -> Callable[[str, ReconstructionJob], None]:
        """Return a callback compatible with runner's on_event argument."""

        def _callback(event_type: str, job: ReconstructionJob) -> None:
            if event_type == "state":
                self.emit_state()
            elif event_type == "progress":
                self.emit_progress()
            elif event_type == "preview":
                self.emit_preview({})
            elif event_type == "done":
                self.emit_done()
            elif event_type == "error":
                self.emit_error()

        return _callback
