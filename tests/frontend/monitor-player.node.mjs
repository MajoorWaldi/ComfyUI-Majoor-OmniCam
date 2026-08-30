import test from "node:test";
import assert from "node:assert/strict";
import { MonitorPlayer, frameAtTime } from "../../web-src/monitor/player.js";

test("proxy time maps deterministically to the canonical frame", () => {
  assert.equal(frameAtTime(1.49, 24, 121), 36);
  assert.equal(frameAtTime(99, 24, 121), 120);
});

test("disposing the player pauses, removes listeners and clears its source", () => {
  const listeners = new Map();
  const video = { src: "x", pauseCalls: 0, addEventListener(n, f) { listeners.set(n, f); }, removeEventListener(n) { listeners.delete(n); }, pause() { this.pauseCalls++; }, removeAttribute(name) { if (name === "src") this.src = ""; }, load() {} };
  const player = new MonitorPlayer(video, { fps: 24, durationFrames: 12 });
  assert.ok(listeners.size);
  player.dispose();
  assert.equal(listeners.size, 0);
  assert.equal(video.pauseCalls, 1);
  assert.equal(video.src, "");
});

test("loop and mute controls update only the proxy element", () => {
  const video = { addEventListener() {}, removeEventListener() {}, pause() {}, removeAttribute() {}, load() {} };
  const player = new MonitorPlayer(video);
  player.setLoop(false); player.setMuted(true);
  assert.equal(video.loop, false); assert.equal(video.muted, true);
  player.dispose();
});
