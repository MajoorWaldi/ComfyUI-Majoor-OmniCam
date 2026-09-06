"""Deterministic fake reconstruction provider and fixtures for testing."""

from __future__ import annotations

import math

import numpy as np
import torch

from omnicam.reconstruction.providers.base import (
    CancelToken,
    ProgressSink,
    ProviderCapabilities,
)
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import GeometryEvidence, ReconstructionSource


class FakeCancelToken:
    """Controllable cancellation token for test scenarios."""

    def __init__(self) -> None:
        self._cancelled = False

    def cancel(self) -> None:
        self._cancelled = True

    def is_cancelled(self) -> bool:
        return self._cancelled


class FakeReconstructionProvider:
    """Deterministic, CPU-only provider producing synthetic planar geometry."""

    provider_id = "fake"

    def __init__(
        self,
        *,
        grid_size: int = 32,
        distance: float = 2.0,
        fov_deg: float = 60.0,
        available: bool = True,
        fail: bool = False,
    ) -> None:
        self.grid_size = grid_size
        self.distance = distance
        self.fov_deg = fov_deg
        self.available = available
        self.fail = fail

    def capabilities(self) -> ProviderCapabilities:
        return ProviderCapabilities(
            provider_id=self.provider_id,
            available=self.available,
            modes=["geometry", "layout"],
            source_kinds=["annotated_input", "annotated_output"],
            reason="" if self.available else "Fake provider intentionally disabled",
            recommended=False,
            metadata={"synthetic": True},
        )

    def reconstruct(
        self,
        source: ReconstructionSource,
        settings: ReconstructionSettings,
        *,
        progress: ProgressSink | None = None,
        cancel: CancelToken | None = None,
    ) -> GeometryEvidence:
        if self.fail:
            raise RuntimeError("Fake provider inference failure")

        if cancel and cancel.is_cancelled():
            raise RuntimeError("Operation cancelled")

        if progress:
            progress("INFER_GEOMETRY", 0.25, "Running synthetic inference")

        h, w = self.grid_size, self.grid_size

        # Create camera intrinsics for fov_deg (OpenCV convention: fx, fy, cx, cy)
        fx = (w / 2.0) / math.tan(math.radians(self.fov_deg / 2.0))
        fy = (h / 2.0) / math.tan(math.radians(self.fov_deg / 2.0))
        cx = w / 2.0
        cy = h / 2.0
        intrinsics = torch.tensor(
            [[[fx, 0.0, cx], [0.0, fy, cy], [0.0, 0.0, 1.0]]],
            dtype=torch.float32,
        )

        # Create a grid of points with ground in lower half
        # In OpenCV: X right, Y down, Z forward
        y_indices, x_indices = np.meshgrid(np.arange(h), np.arange(w), indexing="ij")
        # Unproject to 3D points
        z = np.full((h, w), self.distance, dtype=np.float32)
        # Add a floor slant to the bottom 40% of rows
        floor_cutoff = int(h * 0.6)
        # Tilt bottom into a ground plane
        for r in range(floor_cutoff, h):
            # As r increases, Y increases (downward), Z increases (further)
            frac = (r - floor_cutoff) / float(h - floor_cutoff)
            z[r, :] = self.distance + frac * 2.0

        x = (x_indices - cx) * z / fx
        y = (y_indices - cy) * z / fy

        pts_np = np.stack([x, y, z], axis=-1).astype(np.float32)
        points = torch.from_numpy(pts_np).unsqueeze(0)  # [1, H, W, 3]
        depth = torch.from_numpy(z).unsqueeze(0)  # [1, H, W]
        mask = torch.ones((1, h, w), dtype=torch.bool)
        image = torch.full((1, h, w, 3), 0.5, dtype=torch.float32)

        # Normals: dy x dx outward in OpenCV (Y down)
        normals = torch.zeros((1, h, w, 3), dtype=torch.float32)
        normals[:, :, :, 2] = -1.0  # Facing camera
        # For the floor, normal points up in world (which is -Y in OpenCV)
        normals[:, floor_cutoff:, :, 1] = -1.0
        normals[:, floor_cutoff:, :, 2] = 0.0

        if progress:
            progress("INFER_GEOMETRY", 0.52, "Inference complete")

        return GeometryEvidence(
            points=points,
            depth=depth,
            intrinsics=intrinsics,
            mask=mask,
            normals=normals,
            image=image,
            coordinate_system="opencv_x_right_y_down_z_forward",
            provider_version="fake-1.0",
            scale_mode="relative",
            confidence=0.92,
        )
