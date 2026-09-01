"""Browser fallback frame decoding stays bounded and source-safe."""

from __future__ import annotations

import sys
import types

import pytest

from omnicam.extractor import preview_frame

SOURCE = {
    "kind": "managed",
    "value": "omnicam/extractor_sources/shot.mp4",
}


def _resolve_clip(monkeypatch, clip):
    monkeypatch.setattr(
        preview_frame,
        "resolve_interactive_video_source",
        lambda source: clip.get_stream_source(),
    )


def test_preview_frame_clamps_requested_index_to_the_video_timeline(monkeypatch, clip):
    """A scrubber cannot request a frame outside the finite source timeline."""
    _resolve_clip(monkeypatch, clip)

    before_start = preview_frame.decode_preview_frame(SOURCE, -12, 640)
    after_end = preview_frame.decode_preview_frame(SOURCE, 10_000, 640)

    assert before_start.frame == 0
    assert after_end.frame == 23
    assert before_start.frame_count == 24
    assert after_end.frame_count == 24


def test_preview_frame_clamps_unknown_count_stream_at_eof(monkeypatch):
    """An unknown container count must not leak a beyond-EOF frame index."""
    class Image:
        def save(self, output, **_kwargs):
            output.write(b"\xff\xd8frame\xff\xd9")

    class Frame:
        width = 320
        height = 180

        def reformat(self, **_kwargs):
            return self

        def to_image(self):
            return Image()

    class Container:
        def __init__(self):
            self.streams = [types.SimpleNamespace(type="video", frames=0)]

        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def seek(self, *_args, **_kwargs):
            pass

        def decode(self, _stream):
            return iter((Frame(), Frame(), Frame()))

    monkeypatch.setattr(preview_frame, "resolve_interactive_video_source", lambda _source: "shot.mp4")
    monkeypatch.setitem(sys.modules, "av", types.SimpleNamespace(open=lambda _path: Container()))

    preview = preview_frame.decode_preview_frame(SOURCE, 10_000, 640)

    assert preview.frame == 2
    assert preview.frame_count == 3


def test_preview_frame_is_a_jpeg_with_its_media_type(monkeypatch, clip):
    """A browser fallback consumes one directly displayable JPEG payload."""
    _resolve_clip(monkeypatch, clip)

    frame = preview_frame.decode_preview_frame(SOURCE, 3, 640)

    assert frame.mime_type == "image/jpeg"
    assert frame.data.startswith(b"\xff\xd8")
    assert frame.data.endswith(b"\xff\xd9")
    assert frame.frame == 3


def test_preview_frame_fits_the_largest_edge_with_aspect_preserved(monkeypatch, clip):
    """A small browser image must not exceed its explicitly bounded edge."""
    _resolve_clip(monkeypatch, clip)

    frame = preview_frame.decode_preview_frame(SOURCE, 3, 64)

    assert (frame.width, frame.height) == (64, 36)
    assert max(frame.width, frame.height) == 64


def test_preview_frame_rejects_non_positive_max_dimension(monkeypatch, clip):
    """Zero must not be silently turned into the minimum preview size."""
    _resolve_clip(monkeypatch, clip)

    with pytest.raises(ValueError, match="max_dimension"):
        preview_frame.decode_preview_frame(SOURCE, 3, 0)
