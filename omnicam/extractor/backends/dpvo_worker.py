"""Spawn-isolated runtime for the optional CUDA DPVO solver.

The parent process never imports Torch or DPVO through this module.  A solve
gets a fresh child process and therefore a fresh CUDA context; when that child
exits the driver, rather than PyTorch's caching allocator, owns VRAM cleanup.
"""

from __future__ import annotations

import contextlib
import importlib
import math
import multiprocessing
import shutil
import sys
import tempfile
import threading
import time
import traceback
import types
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from ..types import CameraIntrinsics, VideoFrameSample
from .base import SolveError, checkpoint, report_progress, sample_features

DPVO_WORKER_PROTOCOL = 2
MAX_CHILD_ERROR_CHARS = 12_000
CANONICAL_MODULE_NAME = "omnicam.extractor.backends.dpvo_worker"
_PACKAGE_ROOT_PATH = Path(__file__).resolve().parents[3]
PACKAGE_ROOT = str(_PACKAGE_ROOT_PATH)
RESOLUTION_MULTIPLE = 4
DPVO_FEATURE_RESOLUTION = 4
DEFAULT_FINALIZATION_TIMEOUT_SECONDS = 120.0
MAX_LANDMARKS_3D = 8_000
MIN_LANDMARK_CONFIDENCE = 0.2

_ACTIVE_RUNNERS: set[DpvoProcessRunner] = set()
_ACTIVE_RUNNERS_LOCK = threading.RLock()


def _managed_exchange_root() -> Path:
    try:
        import folder_paths

        root = Path(folder_paths.get_temp_directory()) / "omnicam" / "dpvo_exchange"
    except Exception:  # noqa: BLE001 - unit tests and standalone tools have no ComfyUI
        root = Path(tempfile.gettempdir()) / "omnicam" / "dpvo_exchange"
    root.mkdir(parents=True, exist_ok=True)
    return root


@dataclass(slots=True)
class FrameExchange:
    """One private, parent-owned memmap directory."""

    directory: Path
    frames_path: Path
    source_frames: tuple[int, ...]
    timestamps: tuple[float, ...]

    def cleanup(self) -> None:
        directory = self.directory.resolve()
        frames_parent = self.frames_path.resolve().parent
        if frames_parent != directory or not directory.name.startswith("omnicam-dpvo-"):
            raise RuntimeError("Refusing to remove an invalid DPVO exchange directory")
        if directory.exists():
            shutil.rmtree(directory)


def write_frame_exchange(
    frames: Sequence[VideoFrameSample], *, root: str | Path | None = None,
) -> FrameExchange:
    """Write frames incrementally to a child-readable NumPy memmap."""
    if not frames:
        raise ValueError("DPVO frame exchange needs at least one frame")
    import numpy as np

    exchange_root = Path(root) if root is not None else _managed_exchange_root()
    exchange_root.mkdir(parents=True, exist_ok=True)
    directory = Path(tempfile.mkdtemp(prefix="omnicam-dpvo-", dir=exchange_root))
    frames_path = directory / "frames.npy"
    mapped = None
    try:
        first = np.asarray(frames[0].rgb)
        if first.ndim != 3 or first.shape[2] != 3:
            raise ValueError("DPVO frames must be HxWx3 RGB arrays")
        mapped = np.lib.format.open_memmap(
            frames_path, mode="w+", dtype=np.uint8, shape=(len(frames), *first.shape),
        )
        for index, frame in enumerate(frames):
            image = np.asarray(frame.rgb)
            if image.shape != first.shape:
                raise ValueError("All DPVO exchange frames must have the same shape")
            mapped[index] = image
        mapped.flush()
        mapped = None
        return FrameExchange(
            directory=directory,
            frames_path=frames_path,
            source_frames=tuple(int(frame.source_frame) for frame in frames),
            timestamps=tuple(float(frame.timestamp_seconds) for frame in frames),
        )
    except BaseException:
        if mapped is not None:
            mmap_handle = getattr(mapped, "_mmap", None)
            if mmap_handle is not None:
                with contextlib.suppress(Exception):
                    mmap_handle.close()
            del mapped
        with contextlib.suppress(Exception):
            shutil.rmtree(directory)
        raise


@dataclass(slots=True, frozen=True)
class DpvoWorkerRequest:
    frames_path: str
    source_frames: tuple[int, ...]
    timestamps: tuple[float, ...]
    intrinsics: CameraIntrinsics
    checkpoint_path: str
    protocol: int = DPVO_WORKER_PROTOCOL

    def __post_init__(self) -> None:
        if self.protocol != DPVO_WORKER_PROTOCOL:
            raise ValueError(f"Unsupported DPVO worker protocol {self.protocol}")
        if len(self.source_frames) != len(self.timestamps):
            raise ValueError("DPVO worker source frame and timestamp counts differ")

    def to_dict(self) -> dict[str, Any]:
        return {
            "protocol": self.protocol,
            "frames_path": self.frames_path,
            "source_frames": list(self.source_frames),
            "timestamps": list(self.timestamps),
            "intrinsics": {
                "fx": self.intrinsics.fx, "fy": self.intrinsics.fy,
                "cx": self.intrinsics.cx, "cy": self.intrinsics.cy,
                "width": self.intrinsics.width, "height": self.intrinsics.height,
                "source": self.intrinsics.source,
            },
            "checkpoint_path": self.checkpoint_path,
        }

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> DpvoWorkerRequest:
        protocol = int(payload.get("protocol", -1))
        if protocol != DPVO_WORKER_PROTOCOL:
            raise ValueError(f"Unsupported DPVO worker protocol {protocol}")
        intrinsics = payload.get("intrinsics") or {}
        return cls(
            frames_path=str(payload.get("frames_path", "")),
            source_frames=tuple(int(value) for value in payload.get("source_frames", ())),
            timestamps=tuple(float(value) for value in payload.get("timestamps", ())),
            intrinsics=CameraIntrinsics(
                fx=float(intrinsics["fx"]), fy=float(intrinsics["fy"]),
                cx=float(intrinsics["cx"]), cy=float(intrinsics["cy"]),
                width=int(intrinsics["width"]), height=int(intrinsics["height"]),
                source=str(intrinsics.get("source", "worker")),
            ),
            checkpoint_path=str(payload.get("checkpoint_path", "")),
            protocol=protocol,
        )


def extract_active_patch_features(slam, width: int, height: int) -> list[dict[str, float | str]]:
    """Return a bounded display sample of DPVO's active patch centres.

    DPVO stores patch coordinates on its quarter-resolution feature map, so
    callers pass those feature-map dimensions rather than source pixels.
    This function is deliberately telemetry-only: callers suppress failures
    around it because a preview must never invalidate a pose solve.
    """
    count = max(0, int(getattr(slam, "m", 0)))
    if not count:
        return []
    centres = slam.patches[0, :count, :2, 1, 1].detach().float().cpu().tolist()
    normalizer_x = max(1, int(width))
    normalizer_y = max(1, int(height))
    normalized = [
        (min(1.0, max(0.0, float(x) / normalizer_x)), min(1.0, max(0.0, float(y) / normalizer_y)))
        for x, y in centres
    ]
    return sample_features(normalized, [True] * len(normalized))


def extract_landmarks_3d(slam, limit: int = MAX_LANDMARKS_3D) -> list[dict[str, float]]:
    """Read an explicitly exposed DPVO geometry map, never 2-D patches.

    DPVO builds differ in whether they expose reconstruction points. Unsupported
    builds simply return no cloud and retain a successful camera solve.
    """
    geometry = next((getattr(slam, name, None) for name in ("landmarks_3d", "points_3d", "map_points") if getattr(slam, name, None) is not None), None)
    if geometry is None:
        return []
    try:
        array = geometry.detach().float().cpu().tolist() if hasattr(geometry, "detach") else geometry.tolist() if hasattr(geometry, "tolist") else geometry
        confidence_values = getattr(slam, "landmark_confidence", None)
        confidences = confidence_values.detach().float().cpu().tolist() if hasattr(confidence_values, "detach") else confidence_values.tolist() if hasattr(confidence_values, "tolist") else confidence_values
    except Exception:
        return []
    candidates = []
    for index, value in enumerate(array if isinstance(array, list) else []):
        if not isinstance(value, (list, tuple)) or len(value) < 3:
            continue
        x, y, z = (float(value[axis]) for axis in range(3))
        confidence = float(confidences[index]) if isinstance(confidences, (list, tuple)) and index < len(confidences) else 1.0
        if not all(math.isfinite(component) for component in (x, y, z, confidence)) or z <= 0 or confidence < MIN_LANDMARK_CONFIDENCE:
            continue
        candidates.append((confidence, index, {"x": round(x, 5), "y": round(y, 5), "z": round(z, 5), "confidence": round(confidence, 5)}))
    candidates.sort(key=lambda item: (-item[0], item[1]))
    return [point for _confidence, _index, point in candidates[:max(0, min(MAX_LANDMARKS_3D, int(limit)))]]


def writable_frame_copy(frames, index: int, height: int, width: int):
    """Detach one C-contiguous writable frame from the read-only exchange memmap."""
    import numpy as np

    return np.array(frames[index, :height, :width], dtype=np.uint8, copy=True, order="C")


def run_dpvo_child(connection, request: DpvoWorkerRequest) -> None:
    """Import and execute DPVO inside the disposable CUDA process."""
    try:
        import numpy as np
        import torch
        from dpvo.config import cfg
        from dpvo.dpvo import DPVO

        frames = np.load(request.frames_path, mmap_mode="r")
        if len(frames) != len(request.source_frames):
            raise ValueError("DPVO frame exchange metadata does not match its array")
        height = int(frames.shape[1])
        width = int(frames.shape[2])
        height -= height % RESOLUTION_MULTIPLE
        width -= width % RESOLUTION_MULTIPLE
        config = cfg.clone()
        slam = DPVO(config, request.checkpoint_path, ht=height, wd=width, viz=False)
        intrinsics = torch.as_tensor(
            [request.intrinsics.fx, request.intrinsics.fy,
             request.intrinsics.cx, request.intrinsics.cy],
            dtype=torch.float32,
        )
        if torch.cuda.is_available():
            intrinsics = intrinsics.cuda()
        total = len(frames)
        for index in range(total):
            connection.send({
                "kind": "ready", "index": index,
                "source_frame": request.source_frames[index],
            })
            command = connection.recv()
            if command.get("kind") != "continue":
                connection.send({"kind": "stopped"})
                return
            image = torch.from_numpy(writable_frame_copy(frames, index, height, width)).permute(2, 0, 1)
            if torch.cuda.is_available():
                image = image.cuda()
            slam(index, image, intrinsics)
            with contextlib.suppress(Exception):
                points = extract_active_patch_features(
                    slam, width // DPVO_FEATURE_RESOLUTION, height // DPVO_FEATURE_RESOLUTION,
                )
                if points:
                    connection.send({
                        "kind": "features", "source_frame": request.source_frames[index], "points": points,
                    })
            connection.send({
                "kind": "progress", "done": index + 1, "total": total,
                "source_frame": request.source_frames[index],
            })
        connection.send({"kind": "finalizing", "total": total})
        poses, timestamps = slam.terminate()
        result = {
            "kind": "result",
            "poses": np.asarray(poses).tolist(),
            "timestamps": np.asarray(timestamps).tolist(),
        }
        with contextlib.suppress(Exception):
            landmarks = extract_landmarks_3d(slam)
            if landmarks:
                result["landmarks_3d"] = landmarks
        connection.send(result)
    except BaseException as exc:  # noqa: BLE001 - failure must cross the process boundary
        message = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
        with contextlib.suppress(Exception):
            connection.send({"kind": "error", "error": message[-MAX_CHILD_ERROR_CHARS:]})
    finally:
        with contextlib.suppress(Exception):
            connection.close()


def canonical_worker_entry(
    request: DpvoWorkerRequest,
) -> tuple[Callable[..., None], DpvoWorkerRequest]:
    """Return a child entry point and request the spawned interpreter can unpickle.

    ComfyUI registers a custom-node package in ``sys.modules`` under a name built
    from its absolute filesystem path, so functions and classes defined here
    pickle *by reference* under a dotted name
    no fresh interpreter can import: the child then dies in the spawn bootstrap
    with ``ModuleNotFoundError`` before any of our error handling exists.
    Re-importing this module under its canonical name -- with the repository root
    on ``sys.path``, which the bootstrap copies into the child -- yields a target
    and a request whose references resolve there.
    """
    if __name__ == CANONICAL_MODULE_NAME:
        return run_dpvo_child, request
    if PACKAGE_ROOT not in sys.path:
        sys.path.append(PACKAGE_ROOT)
    try:
        module = importlib.import_module(CANONICAL_MODULE_NAME)
    except Exception as exc:  # a broken sys.path entry raises anything; re-raised as SolveError
        raise SolveError(
            f"OmniCam could not import {CANONICAL_MODULE_NAME} from {PACKAGE_ROOT} "
            f"for the DPVO worker process: {exc}"
        ) from exc
    return module.run_dpvo_child, module.DpvoWorkerRequest.from_dict(request.to_dict())


def _is_foreign_custom_node_entry(entry: str) -> bool:
    """True for a ``sys.path`` entry belonging to some *other* ComfyUI custom node."""
    if not entry:
        return False
    try:
        resolved = Path(entry).resolve()
    except (OSError, ValueError):
        return False
    if resolved == _PACKAGE_ROOT_PATH or _PACKAGE_ROOT_PATH in resolved.parents:
        return False
    return any(part.lower() == "custom_nodes" for part in resolved.parts)


def child_sys_path(entries: Sequence[str]) -> list[str]:
    """The import path the worker should start from.

    Custom nodes routinely append their own root to ``sys.path``, and a stray
    directory there shadows a real dependency for every later import -- a
    ``coverage`` report folder, for instance, makes ``import coverage`` succeed
    as an empty namespace package and takes Numba (hence DPVO) down with it.
    The solver child only needs the interpreter's own paths plus this
    repository, so foreign custom-node entries are dropped rather than
    inherited.
    """
    kept = [entry for entry in entries if not _is_foreign_custom_node_entry(entry)]
    if PACKAGE_ROOT not in kept:
        kept.append(PACKAGE_ROOT)
    return kept


@contextlib.contextmanager
def _isolated_child_bootstrap():
    """Hand the spawn bootstrap a clean ``__main__`` and a clean ``sys.path``.

    ``multiprocessing`` snapshots both when the process starts.  The parent's
    main module is ComfyUI's ``main.py``; re-running it in the child re-imports
    Torch, replays custom-node prestartup and can abort the child long before
    the solver starts -- a main module carrying neither ``__spec__`` nor
    ``__file__`` makes the bootstrap skip that step entirely.
    """
    real_main = sys.modules.get("__main__")
    real_path = sys.path
    sys.modules["__main__"] = types.ModuleType("__main__")
    sys.path = child_sys_path(real_path)
    try:
        yield
    finally:
        sys.path = real_path
        if real_main is not None:
            sys.modules["__main__"] = real_main
        else:
            sys.modules.pop("__main__", None)


def _worker_exit_error(process, *, last_state: str | None = None) -> SolveError:
    """Describe a child that died before it could return its structured error."""
    details = ["DPVO worker exited without a result"]
    pid = getattr(process, "pid", None)
    exitcode = getattr(process, "exitcode", None)
    if pid is not None:
        details.append(f"pid={pid}")
    if exitcode is not None:
        details.append(f"exit code {exitcode}")
    if last_state:
        details.append(f"state={last_state}")
    summary = " (" + ", ".join(details[1:]) + ")" if len(details) > 1 else ""
    return SolveError(
        details[0] + summary + ". The child died before Python could report a traceback; "
        "this usually means a native extension or PyTorch/CUDA ABI mismatch. "
        "Rebuild DPVO for ComfyUI's embedded Python and PyTorch/CUDA environment, "
        "or select opencv_sift."
    )


class DpvoProcessRunner:
    """Own exactly one spawned child and reap it on every terminal path."""

    def __init__(
        self, *, target=run_dpvo_child, poll_seconds: float = 0.05,
        timeout_seconds: float | None = None, stop_grace_seconds: float = 2.0,
        finalization_timeout_seconds: float | None = DEFAULT_FINALIZATION_TIMEOUT_SECONDS,
    ) -> None:
        self._target = target
        self._poll_seconds = float(poll_seconds)
        self._timeout_seconds = timeout_seconds
        self._stop_grace_seconds = float(stop_grace_seconds)
        self._finalization_timeout_seconds = finalization_timeout_seconds
        self.process = None
        self._connection = None
        self.last_pid: int | None = None
        self.last_exitcode: int | None = None
        self.landmarks_3d: list[dict[str, float]] = []

    def solve(
        self, request: DpvoWorkerRequest, *, progress=None, control=None,
        on_source_frame: Callable[[int], None] | None = None,
        on_features: Callable[[int, list[dict[str, Any]]], None] | None = None,
        on_finalizing: Callable[[], None] | None = None,
    ) -> tuple[list, list]:
        if self.process is not None:
            raise RuntimeError("This DPVO process runner is already active")
        target, payload = self._target, request
        if target is run_dpvo_child:
            target, payload = canonical_worker_entry(request)
        context = multiprocessing.get_context("spawn")
        parent, child = context.Pipe(duplex=True)
        process = context.Process(target=target, args=(child, payload), daemon=True)
        self.process = process  # type: ignore[assignment]
        self._connection = parent  # type: ignore[assignment]
        self.landmarks_3d = []
        started = time.monotonic()
        finalization_started: float | None = None
        with _isolated_child_bootstrap():
            process.start()
        self.last_pid = process.pid
        child.close()
        with _ACTIVE_RUNNERS_LOCK:
            _ACTIVE_RUNNERS.add(self)
        try:
            while True:
                checkpoint(control)
                now = time.monotonic()
                if self._timeout_seconds is not None and now - started > self._timeout_seconds:
                    raise SolveError("DPVO worker timed out")
                if (
                    finalization_started is not None
                    and self._finalization_timeout_seconds is not None
                    and now - finalization_started > self._finalization_timeout_seconds
                ):
                    raise SolveError(
                        "DPVO finalization timed out after "
                        f"{self._finalization_timeout_seconds:g} seconds while waiting for "
                        "slam.terminate(). The frame pass completed, but DPVO's global "
                        "optimization did not return a trajectory. Try a shorter clip, lower "
                        "max_dimension, or method=opencv_sift."
                    )
                try:
                    has_message = parent.poll(self._poll_seconds)
                except (BrokenPipeError, EOFError, OSError):
                    # A native CUDA extension can terminate the child before
                    # Python has a chance to send its traceback.  Windows then
                    # reports the closed named pipe from poll() itself.
                    has_message = False
                if has_message:
                    try:
                        message = parent.recv()
                    except EOFError:
                        message = None
                    if message is None:
                        if not process.is_alive():
                            raise _worker_exit_error(process, last_state="eof")
                        continue
                    kind = message.get("kind")
                    if kind == "ready":
                        checkpoint(control)
                        parent.send({"kind": "continue"})
                    elif kind == "progress":
                        source_frame = int(message.get("source_frame", 0))
                        if on_source_frame is not None:
                            with contextlib.suppress(Exception):
                                on_source_frame(source_frame)
                        report_progress(progress, int(message["done"]), int(message["total"]))
                    elif kind == "features":
                        if on_features is not None:
                            source_frame = int(message.get("source_frame", 0))
                            points = list(message.get("points") or [])
                            with contextlib.suppress(Exception):
                                on_features(source_frame, points)
                    elif kind == "finalizing":
                        if finalization_started is None:
                            finalization_started = time.monotonic()
                            if on_finalizing is not None:
                                with contextlib.suppress(Exception):
                                    on_finalizing()
                    elif kind == "result":
                        self.landmarks_3d = list(message.get("landmarks_3d") or [])
                        return list(message.get("poses", [])), list(message.get("timestamps", []))
                    elif kind == "error":
                        raise SolveError(f"DPVO worker failed:\n{message.get('error', 'unknown error')}")
                    elif kind == "stopped":
                        checkpoint(control)
                        raise SolveError("DPVO worker stopped before producing a result")
                    else:
                        raise SolveError(f"DPVO worker sent an unknown message {kind!r}")
                elif not process.is_alive():
                    try:
                        has_pending_message = parent.poll()
                    except (BrokenPipeError, EOFError, OSError):
                        has_pending_message = False
                    if has_pending_message:
                        continue
                    raise _worker_exit_error(process, last_state="no_result")
        finally:
            self._request_stop()
            self._reap()
            with _ACTIVE_RUNNERS_LOCK:
                _ACTIVE_RUNNERS.discard(self)

    def close(self) -> None:
        self._request_stop()
        self._reap()

    def _request_stop(self) -> None:
        if self._connection is not None:
            with contextlib.suppress(Exception):
                self._connection.send({"kind": "stop"})

    def _reap(self) -> None:
        process, connection = self.process, self._connection
        self.process = None
        self._connection = None
        if connection is not None:
            with contextlib.suppress(Exception):
                connection.close()
        if process is None:
            return
        process.join(timeout=self._stop_grace_seconds)
        if process.is_alive():
            process.terminate()
            process.join(timeout=self._stop_grace_seconds)
        if process.is_alive() and hasattr(process, "kill"):
            process.kill()
            process.join(timeout=self._stop_grace_seconds)
        self.last_exitcode = process.exitcode


def close_all_dpvo_runners() -> None:
    """Reap every active CUDA child during ComfyUI server shutdown."""
    with _ACTIVE_RUNNERS_LOCK:
        active = tuple(_ACTIVE_RUNNERS)
    for runner in active:
        runner.close()
