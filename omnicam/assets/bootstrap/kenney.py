"""Resolve an official Kenney pack page to its single approved CC0 ZIP URL.

Fails closed (plan section 9): the page must still be served from
``https://kenney.nl`` under ``/assets/``, must still carry visible
``Creative Commons CC0`` text, and must expose exactly one ``.zip`` link that
itself stays on ``https://kenney.nl/media/pages/assets/``. Anything else raises
:class:`omnicam.assets.bootstrap.types.BootstrapError`.

The network call is injected (``opener``) so the default test suite never
touches the internet (plan section 25).
"""

from __future__ import annotations

from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

from .types import (
    EXIT_SOURCE,
    HTTP_TIMEOUT,
    MAX_HTML_BYTES,
    USER_AGENT,
    BootstrapError,
)

KENNEY_HOSTS = frozenset({"kenney.nl", "www.kenney.nl"})
_CC0_MARKERS = ("creative commons cc0", "creativecommonscc0")


class _PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []
        self.text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        href = dict(attrs).get("href")
        if href:
            self.links.append(href)

    def handle_data(self, data: str) -> None:
        if data.strip():
            self.text.append(data.strip())


def _fail(message: str) -> BootstrapError:
    return BootstrapError(message, exit_code=EXIT_SOURCE)


def assert_https_kenney(url: str, *, assets_page: bool) -> None:
    """Raise unless ``url`` is ``https://kenney.nl`` under the required prefix."""
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in KENNEY_HOSTS:
        raise _fail(f"Kenney URL must stay on https://kenney.nl: {url!r}")
    prefix = "/assets/" if assets_page else "/media/pages/assets/"
    if not parsed.path.startswith(prefix):
        raise _fail(f"Kenney URL must stay below {prefix}: {url!r}")
    if not assets_page and not parsed.path.lower().endswith(".zip"):
        raise _fail(f"Kenney archive URL must end in .zip: {url!r}")


def resolve_kenney_archive(page_url: str, opener=urlopen) -> str:
    """Return the one approved CC0 ZIP URL advertised by ``page_url``."""
    assert_https_kenney(page_url, assets_page=True)
    request = Request(page_url, headers={"User-Agent": USER_AGENT})  # noqa: S310
    try:
        with opener(request, timeout=HTTP_TIMEOUT) as response:
            final_page = response.geturl() or page_url
            raw = response.read(MAX_HTML_BYTES + 1)
    except BootstrapError:
        raise
    except OSError as exc:
        raise _fail(f"could not open Kenney page {page_url}: {exc}") from exc

    assert_https_kenney(final_page, assets_page=True)
    if len(raw) > MAX_HTML_BYTES:
        raise _fail(f"Kenney page exceeds the {MAX_HTML_BYTES}-byte HTML limit")

    parser = _PageParser()
    parser.feed(raw.decode("utf-8", "replace"))
    normalized = " ".join(parser.text).lower()
    collapsed = normalized.replace(" ", "")
    if not any(marker in normalized or marker in collapsed for marker in _CC0_MARKERS):
        raise _fail("Kenney page no longer declares Creative Commons CC0")

    candidates: list[str] = []
    for href in parser.links:
        absolute = urljoin(final_page, href)
        if not urlparse(absolute).path.lower().endswith(".zip"):
            continue
        try:
            assert_https_kenney(absolute, assets_page=False)
        except BootstrapError:
            continue
        if absolute not in candidates:
            candidates.append(absolute)

    if len(candidates) != 1:
        raise _fail(
            f"expected exactly one approved Kenney ZIP link, found {len(candidates)}"
        )
    return candidates[0]
