from __future__ import annotations

import json
from typing import Any

from comfy_api.latest import IO

from ..core.edl import edl_to_shots, otio_to_shots, sequence_to_edl, sequence_to_otio
from ..core.sequence import build_sequence, playblast_manifest, sequence_to_json, validate_sequence
from .base import OMNICAM_SEQUENCE, OMNICAM_TRACK


class MajoorOmniCamSequence(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        shots = IO.Autogrow.TemplatePrefix(OMNICAM_TRACK.Input("shot"), prefix="shot", min=1, max=32)
        return IO.Schema(
            node_id="MajoorOmniCamSequence",
            display_name="OmniCam Sequence",
            category="Majoor/OmniCam/Sequence",
            description="Assembles multiple camera tracks into a multi-shot sequence with editorial timing and shot extraction.",
            inputs=[
                IO.String.Input("shot_names", default="", multiline=True, advanced=True),
                IO.String.Input("shot_settings_json", default="[]", multiline=True, advanced=True),
                IO.Int.Input("selected_shot_index", default=0, min=0, max=31),
                IO.Autogrow.Input("shots", template=shots),
            ],
            outputs=[
                OMNICAM_SEQUENCE.Output(display_name="sequence"),
                OMNICAM_TRACK.Output(display_name="selected_shot"),
                IO.String.Output(display_name="selected_shot_name"),
                IO.String.Output(display_name="manifest_json"),
            ],
        )

    @classmethod
    def execute(cls, shot_names: str, shot_settings_json: str, selected_shot_index: int, shots: IO.Autogrow.Type) -> IO.NodeOutput:
        ordered = [shots[name] for name in sorted(shots, key=lambda value: int(value.removeprefix("shot"))) if shots[name] is not None]
        names = [name.strip() for name in shot_names.splitlines()]
        settings = json.loads(shot_settings_json) if shot_settings_json else []
        if not isinstance(settings, list):
            raise TypeError("shot_settings_json must contain a JSON list")
        sequence = build_sequence(ordered, names, settings)
        normalized = validate_sequence(sequence)
        shots_list = normalized.get("shots", [])
        if shots_list:
            shot = shots_list[max(0, min(selected_shot_index, len(shots_list) - 1))]
            selected_track = shot["track"]
            selected_name = shot["name"]
        else:
            selected_track = {}
            selected_name = ""
        manifest = playblast_manifest(sequence)
        return IO.NodeOutput(sequence, selected_track, selected_name, json.dumps(manifest, indent=2))


class MajoorOmniCamSequenceBuilder(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        shots = IO.Autogrow.TemplatePrefix(OMNICAM_TRACK.Input("shot"), prefix="shot", min=1, max=32)
        return IO.Schema(
            node_id="MajoorOmniCamSequenceBuilder",
            display_name="OmniCam Sequence Builder",
            category="Majoor/OmniCam/Sequence",
            inputs=[
                IO.String.Input("shot_names", default="", multiline=True, advanced=True),
                IO.String.Input("shot_settings_json", default="[]", multiline=True, advanced=True),
                IO.Autogrow.Input("shots", template=shots),
            ],
            outputs=[OMNICAM_SEQUENCE.Output(display_name="sequence"), IO.String.Output(display_name="sequence_json")],
        )

    @classmethod
    def execute(cls, shot_names: str, shot_settings_json: str, shots: IO.Autogrow.Type) -> IO.NodeOutput:
        ordered = [shots[name] for name in sorted(shots, key=lambda value: int(value.removeprefix("shot"))) if shots[name] is not None]
        names = [name.strip() for name in shot_names.splitlines()]
        settings = json.loads(shot_settings_json) if shot_settings_json else []
        if not isinstance(settings, list):
            raise TypeError("shot_settings_json must contain a JSON list")
        sequence = build_sequence(ordered, names, settings)
        return IO.NodeOutput(sequence, sequence_to_json(sequence))


class MajoorOmniCamSequenceShot(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamSequenceShot",
            display_name="OmniCam Sequence Shot",
            category="Majoor/OmniCam/Sequence",
            inputs=[OMNICAM_SEQUENCE.Input("sequence"), IO.Int.Input("shot_index", default=0, min=0, max=31)],
            outputs=[OMNICAM_TRACK.Output(display_name="camera_track"), IO.String.Output(display_name="shot_name")],
        )

    @classmethod
    def execute(cls, sequence: dict[str, Any], shot_index: int) -> IO.NodeOutput:
        normalized = validate_sequence(sequence)
        shot = normalized["shots"][max(0, min(shot_index, len(normalized["shots"]) - 1))]
        return IO.NodeOutput(shot["track"], shot["name"])


class MajoorOmniCamSequenceManifest(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamSequenceManifest",
            display_name="OmniCam Sequence Playblast Manifest",
            category="Majoor/OmniCam/Sequence",
            inputs=[OMNICAM_SEQUENCE.Input("sequence")],
            outputs=[IO.String.Output(display_name="manifest_json")],
        )

    @classmethod
    def execute(cls, sequence: dict[str, Any]) -> IO.NodeOutput:
        return IO.NodeOutput(json.dumps(playblast_manifest(sequence), indent=2))


class MajoorOmniCamSequenceEDL(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamSequenceEDL",
            display_name="OmniCam Sequence → EDL/OTIO Export",
            category="Majoor/OmniCam/Sequence",
            description="Exports the sequence as CMX3600 EDL text and OTIO JSON for editorial interchange.",
            inputs=[OMNICAM_SEQUENCE.Input("sequence"), IO.String.Input("title", default="OmniCam Sequence", multiline=False)],
            outputs=[IO.String.Output(display_name="edl"), IO.String.Output(display_name="otio_json")],
        )

    @classmethod
    def execute(cls, sequence: dict[str, Any], title: str) -> IO.NodeOutput:
        return IO.NodeOutput(sequence_to_edl(sequence, title or "OmniCam Sequence"), json.dumps(sequence_to_otio(sequence, title or "OmniCam Sequence"), indent=2))


class MajoorOmniCamSequenceEDLImport(IO.ComfyNode):
    @classmethod
    def define_schema(cls):
        return IO.Schema(
            node_id="MajoorOmniCamSequenceEDLImport",
            display_name="OmniCam EDL/OTIO Shot Import",
            category="Majoor/OmniCam/Sequence",
            description="Parses an EDL or OTIO JSON document into the shot skeleton list (names, order, durations) consumed by the Sequence Builder.",
            inputs=[
                IO.String.Input("document", default="", multiline=True),
                IO.Combo.Input("format", options=["auto", "edl", "otio"]),
                IO.Int.Input("fps", default=24, min=1, max=120, step=1),
            ],
            outputs=[IO.String.Output(display_name="shot_names"), IO.String.Output(display_name="durations_json")],
        )

    @classmethod
    def execute(cls, document: str, format: str, fps: int) -> IO.NodeOutput:
        text = document.strip()
        if not text:
            raise ValueError("Provide an EDL or OTIO document")
        mode = format
        if mode == "auto":
            mode = "otio" if text.startswith("{") else "edl"
        if mode == "otio":
            shots = otio_to_shots(json.loads(text), fps)
        else:
            shots = edl_to_shots(text, fps)
        names = "\n".join(shot["name"] for shot in shots)
        durations = json.dumps([shot["duration_frames"] for shot in shots])
        return IO.NodeOutput(names, durations)
