import test from "node:test";
import assert from "node:assert/strict";
import {
  canPreviewLive,
  directorLivePayload,
  liveRequestPayload,
  monitorLivePayload,
} from "../../web-src/monitor/live-source.js";

function directorNode(values = {}) {
  const defaults = {
    state_json: '{"cameras":[]}', recording_path: "clip.webm [temp]", card_asset: "",
    width: 1280, height: 720, fps: 24, duration_seconds: 5, render_mode: "omni_ref",
  };
  const merged = { ...defaults, ...values };
  return {
    comfyClass: "MajoorOmniCamDirector",
    widgets: Object.entries(merged).map(([name, value]) => ({ name, value })),
  };
}

test("canPreviewLive is true only for a Director origin", () => {
  assert.equal(canPreviewLive(directorNode()), true);
  assert.equal(canPreviewLive({ comfyClass: "SomeExtractorNode" }), false);
  assert.equal(canPreviewLive(null), false);
});

test("directorLivePayload reads every field the backend needs, verbatim", () => {
  const payload = directorLivePayload(directorNode({ width: 640, height: 360, fps: 30 }));
  assert.deepEqual(payload, {
    state_json: '{"cameras":[]}',
    recording_path: "clip.webm [temp]",
    card_asset: "",
    width: 640,
    height: 360,
    fps: 30,
    duration_seconds: 5,
    render_mode: "omni_ref",
  });
});

test("directorLivePayload falls back to safe defaults for a widget-less node", () => {
  const payload = directorLivePayload({ comfyClass: "MajoorOmniCamDirector", widgets: [] });
  assert.equal(payload.state_json, "{}");
  assert.equal(payload.width, 1280);
  assert.equal(payload.height, 720);
  assert.equal(payload.fps, 24);
  assert.equal(payload.render_mode, "omni_ref");
});

test("directorLivePayload tolerates a null origin", () => {
  const payload = directorLivePayload(null);
  assert.equal(payload.state_json, "{}");
  assert.equal(payload.recording_path, "");
});

test("monitorLivePayload shapes the Monitor's own widget values", () => {
  const payload = monitorLivePayload({
    target_profile: "h3_native", base_prompt: "A move.",
    target_width: 832, target_height: 480, duration_seconds: 2, target_fps: 24,
  });
  assert.deepEqual(payload, {
    target_profile: "h3_native", base_prompt: "A move.",
    target_width: 832, target_height: 480, duration_seconds: 2, target_fps: 24,
  });
});

test("monitorLivePayload falls back to safe defaults when values are missing", () => {
  assert.deepEqual(monitorLivePayload(undefined), {
    target_profile: "", base_prompt: "", target_width: 832, target_height: 480,
    duration_seconds: 2, target_fps: 24,
  });
});

test("liveRequestPayload combines both halves under the shape the route expects", () => {
  const payload = liveRequestPayload(directorNode(), { target_profile: "external_reference_video" });
  assert.ok(payload.director);
  assert.ok(payload.monitor);
  assert.equal(payload.director.recording_path, "clip.webm [temp]");
  assert.equal(payload.monitor.target_profile, "external_reference_video");
});
