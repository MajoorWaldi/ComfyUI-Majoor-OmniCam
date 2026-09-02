import test from "node:test";
import assert from "node:assert/strict";
import { MonitorRefreshController } from "../../web-src/monitor/refresh.js";

function fakeApi({ handler } = {}) {
  const calls = [];
  return {
    calls,
    fetchApi: async (path, options) => {
      calls.push({ path, options, signal: options.signal });
      return handler ? handler(path, options) : { ok: true, json: async () => ({ ok: true }) };
    },
  };
}

test("an unchanged payload is not rescheduled", async () => {
  const api = fakeApi();
  const controller = new MonitorRefreshController(api, { delay: 5 });

  controller.schedule({ a: 1 });
  controller.schedule({ a: 1 });
  await new Promise((resolve) => setTimeout(resolve, 20));

  assert.equal(api.calls.length, 1);
  controller.dispose();
});

test("a changed payload restarts the debounce and both eventually fire", async () => {
  const api = fakeApi();
  const controller = new MonitorRefreshController(api, { delay: 5 });

  controller.schedule({ a: 1 });
  await new Promise((resolve) => setTimeout(resolve, 20));
  controller.schedule({ a: 2 });
  await new Promise((resolve) => setTimeout(resolve, 20));

  assert.equal(api.calls.length, 2);
  assert.deepEqual(JSON.parse(api.calls[1].options.body), { a: 2 });
  controller.dispose();
});

test("a snapshot reaches onSnapshot, not onError", async () => {
  const api = fakeApi({ handler: async () => ({ ok: true, json: async () => ({ live: true, preflight: [] }) }) });
  let snapshot = null;
  let error = null;
  const controller = new MonitorRefreshController(api, {
    delay: 1, onSnapshot: (value) => { snapshot = value; }, onError: (value) => { error = value; },
  });

  await controller.refresh({ a: 1 });

  assert.deepEqual(snapshot, { live: true, preflight: [] });
  assert.equal(error, null);
  controller.dispose();
});

test("a non-ok response reaches onError, not onSnapshot", async () => {
  const api = fakeApi({ handler: async () => ({ ok: false, status: 400, text: async () => "Invalid Director state" }) });
  let snapshot = "untouched";
  let error = null;
  const controller = new MonitorRefreshController(api, {
    onSnapshot: (value) => { snapshot = value; }, onError: (value) => { error = value; },
  });

  await controller.refresh({ a: 1 });

  assert.equal(snapshot, "untouched");
  assert.match(String(error?.message), /Invalid Director state/);
});

test("a superseded request is aborted and never reports an error for it", async () => {
  const api = fakeApi({
    // Settles by abort if superseded, otherwise resolves normally -- a real
    // fetch does exactly one of the two, never neither.
    handler: (path, options) => new Promise((resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
      setTimeout(() => resolve({ ok: true, json: async () => ({ payload: path }) }), 5);
    }),
  });
  let error = null;
  const controller = new MonitorRefreshController(api, { onError: (value) => { error = value; } });

  const first = controller.refresh({ a: 1 });
  const second = controller.refresh({ a: 2 }); // aborts the first mid-flight

  await Promise.all([first, second]);
  assert.equal(error, null, "an AbortError must never surface as a user-facing error");
  controller.dispose();
});

test("dispose cancels the pending timer and any in-flight request", async () => {
  const api = fakeApi();
  const controller = new MonitorRefreshController(api, { delay: 5 });

  controller.schedule({ a: 1 });
  controller.dispose();
  await new Promise((resolve) => setTimeout(resolve, 20));

  assert.equal(api.calls.length, 0);
});

test("the endpoint is configurable, and defaults to the live preflight route", async () => {
  const api = fakeApi();
  await new MonitorRefreshController(api).refresh({});
  assert.equal(api.calls[0].path, "/majoor/omnicam/monitor/live_preflight");

  const custom = fakeApi();
  await new MonitorRefreshController(custom, { endpoint: "/custom" }).refresh({});
  assert.equal(custom.calls[0].path, "/custom");
});
