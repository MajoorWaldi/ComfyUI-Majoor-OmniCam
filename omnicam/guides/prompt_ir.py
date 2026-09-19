"""Model-neutral IR for prompt compilation (P5): MotionScene -> PromptCompileIR.

Transient, compiler-side only -- nothing here is persisted into MotionScene.
Built fresh for every ``compile_prompt`` call (a real execution's ``compile()``
and the Monitor's live-preflight route both build one, so preview and output
never diverge). Cheap by construction: it never touches ``playblast_video`` or
does any video decode, only the already-in-memory MotionScene and camera track.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import TYPE_CHECKING

from ..core.motion_scene import CameraSceneItem, CutEvent, MotionKey, MotionScene
from ..guides.analysis import camera_phases_from_track
from ..guides.model import CameraPhase, ReferenceSpec, ShotIntent, parse_reference_plan

if TYPE_CHECKING:
    from ..profiles.base import CompileRequest

_SCREEN_DIRECTIONS = frozenset({
    "left_to_right", "right_to_left", "top_to_bottom", "bottom_to_top", "static",
})
_PACES = frozenset({"steady", "accelerating", "decelerating"})


@dataclass(frozen=True, slots=True)
class ActionCue:
    """One artist-authored action, carried verbatim -- never inferred from motion.

    Sourced only from a ``screen_point`` layer's freeform ``source.action_text``
    (doc's P4-skip guardrail: no MotionScene schema change, no new dataclass
    field). Absent ``action_text`` means no cue -- the compiler never invents a
    verb ("runs", "fights") from trajectory math alone.
    """

    subject_id: str
    start_seconds: float
    end_seconds: float
    text: str
    source: str = "motion_layer"

    def __post_init__(self) -> None:
        if not isinstance(self.subject_id, str) or not self.subject_id.strip():
            raise ValueError("ActionCue.subject_id must be a non-empty string")
        if not isinstance(self.text, str) or not self.text.strip():
            raise ValueError("ActionCue.text must be a non-empty string")
        start, end = float(self.start_seconds), float(self.end_seconds)
        if end < start:
            raise ValueError("ActionCue.end_seconds must be >= start_seconds")
        object.__setattr__(self, "start_seconds", start)
        object.__setattr__(self, "end_seconds", end)


@dataclass(frozen=True, slots=True)
class SubjectTrajectoryCue:
    """Physical screen-space motion only -- direction and pace, no semantic verb."""

    subject_id: str
    label: str
    start_seconds: float
    end_seconds: float
    screen_direction: str
    pace: str

    def __post_init__(self) -> None:
        if not isinstance(self.subject_id, str) or not self.subject_id.strip():
            raise ValueError("SubjectTrajectoryCue.subject_id must be a non-empty string")
        if self.screen_direction not in _SCREEN_DIRECTIONS:
            raise ValueError(f"screen_direction must be one of {sorted(_SCREEN_DIRECTIONS)}")
        if self.pace not in _PACES:
            raise ValueError(f"pace must be one of {sorted(_PACES)}")
        start, end = float(self.start_seconds), float(self.end_seconds)
        if end < start:
            raise ValueError("SubjectTrajectoryCue.end_seconds must be >= start_seconds")
        object.__setattr__(self, "start_seconds", start)
        object.__setattr__(self, "end_seconds", end)


@dataclass(frozen=True, slots=True)
class PromptCompileIR:
    """Everything a dialect renderer needs to write ``final_prompt`` text.

    Cuts, camera phases and cues are carried through in the exact order
    ``MotionScene`` authored them -- never re-sorted or summarized away. That
    invariant belongs here, once, rather than being re-implemented (or missed)
    per renderer.
    """

    duration_seconds: float
    base_prompt: str
    camera_phases: tuple[CameraPhase, ...]
    cuts: tuple[CutEvent, ...]
    subject_trajectories: tuple[SubjectTrajectoryCue, ...]
    action_cues: tuple[ActionCue, ...]
    references: tuple[ReferenceSpec, ...]
    intent: ShotIntent

    def __post_init__(self) -> None:
        object.__setattr__(self, "camera_phases", tuple(self.camera_phases))
        object.__setattr__(self, "cuts", tuple(self.cuts))
        object.__setattr__(self, "subject_trajectories", tuple(self.subject_trajectories))
        object.__setattr__(self, "action_cues", tuple(self.action_cues))
        object.__setattr__(self, "references", tuple(self.references))
        if not isinstance(self.intent, ShotIntent):
            raise TypeError("intent must be a ShotIntent")


def _selected_camera(scene: MotionScene) -> CameraSceneItem | None:
    return next((camera for camera in scene.cameras if camera.id == scene.playblast_camera_id), None)


def _cue_subject_id(layer_id: str, source: dict) -> str:
    value = source.get("object_id") if isinstance(source, dict) else None
    return str(value) if value else layer_id


def extract_action_cues(motion_scene: MotionScene) -> tuple[ActionCue, ...]:
    """Verbatim ``action_text`` from each enabled ``screen_point`` layer, if any."""
    cues: list[ActionCue] = []
    for layer in motion_scene.motion_layers:
        if not layer.enabled or layer.semantic != "screen_point":
            continue
        text = layer.source.get("action_text") if isinstance(layer.source, dict) else None
        if not isinstance(text, str) or not text.strip():
            continue
        cues.append(ActionCue(
            subject_id=_cue_subject_id(layer.id, layer.source),
            start_seconds=layer.keys[0].time_seconds,
            end_seconds=layer.keys[-1].time_seconds,
            text=text.strip(),
        ))
    return tuple(cues)


def _screen_direction(dx: float, dy: float) -> str:
    if abs(dx) < 0.02 and abs(dy) < 0.02:
        return "static"
    if abs(dx) >= abs(dy):
        return "left_to_right" if dx > 0 else "right_to_left"
    return "top_to_bottom" if dy > 0 else "bottom_to_top"


def _speed_between(a: MotionKey, b: MotionKey) -> float:
    dt = b.time_seconds - a.time_seconds
    if dt <= 0:
        return 0.0
    return math.hypot(b.x - a.x, b.y - a.y) / dt


def _pace(keys: list[MotionKey]) -> str:
    if len(keys) < 3:
        return "steady"
    first_speed = _speed_between(keys[0], keys[1])
    last_speed = _speed_between(keys[-2], keys[-1])
    if last_speed > first_speed * 1.15:
        return "accelerating"
    if last_speed < first_speed * 0.85:
        return "decelerating"
    return "steady"


def extract_subject_trajectories(motion_scene: MotionScene) -> tuple[SubjectTrajectoryCue, ...]:
    """Direction/pace derived only from an enabled layer's own key deltas."""
    cues: list[SubjectTrajectoryCue] = []
    for layer in motion_scene.motion_layers:
        if not layer.enabled or layer.semantic != "screen_point" or len(layer.keys) < 2:
            continue
        first, last = layer.keys[0], layer.keys[-1]
        cues.append(SubjectTrajectoryCue(
            subject_id=_cue_subject_id(layer.id, layer.source),
            label=layer.label,
            start_seconds=first.time_seconds,
            end_seconds=last.time_seconds,
            screen_direction=_screen_direction(last.x - first.x, last.y - first.y),
            pace=_pace(layer.keys),
        ))
    return tuple(cues)


def build_prompt_compile_ir(request: CompileRequest) -> PromptCompileIR:
    """Assemble the shared IR every profile's ``compile_prompt`` renders from.

    Cheap: only reads the already-parsed MotionScene and the selected camera's
    track, never the connected playblast video. Safe to call on every live
    Monitor preview tick.
    """
    scene = request.motion_scene
    camera = _selected_camera(scene)
    camera_phases = camera_phases_from_track(camera.track) if camera is not None else ()

    try:
        declared = parse_reference_plan(request.reference_plan_json)
    except ValueError:
        # An in-progress/invalid edit of the plan is reported as a preflight
        # Check elsewhere; the prompt IR just compiles without it.
        declared = ()

    return PromptCompileIR(
        duration_seconds=request.duration_seconds,
        base_prompt=request.base_prompt,
        camera_phases=camera_phases,
        cuts=tuple(scene.cuts),
        subject_trajectories=extract_subject_trajectories(scene),
        action_cues=extract_action_cues(scene),
        references=declared,
        intent=ShotIntent(),
    )
