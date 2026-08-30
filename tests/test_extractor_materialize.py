"""Managed materialization of runtime-only ComfyUI VIDEO values."""

from __future__ import annotations

from pathlib import Path

from omnicam.extractor.materialize import materialize_video_reference


class FakeVideo:
    def __init__(self, source=None, *, trim=(0.0, 0.0)):
        self.source = source
        self.trim = trim
        self.saved = []

    def get_stream_source(self):
        return self.source

    def get_active_trim_window(self):
        return self.trim

    def save_to(self, path):
        target = Path(path)
        target.write_bytes(b"runtime video")
        self.saved.append(target)


def _roots(tmp_path):
    roots = {
        "input": tmp_path / "input",
        "output": tmp_path / "output",
        "temp": tmp_path / "temp",
    }
    for root in roots.values():
        root.mkdir()
    return roots


def test_runtime_video_is_saved_below_comfy_temp(tmp_path):
    roots = _roots(tmp_path)
    video = FakeVideo(source=None)

    reference = materialize_video_reference(video, roots=roots)

    assert reference.startswith("omnicam/extractor_runtime/")
    assert reference.endswith(".mp4 [temp]")
    relative = reference.removesuffix(" [temp]")
    assert (roots["temp"] / relative).read_bytes() == b"runtime video"
    assert video.saved == [roots["temp"] / relative]


def test_existing_managed_file_is_reused_without_copy(tmp_path):
    roots = _roots(tmp_path)
    source = roots["input"] / "clips" / "shot.mp4"
    source.parent.mkdir()
    source.write_bytes(b"video")
    video = FakeVideo(source=str(source))

    assert materialize_video_reference(video, roots=roots) == "clips/shot.mp4 [input]"
    assert video.saved == []


def test_trimmed_file_is_materialized_instead_of_previewing_the_untrimmed_source(tmp_path):
    roots = _roots(tmp_path)
    source = roots["input"] / "shot.mp4"
    source.write_bytes(b"video")
    video = FakeVideo(source=str(source), trim=(1.0, 2.0))

    reference = materialize_video_reference(video, roots=roots)

    assert reference.endswith(" [temp]")
    assert video.saved

