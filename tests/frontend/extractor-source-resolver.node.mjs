import assert from "node:assert/strict";
import test from "node:test";

import { resolveInteractiveExtractorSource } from "../../web-src/extractor/source-resolver.js";

/** A minimal graph + node pair with one link from `origin` into `node`'s "video" input. */
function connectedGraph(origin) {
  const link = { id: 1, origin_id: origin.id, target_id: 2 };
  const graph = {
    getNodeById(id) {
      return [origin].find((n) => n.id === id) ?? null;
    },
    links: new Map([[1, link]]),
  };
  const node = { id: 2, graph, inputs: [{ name: "video", link: 1 }], widgets: [] };
  return { graph, node };
}

test("scene_reconstruct mode resolves a connected Load Image node", () => {
  const origin = { id: 1, comfyClass: "LoadImage", widgets: [{ name: "image", value: "room.png" }] };
  const { node, graph } = connectedGraph(origin);

  const resolved = resolveInteractiveExtractorSource(node, graph, "scene_reconstruct");

  assert.equal(resolved.available, true);
  assert.deepEqual(resolved.ref, { kind: "annotated_input", value: "room.png" });
  assert.equal(resolved.label, "room.png");
});

test("camera_track mode does not treat a Load Image node as file-backed", () => {
  const origin = { id: 1, comfyClass: "LoadImage", widgets: [{ name: "image", value: "room.png" }] };
  const { node, graph } = connectedGraph(origin);

  const resolved = resolveInteractiveExtractorSource(node, graph, "camera_track");

  assert.equal(resolved.available, false);
  assert.match(resolved.reason, /produces its footage only while the workflow runs/);
});

test("scene_reconstruct mode does not treat a Load Video node as file-backed", () => {
  const origin = { id: 1, comfyClass: "LoadVideo", widgets: [{ name: "file", value: "clip.mp4" }] };
  const { node, graph } = connectedGraph(origin);

  const resolved = resolveInteractiveExtractorSource(node, graph, "scene_reconstruct");

  assert.equal(resolved.available, false);
  assert.match(resolved.reason, /produces its footage only while the workflow runs/);
});

test("camera_track mode still resolves a connected Load Video node", () => {
  const origin = { id: 1, comfyClass: "LoadVideo", widgets: [{ name: "file", value: "clip.mp4" }] };
  const { node, graph } = connectedGraph(origin);

  const resolved = resolveInteractiveExtractorSource(node, graph, "camera_track");

  assert.equal(resolved.available, true);
  assert.deepEqual(resolved.ref, { kind: "annotated_input", value: "clip.mp4" });
});

test("scene_reconstruct mode rejects a non-image extension from a Load Image node", () => {
  const origin = { id: 1, comfyClass: "LoadImage", widgets: [{ name: "image", value: "clip.mp4" }] };
  const { node, graph } = connectedGraph(origin);

  const resolved = resolveInteractiveExtractorSource(node, graph, "scene_reconstruct");

  assert.equal(resolved.available, false);
  assert.match(resolved.reason, /does not look like an image file/);
});

test("scene_reconstruct mode falls back to the picker with no connection", () => {
  const node = {
    id: 2,
    graph: { getNodeById: () => null, links: new Map() },
    inputs: [],
    widgets: [{ name: "omnicam_extractor_source", value: "chosen.png [input]" }],
  };

  const resolved = resolveInteractiveExtractorSource(node, node.graph, "scene_reconstruct");

  assert.equal(resolved.available, true);
  assert.deepEqual(resolved.ref, { kind: "annotated_input", value: "chosen.png [input]" });
});
