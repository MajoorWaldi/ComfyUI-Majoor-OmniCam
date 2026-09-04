"""Ownership, concurrency and lifetime for interactive solves.

Three rules, each of which exists because breaking it is expensive:

* **one GPU solve at a time.** Two DPVO jobs on one card do not run twice as
  fast; they run out of VRAM and take the ComfyUI process with them. So the
  slot is a hard global limit, and a second request is refused with a message
  rather than queued into an unbounded backlog.
* **jobs belong to whoever started them.** A second browser tab must not be
  able to stop someone else's forty-minute solve. This is scoping, not
  authentication: ComfyUI has no notion of an authenticated caller, so the
  client id is what the browser reports. It stops honest tabs from colliding;
  it does not stop anyone who can already reach this server.
* **nothing lives forever.** A finished job holds pose arrays and quality
  samples; the TTL sweep drops them. It never touches the user's video.
"""

from __future__ import annotations

import logging
import threading
import time
from typing import Any

from ...comfy_compat.execution import execution_busy
from ..backends import backend_requires_gpu_slot
from ..backends.dpvo_worker import close_all_dpvo_runners
from .events import SolveEventPublisher
from .types import (
    COMPLETED,
    STOPPED,
    STOPPING,
    InteractiveSolveJob,
    JobStateError,
    can_transition,
    new_job,
)
from .worker import run_solve_job

logger = logging.getLogger(__name__)

TERMINAL_TTL_SECONDS = 30 * 60
MAX_TRACKED_JOBS = 32

#: How long ``shutdown()`` waits, in total, for worker threads to unwind after
#: their solver children have been terminated. Bounded so a wedged solve cannot
#: hang ComfyUI teardown; a thread still alive past this is logged, not joined
#: forever.
SHUTDOWN_JOIN_SECONDS = 5.0


class SolveSlotBusyError(RuntimeError):
    """Another exclusive solve already holds the single GPU slot."""


class JobNotFoundError(KeyError):
    """No such job, or it has already been swept."""


class JobAccessDeniedError(PermissionError):
    """The requester does not own this job."""


class SolveJobManager:
    """Owns every interactive solve in this ComfyUI process."""

    def __init__(self, *, runner=run_solve_job, publisher_factory=SolveEventPublisher,
                 ttl_seconds: float = TERMINAL_TTL_SECONDS, clock=time.monotonic,
                 backend_cleanup=close_all_dpvo_runners,
                 execution_probe=execution_busy) -> None:
        self._jobs: dict[str, InteractiveSolveJob] = {}
        self._threads: dict[str, threading.Thread] = {}
        self._publishers: dict[str, Any] = {}
        self._lock = threading.RLock()
        self._runner = runner
        self._publisher_factory = publisher_factory
        self._ttl = float(ttl_seconds)
        self._clock = clock
        self._backend_cleanup = backend_cleanup
        self._execution_probe = execution_probe
        self._exclusive_job_id: str | None = None

    def execution_busy(self) -> bool:
        """Whether ComfyUI is executing a prompt right now.

        Public because a running solve has to keep asking, not just the ``start``
        gate: routing it through the manager keeps the one injected probe as the
        single source of truth for both.
        """
        try:
            return bool(self._execution_probe())
        except Exception:  # noqa: BLE001 - the probe is best effort on both call sites
            return False

    # -- lookup ------------------------------------------------------------

    def get(self, job_id: str, *, client_id: str | None = None) -> InteractiveSolveJob:
        with self._lock:
            job = self._jobs.get(str(job_id))
            if job is None:
                raise JobNotFoundError(f"Unknown OmniCam solve job {job_id!r}")
            if client_id is not None and job.owner_client_id and job.owner_client_id != client_id:
                raise JobAccessDeniedError("This OmniCam solve belongs to another session")
            return job

    def jobs(self) -> list[InteractiveSolveJob]:
        with self._lock:
            return list(self._jobs.values())

    # -- lifecycle ---------------------------------------------------------

    def start(
        self,
        *,
        client_id: str,
        node_id: str,
        source_ref: dict[str, Any],
        settings: dict[str, Any],
    ) -> InteractiveSolveJob:
        """Create a job and hand it to a worker thread outside the prompt queue."""
        method = str(settings.get("method", "auto"))
        exclusive = backend_requires_gpu_slot(method)
        if exclusive and self._execution_probe():
            raise SolveSlotBusyError(
                "ComfyUI is currently executing a workflow. Wait for GPU execution "
                "to finish before starting DPVO tracking."
            )
        with self._lock:
            self._sweep_locked()
            if exclusive and self._exclusive_job_id:
                active = self._jobs.get(self._exclusive_job_id)
                if active is not None and active.is_active:
                    raise SolveSlotBusyError(
                        "Another OmniCam camera solve is currently active. "
                        "Stop it before starting a new one."
                    )
                self._exclusive_job_id = None
            if len(self._jobs) >= MAX_TRACKED_JOBS:
                raise SolveSlotBusyError("Too many OmniCam solve jobs are being tracked; clear finished ones.")

            job = new_job(
                owner_client_id=client_id,
                extractor_node_id=node_id,
                source_ref=source_ref,
                settings=settings,
            )
            self._jobs[job.job_id] = job
            if exclusive:
                self._exclusive_job_id = job.job_id
            publisher = self._publisher_factory(job)
            self._publishers[job.job_id] = publisher
            thread = threading.Thread(
                target=self._runner, args=(job, self, publisher),
                name=f"omnicam-solve-{job.job_id[:8]}", daemon=True,
            )
            self._threads[job.job_id] = thread
        thread.start()
        return job

    def transition(self, job: InteractiveSolveJob, target: str, *, force: bool = False) -> None:
        """Move a job to ``target``, refusing transitions the machine forbids."""
        with self._lock:
            if not force and not can_transition(job.state, target):
                raise JobStateError(f"Cannot move an OmniCam solve from {job.state} to {target}")
            job.state = target
            if target in {COMPLETED, STOPPED} or target == "FAILED":
                job.finished_at = self._clock()
        publisher = self._publishers.get(job.job_id)
        if publisher is not None:
            publisher.state_changed(target)

    # -- control -----------------------------------------------------------

    def stop(self, job: InteractiveSolveJob) -> InteractiveSolveJob:
        with self._lock:
            if job.is_terminal:
                return job
            job.stop_requested.set()
        if job.state != STOPPING:
            self.transition(job, STOPPING, force=True)
        return job

    def finish(self, job: InteractiveSolveJob) -> None:
        """Worker teardown: release the GPU slot and the decode buffers."""
        with self._lock:
            if self._exclusive_job_id == job.job_id:
                self._exclusive_job_id = None
            self._threads.pop(job.job_id, None)
            if job.finished_at is None:
                job.finished_at = self._clock()
            if not job.is_terminal:
                job.state = STOPPED
        publisher = self._publishers.get(job.job_id)
        if publisher is not None:
            publisher.flush()

    def delete(self, job_id: str) -> bool:
        job_key = str(job_id)
        with self._lock:
            job = self._jobs.get(job_key)
            if job is None:
                return True
            if not job.is_terminal:
                # Cancellation is cooperative. Keep ownership and the exclusive
                # GPU slot until the worker reaches its finally block; removing
                # either here would allow a second CUDA solve to overlap it.
                self.stop(job)
                return False
            self._jobs.pop(job_key, None)
            self._publishers.pop(job_key, None)
            self._threads.pop(job_key, None)
            if self._exclusive_job_id == job_key:
                self._exclusive_job_id = None
        _release(job)
        return True

    # -- housekeeping ------------------------------------------------------

    def sweep(self) -> int:
        with self._lock:
            return self._sweep_locked()

    def _sweep_locked(self) -> int:
        now = self._clock()
        expired = [
            job_id for job_id, job in self._jobs.items()
            if job.is_terminal and job.finished_at is not None and (now - job.finished_at) > self._ttl
        ]
        for job_id in expired:
            job = self._jobs.pop(job_id, None)
            self._publishers.pop(job_id, None)
            self._threads.pop(job_id, None)
            if job is not None:
                _release(job)
        return len(expired)

    def shutdown(self) -> None:
        for job in self.jobs():
            job.stop_requested.set()

        # Stop/terminate solver children first. This gives threads waiting on a
        # solver a chance to unwind before we join them.
        self._backend_cleanup()

        with self._lock:
            threads = list(self._threads.values())

        deadline = time.monotonic() + SHUTDOWN_JOIN_SECONDS
        for thread in threads:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                break
            thread.join(timeout=remaining)

        alive = [thread.name for thread in threads if thread.is_alive()]
        if alive:
            logger.warning(
                "OmniCam shutdown timed out with worker threads still alive: %s",
                ", ".join(alive),
            )


def _release(job: InteractiveSolveJob) -> None:
    """Drop what a finished job was holding. Never touches the source video."""
    job.raw_poses = []
    job.quality_samples = []
    job.raw_solve = None
    job.anomalies = []


#: One manager per ComfyUI process.
_MANAGER: SolveJobManager | None = None


def solve_manager() -> SolveJobManager:
    global _MANAGER
    if _MANAGER is None:
        _MANAGER = SolveJobManager()
    return _MANAGER
