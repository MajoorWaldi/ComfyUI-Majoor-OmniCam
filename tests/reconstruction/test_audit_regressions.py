"""Regressions for defects found in the scene reconstruction audit.

Each test here pins a behaviour that was wrong when the feature was first wired
up, so the fix cannot quietly come undone.
"""

from __future__ import annotations

import math

import pytest
import torch

from omnicam.reconstruction.camera import reconstruct_camera_from_evidence
from omnicam.reconstruction.jobs.manager import (
    JobAccessDeniedError,
    JobLimitReachedError,
    ReconstructionJobManager,
)
from omnicam.reconstruction.jobs.runner import run_reconstruction_job
from omnicam.reconstruction.jobs.types import FAILED, ReconstructionJob
from omnicam.reconstruction.planes import scale_planes
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import (
    GeometryEvidence,
    ReconstructedPlane,
    ReconstructionSource,
)


def _source() -> ReconstructionSource:
    return ReconstructionSource(kind="annotated_input", value="room.png")


def test_normalized_intrinsics_do_not_blow_the_fov_up_to_180_degrees():
    # MoGe reports intrinsics over a unit image plane (cx = cy = 0.5). Read as
    # pixels, fx ~ 0.9 against a 1024px width gives 2*atan(569) ~ 179.8 degrees.
    fx = fy = 1.0 / (2.0 * math.tan(math.radians(30.0)))  # 60 degree fov
    k = torch.tensor([[[fx, 0.0, 0.5], [0.0, fy, 0.5], [0.0, 0.0, 1.0]]])
    evidence = GeometryEvidence(
        points=torch.zeros((1, 720, 1024, 3)),
        intrinsics=k,
        normalized_intrinsics=True,
    )

    cam = reconstruct_camera_from_evidence(evidence, ReconstructionSettings(recover_fov=True))

    assert pytest.approx(cam.fov_x_degrees, rel=1e-3) == 60.0
    assert pytest.approx(cam.fov_y_degrees, rel=1e-3) == 60.0


def test_pixel_intrinsics_still_use_the_image_dimensions():
    w, h = 1280, 720
    fx = (w / 2.0) / math.tan(math.radians(35.0))
    fy = (h / 2.0) / math.tan(math.radians(22.5))
    k = torch.tensor([[[fx, 0.0, w / 2.0], [0.0, fy, h / 2.0], [0.0, 0.0, 1.0]]])
    evidence = GeometryEvidence(
        points=torch.zeros((1, h, w, 3)),
        image=torch.zeros((1, h, w, 3)),
        intrinsics=k,
    )

    cam = reconstruct_camera_from_evidence(evidence, ReconstructionSettings(recover_fov=True))

    assert pytest.approx(cam.fov_x_degrees, rel=1e-3) == 70.0
    assert pytest.approx(cam.fov_y_degrees, rel=1e-3) == 45.0


def test_scale_planes_follows_the_mesh_into_scaled_space():
    plane = ReconstructedPlane(
        plane_type="ground",
        center=(1.0, -2.0, 3.0),
        normal=(0.0, 1.0, 0.0),
        size=(4.0, 6.0),
        confidence=0.8,
        inlier_ratio=0.5,
    )

    scaled = scale_planes([plane], 2.5)[0]

    assert scaled.center == (2.5, -5.0, 7.5)
    assert scaled.size == (10.0, 15.0)
    # Orientation and fit quality are scale invariant.
    assert scaled.normal == plane.normal
    assert scaled.confidence == plane.confidence
    assert scale_planes([plane], 1.0)[0] is plane


def test_a_request_without_a_client_id_cannot_read_someone_elses_job():
    manager = ReconstructionJobManager()
    job = manager.create_job("node_1", "owner", _source(), ReconstructionSettings())

    # "" is what the HTTP layer produces when clientId is omitted entirely.
    for impostor in ("", "someone_else"):
        with pytest.raises(JobAccessDeniedError):
            manager.get_job(job.job_id, client_id=impostor)
        with pytest.raises(JobAccessDeniedError):
            manager.stop_job(job.job_id, client_id=impostor)
        with pytest.raises(JobAccessDeniedError):
            manager.delete_job(job.job_id, client_id=impostor)

    assert manager.get_job(job.job_id, client_id="owner").job_id == job.job_id


def test_the_job_table_is_bounded():
    manager = ReconstructionJobManager(max_jobs=2)
    manager.create_job("n", "c", _source(), ReconstructionSettings())
    manager.create_job("n", "c", _source(), ReconstructionSettings())

    with pytest.raises(JobLimitReachedError):
        manager.create_job("n", "c", _source(), ReconstructionSettings())


def test_an_unregistered_provider_fails_the_job_instead_of_stranding_it():
    # "vggt" passes settings validation but has no implementation registered.
    job = ReconstructionJob(
        job_id="j1",
        node_id="n1",
        client_id="c1",
        source=_source(),
        settings=ReconstructionSettings(provider="vggt"),
    )
    events: list[str] = []

    run_reconstruction_job(job, on_event=lambda kind, _job: events.append(kind))

    assert job.state == FAILED
    assert job.error is not None
    assert job.error["code"] == "RECON_PROVIDER_UNAVAILABLE"
    assert "error" in events


def test_quality_is_validated_like_provider_and_mode():
    with pytest.raises(ValueError, match="quality"):
        ReconstructionSettings(quality="ultra")
