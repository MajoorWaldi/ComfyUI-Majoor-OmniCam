import pytest

from omnicam.adapters.ltx_guide import plan_ltx_guide


class MetadataOnlyVideo:
    def __init__(self, *, width: int, height: int, frames: int, fps: float = 24.0):
        self.width, self.height, self.frames, self.fps = width, height, frames, fps

    def get_dimensions(self):
        return self.width, self.height

    def get_frame_count(self):
        return self.frames

    def get_frame_rate(self):
        return self.fps


def test_ltx_plan_rejects_the_source_batch_before_a_smaller_resize_can_hide_it():
    video = MetadataOnlyVideo(width=3840, height=2160, frames=121)

    with pytest.raises(ValueError, match="source decode"):
        plan_ltx_guide(
            video,
            max_frames=121,
            sampling_mode="contiguous",
            width=832,
            height=480,
        )


def test_ltx_plan_reports_source_and_output_memory_separately():
    video = MetadataOnlyVideo(width=640, height=360, frames=10)

    plan = plan_ltx_guide(
        video,
        max_frames=10,
        sampling_mode="contiguous",
        width=320,
        height=180,
    )

    assert plan["source_decode_bytes"] == 10 * 640 * 360 * 3 * 4
    assert plan["output_bytes"] == 10 * 320 * 180 * 3 * 4
    assert plan["estimated_memory_bytes"] == plan["source_decode_bytes"] + plan["output_bytes"]
