from __future__ import annotations

import pytest

pytest.importorskip("aiohttp")
from aiohttp import web

from omnicam.http_json import read_bounded_json_object


class ChunkedContent:
    def __init__(self, chunks: list[bytes]):
        self.chunks = chunks
        self.yielded = 0

    async def iter_chunked(self, _size: int):
        for chunk in self.chunks:
            self.yielded += 1
            yield chunk


class Request:
    def __init__(self, chunks: list[bytes], *, content_length=None, can_read_body=True):
        self.content_length = content_length
        self.can_read_body = can_read_body
        self.content = ChunkedContent(chunks)


@pytest.mark.asyncio
async def test_chunked_json_is_rejected_as_soon_as_stream_crosses_limit():
    request = Request([b'{"value":"', b"x" * 20, b'"}'], content_length=None)

    with pytest.raises(web.HTTPRequestEntityTooLarge):
        await read_bounded_json_object(request, max_bytes=16)

    assert request.content.yielded == 2


@pytest.mark.asyncio
async def test_bounded_json_requires_an_object_and_accepts_empty_body():
    with pytest.raises(web.HTTPBadRequest) as exc_info:
        await read_bounded_json_object(Request([b"[]"]), max_bytes=16)
    assert exc_info.value.text == "Expected a JSON object"

    assert await read_bounded_json_object(
        Request([], can_read_body=False), max_bytes=16, allow_empty=True
    ) == {}


@pytest.mark.asyncio
async def test_declared_oversize_is_rejected_before_streaming():
    request = Request([b"{}"], content_length=17)

    with pytest.raises(web.HTTPRequestEntityTooLarge):
        await read_bounded_json_object(request, max_bytes=16)

    assert request.content.yielded == 0


@pytest.mark.asyncio
async def test_a_deeply_nested_body_is_a_bad_request_not_a_server_error():
    """json.loads recurses per level, so deep nesting raises before it can parse."""
    depth = 20_000
    body = b'{"n":' * depth + b"{}" + b"}" * depth
    request = Request([body])

    with pytest.raises(web.HTTPBadRequest) as exc_info:
        await read_bounded_json_object(request, max_bytes=len(body) + 1)

    assert exc_info.value.text == "JSON body is nested too deeply"
