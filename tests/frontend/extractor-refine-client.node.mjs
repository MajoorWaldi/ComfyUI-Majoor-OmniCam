// Post-solve refine: POST the raw solve + settings to the bounded refine
// route, no queue involved.

import assert from "node:assert/strict";
import test from "node:test";

import { postRefine } from "../../web-src/extractor/refine-client.js";
import { RESULT_ENVELOPE_KIND, parseExtractorMessage } from "../../web-src/extractor/result-cache.js";

function mockApi({ ok = true, status = 200, json = {}, text = "" } = {}) {
  const calls = [];
  return {
    calls,
    fetchApi: async (url, options) => {
      calls.push({ url, options });
      return { ok, status, json: async () => json, text: async () => text };
    },
  };
}

test("postRefine hits /extractor/refine with the raw solve and settings", async () => {
  const api = mockApi({ json: { refined_track: { keyframes: [1, 2] }, fingerprint: "fp2", key_count: 2 } });
  const out = await postRefine(api, { poses: [1, 2] }, { position_smoothing: 0.3 });
  assert.equal(api.calls[0].url, "/majoor/omnicam/extractor/refine");
  assert.equal(api.calls[0].options.method, "POST");
  const body = JSON.parse(api.calls[0].options.body);
  assert.deepEqual(body.raw_solve, { poses: [1, 2] });
  assert.deepEqual(body.settings, { position_smoothing: 0.3 });
  assert.equal(out.fingerprint, "fp2");
});

test("postRefine surfaces the server's error text", async () => {
  const api = mockApi({ ok: false, status: 413, text: "too large for live refine" });
  await assert.rejects(() => postRefine(api, {}, {}), /too large for live refine/);
});

test("parseExtractorMessage carries raw_solve for a camera_track envelope", () => {
  const message = {
    text: [JSON.stringify({
      kind: RESULT_ENVELOPE_KIND,
      mode: "camera_track",
      fingerprint: "fp1",
      motion_scene: {
        version: 1,
        cameras: [{ id: "extracted_camera", track: { keyframes: [{ frame: 0 }, { frame: 1 }] } }],
        playblast_camera_id: "extracted_camera",
      },
      raw_solve: { poses: [{ source_frame: 0 }, { source_frame: 1 }], source_fps: 24 },
    })],
  };
  const parsed = parseExtractorMessage(message);
  assert.equal(parsed.mode, "camera_track");
  assert.deepEqual(parsed.rawSolve.poses.length, 2);

  // Absent raw_solve -> null, never undefined.
  const noRaw = JSON.parse(message.text[0]);
  delete noRaw.raw_solve;
  assert.equal(parseExtractorMessage({ text: [JSON.stringify(noRaw)] }).rawSolve, null);
});
