import test from "node:test";
import assert from "node:assert/strict";

import { annotatedAssetUrl, parseAnnotatedAsset } from "../../web-src/shared/managed-assets.js";
import { ManagedVideoPlayer } from "../../web-src/shared/video-player.js";


function fakeVideo() {
  const listeners = new Map();
  return {
    src: "", paused: true, currentTime: 0, duration: 2, readyState: 2,
    loadCalls: 0, pauseCalls: 0,
    addEventListener(name, listener) { listeners.set(name, listener); },
    removeEventListener(name) { listeners.delete(name); },
    removeAttribute(name) { if (name === "src") this.src = ""; },
    load() { this.loadCalls += 1; },
    pause() { this.pauseCalls += 1; this.paused = true; },
    play() { this.paused = false; return Promise.resolve(); },
    listeners,
  };
}


test("managed URL preserves annotations and subfolders", () => {
  const api = { apiURL: (path) => `/api${path}` };
  assert.deepEqual(parseAnnotatedAsset("clips/a.mp4 [temp]"), {
    filename: "a.mp4", subfolder: "clips", type: "temp",
  });
  assert.equal(
    annotatedAssetUrl(api, "clips/a.mp4 [temp]"),
    "/api/view?filename=a.mp4&subfolder=clips&type=temp",
  );
});


test("unsafe asset annotations are rejected", () => {
  assert.equal(parseAnnotatedAsset("../secret.mp4 [input]"), null);
  assert.equal(parseAnnotatedAsset("C:/secret.mp4 [input]"), null);
  assert.equal(parseAnnotatedAsset("https://host/a.mp4"), null);
});


test("setting the same playable source does not reload", () => {
  const video = fakeVideo();
  const player = new ManagedVideoPlayer(video);
  assert.equal(player.setSource("/view?a"), true);
  assert.equal(player.setSource("/view?a"), false);
  assert.equal(video.loadCalls, 1);
  player.dispose();
});


test("player maps frames, primes frame zero and releases listeners", () => {
  const video = fakeVideo();
  const frames = [];
  const player = new ManagedVideoPlayer(video, { fps: 24, durationFrames: 49, onFrame: (f) => frames.push(f) });
  player.setSource("/view?a");
  video.listeners.get("loadeddata")();
  assert.equal(video.currentTime, 0.25 / 24);
  player.seekFrame(48);
  assert.equal(video.currentTime, 2);
  player.dispose();
  assert.equal(video.listeners.size, 0);
  assert.equal(video.src, "");
});

