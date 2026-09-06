import assert from "node:assert/strict";
import test from "node:test";

import {
  RECONSTRUCTION_EVENTS,
  ReconstructionEventSubscription,
  matchesReconstructionEvent,
} from "../../web-src/extractor/reconstruction/events.js";

test("matchesReconstructionEvent filters by job_id and node_id", () => {
  // Matching both
  assert.equal(
    matchesReconstructionEvent(
      { job_id: "job_1", node_id: "node_A" },
      { jobId: "job_1", nodeId: "node_A" }
    ),
    true
  );

  // Mismatched job_id
  assert.equal(
    matchesReconstructionEvent(
      { job_id: "job_2", node_id: "node_A" },
      { jobId: "job_1", nodeId: "node_A" }
    ),
    false
  );

  // Mismatched node_id
  assert.equal(
    matchesReconstructionEvent(
      { job_id: "job_1", node_id: "node_B" },
      { jobId: "job_1", nodeId: "node_A" }
    ),
    false
  );

  // If filter has no jobId, accepts any job for the same node
  assert.equal(
    matchesReconstructionEvent(
      { job_id: "job_99", node_id: "node_A" },
      { jobId: "", nodeId: "node_A" }
    ),
    true
  );

  // Handles null payload safely
  assert.equal(matchesReconstructionEvent(null, { jobId: "job_1", nodeId: "node_A" }), false);
});

test("ReconstructionEventSubscription listens and tears down on dispose", () => {
  const listeners = new Map();
  const mockApi = {
    addEventListener(name, fn) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(fn);
    },
    removeEventListener(name, fn) {
      if (!listeners.has(name)) return;
      listeners.set(
        name,
        listeners.get(name).filter((l) => l !== fn)
      );
    },
  };

  const received = {
    state: [],
    progress: [],
    done: [],
  };

  const subscription = new ReconstructionEventSubscription(
    mockApi,
    {
      state: (payload) => received.state.push(payload),
      progress: (payload) => received.progress.push(payload),
      done: (payload) => received.done.push(payload),
    },
    (payload) => matchesReconstructionEvent(payload, { jobId: "job_target", nodeId: "node_1" })
  );

  // Verify listeners were added
  assert.equal(listeners.get(RECONSTRUCTION_EVENTS.state)?.length, 1);
  assert.equal(listeners.get(RECONSTRUCTION_EVENTS.progress)?.length, 1);
  assert.equal(listeners.get(RECONSTRUCTION_EVENTS.done)?.length, 1);

  // Emit state event for target job
  const stateFn = listeners.get(RECONSTRUCTION_EVENTS.state)[0];
  stateFn({ detail: { job_id: "job_target", node_id: "node_1", job_state: "PREPARING" } });
  assert.equal(received.state.length, 1);
  assert.equal(received.state[0].job_state, "PREPARING");

  // Emit state event for foreign job: should be filtered out
  stateFn({ detail: { job_id: "job_foreign", node_id: "node_1", job_state: "FAILED" } });
  assert.equal(received.state.length, 1);

  // Dispose subscription
  subscription.dispose();

  // All event listeners must be removed
  assert.equal(listeners.get(RECONSTRUCTION_EVENTS.state)?.length, 0);
  assert.equal(listeners.get(RECONSTRUCTION_EVENTS.progress)?.length, 0);
  assert.equal(listeners.get(RECONSTRUCTION_EVENTS.done)?.length, 0);
});
