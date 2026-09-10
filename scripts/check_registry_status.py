"""Wait for a published node version to become Active on the Comfy Registry.

A successful ``comfy node publish`` only *uploads* a version; the Registry then
scans it and may leave it Pending, or move it to Flagged / Banned. So the
GitHub Release must not be finalized on the upload alone -- it waits here until
the Registry reports the version Active.

    python scripts/check_registry_status.py \
        --node majoor-omnicam --version 0.3.1 --timeout 900 --interval 15

Endpoint (verified against the Comfy Registry OpenAPI spec):

    GET https://api.comfy.org/nodes/{nodeId}/versions/{version}
    -> 200 {"status": "NodeVersionStatus...", "status_reason": "..."}
    -> 404 while the version is not visible yet

Exit codes: 0 Active; 1 Flagged / Banned / Deleted / timed out; 2 bad usage.
Standard library only -- no new runtime dependency.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request

DEFAULT_BASE_URL = "https://api.comfy.org"

STATUS_ACTIVE = "NodeVersionStatusActive"
STATUS_PENDING = "NodeVersionStatusPending"
STATUS_FLAGGED = "NodeVersionStatusFlagged"
STATUS_BANNED = "NodeVersionStatusBanned"
STATUS_DELETED = "NodeVersionStatusDeleted"

_FATAL = {STATUS_FLAGGED, STATUS_BANNED, STATUS_DELETED}


def _urlopen_fetch(url: str) -> tuple[int, dict]:
    """Return (status_code, parsed_json). Never raises for HTTP errors."""
    if not url.startswith(("https://", "http://")):
        raise ValueError(f"refusing non-http(s) URL: {url}")
    request = urllib.request.Request(url, headers={"Accept": "application/json"})  # noqa: S310 - http(s) only, guarded above
    try:
        with urllib.request.urlopen(request, timeout=30) as response:  # noqa: S310 - http(s) only, guarded above
            body = response.read().decode("utf-8", "replace")
            return response.status, json.loads(body or "{}")
    except urllib.error.HTTPError as exc:
        try:
            payload = json.loads(exc.read().decode("utf-8", "replace") or "{}")
        except (ValueError, OSError):
            payload = {}
        return exc.code, payload
    except (urllib.error.URLError, TimeoutError, ConnectionError, OSError):
        return 0, {}  # network blip -> caller retries


def check_registry_status(
    node: str,
    version: str,
    *,
    timeout: float = 900.0,
    interval: float = 15.0,
    base_url: str = DEFAULT_BASE_URL,
    fetch=_urlopen_fetch,
    sleep=time.sleep,
    now=time.monotonic,
    log=print,
) -> int:
    url = f"{base_url.rstrip('/')}/nodes/{node}/versions/{version}"
    deadline = now() + timeout
    attempt = 0
    while True:
        attempt += 1
        code, payload = fetch(url)
        status = str(payload.get("status") or "")

        if code == 200 and status == STATUS_ACTIVE:
            log(f"Registry: {node} {version} is Active.")
            return 0
        if code == 200 and status in _FATAL:
            reason = str(payload.get("status_reason") or "(no reason given)")
            log(f"Registry: {node} {version} is {status}: {reason}", file=sys.stderr)
            return 1
        if code == 200 and status == STATUS_PENDING:
            detail = "Pending (scanning)"
        elif code == 200:
            detail = f"unexpected status {status!r}"
        elif code == 404:
            detail = "not visible yet (404)"
        elif code == 0:
            detail = "network error"
        else:
            detail = f"HTTP {code}"

        remaining = deadline - now()
        if remaining <= 0:
            log(
                f"Registry: timed out after {timeout:g}s waiting for {node} {version} "
                f"to become Active (last: {detail}).",
                file=sys.stderr,
            )
            return 1
        log(f"Registry: {detail}; retrying in {interval:g}s (attempt {attempt}, {remaining:g}s left).")
        sleep(min(interval, max(0.0, remaining)))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Wait for a Comfy Registry node version to be Active.")
    parser.add_argument("--node", required=True, help="Registry node id, e.g. majoor-omnicam")
    parser.add_argument("--version", required=True, help="semver version, e.g. 0.3.1")
    parser.add_argument("--timeout", type=float, default=900.0, help="seconds to wait (default 900)")
    parser.add_argument("--interval", type=float, default=15.0, help="seconds between polls (default 15)")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    args = parser.parse_args(argv)
    return check_registry_status(
        args.node,
        args.version,
        timeout=args.timeout,
        interval=args.interval,
        base_url=args.base_url,
    )


if __name__ == "__main__":
    raise SystemExit(main())
