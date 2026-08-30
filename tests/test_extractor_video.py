"""Streaming decode of a ComfyUI VIDEO into solver frames."""

from fractions import Fraction

import numpy as np
import pytest

from omnicam.extractor.video import (
    VideoDecodeError,
    decode_solver_frames,
    inspect_video,
    solver_scale,
)

av = pytest.importorskip("av")


class FakeVideo:
    """The slice of the VIDEO contract the extractor actually uses."""

    def __init__(self, path, width, height, fps, frame_count, trim=(0.0, 0.0)):
        self._path, self._trim = str(path), trim
        self._width, self._height = width, height
        self._fps, self._frame_count = fps, frame_count

    def get_stream_source(self):
        return self._path

    def get_dimensions(self):
        return self._width, self._height

    def get_frame_rate(self):
        return Fraction(self._fps).limit_denominator(1000)

    def get_frame_count(self):
        return self._frame_count

    def get_active_trim_window(self):
        return self._trim


def write_clip(path, frames=24, width=160, height=120, fps=24):
    """A tiny synthetic clip: a moving bar, so every frame differs."""
    with av.open(str(path), mode="w") as container:
        stream = container.add_stream("mpeg4", rate=fps)
        stream.width, stream.height, stream.pix_fmt = width, height, "yuv420p"
        for index in range(frames):
            image = np.zeros((height, width, 3), dtype=np.uint8)
            column = (index * 5) % (width - 10)
            image[:, column:column + 10] = 255
            container.mux(stream.encode(av.VideoFrame.from_ndarray(image, format="rgb24")))
        container.mux(stream.encode(None))
    return path


@pytest.fixture
def clip(tmp_path):
    path = write_clip(tmp_path / "shot.mp4")
    return FakeVideo(path, 160, 120, 24, 24)


def test_inspect_reads_dimensions_and_frame_rate(clip):
    info = inspect_video(clip)
    assert (info.width, info.height) == (160, 120)
    assert info.fps == pytest.approx(24.0)
    assert info.frame_count == 24


def test_inspect_rejects_a_zero_frame_rate(tmp_path):
    path = write_clip(tmp_path / "zero.mp4")
    with pytest.raises(VideoDecodeError, match="positive frame rate"):
        inspect_video(FakeVideo(path, 160, 120, 0, 24))


def test_solver_scale_never_upscales():
    from omnicam.extractor.video import VideoInfo

    small = solver_scale(VideoInfo(320, 180, 24.0, 24), max_dimension=960)
    assert (small.width, small.height) == (320, 180)
    assert small.scale_x == 1.0


def test_solver_scale_fits_the_longest_edge_and_keeps_the_aspect():
    from omnicam.extractor.video import VideoInfo

    scale = solver_scale(VideoInfo(1920, 1080, 24.0, 240), max_dimension=960)
    assert scale.width == 960
    assert scale.height == 540
    assert scale.scale_x == pytest.approx(0.5)
    assert scale.scale_y == pytest.approx(0.5)


def test_decode_returns_downscaled_uint8_rgb(clip):
    decoded = decode_solver_frames(clip, frame_step=1, max_dimension=80)
    assert decoded.scale.width == 80
    first = decoded.frames[0].rgb
    assert first.dtype == np.uint8
    assert first.shape == (60, 80, 3)


def test_decode_keeps_the_source_resolution_in_the_info(clip):
    decoded = decode_solver_frames(clip, frame_step=1, max_dimension=80)
    assert (decoded.info.width, decoded.info.height) == (160, 120)


def test_frame_step_keeps_source_timeline_frame_numbers(clip):
    decoded = decode_solver_frames(clip, frame_step=3, max_dimension=160)
    numbers = [frame.source_frame for frame in decoded.frames]
    assert numbers == list(range(0, numbers[-1] + 1, 3))
    assert numbers[:4] == [0, 3, 6, 9], "solver indices must never replace source frames"


def test_timestamps_follow_the_source_frame_rate(clip):
    decoded = decode_solver_frames(clip, frame_step=2, max_dimension=160)
    for frame in decoded.frames:
        assert frame.timestamp_seconds == pytest.approx(frame.source_frame / 24.0, abs=0.02)


def test_frames_are_sorted_and_unique(clip):
    decoded = decode_solver_frames(clip, frame_step=1, max_dimension=160)
    numbers = [frame.source_frame for frame in decoded.frames]
    assert numbers == sorted(numbers)
    assert len(numbers) == len(set(numbers))


def test_a_trim_window_limits_what_is_decoded(tmp_path):
    path = write_clip(tmp_path / "trimmed.mp4", frames=24)
    trimmed = FakeVideo(path, 160, 120, 24, 24, trim=(0.25, 0.25))
    decoded = decode_solver_frames(trimmed, frame_step=1, max_dimension=160)
    assert len(decoded.frames) <= 8
    assert decoded.frames[0].source_frame == 0, "a trimmed clip starts its own timeline at zero"


def test_a_clip_with_one_usable_frame_is_refused(tmp_path):
    path = write_clip(tmp_path / "single.mp4", frames=1)
    with pytest.raises(VideoDecodeError, match="at least 2 usable frames"):
        decode_solver_frames(FakeVideo(path, 160, 120, 24, 1), frame_step=1, max_dimension=160)


def test_too_large_a_frame_step_is_refused(tmp_path):
    path = write_clip(tmp_path / "short.mp4", frames=6)
    with pytest.raises(VideoDecodeError, match="at least 2 usable frames"):
        decode_solver_frames(FakeVideo(path, 160, 120, 24, 6), frame_step=10, max_dimension=160)


def test_the_sample_budget_is_enforced(clip):
    with pytest.raises(VideoDecodeError, match="raise frame_step"):
        decode_solver_frames(clip, frame_step=1, max_dimension=160, max_frames=4)


def test_the_raw_rgb_memory_budget_is_enforced_before_an_extra_frame_is_kept(clip):
    bytes_per_frame = 160 * 120 * 3
    with pytest.raises(VideoDecodeError, match="memory budget"):
        decode_solver_frames(
            clip,
            frame_step=1,
            max_dimension=160,
            max_decoded_bytes=bytes_per_frame * 4,
        )


def test_an_undecodable_source_reports_a_video_error(tmp_path):
    broken = tmp_path / "broken.mp4"
    broken.write_bytes(b"this is not a video")
    with pytest.raises(VideoDecodeError, match="could not decode"):
        decode_solver_frames(FakeVideo(broken, 160, 120, 24, 24), frame_step=1, max_dimension=160)


def test_a_variable_frame_rate_clip_is_placed_by_time_and_warned_about(tmp_path):
    """Frames are timed at 24 fps but the container declares 30: a VFR stand-in."""
    path = write_clip(tmp_path / "vfr.mp4", frames=24, fps=24)
    decoded = decode_solver_frames(
        FakeVideo(path, 160, 120, 30, 24), frame_step=1, max_dimension=160
    )
    assert decoded.info.variable_frame_rate
    assert any("variable frame rate" in warning for warning in decoded.warnings)
    for frame in decoded.frames:
        assert frame.source_frame == round(frame.timestamp_seconds * 30.0)


def test_solver_scale_floors_the_short_edge_without_stretching():
    from omnicam.extractor.video import VideoInfo

    scale = solver_scale(VideoInfo(1920, 40, 24.0, 24), max_dimension=320)
    assert scale.height >= 32
    assert scale.scale_x == pytest.approx(scale.scale_y, rel=0.05)


def test_a_file_source_presents_the_video_contract(tmp_path):
    from omnicam.extractor.video import FileVideoSource

    path = write_clip(tmp_path / "file-source.mp4", frames=12, width=96, height=64, fps=25)
    source = FileVideoSource(path)
    assert source.get_dimensions() == (96, 64)
    assert float(source.get_frame_rate()) == pytest.approx(25.0)
    assert source.get_frame_count() >= 1
    assert source.get_active_trim_window() == (0.0, 0.0)

    decoded = decode_solver_frames(source, frame_step=1, max_dimension=96)
    assert len(decoded.frames) >= 10
    assert decoded.frames[0].rgb.shape[:2] == (64, 96)


def test_a_file_source_rejects_a_file_with_no_video_stream(tmp_path):
    from omnicam.extractor.video import FileVideoSource

    broken = tmp_path / "novideo.mp4"
    broken.write_bytes(b"still not a video")
    with pytest.raises(Exception, match=r"(?i)video|invalid|error"):
        FileVideoSource(broken)
