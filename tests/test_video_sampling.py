from types import SimpleNamespace

import pytest

# torch is a ComfyUI runtime dependency, not a core one.
torch = pytest.importorskip("torch")

from omnicam.core.video_sampling import sample_video_frames, sampling_indices  # noqa: E402


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
