from types import SimpleNamespace

import pytest

# torch is a ComfyUI runtime dependency, not a core one.
torch = pytest.importorskip("torch")

from omnicam.core import video_sampling  # noqa: E402

sample_video_frames = video_sampling.sample_video_frames
sampling_indices = video_sampling.sampling_indices


class _TrimmedVideo:
    def __init__(self, parent, start_time, duration):
        self.parent = parent
        self.start = round(start_time * parent.fps)
        self.count = max(1, round(duration * parent.fps))

    def get_components(self):
        self.parent.decoded_ranges.append((self.start, self.count))
        values = torch.arange(self.start, min(self.parent.total, self.start + self.count), dtype=torch.float32)
        return SimpleNamespace(images=values[:, None, None, None].repeat(1, 2, 3, 3))


class _Video:
    fps = 24.0
    total = 2400

    def __init__(self):
        self.decoded_ranges = []

    def get_frame_rate(self): return self.fps
    def get_frame_count(self): return self.total
    def get_dimensions(self): return (3, 2)
    def get_components(self): raise AssertionError("full source must never be decoded")
    def as_trimmed(self, *, start_time, duration, strict_duration=False):
        assert strict_duration is False
        return _TrimmedVideo(self, start_time, duration)


def test_uniform_sampling_decodes_only_planned_single_frames():
    video = _Video()
    frames = sample_video_frames(video, max_frames=32, mode="uniform")
    assert frames.shape == (32, 2, 3, 3)
    assert len(video.decoded_ranges) == 32
    assert all(count == 1 for _, count in video.decoded_ranges)
    assert video.decoded_ranges[-1][0] == 2399


def test_contiguous_sampling_trims_before_decode():
    video = _Video()
    frames = sample_video_frames(video, start_frame=100, end_frame=999, max_frames=121, mode="contiguous")
    assert frames.shape[0] == 121
    assert video.decoded_ranges == [(100, 121)]


def test_sampling_plan_includes_both_uniform_endpoints():
    assert sampling_indices(101, 10, 90, 3, "uniform") == [10, 50, 90]


@pytest.mark.parametrize(
    ("total_frames", "source_fps", "max_seconds", "expected_count"),
    [
        (150, 30.0, None, 120),
        (300, 60.0, None, 120),
        (60, 12.0, None, 120),
        (480, 24.0, 15.0, 360),
    ],
)
def test_resampling_plan_preserves_duration_at_24_fps(
    total_frames, source_fps, max_seconds, expected_count,
):
    indices = video_sampling.resampling_indices(
        total_frames, source_fps, 24.0, max_seconds=max_seconds,
    )
    assert len(indices) == expected_count
    assert all(0 <= index < total_frames for index in indices)


def test_upsampling_repeats_source_frames_instead_of_shortening_the_clip():
    indices = video_sampling.resampling_indices(60, 12.0, 24.0)
    assert indices[:6] == [0, 0, 1, 2, 2, 2]
    assert indices[-1] == 59
    assert len(set(indices)) == 60


def test_video_resampling_decodes_a_five_second_30_fps_clip_to_120_frames():
    video = _Video()
    video.fps = 30.0
    video.total = 150
    frames = video_sampling.resample_video_frames(video, target_fps=24.0, max_seconds=15.0)
    assert frames.shape == (120, 2, 3, 3)
    assert frames[0, 0, 0, 0].item() == 0
    assert frames[-1, 0, 0, 0].item() == 149


def test_h3_native_resampling_bounds_memory_by_using_contiguous_ranges():
    video = _Video()
    video.fps = 24.0
    video.total = 120
    # 24 -> 24 fps contiguous clip: one contiguous decode range, not N seeks.
    frames = video_sampling.resample_video_frames(video, target_fps=24.0)
    assert frames.shape[0] == 120
    assert video.decoded_ranges == [(0, 120)]

def test_h3_native_resampling_groups_source_ranges_for_downsampling():
    video = _Video()
    video.fps = 30.0
    video.total = 150
    # 30 -> 24 fps downsampling
    frames = video_sampling.resample_video_frames(video, target_fps=24.0)
    assert frames.shape[0] == 120
    # The source indices are sampled, so they should be grouped into ranges
    # It won't be just (0, 150) because some frames are skipped.
    assert len(video.decoded_ranges) < 120
    # Each range was decoded exactly once
    assert all(count >= 1 for _, count in video.decoded_ranges)

def test_h3_native_resampling_repeats_output_without_decoding_repeatedly():
    video = _Video()
    video.fps = 12.0
    video.total = 60
    # 12 -> 24 fps upsampling
    frames = video_sampling.resample_video_frames(video, target_fps=24.0)
    assert frames.shape[0] == 120
    # Source frames are repeated in target, but we only decode the contiguous source once
    # Since all source frames are needed (repeatedly), it's just one range!
    assert video.decoded_ranges == [(0, 60)]

def test_h3_native_resampling_empty_source():
    video = _Video()
    video.total = 0
    frames = video_sampling.resample_video_frames(video, target_fps=24.0)
    assert frames.shape == (0, 2, 3, 3)

def test_h3_native_resampling_respects_max_seconds():
    video = _Video()
    video.fps = 24.0
    video.total = 1000
    frames = video_sampling.resample_video_frames(video, target_fps=24.0, max_seconds=15.0)
    # 15 seconds * 24 fps = 360 frames
    assert frames.shape[0] == 360
    assert video.decoded_ranges == [(0, 360)]


def test_h3_native_resampling_respects_max_frames():
    video = _Video()
    video.fps = 24.0
    video.total = 1440
    frames = video_sampling.resample_video_frames(video, target_fps=24.0, max_frames=90)
    assert frames.shape[0] == 90
    assert video.decoded_ranges == [(0, 90)]
