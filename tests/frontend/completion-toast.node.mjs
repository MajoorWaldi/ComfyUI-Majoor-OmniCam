import test from "node:test";
import assert from "node:assert/strict";
import { notifyCompletion } from "../../web-src/director/completion-toast.js";

for (const tone of ["success", "error", "warning"]) {
  test(`uses native ${tone} without creating a second notification`, () => {
    const calls = [];
    const owner = { app: { extensionManager: { toast: {
      [tone](message) { calls.push(message); }, add() { assert.fail("duplicate legacy toast"); },
    } } } };
    assert.equal(notifyCompletion(owner, "Done", tone), true);
    assert.deepEqual(calls, ["Done"]);
  });
}

test("older ComfyUI versions use the native add API with warning severity", () => {
  const calls = [];
  const owner = { runtime: { app: { extensionManager: { toast: { add: (message) => calls.push(message) } } } } };
  assert.equal(notifyCompletion(owner, "Review this", "warning"), true);
  assert.equal(calls[0].severity, "warn");
  assert.equal(calls[0].detail, "Review this");
  assert.equal(calls[0].closable, true);
});

test("missing/unavailable toast service never fails the completed operation", () => {
  assert.equal(notifyCompletion({}, "Done"), false);
  const owner = { app: { extensionManager: { toast: { success() { throw new Error("unavailable"); } } } } };
  assert.equal(notifyCompletion(owner, "Done"), false);
});

test("disposed owners and empty completions do not emit notifications", () => {
  const owner = { disposed: true, app: { extensionManager: { toast: { success() { assert.fail("stale completion"); } } } } };
  assert.equal(notifyCompletion(owner, "Done"), false);
  assert.equal(notifyCompletion(owner, ""), false);
});
