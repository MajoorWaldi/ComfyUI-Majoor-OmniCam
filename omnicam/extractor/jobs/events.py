"""Live solve telemetry over ComfyUI's WebSocket.

The rule this module exists to enforce: **events are transport, never state**.
Everything sent here is also readable from ``GET /jobs/{id}``, so a dropped
message costs the user a smoother progress bar, never a correct solve.

Two consequences shape the code:

* messages are throttled (~10 Hz), because a 24 fps decode can otherwise
  produce thousands of socket writes a second and stall the UI thread;
* a pose event carries one pose, never the accumulated trajectory. Resending
  the whole path per frame is quadratic, and it is the kind of thing that looks
  fine on a 3-second test clip and melts on a real one.
"""

from __future__ import annotations

import logging
import math
import time
from typing import Any

logger = logging.getLogger(__name__)

JOB_EVENT = "majoor.omnicam.extractor.job"
PROGRESS_EVENT = "majoor.omnicam.extractor.progress"
POSE_EVENT = "majoor.omnicam.extractor.pose"
QUALITY_EVENT = "majoor.omnicam.extractor.quality"
FEATURES_EVENT = "majoor.omnicam.extractor.features"
COMPLETED_EVENT = "majoor.omnicam.extractor.completed"
FAILED_EVENT = "majoor.omnicam.extractor.failed"

EVENT_NAMES = (
    JOB_EVENT, PROGRESS_EVENT, POSE_EVENT, QUALITY_EVENT, FEATURES_EVENT,
    COMPLETED_EVENT, FAILED_EVENT,
)

#: Roughly 10 Hz. State changes and terminal events ignore this.
THROTTLE_SECONDS = 0.1
#: Quality readings are batched between flushes rather than sent one by one.
MAX_QUALITY_BATCH = 120


def _send_sync(event: str, payload: dict[str, Any], client_id: str) -> None:
    try:
        from server import PromptServer

        instance = getattr(PromptServer, "instance", None)
        if instance is None:
            return
        instance.send_sync(event, payload, client_id or None)
    except Exception as exc:  # noqa: BLE001 - telemetry must never break a solve
        logger.debug("OmniCam extractor event %s could not be sent: %s", event, exc)


class SolveEventPublisher:
    """Throttled per-job publisher. ``sender`` is injectable for tests."""

    def __init__(self, job, *, sender=_send_sync, throttle_seconds: float = THROTTLE_SECONDS,
                 clock=time.monotonic) -> None:
        self._job = job
        self._sender = sender
        self._throttle = float(throttle_seconds)
        self._clock = clock
        # None, not 0.0: a monotonic clock can read zero at startup, and a
        # numeric sentinel made the very first progress and pose events fall
        # inside the throttle window and vanish.
        # Per-channel, not global: progress, pose and features each report every
        # frame, and one shared timestamp let whichever fired first starve the
        # other two out of the same throttle window.
        self._last_sent: dict[str, float] = {}
        self._pending_quality: list[dict[str, Any]] = []

    # -- internals ---------------------------------------------------------

    def _envelope(self, extra: dict[str, Any]) -> dict[str, Any]:
        return {"job_id": self._job.job_id, "node_id": self._job.extractor_node_id, **extra}

    def _emit(self, event: str, payload: dict[str, Any]) -> None:
        self._sender(event, self._envelope(payload), self._job.owner_client_id)

    def _due(self, channel: str) -> bool:
        now = self._clock()
        last = self._last_sent.get(channel)
        if last is not None and now - last < self._throttle:
            return False
        self._last_sent[channel] = now
        return True

    # -- events ------------------------------------------------------------

    def state_changed(self, state: str) -> None:
        """State changes are never throttled: the UI's buttons depend on them."""
        self.flush()
        self._emit(JOB_EVENT, {"state": state, "progress": round(float(self._job.progress), 4)})

    def progress(self, *, force: bool = False) -> None:
        if not force and not self._due("progress"):
            return
        job = self._job
        self._emit(PROGRESS_EVENT, {
            "state": job.state,
            "progress": round(float(job.progress), 4),
            "stage_progress": round(float(job.stage_progress), 4),
            "frame": int(job.current_source_frame),
            "frame_count": int(job.source_frame_count),
            "backend": str(job.backend_name),
        })

    def pose(self, pose, *, force: bool = False) -> None:
        """One pose, and only if every component is finite."""
        values = [*pose.position, *pose.quaternion_xyzw]
        if any(not math.isfinite(float(value)) for value in values):
            return
        if not force and not self._due("pose"):
            return
        self._emit(POSE_EVENT, {
            "frame": int(pose.source_frame),
            "position": [round(float(value), 6) for value in pose.position],
            "quaternion_xyzw": [round(float(value), 6) for value in pose.quaternion_xyzw],
            "valid": bool(pose.valid),
        })

    def features(self, frame: int, points: list[dict[str, Any]], state: str) -> None:
        """The tracked points for one frame -- a view, never state.

        Unlike quality these are not batched and not replayable: an overlay is
        only meaningful while the frame it describes is on screen, so a dropped
        features message is simply a frame the overlay did not draw. It shares
        the same throttle as progress, which keeps a dense SIFT frame from
        turning a solve into a socket flood.
        """
        if not points or not self._due("features"):
            return
        self._emit(FEATURES_EVENT, {
            "frame": int(frame),
            "state": str(state),
            "points": list(points),
        })

    def quality(self, sample) -> None:
        """Batch readings and let :meth:`flush` decide when they go out."""
        self._pending_quality.append(sample.to_dict())
        if len(self._pending_quality) >= MAX_QUALITY_BATCH:
            self.flush()

    def flush(self) -> None:
        if not self._pending_quality:
            return
        batch, self._pending_quality = self._pending_quality[:MAX_QUALITY_BATCH], []
        self._emit(QUALITY_EVENT, {"samples": batch})

    def completed(self, payload: dict[str, Any]) -> None:
        self.flush()
        self._emit(COMPLETED_EVENT, payload)

    def failed(self, error: str) -> None:
        self.flush()
        self._emit(FAILED_EVENT, {"state": self._job.state, "error": str(error)})
