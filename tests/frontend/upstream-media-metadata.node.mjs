import assert from "node:assert/strict";
import test from "node:test";

import { adoptUpstreamMediaMetadata } from "../../web-src/upstream-media-metadata.js";

test("upstream video metadata updates Director fps and duration widgets", () => {
  let synced = 0;
  const ui = {
    state: { fps: 24 },
    widthWidget: { value: 1280 }, heightWidget: { value: 720 },
    fpsWidget: { value: 24 }, durationWidget: { value: 5 },
    syncFromWidgets() { synced += 1; },
  };
  const updated = adoptUpstreamMediaMetadata(ui, { videoWidth: 1920, videoHeight: 1080 }, {
    fps: 30, frameCount: 300,
  });
  assert.equal(updated, true);
  assert.equal(ui.widthWidget.value, 1920);
  assert.equal(ui.heightWidget.value, 1080);
  assert.equal(ui.fpsWidget.value, 30);
  assert.equal(ui.durationWidget.value, 10);
  assert.equal(synced, 1);
});

test("a still replaces the stale timeline with the graph widget minimum", () => {
  const ui = {
    state: { fps: 24 },
    widthWidget: { value: 1280 }, heightWidget: { value: 720 },
    fpsWidget: { value: 24 }, durationWidget: { value: 5 },
    syncFromWidgets() {},
  };
  adoptUpstreamMediaMetadata(ui, { naturalWidth: 640, naturalHeight: 480 }, { frameCount: 1 });
  assert.equal(ui.durationWidget.value, 0.25);
});

test("a user-typed duration survives a re-sync of the same connected media", () => {
  const media = { currentSrc: "video.mp4", videoWidth: 1920, videoHeight: 1080 };
  const ui = {
    state: { fps: 24 },
    widthWidget: { value: 1920 }, heightWidget: { value: 1080 },
    fpsWidget: { value: 30 }, durationWidget: { value: 10 },
    durationManuallySet: false,
    syncFromWidgets() {},
  };
  // First connect: nothing typed yet, the media's own length applies.
  adoptUpstreamMediaMetadata(ui, media, { fps: 30, frameCount: 300 });
  assert.equal(ui.durationWidget.value, 10);

  // The user overrides it by hand (editor-global.js's change handler).
  ui.durationWidget.value = 3;
  ui.durationManuallySet = true;

  // Re-syncing the SAME still-connected media (e.g. every queue execution)
  // must not stomp the user's override back to the clip's own length.
  adoptUpstreamMediaMetadata(ui, media, { fps: 30, frameCount: 300 });
  assert.equal(ui.durationWidget.value, 3);

  // Plugging in a genuinely different clip clears the override and adopts
  // the new clip's own length.
  const nextMedia = { currentSrc: "other.mp4", videoWidth: 1920, videoHeight: 1080 };
  adoptUpstreamMediaMetadata(ui, nextMedia, { fps: 30, frameCount: 150 });
  assert.equal(ui.durationWidget.value, 5);
  assert.equal(ui.durationManuallySet, false);
});
