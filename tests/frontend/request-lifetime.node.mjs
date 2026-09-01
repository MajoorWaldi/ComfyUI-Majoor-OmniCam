import assert from "node:assert/strict";
import test from "node:test";

import { RequestLifetime, isAbortError } from "../../web-src/request-lifetime.js";

test("a cancelled request resolves to undefined instead of reporting a failure", async () => {
  // A node removed mid-flight is not a network error, and the panel that would
  // have shown one no longer exists.
  const lifetime = new RequestLifetime();
  const started = lifetime.run(async (signal) => {
    await new Promise((resolve) => setTimeout(resolve, 5));
    const error = new Error("The user aborted a request.");
    error.name = "AbortError";
    assert.ok(signal.aborted);
    throw error;
  });
  lifetime.dispose();

  assert.equal(await started, undefined);
  assert.equal(lifetime.aborted, true);
});

test("a real failure while the component is alive still propagates", async () => {
  const lifetime = new RequestLifetime();

  await assert.rejects(
    () => lifetime.run(async () => { throw new Error("connection refused"); }),
    /connection refused/,
  );
});

test("a completed request returns its value", async () => {
  const lifetime = new RequestLifetime();

  assert.deepEqual(await lifetime.run(async () => ({ ok: true })), { ok: true });
});

test("a result that arrives after disposal is discarded", async () => {
  const lifetime = new RequestLifetime();
  const started = lifetime.run(async () => {
    await new Promise((resolve) => setTimeout(resolve, 5));
    return { ok: true };
  });
  lifetime.dispose();

  assert.equal(await started, undefined);
});

test("options merge the signal without dropping what the caller set", () => {
  const lifetime = new RequestLifetime();

  const options = lifetime.options({ method: "POST", body: "{}" });

  assert.equal(options.method, "POST");
  assert.equal(options.body, "{}");
  assert.equal(options.signal, lifetime.signal);
});

test("abort errors are recognised by name and by legacy code", () => {
  assert.equal(isAbortError({ name: "AbortError" }), true);
  assert.equal(isAbortError({ code: 20 }), true);
  assert.equal(isAbortError(new Error("nope")), false);
  assert.equal(isAbortError(undefined), false);
});

test("disposing twice is harmless", () => {
  const lifetime = new RequestLifetime();
  lifetime.dispose();
  lifetime.dispose();
  assert.equal(lifetime.aborted, true);
});
