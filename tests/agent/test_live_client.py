"""Example client selection and protocol safety without opening sockets."""

import importlib.util
from pathlib import Path

import pytest


def client_class():
    spec = importlib.util.spec_from_file_location("omnicam_example_client", Path(__file__).parents[2] / "examples/agent/live_client.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.OmniCamClient


@pytest.mark.parametrize("url", ["https://remote.example", "http://localhost:8188", "http://127.0.0.1@remote.example", "file:///tmp", "http://127.0.0.1/?x=y"])
def test_client_rejects_nonliteral_or_credentialed_destinations(url):
    with pytest.raises(ValueError):
        client_class()(url)


def test_client_requires_complete_unambiguous_target():
    client = client_class()()
    target = {"document_id": "one", "graph_id": "graph", "node_locator": "graph:42", "instance_id": "instance"}
    client.request = lambda path: {"sessions": [{"session_id": "a", "target": target}, {"session_id": "b", "target": {**target, "document_id": "two"}}]}
    assert client.select_session(target) == "a"
    with pytest.raises(ValueError):
        client.select_session({"node_id": "42"})
    client.request = lambda path: {"sessions": []}
    with pytest.raises(ValueError):
        client.select_session(target)
