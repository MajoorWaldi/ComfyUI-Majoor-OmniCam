"""OmniCam Sequencer node (MajoorOmniCamSequencer).

Assembles multi-shot video, multi-track audio, retime speed curves,
and structured sequence timing metadata.
"""

from __future__ import annotations

import json
from fractions import Fraction
from typing import Any

from comfy_api.latest import IO

from ..audio.sequence_audio import assemble_sequence_audio
from ..core.director_shot import validate_shot_collection
from ..core.sequence_time import build_sequence_time, sequence_time_to_json, sequence_time_to_prompt
from ..core.sequence_validation import validate_sequence_state
from ..video.sequence_video import assemble_sequence_video
from .base import OMNICAM_EDIT_SEQUENCE, OMNICAM_SEQUENCE_TIME, OMNICAM_SHOT_COLLECTION


SHOT_TEMPLATE = IO.Autogrow.TemplatePrefix(IO.Video.Input("shot"), prefix="shot", min=1, max=32)
AUDIO_TEMPLATE = IO.Autogrow.TemplatePrefix(IO.Audio.Input("audio"), prefix="audio", min=0, max=16)


def _leaf_slot_name(slot_name: Any) -> str:
    """Accept both V3 namespaced slots and legacy leaf slot names."""
    return str(slot_name).rsplit(".", 1)[-1]


def _connected_inputs(inputs: Any) -> dict[str, Any]:
    if not isinstance(inputs, dict):
        return {}
    return {
        _leaf_slot_name(slot_name): value
        for slot_name, value in inputs.items()
        if value is not None
    }


def _append_connected_shots(state: dict[str, Any], shot_inputs: dict[str, Any], custom_fps: int) -> None:
    """Reconcile every newly connected source, even when a timeline already exists."""
    existing_slots = {
        str(shot.get("source_slot"))
        for shot in state.get("shots", {}).values()
        if isinstance(shot, dict) and shot.get("source_slot")
    }
    ordered_slots = sorted(
        shot_inputs,
        key=lambda slot: (0, int(slot[4:])) if slot.startswith("shot") and slot[4:].isdigit() else (1, slot),
    )
    for slot_name in ordered_slots:
        if slot_name in existing_slots:
            continue
        index = len(state["shot_order"]) + 1
        base_id = f"shot_{index:03d}"
        shot_id = base_id
        while shot_id in state["shots"]:
            index += 1
            shot_id = f"shot_{index:03d}"
        state["shots"][shot_id] = {
            "id": shot_id,
            "name": f"Shot {index:03d}",
            "source_slot": slot_name,
            "enabled": True,
            "source": {"duration_frames": 120, "fps_num": custom_fps, "fps_den": 1},
            "trim": {"in_frame": 0, "out_frame": 119},
            "retime": {"enabled": False, "mode": "absolute_speed", "interpolation": "blend", "curve": {"keys": [{"frame": 0, "value": 1.0}]}},
            "timeline": {"start_frame": 0, "duration_frames": 120, "end_frame": 119},
            "prompt": "",
            "description": "",
            "tags": [],
        }
        state["shot_order"].append(shot_id)
        existing_slots.add(slot_name)


class MajoorOmniCamSequencer(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamSequencer",
            display_name="OmniCam Sequencer",
            category="Majoor/OmniCam/Sequencer",
            description=(
                "Multi-shot timeline sequencer and audio mixer. Supports trimming, retime speed curves, "
                "split clips, ripple editing, and structured prompt timing generation."
            ),
            search_aliases=["sequencer", "timeline", "video editor", "shot sequence", "retime", "audio mixer"],
            is_experimental=True,
            inputs=[
                IO.String.Input("sequence_state", default="{}", multiline=True, advanced=True),
                IO.Combo.Input("resolution_mode", options=["first_shot", "custom", "strict"]),
                IO.Int.Input("custom_width", default=1280, min=64, max=4096, step=8),
                IO.Int.Input("custom_height", default=720, min=64, max=4096, step=8),
                IO.Combo.Input("fit_mode", options=["contain", "cover", "stretch", "center_crop"]),
                IO.Combo.Input("fps_mode", options=["first_shot", "custom", "strict"]),
                IO.Int.Input("custom_fps", default=24, min=1, max=120, step=1),
                IO.Combo.Input("prompt_timing_format", options=["seconds", "timecode", "frames", "verbose"]),
                IO.Autogrow.Input("shots", template=SHOT_TEMPLATE),
                OMNICAM_SHOT_COLLECTION.Input("shot_collection", optional=True),
                IO.Autogrow.Input("audio_tracks", template=AUDIO_TEMPLATE),
            ],
            outputs=[
                IO.Video.Output(display_name="video"),
                IO.Audio.Output(display_name="audio"),
                OMNICAM_EDIT_SEQUENCE.Output(display_name="sequence"),
                OMNICAM_SEQUENCE_TIME.Output(display_name="sequence_time"),
                IO.String.Output(display_name="sequence_time_json"),
                IO.String.Output(display_name="prompt_timing"),
            ],
        )

    @classmethod
    def execute(
        cls,
        sequence_state: str,
        resolution_mode: str,
        custom_width: int,
        custom_height: int,
        fit_mode: str,
        fps_mode: str,
        custom_fps: int,
        prompt_timing_format: str,
        shots: IO.Autogrow.Type,
        audio_tracks: IO.Autogrow.Type,
        shot_collection=None,
    ) -> IO.NodeOutput:
        raw_state: dict[str, Any] = {}
        if sequence_state:
            try:
                parsed = json.loads(sequence_state)
                if isinstance(parsed, dict):
                    raw_state = parsed
            except json.JSONDecodeError as exc:
                raise ValueError(f"Invalid OmniCam sequence state JSON: {exc}") from exc

        state = validate_sequence_state(raw_state)

        # Collect connected video slots
        shot_inputs = _connected_inputs(shots)

        # Director shots are atomic VIDEO + camera track + optional audio
        # packets. They become ordinary editorial sources after validation.
        director_inputs = {}
        if shot_collection is not None:
            collection = validate_shot_collection(shot_collection)
            for index, payload in enumerate(collection["shots"]):
                director_inputs[f"collection_shot{index}"] = payload
        director_audio_slots: dict[str, str] = {}
        for slot_name, payload in director_inputs.items():
            if payload.get("video") is None:
                raise ValueError(
                    f"Director shot '{payload.get('name') or slot_name}' has no proxy video. "
                    "Record a playblast in Director or connect a VIDEO input to Director."
                )
            shot_inputs[slot_name] = payload["video"]
            if payload.get("audio") is not None:
                director_audio_slots[slot_name] = f"audio_from_{slot_name}"

        # Collect connected audio slots
        audio_inputs = _connected_inputs(audio_tracks)
        for slot_name, payload in director_inputs.items():
            if payload.get("audio") is not None:
                audio_inputs[director_audio_slots[slot_name]] = payload["audio"]

        existing_source_slots = {
            shot.get("source_slot") for shot in state.get("shots", {}).values() if isinstance(shot, dict)
        }
        for slot_name, payload in director_inputs.items():
            if slot_name in existing_source_slots:
                target = next(shot for shot in state["shots"].values() if shot.get("source_slot") == slot_name)
            else:
                base_id = str(payload.get("id") or slot_name)
                shot_id = base_id if base_id not in state["shots"] else f"{base_id}_{len(state['shots']) + 1}"
                target = {
                    "id": shot_id,
                    "name": str(payload.get("name") or "Director Shot"),
                    "source_slot": slot_name,
                    "enabled": True,
                    "source": {"duration_frames": 120, "fps_num": custom_fps, "fps_den": 1},
                    "trim": {"in_frame": 0, "out_frame": 119},
                    "retime": {"enabled": False, "mode": "absolute_speed", "interpolation": "blend", "curve": {"keys": [{"frame": 0, "value": 1.0}]}},
                    "timeline": {"start_frame": 0, "duration_frames": 120, "end_frame": 119},
                    "prompt": "",
                    "description": "",
                    "tags": [],
                }
                state["shots"][shot_id] = target
                state["shot_order"].append(shot_id)
            target["name"] = str(payload.get("name") or target.get("name") or "Director Shot")
            target["camera_track"] = payload.get("camera_track")
            target["metadata"] = payload.get("metadata", {})

            if payload.get("audio") is not None:
                audio_id = f"audio_{target['id']}"
                if audio_id not in state["audio_tracks"]:
                    state["audio_tracks"][audio_id] = {
                        "id": audio_id,
                        "name": f"{target['name']} Audio",
                        "source_slot": director_audio_slots[slot_name],
                        "enabled": True,
                        "timeline": {"start_frame": 0},
                        "trim": {"in_seconds": 0.0, "out_seconds": None},
                        "gain_db": 0.0,
                        "pan": 0.0,
                        "fade": {"in_seconds": 0.0, "out_seconds": 0.0},
                        "linked_shot_id": target["id"],
                        "audio_retime_mode": "follow_video",
                    }

        _append_connected_shots(state, shot_inputs, custom_fps)

        # 1. Video assembly
        rendered_video, render_spec = assemble_sequence_video(
            sequence_state=state,
            shot_inputs=shot_inputs,
            resolution_mode=resolution_mode,
            custom_width=custom_width,
            custom_height=custom_height,
            fit_mode=fit_mode,
            fps_mode=fps_mode,
            custom_fps=custom_fps,
        )

        # 2. Sequence Timing calculation
        output_rate = Fraction(render_spec["fps"]).limit_denominator(1001)
        sequence_time = build_sequence_time(state, fps_num=output_rate.numerator, fps_den=output_rate.denominator)
        sequence_time_json_str = sequence_time_to_json(sequence_time)
        prompt_timing_str = sequence_time_to_prompt(sequence_time, format=prompt_timing_format)

        total_dur_sec = sequence_time.get("duration", {}).get("seconds", 0.0)

        # 3. Audio mix assembly
        rendered_audio = assemble_sequence_audio(
            sequence_state=state,
            audio_inputs=audio_inputs,
            fps=float(render_spec["fps"]),
            total_duration_seconds=total_dur_sec,
            sequence_time=sequence_time,
        )

        # 4. OMNICAM_SEQUENCE v2 editorial representation. Optional camera
        # tracks can be added per shot without coupling the edit core to them.
        editorial_shots = []
        for s in sequence_time.get("shots", []):
            editorial_shots.append({
                "index": len(editorial_shots),
                "id": s.get("id"),
                "name": s.get("name"),
                "start_frame": s.get("timeline", {}).get("start_frame", 0),
                "end_frame": s.get("timeline", {}).get("end_frame", 0),
                "duration_frames": s.get("timeline", {}).get("duration_frames", 0),
                "source": s.get("source", {}),
                "retime": s.get("retime", {}),
                "prompt": s.get("prompt", ""),
                "camera_track": state.get("shots", {}).get(s.get("id"), {}).get("camera_track"),
            })

        editorial_sequence = {
            "schema_version": 2,
            "kind": "omnicam_sequence",
            "fps_num": output_rate.numerator,
            "fps_den": output_rate.denominator,
            "duration_frames": sequence_time.get("duration", {}).get("frames", 0),
            "width": render_spec["width"],
            "height": render_spec["height"],
            "shots": editorial_shots,
            "metadata": {"source": "MajoorOmniCamSequencer"},
        }

        return IO.NodeOutput(
            rendered_video,
            rendered_audio,
            editorial_sequence,
            sequence_time,
            sequence_time_json_str,
            prompt_timing_str,
        )
