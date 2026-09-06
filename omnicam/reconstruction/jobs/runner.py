"""Thread-based out-of-band runner for reconstruction jobs."""

from __future__ import annotations

import logging
import threading
from collections.abc import Callable
from typing import Any

from omnicam.reconstruction.errors import ReconCancelledError, ReconstructionError
from omnicam.reconstruction.jobs.types import (
    DONE,
    FAILED,
    PREPARING,
    STOPPED,
    STOPPING,
    ReconstructionJob,
    can_transition,
)
from omnicam.reconstruction.pipeline import run_reconstruction_pipeline
from omnicam.reconstruction.providers import get_provider
from omnicam.reconstruction.providers.base import ReconstructionProvider

logger = logging.getLogger(__name__)


def run_reconstruction_job(
    job: ReconstructionJob,
    *,
    provider: ReconstructionProvider | None = None,
    pipeline_fn: Callable[..., Any] | None = None,
    gpu_semaphore: threading.Semaphore | None = None,
    on_event: Callable[[str, ReconstructionJob], None] | None = None,
) -> None:
    """Execute reconstruction job out-of-band without enqueuing ComfyUI prompt graphs."""
    pipe_fn = pipeline_fn or run_reconstruction_pipeline

    def _execute() -> None:
        if job.cancel_token.is_cancelled():
            if can_transition(job.state, STOPPING):
                job.transition(STOPPING)
            job.transition(STOPPED)
            job.stage = STOPPED
            job.message = "Reconstruction stopped before start"
            if on_event:
                on_event("state", job)
            return

        job.transition(PREPARING)
        job.stage = PREPARING
        job.progress = 0.05
        job.message = "Preparing reconstruction"
        if on_event:
            on_event("state", job)

        def on_progress(stage: str, pct: float, msg: str) -> None:
            if job.cancel_token.is_cancelled():
                raise ReconCancelledError("Reconstruction cancelled")
            if stage != job.state and can_transition(job.state, stage):
                job.transition(stage)
            job.stage = stage
            job.progress = pct
            job.message = msg
            job.touch()
            if on_event:
                on_event("progress", job)

        active_provider = provider or get_provider(job.settings.provider)

        try:
            output = pipe_fn(
                source=job.source,
                settings=job.settings,
                provider=active_provider,
                progress=on_progress,
                cancel=job.cancel_token,
            )
            job.result = output
            job.warnings = list(output.warnings)
            job.stage = DONE
            job.progress = 1.0
            job.message = "Reconstruction completed"
            job.transition(DONE)
            if on_event:
                on_event("done", job)
        except ReconCancelledError:
            if can_transition(job.state, STOPPING):
                job.transition(STOPPING)
            job.transition(STOPPED)
            job.stage = STOPPED
            job.message = "Reconstruction stopped"
            if on_event:
                on_event("state", job)
        except ReconstructionError as err:
            logger.warning("Reconstruction job %s failed: %s", job.job_id, err)
            job.error = err.to_dict()["error"]
            job.stage = FAILED
            if can_transition(job.state, FAILED):
                job.transition(FAILED)
            if on_event:
                on_event("error", job)
        except Exception as err:
            logger.exception("Unexpected error in reconstruction job %s", job.job_id)
            job.error = {"code": "RECON_FAILED", "message": str(err)}
            job.stage = FAILED
            if can_transition(job.state, FAILED):
                job.transition(FAILED)
            if on_event:
                on_event("error", job)

    if gpu_semaphore is not None:
        with gpu_semaphore:
            _execute()
    else:
        _execute()
