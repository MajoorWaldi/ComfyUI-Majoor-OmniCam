import assert from "node:assert/strict";
import test from "node:test";

import { loadMonitorProfileInfo, renderMonitorProfileInfo } from "../../web-src/monitor/profile-info.js";

const payload = {
  format: "majoor.omnicam.monitor.profiles.v1",
  profiles: [
    { id: "wan_camera_native", display_name: "Wan Camera", semantic: "camera_embedding", frame_policy: "requested_length" },
  ],
  // Keyed by profile id: capability contracts and profiles share one vocabulary.
  capabilities: { capabilities: [{ adapter: "wan_camera_native", state: "verified" }] },
};

test("Monitor loads the modern profile catalog before execution", async () => {
  const api = {
    async fetchApi(path) {
      assert.equal(path, "/majoor/omnicam/monitor/profiles");
      return { ok: true, async json() { return payload; } };
    },
  };
  assert.deepEqual(await loadMonitorProfileInfo(api), payload);
});

test("Monitor renders profile and capability facts without an execution result", () => {
  const target = { innerHTML: "" };
  const root = { querySelector(selector) { assert.equal(selector, '[data-role="profile-catalogue"]'); return target; } };
  renderMonitorProfileInfo(root, payload);
  assert.match(target.innerHTML, /Wan Camera/);
  assert.match(target.innerHTML, /camera_embedding/);
  assert.match(target.innerHTML, /verified/);
});

test("a profile with no capability contract is reported missing, never available", () => {
  // Absence of information is not good news. Defaulting to "available" made an
  // unknown downstream render green, which defeats the point of a preflight.
  const target = { innerHTML: "" };
  const root = { querySelector() { return target; } };
  renderMonitorProfileInfo(root, {
    profiles: [{ id: "ltx25_motion_track", display_name: "LTX Motion", semantic: "screen_tracks", frame_policy: "8n+1" }],
    capabilities: { capabilities: [] },
  });
  assert.match(target.innerHTML, /data-state="missing"/);
  assert.doesNotMatch(target.innerHTML, /available/);
});

test("the profile catalogue does not share a slot with the capability report", () => {
  // They used to write to the same element, so whichever rendered last erased
  // the other: after any queued run the catalogue simply disappeared.
  const seen = [];
  const target = { innerHTML: "" };
  const root = { querySelector(selector) { seen.push(selector); return target; } };

  renderMonitorProfileInfo(root, payload);

  assert.deepEqual(seen, ['[data-role="profile-catalogue"]']);
});
