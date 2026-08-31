"""Shared pytest fixtures.

The extractor needs a real decodable clip, and writing one per test module
would encode the same PyAV incantation three times.
"""

from fractions import Fraction

import numpy as np
import pytest


class FakeVideo:
    """The slice of the ComfyUI VIDEO contract the extractor consumes."""

    def __init__(self, path, width=320, height=180, fps=24, frame_count=24):
        self._path, self._width, self._height = str(path), width, height
        self._fps, self._frame_count = fps, frame_count

    def get_stream_source(self):
        return self._path

    def get_dimensions(self):
        return self._width, self._height

    def get_frame_rate(self):
        return Fraction(self._fps)

    def get_frame_count(self):
        return self._frame_count

    def get_active_trim_window(self):
        return 0.0, 0.0


@pytest.fixture
def clip(tmp_path):
    """A 24-frame 320x180 clip whose every frame differs.

    Tests that depend on this fixture are skipped when PyAV is not installed.
    """
    av = pytest.importorskip("av")
    path = tmp_path / "shot.mp4"
    width, height, frames = 320, 180, 24
    with av.open(str(path), mode="w") as container:
        stream = container.add_stream("mpeg4", rate=24)
        stream.width, stream.height, stream.pix_fmt = width, height, "yuv420p"
        for index in range(frames):
            image = np.zeros((height, width, 3), dtype=np.uint8)
            column = (index * 7) % (width - 12)
            image[:, column:column + 12] = 255
            container.mux(stream.encode(av.VideoFrame.from_ndarray(image, format="rgb24")))
        container.mux(stream.encode(None))
    return FakeVideo(path, width, height, 24, frames)
