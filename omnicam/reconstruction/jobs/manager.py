"""Reconstruction job manager providing concurrency, ownership, and lifecycle management."""

from __future__ import annotations

import logging
import threading
import time
import uuid
from collections.abc import Callable
from typing import Any

from ...comfy_compat.execution import execution_busy
from ..errors import ReconGpuBusyError
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

#: Active-or-pending jobs (state not in TERMINAL_STATES). Each holds a worker
#: thread; the GPU semaphore is still 1 so only one runs at a time.
DEFAULT_MAX_ACTIVE_OR_PENDING = 4
#: Terminal jobs kept for result recovery. Trimmed oldest-first on admission.
DEFAULT_MAX_HISTORY = 16

#: Mirrors omnicam/extractor/jobs/manager.py's own SHUTDOWN_JOIN_SECONDS --
#: same bounded-wait philosophy so a slow reconstruction can't hang process exit.
SHUTDOWN_JOIN_SECONDS = 5.0


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
        max_jobs: int | None = None,
        max_active_or_pending: int = DEFAULT_MAX_ACTIVE_OR_PENDING,
        max_history: int = DEFAULT_MAX_HISTORY,
        execution_probe: Callable[[], bool] = execution_busy,
    ) -> None:
        self._jobs: dict[str, ReconstructionJob] = {}
        self._threads: dict[str, threading.Thread] = {}
        self._lock = threading.RLock()
        self._ttl = float(ttl_seconds)
        # ``max_jobs`` is the deprecated single knob -- when given it caps both
        # the active-or-pending set and the retained history at that number,
        # matching its historical all-in-one meaning.
        if max_jobs is not None:
            self._max_active_or_pending = int(max_jobs)
            self._max_history = int(max_jobs)
            self._max_jobs = int(max_jobs)
        else:
            self._max_active_or_pending = int(max_active_or_pending)
            self._max_history = int(max_history)
            self._max_jobs = self._max_active_or_pending + self._max_history
        self._semaphore = gpu_semaphore if gpu_semaphore is not None else threading.Semaphore(1)
        self._runner = runner
        self._execution_probe = execution_probe

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
            # Only active-or-pending jobs count against admission -- a finished
            # result sitting in history is not GPU work and must never block a
            # new job.
            active = [job for job in self._jobs.values() if job.state not in TERMINAL_STATES]
            if len(active) >= self._max_active_or_pending:
                raise JobLimitReachedError(
                    f"Too many reconstruction jobs active at once ({len(active)}); "
                    "wait for one to finish or stop one before starting another"
                )
            # Trim terminal history, and if the whole table is still at the
            # cap, evict oldest terminal jobs to make room for the newcomer.
            self._evict_terminal_history_locked(self._max_history)
            while len(self._jobs) >= self._max_jobs and self._evict_one_terminal_locked():
                pass
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

    def _terminal_ids_oldest_first(self) -> list[str]:
        return sorted(
            (jid for jid, job in self._jobs.items() if job.state in TERMINAL_STATES),
            key=lambda jid: self._jobs[jid].last_access,
        )

    def _evict_terminal_history_locked(self, keep: int) -> None:
        """Trim terminal jobs to the ``keep`` most recently accessed. Caller holds the lock."""
        terminal_ids = self._terminal_ids_oldest_first()
        overflow = len(terminal_ids) - max(0, keep)
        for jid in terminal_ids[: max(0, overflow)]:
            self._jobs.pop(jid, None)
            self._threads.pop(jid, None)

    def _evict_one_terminal_locked(self) -> bool:
        """Drop the single oldest terminal job. Returns False if there is none."""
        terminal_ids = self._terminal_ids_oldest_first()
        if not terminal_ids:
            return False
        self._jobs.pop(terminal_ids[0], None)
        self._threads.pop(terminal_ids[0], None)
        return True

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
        # One-shot admission gate: refuse to start a GPU job while ComfyUI's
        # own queue is already running one. Cheap, and it stops the common
        # case outright -- the mid-run GpuContentionGuard in the pipeline
        # covers the window this read can't see (a workflow queued a moment
        # later). Mirrors omnicam/extractor/jobs/manager.py's start() gate.
        if self._execution_probe():
            raise ReconGpuBusyError(
                "ComfyUI is currently executing a workflow. Wait for GPU execution "
                "to finish before starting scene reconstruction."
            )
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
        kwargs: dict[str, Any] = {"execution_probe": self._execution_probe}
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

    def shutdown(self) -> None:
        """Cancel every active job and wait (bounded) for its worker thread to exit.

        Called once from ComfyUI's aiohttp on_shutdown hook (see
        omnicam/extension.py) via comfy_compat.lifecycle.register_shutdown_callback,
        the same mechanism omnicam/extractor/jobs/manager.py::shutdown() already
        uses -- otherwise a reconstruction mid-run leaks a daemon thread (and
        whatever GPU memory MoGeInference/LoadMoGeModel are still holding)
        past process exit instead of unwinding cooperatively.
        """
        with self._lock:
            jobs = list(self._jobs.values())
            threads = list(self._threads.values())

        for job in jobs:
            job.cancel_token.cancel()

        deadline = time.monotonic() + SHUTDOWN_JOIN_SECONDS
        for thread in threads:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                break
            thread.join(timeout=remaining)

        alive = [t.name for t in threads if t.is_alive()]
        if alive:
            logger.warning(
                "OmniCam reconstruction shutdown timed out with worker threads still alive: %s",
                ", ".join(alive),
            )

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
