import test from "node:test";
import assert from "node:assert/strict";

import { createAssetLibraryApi } from "../../web-src/assets/api.js";

function recorder(response) {
  const calls = [];
  const fetchApi = (path, options = {}) => {
    calls.push({ path, options });
    const body = typeof response === "function" ? response(path, options) : response;
    return {
      ok: body.ok !== false,
      status: body.status || (body.ok === false ? 400 : 200),
      statusText: "",
      text: async () => JSON.stringify(body.json ?? {}),
    };
  };
  return { calls, api: createAssetLibraryApi({ fetchApi }) };
}

test("list drops empty params, skips kind=all, keeps real filters", async () => {
  const { calls, api } = recorder({ json: { items: [], total: 0 } });
  await api.list({ kind: "all", tag: "hero", search: "", offset: 0, limit: 60 });
  assert.equal(calls[0].path, "/majoor/omnicam/library?tag=hero&offset=0&limit=60");
});

test("list forwards a concrete kind", async () => {
  const { calls, api } = recorder({ json: { items: [] } });
  await api.list({ kind: "character", search: "human" });
  assert.equal(calls[0].path, "/majoor/omnicam/library?search=human&kind=character");
});

test("get / register / patch / remove hit the right route and verb", async () => {
  const { calls, api } = recorder({ json: { asset: {} } });
  await api.get("omnicam.prop.x");
  await api.register({ id: "omnicam.prop.y" });
  await api.patch("omnicam.prop.y", { tags: ["a"] });
  await api.remove("omnicam.prop.y");
  assert.equal(calls[0].path, "/majoor/omnicam/library/omnicam.prop.x");
  assert.equal(calls[1].options.method, "POST");
  assert.equal(calls[1].path, "/majoor/omnicam/library/register");
  assert.equal(calls[2].options.method, "PATCH");
  assert.deepEqual(JSON.parse(calls[2].options.body), { tags: ["a"] });
  assert.equal(calls[3].options.method, "DELETE");
});

test("pose routes", async () => {
  const { calls, api } = recorder({ json: { poses: [] } });
  await api.listPoses();
  await api.savePose({ id: "reach" });
  await api.deletePose("reach");
  assert.deepEqual(calls.map((c) => c.path), [
    "/majoor/omnicam/library/poses",
    "/majoor/omnicam/library/poses",
    "/majoor/omnicam/library/poses/reach",
  ]);
});

test("a non-ok response throws with the server error code", async () => {
  const { api } = recorder({ ok: false, status: 404, json: { error: { code: "ASSET_NOT_FOUND", message: "nope" } } });
  await assert.rejects(() => api.get("ghost"), (error) => {
    assert.equal(error.code, "ASSET_NOT_FOUND");
    assert.equal(error.status, 404);
    return true;
  });
});
