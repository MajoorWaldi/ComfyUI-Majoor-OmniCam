"""Tests for reconstruction HTTP routes."""

from __future__ import annotations

from pathlib import Path

import pytest
import pytest_asyncio
from aiohttp import web
from aiohttp.test_utils import TestClient, TestServer

from omnicam.reconstruction.jobs.manager import ReconstructionJobManager
from omnicam.reconstruction.jobs.routes import create_reconstruction_routes_table


@pytest.fixture
def fake_job_manager():
    return ReconstructionJobManager()


@pytest_asyncio.fixture
async def client(fake_job_manager):
    app = web.Application()
    routes = create_reconstruction_routes_table(fake_job_manager)
    app.add_routes(routes)
    test_client = TestClient(TestServer(app))
    await test_client.start_server()
    try:
        yield test_client
    finally:
        await test_client.close()


@pytest.mark.asyncio
async def test_capabilities_route(client):
    resp = await client.get("/majoor/omnicam/reconstruction/capabilities")
    assert resp.status == 200
    data = await resp.json()
    assert data["feature"] == "scene_reconstruction"
    assert "providers" in data


@pytest.mark.asyncio
async def test_all_job_routes_lifecycle(client, fake_job_manager):
    # 1. Start job
    payload = {
        "node_id": "n1",
        "client_id": "c1",
        "source": {"kind": "annotated_input", "value": "test.png"},
        "settings": {"quality": "balanced"},
    }
    resp = await client.post("/majoor/omnicam/reconstruction/jobs", json=payload)
    assert resp.status == 200
    data = await resp.json()
    job_id = data["job_id"]
    assert data["node_id"] == "n1"

    # 2. Get status
    resp = await client.get(f"/majoor/omnicam/reconstruction/jobs/{job_id}?clientId=c1")
    assert resp.status == 200
    status_data = await resp.json()
    assert status_data["job_id"] == job_id

    # 3. Foreign client forbidden
    resp = await client.get(f"/majoor/omnicam/reconstruction/jobs/{job_id}?clientId=foreign")
    assert resp.status == 403

    # 4. Get result (before done)
    resp = await client.get(f"/majoor/omnicam/reconstruction/jobs/{job_id}/result?clientId=c1")
    assert resp.status == 200
    result_data = await resp.json()
    assert result_data["job_id"] == job_id
    assert result_data["motion_scene"] is None

    # 5. Stop job
    resp = await client.post(f"/majoor/omnicam/reconstruction/jobs/{job_id}/stop?clientId=c1")
    assert resp.status == 200
    stop_data = await resp.json()
    assert stop_data["job_id"] == job_id

    # 6. Delete job
    resp = await client.delete(f"/majoor/omnicam/reconstruction/jobs/{job_id}?clientId=c1")
    assert resp.status == 200
    del_data = await resp.json()
    assert del_data["deleted"] is True


@pytest.mark.asyncio
async def test_oversize_payload_rejected(client):
    # Payload exceeding 256KB
    large_payload = {
        "node_id": "n1",
        "client_id": "c1",
        "source": {"kind": "annotated_input", "value": "test.png"},
        "settings": {"extra": "x" * (300 * 1024)},
    }
    resp = await client.post("/majoor/omnicam/reconstruction/jobs", json=large_payload)
    assert resp.status == 413


def test_routes_py_does_not_contain_reconstruction_handler_bodies():
    routes_py = Path(__file__).resolve().parents[2] / "omnicam" / "routes.py"
    content = routes_py.read_text(encoding="utf-8")
    assert "def reconstruction_capabilities_route" not in content
    assert "def start_reconstruction_route" not in content
    # Only import is allowed
    assert "from .reconstruction.jobs import routes" in content or "reconstruction" in content
