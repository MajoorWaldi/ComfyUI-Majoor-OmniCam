import assert from "node:assert/strict";
import test from "node:test";

import { loadMonitorProfileInfo, renderMonitorProfileInfo } from "../../web-src/monitor/profile-info.js";

const payload = {
  format: "majoor.omnicam.monitor.profiles.v1",
  profiles: [
    { id: "wan_camera_native", display_name: "Wan Camera", semantic: "camera_embedding", frame_policy: "requested_length" },
  ],
  capabilities: { capabilities: [{ adapter: "wan_native", state: "verified" }] },
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
  const root = { querySelector(selector) { assert.equal(selector, '[data-role="profile-capabilities"]'); return target; } };
  renderMonitorProfileInfo(root, payload);
  assert.match(target.innerHTML, /Wan Camera/);
  assert.match(target.innerHTML, /camera_embedding/);
  assert.match(target.innerHTML, /verified/);
});
