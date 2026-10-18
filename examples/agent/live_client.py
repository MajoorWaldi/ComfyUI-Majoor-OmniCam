"""Small loopback client for a future Comfy Agent adapter.

Import from a trusted local integration. No registration with the official
panel is implied, no execution occurs on import, and no provider key is used.
"""

from __future__ import annotations

import ipaddress
import json
import uuid
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError("Agent client does not follow redirects")


class OmniCamClient:
    def __init__(self, base_url="http://127.0.0.1:8188"):
        parts = urlsplit(base_url)
        # Literal loopback only: no DNS/proxy ambiguity or credential forwarding.
        if parts.scheme != "http" or not ipaddress.ip_address(parts.hostname or "").is_loopback:
            raise ValueError("Use an HTTP literal loopback ComfyUI address")
        if parts.username or parts.password or parts.query or parts.fragment or parts.path not in ("", "/"):
            raise ValueError("Unexpected ComfyUI URL components")
        from urllib.request import ProxyHandler

        self.base_url = base_url.rstrip("/") + "/majoor/omnicam/agent/v1"
        self.opener = build_opener(ProxyHandler({}), NoRedirect())

    def request(self, path, body=None):
        data = None if body is None else json.dumps(body).encode("utf-8")
        request = Request(self.base_url + path, data=data,  # noqa: S310 - literal loopback validated above
                          headers={"X-OmniCam-Agent": "1", "Content-Type": "application/json"})
        with self.opener.open(request, timeout=15) as response:
            encoded = response.read(1024 * 1024 + 1)
        if len(encoded) > 1024 * 1024:
            raise ValueError("Agent response exceeds limit")
        return json.loads(encoded)

    def select_session(self, target):
        """Require all discovered target fields; never guess from a numeric node id."""
        fields = ("document_id", "graph_id", "node_locator", "instance_id")
        if set(target) != set(fields) or not all(isinstance(target[key], str) and target[key] for key in fields):
            raise ValueError("Supply the complete target from session discovery")
        matches = [row for row in self.request("/sessions")["sessions"] if row.get("target") == target]
        if len(matches) != 1:
            raise ValueError("Director target is unavailable or ambiguous; rediscover sessions")
        return matches[0]["session_id"]

    def preview(self, session_id, operations, description):
        observation = self.request("/query", {"session_id": session_id, "request": {"type": "scene.summary"}})
        transaction = {"version": 1, "id": uuid.uuid4().hex, "description": description,
                       "baseRevision": observation["revision"], "operations": operations, "validateOnly": True}
        preview = self.request("/transaction", {"session_id": session_id, "transaction": transaction})
        return transaction, preview

    def apply_reviewed(self, session_id, transaction):
        """Call only after the host has displayed the preview and obtained approval.

        Keep this envelope and id on timeouts; use status(), then retry this
        exact request. Never automatically create a new id after an error.
        """
        return self.request("/transaction", {"session_id": session_id,
                                             "transaction": {**transaction, "validateOnly": False}})

    def status(self, session_id, transaction_id):
        return self.request("/transaction/status", {"session_id": session_id, "transaction_id": transaction_id})
