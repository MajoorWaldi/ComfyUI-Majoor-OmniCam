from fractions import Fraction
import sys
import types

import pytest
import torch

from omnicam.video.sequence_video import _extract_video_frames, _wrap_output_video, assemble_sequence_video


def test_video_wrapper_uses_current_comfy_video_components_api(monkeypatch):
    class VideoComponents:
        def __init__(self, *, images, audio, frame_rate):
            self.images = images
            self.audio = audio
            self.frame_rate = frame_rate

    class VideoFromComponents:
        def __init__(self, components):
            self.components = components

    latest = types.ModuleType("comfy_api.latest")
    latest.Types = types.SimpleNamespace(VideoComponents=VideoComponents)
    latest.InputImpl = types.SimpleNamespace(VideoFromComponents=VideoFromComponents)
    package = types.ModuleType("comfy_api")
    package.latest = latest
    monkeypatch.setitem(sys.modules, "comfy_api", package)
    monkeypatch.setitem(sys.modules, "comfy_api.latest", latest)

    images = torch.zeros((1, 2, 2, 3))
    wrapped = _wrap_output_video(images, 24000 / 1001)
    assert wrapped.components.images is images
    assert wrapped.components.frame_rate == Fraction(24000, 1001)


def test_strict_resolution_rejects_mismatched_shots():
    with pytest.raises(ValueError, match="Strict resolution"):
        assemble_sequence_video(
            sequence_state={"shots": {}, "shot_order": []},
            shot_inputs={
                "shot1": torch.zeros((1, 8, 8, 3)),
                "shot2": torch.zeros((1, 10, 8, 3)),
            },
            resolution_mode="strict",
        )


def test_broken_comfy_video_is_reported_instead_of_rendering_black():
    class BrokenVideo:
        def get_components(self):
            raise RuntimeError("decoder failed")

    with pytest.raises(ValueError, match="decoder failed"):
        _extract_video_frames(BrokenVideo())
