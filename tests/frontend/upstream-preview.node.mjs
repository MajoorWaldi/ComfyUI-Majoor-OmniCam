import assert from "node:assert/strict";
import test from "node:test";

// The module checks `instanceof HTMLImageElement` etc.; Node has no DOM, so
// these stand in for the browser globals with just enough shape to pass.
class FakeImage {
  constructor({ complete = true, naturalWidth = 0, naturalHeight = 0 } = {}) {
    this.complete = complete;
    this.naturalWidth = naturalWidth;
    this.naturalHeight = naturalHeight;
  }
  decode() { return Promise.resolve(); }
}
class FakeVideo {
  constructor({ readyState = 2, videoWidth = 0, videoHeight = 0 } = {}) {
    this.readyState = readyState;
    this.videoWidth = videoWidth;
    this.videoHeight = videoHeight;
  }
}
class FakeCanvasEl {
  constructor({ width = 0, height = 0 } = {}) {
    this.width = width;
    this.height = height;
  }
}
globalThis.HTMLImageElement = FakeImage;
globalThis.HTMLVideoElement = FakeVideo;
globalThis.HTMLCanvasElement = FakeCanvasEl;

const { drawUpstreamPreview, upstreamPreviewMedia, widgetPreviewMedia } =
  await import("../../web-src/shared/upstream-preview.js");

function fakeCanvas() {
  const ctx = { drawImage(...args) { ctx.drawn = args; } };
  return { width: 0, height: 0, getContext: () => ctx, get drawn() { return ctx.drawn; } };
}

test("widgetPreviewMedia finds the element itself, or a media descendant", () => {
  const image = new FakeImage();
  assert.equal(widgetPreviewMedia({ element: image }), image);

  const found = new FakeVideo();
  const container = { querySelector: (sel) => (sel.includes("video") ? found : null) };
  assert.equal(widgetPreviewMedia({ element: container }), found);

  assert.equal(widgetPreviewMedia({ element: { querySelector: () => null } }), null);
  assert.equal(widgetPreviewMedia(null), null);
});

test("upstreamPreviewMedia prefers node.imgs, honouring imageIndex", () => {
  const first = new FakeImage();
  const second = new FakeImage();
  const node = { imgs: [first, second], imageIndex: 0 };
  assert.equal(upstreamPreviewMedia(node), first);
  node.imageIndex = 1;
  assert.equal(upstreamPreviewMedia(node), second);
});

test("upstreamPreviewMedia clamps an out-of-range imageIndex instead of returning nothing", () => {
  const only = new FakeImage();
  assert.equal(upstreamPreviewMedia({ imgs: [only], imageIndex: 99 }), only);
});

test("upstreamPreviewMedia falls back to widget media when imgs is empty", () => {
  const media = new FakeVideo();
  const node = { imgs: [], widgets: [{ element: {} }, { element: media }] };
  assert.equal(upstreamPreviewMedia(node), media);
});

test("upstreamPreviewMedia returns null for a node with nothing rendered yet", () => {
  assert.equal(upstreamPreviewMedia({ widgets: [{ element: {} }] }), null);
  assert.equal(upstreamPreviewMedia(null), null);
});

test("drawUpstreamPreview scales to fit maxSize and reports success", async () => {
  const media = new FakeImage({ naturalWidth: 1920, naturalHeight: 1080 });
  const canvas = fakeCanvas();
  assert.equal(await drawUpstreamPreview(media, canvas, 512), true);
  assert.equal(canvas.width, 512);
  assert.equal(canvas.height, 288);
});

test("drawUpstreamPreview never upscales a source smaller than maxSize", async () => {
  const media = new FakeImage({ naturalWidth: 64, naturalHeight: 48 });
  const canvas = fakeCanvas();
  assert.equal(await drawUpstreamPreview(media, canvas, 512), true);
  assert.equal(canvas.width, 64);
  assert.equal(canvas.height, 48);
});

test("drawUpstreamPreview reports false rather than blanking an unready video", async () => {
  const media = new FakeVideo({ readyState: 0, videoWidth: 640, videoHeight: 360 });
  assert.equal(await drawUpstreamPreview(media, fakeCanvas(), 512), false);
});

test("drawUpstreamPreview reports false for a media element with no known size", async () => {
  const media = new FakeImage({ naturalWidth: 0, naturalHeight: 0 });
  assert.equal(await drawUpstreamPreview(media, fakeCanvas(), 512), false);
});

test("drawUpstreamPreview is a no-op without media or a canvas", async () => {
  assert.equal(await drawUpstreamPreview(null, fakeCanvas()), false);
  assert.equal(await drawUpstreamPreview(new FakeImage({ naturalWidth: 10, naturalHeight: 10 }), null), false);
});
