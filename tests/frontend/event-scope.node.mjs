// EventScope replaced three near-identical hand-rolled "listen + push a
// remover onto this.disposers" pairs. The contract worth pinning is that a
// disposed scope leaves nothing attached, and that one bad teardown does not
// strand the rest.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { EventScope } from "../../web-src/shared/event-scope.js";

function fakeTarget() {
  const attached = [];
  return {
    attached,
    addEventListener(type, handler, options) { attached.push({ type, handler, options }); },
    removeEventListener(type, handler, options) {
      const index = attached.findIndex(
        (e) => e.type === type && e.handler === handler && e.options === options,
      );
      if (index >= 0) attached.splice(index, 1);
    },
  };
}

test("dispose removes every listener the scope attached", () => {
  const a = fakeTarget();
  const b = fakeTarget();
  const scope = new EventScope();

  scope.on(a, "click", () => {});
  scope.on(a, "keydown", () => {}, { capture: true });
  scope.on(b, "input", () => {});
  assert.equal(a.attached.length, 2);
  assert.equal(b.attached.length, 1);
  assert.equal(scope.size, 3);

  scope.dispose();

  assert.deepEqual(a.attached, [], "nothing may stay attached after dispose");
  assert.deepEqual(b.attached, []);
  assert.equal(scope.size, 0);
});

test("dispose is idempotent", () => {
  const target = fakeTarget();
  const scope = new EventScope();
  scope.on(target, "click", () => {});
  scope.dispose();
  scope.dispose(); // must not throw, must not double-remove
  assert.deepEqual(target.attached, []);
});

test("a null or listener-less target is a no-op, not a crash", () => {
  const scope = new EventScope();
  scope.on(null, "click", () => {});
  scope.on(undefined, "click", () => {});
  scope.on({}, "click", () => {});
  assert.equal(scope.size, 0);
  scope.dispose();
});

test("one failing teardown does not strand the others", () => {
  const target = fakeTarget();
  const scope = new EventScope();
  scope.add(() => { throw new Error("boom"); });
  scope.on(target, "click", () => {});

  scope.dispose();

  assert.deepEqual(target.attached, [], "the listener after the throwing disposer still ran");
});

test("add() registers a non-listener teardown on the same lifetime", () => {
  const ran = [];
  const scope = new EventScope();
  scope.add(() => ran.push("closed"));
  scope.add("not a function");
  assert.equal(scope.size, 1);
  scope.dispose();
  assert.deepEqual(ran, ["closed"]);
});

test("the panels bind through the scope, not a hand-rolled listen()", () => {
  for (const path of [
    "../../web-src/extractor/index.js",
    "../../web-src/shared/video-player.js",
    "../../web-src/monitor/index.js",
  ]) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    assert.ok(
      !/this\.disposers/.test(source),
      `${path} must own its listeners through EventScope, not a raw disposers array`,
    );
    assert.match(source, /new EventScope\(\)/);
    assert.match(source, /\.events\.dispose\(\)/);
  }
});
