"""Bridge ComfyUI's cooperative interruption into OmniCam's solve control.

A queued Extractor solve is cancelled through ComfyUI's Jobs API. ComfyUI
surfaces that to a long-running node when it polls
``comfy.model_management.throw_exception_if_processing_interrupted()``, which
raises ``InterruptProcessingException``.

OmniCam's solvers already poll a :class:`SolveControlProtocol` (``.checkpoint()``)
at every bounded wait -- the OpenCV frame loop, the DPVO child poll loop, the
pycolmap registration loop. :class:`ComfyInterruptControl` is such a control
backed by ComfyUI's interruption, so a Comfy job cancel travels the exact same
cooperative-stop / bounded-join / terminate / kill / cleanup path a manual stop
already does, and the DPVO child is reaped the same way.

Import-safe without ComfyUI: the primitive is resolved lazily and, when
``comfy`` is absent (or its import fails, e.g. a CPU-only torch build),
:func:`check_interrupted` is a silent no-op so the pure test suite still runs.
"""

from __future__ import annotations

from typing import Callable, Optional

#: Resolved ComfyUI interruption primitive, cached after the first lookup.
_CHECK: Optional[Callable[[], None]] = None
_LOOKED = False


def _comfy_interrupt_check() -> Optional[Callable[[], None]]:
    global _CHECK, _LOOKED
    if not _LOOKED:
        _LOOKED = True
        try:
            from comfy.model_management import (
                throw_exception_if_processing_interrupted as _fn,
            )

            _CHECK = _fn
        except Exception:  # noqa: BLE001 - ComfyUI absent / import failed
            _CHECK = None
    return _CHECK


def check_interrupted() -> None:
    """Raise ComfyUI's interruption if the running prompt has been cancelled.

    A no-op when ComfyUI is not importable.
    """
    check = _comfy_interrupt_check()
    if check is not None:
        check()


class ComfyInterruptControl:
    """A :class:`SolveControlProtocol` backed by ComfyUI's interruption.

    Passed as ``control`` into a queued solve so every existing
    ``checkpoint(control)`` site also honours a Comfy job cancel. ``check`` is
    an injection point for tests.
    """

    def __init__(self, check: Optional[Callable[[], None]] = None) -> None:
        self._check = check if check is not None else check_interrupted

    def checkpoint(self) -> None:
        """Return normally to continue; raise to abandon the solve."""
        self._check()

    def cancelled(self) -> bool:
        try:
            self._check()
        except BaseException:  # noqa: BLE001 - any interruption means cancelled
            return True
        return False
