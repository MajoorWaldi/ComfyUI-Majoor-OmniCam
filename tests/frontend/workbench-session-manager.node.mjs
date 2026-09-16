import test from "node:test";
import assert from "node:assert/strict";

import { WorkbenchSessionManager } from "../../web-src/workbench/session-manager.js";

function fakeSession(key, { closeResult = true } = {}) {
  const calls = { closeReasons: [], disposed: 0, focused: 0 };
  return {
    calls,
    session: {
      key,
      nodeId: key,
      host: { focus: () => { calls.focused++; } },
      close: async (reason) => { calls.closeReasons.push(reason); return closeResult; },
      dispose: () => { calls.disposed++; },
    },
  };
}

test("opening the same key twice focuses the existing session without recreating it", async () => {
  const manager = new WorkbenchSessionManager();
  const { session } = fakeSession("director:1");
  let creations = 0;
  const createSession = async () => { creations++; return session; };

  const first = await manager.open({ key: "director:1", createSession });
  const second = await manager.open({ key: "director:1", createSession });

  assert.equal(first, session);
  assert.equal(second, session);
  assert.equal(creations, 1);
  assert.equal(manager.activeKey, "director:1");
});

test("opening a different key closes the previous session with reason 'switch'", async () => {
  const manager = new WorkbenchSessionManager();
  const { session: sessionA, calls: callsA } = fakeSession("director:1");
  const { session: sessionB } = fakeSession("extractor:2");

  await manager.open({ key: "director:1", createSession: async () => sessionA });
  const opened = await manager.open({ key: "extractor:2", createSession: async () => sessionB });

  assert.equal(callsA.closeReasons.at(-1), "switch");
  assert.equal(opened, sessionB);
  assert.equal(manager.activeKey, "extractor:2");
});

test("a session that refuses to close aborts the new open and leaves the old session active", async () => {
  const manager = new WorkbenchSessionManager();
  const { session: sessionA } = fakeSession("director:1", { closeResult: false });
  let secondCreated = false;
  const createSessionB = async () => { secondCreated = true; return fakeSession("extractor:2").session; };

  await manager.open({ key: "director:1", createSession: async () => sessionA });
  const result = await manager.open({ key: "extractor:2", createSession: createSessionB });

  assert.equal(result, null);
  assert.equal(secondCreated, false, "must not construct the new workbench until the old one agrees to close");
  assert.equal(manager.activeKey, "director:1");
});

test("closing the active session restores focus to the stored opener", async () => {
  const manager = new WorkbenchSessionManager();
  const { session } = fakeSession("director:1");
  let openerFocused = 0;
  const opener = { focus: () => { openerFocused++; } };

  await manager.open({ key: "director:1", opener, createSession: async () => session });
  const closed = await manager.closeActive("user");

  assert.equal(closed, true);
  assert.equal(openerFocused, 1);
  assert.equal(manager.activeKey, null);
});

test("disposeForNode drops the active session for a removed node without calling close", async () => {
  const manager = new WorkbenchSessionManager();
  const { session, calls } = fakeSession("director:1");
  await manager.open({ key: "director:1", createSession: async () => session });

  manager.disposeForNode("director:1");

  assert.equal(calls.disposed, 1);
  assert.equal(calls.closeReasons.length, 0);
  assert.equal(manager.activeKey, null);
});

test("a failed session creation leaves no ghost active session", async () => {
  const manager = new WorkbenchSessionManager();
  const { session: sessionA } = fakeSession("director:1");
  await manager.open({ key: "director:1", createSession: async () => sessionA });

  const result = await manager.open({ key: "extractor:2", createSession: async () => null });

  assert.equal(result, null);
  assert.equal(manager.activeKey, null, "old session already closed; failed creation must not resurrect it or leave a stale key");
});
