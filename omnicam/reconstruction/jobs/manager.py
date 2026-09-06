"""Reconstruction job manager providing concurrency, ownership, and lifecycle management."""

from __future__ import annotations

import logging
import threading
import time
import uuid
from collections.abc import Callable
from typing import Any

from ..settings import ReconstructionSettings
from ..types import ReconstructionSource
from .runner import run_reconstruction_job
from .types import (
    ACTIVE_STATES,
    STOPPING,
    TERMINAL_STATES,
    ReconstructionJob,
    can_transition,
)

logger = logging.getLogger(__name__)

DEFAULT_TTL_SECONDS = 1800.0

#: Ceiling on jobs held in memory. Each finished job retains a full MotionScene,
#: and each pending one holds a worker thread parked on the GPU semaphore.
DEFAULT_MAX_JOBS = 32


class JobLimitReachedError(RuntimeError):
    """Too many reconstruction jobs are already in flight."""


class JobNotFoundError(KeyError):
    """Job does not exist or has already been swept."""


class JobAccessDeniedError(PermissionError):
    """Requester does not own this job."""


class ReconstructionJobManager:
    """Manages out-of-band reconstruction jobs."""

    def __init__(
        self,
        *,
        ttl_seconds: float = DEFAULT_TTL_SECONDS,
        gpu_semaphore: threading.Semaphore | None = None,
        runner: Callable[..., Any] = run_reconstruction_job,
        max_jobs: int = DEFAULT_MAX_JOBS,
    ) -> None:
        self._jobs: dict[str, ReconstructionJob] = {}
        self._threads: dict[str, threading.Thread] = {}
        self._lock = threading.RLock()
        self._ttl = float(ttl_seconds)
        self._max_jobs = int(max_jobs)
        self._semaphore = gpu_semaphore if gpu_semaphore is not None else threading.Semaphore(1)
        self._runner = runner

    def create_job(
        self,
        node_id: str,
        client_id: str,
        source: ReconstructionSource,
        settings: ReconstructionSettings,
    ) -> ReconstructionJob:
        """Instantiate and register a new reconstruction job without starting thread."""
        # Reclaim finished jobs before admitting a new one, so a long-lived
        # server does not accumulate MotionScenes forever.
        self.sweep_stale_jobs()
        with self._lock:
            if len(self._jobs) >= self._max_jobs:
                raise JobLimitReachedError(
                    f"Too many reconstruction jobs in memory ({len(self._jobs)}); "
                    "wait for one to finish or delete a completed job"
                )
        job_id = uuid.uuid4().hex[:16]
        job = ReconstructionJob(
            job_id=job_id,
            node_id=str(node_id),
            client_id=str(client_id),
            source=source,
            settings=settings,
        )
        with self._lock:
            self._jobs[job_id] = job
        return job

    def start_job(
        self,
        node_id: str,
        client_id: str,
        source: ReconstructionSource,
        settings: ReconstructionSettings,
        *,
        on_event: Callable[[str, ReconstructionJob], None] | None = None,
    ) -> ReconstructionJob:
        """Create and start an asynchronous reconstruction job in a background thread."""
        job = self.create_job(node_id, client_id, source, settings)
        if on_event is None:
            from .events import ReconstructionEventPublisher

            pub = ReconstructionEventPublisher(job)
            on_event = pub.as_event_callback()

        thread = threading.Thread(
            target=self.execute_job,
            args=(job.job_id,),
            kwargs={"on_event": on_event},
            name=f"omnicam-recon-{job.job_id}",
            daemon=True,
        )
        with self._lock:
            self._threads[job.job_id] = thread
        thread.start()
        return job

    def execute_job(
        self,
        job_id: str,
        *,
        runner_fn: Callable[..., Any] | None = None,
        on_event: Callable[[str, ReconstructionJob], None] | None = None,
    ) -> None:
        """Execute job synchronously (intended to run inside worker thread)."""
        with self._lock:
            job = self._jobs.get(job_id)
        if job is None:
            return

        run_fn = runner_fn or self._runner
        kwargs = {}
        if on_event is not None:
            kwargs["on_event"] = on_event
        with self._semaphore:
            run_fn(job, **kwargs)

    def get_job(self, job_id: str, *, client_id: str | None = None) -> ReconstructionJob:
        """Retrieve job by id, verifying client ownership if client_id is given."""
        with self._lock:
            job = self._jobs.get(str(job_id))
            if job is None:
                raise JobNotFoundError(f"Reconstruction job {job_id!r} not found")
            # ``client_id=None`` is the in-process bypass; any string that
            # reaches this from HTTP -- including the empty string produced by a
            # request that omitted clientId -- must match the owner.
            if client_id is not None and job.client_id and job.client_id != str(client_id):
                raise JobAccessDeniedError(f"Client {client_id!r} does not own job {job_id!r}")
            job.touch()
            return job

    def stop_job(self, job_id: str, *, client_id: str | None = None) -> ReconstructionJob:
        """Signal cancellation for a running job."""
        with self._lock:
            job = self.get_job(job_id, client_id=client_id)
            job.cancel_token.cancel()
            if job.state in ACTIVE_STATES and can_transition(job.state, STOPPING):
                job.transition(STOPPING)
            return job

    def delete_job(self, job_id: str, *, client_id: str | None = None) -> None:
        """Remove a job from manager memory."""
        with self._lock:
            job = self.get_job(job_id, client_id=client_id)
            if job.state in ACTIVE_STATES:
                job.cancel_token.cancel()
            self._jobs.pop(job_id, None)
            self._threads.pop(job_id, None)

    def sweep_stale_jobs(self, ttl_seconds: float | None = None) -> int:
        """Evict stale terminal jobs past TTL. Disk assets are never touched."""
        ttl = self._ttl if ttl_seconds is None else float(ttl_seconds)
        now = time.time()
        evicted = 0

        with self._lock:
            stale_ids = [
                jid
                for jid, job in self._jobs.items()
                if job.state in TERMINAL_STATES and (now - job.last_access) > ttl
            ]
            for jid in stale_ids:
                self._jobs.pop(jid, None)
                self._threads.pop(jid, None)
                evicted += 1

        return evicted
