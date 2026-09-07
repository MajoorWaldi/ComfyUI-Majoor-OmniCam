import test from "node:test";
import assert from "node:assert/strict";

import { sanitizeState } from "../../web-src/director/core.js";

// omnicam/reconstruction/scene_builder.py never sets reconstruction_appearance
// on the MotionScene it produces (it isn't part of the canonical schema), so
// every freshly-adopted reconstruction lands here without the field. Before
// this default was source_texture, that meant every reconstructed environment
// rendered as an untextured grey proxy the moment it appeared in Director,
// even though the GLB it points to genuinely carries the source texture.
test("a reconstruction scene missing reconstruction_appearance defaults to source_texture", () => {
  const state = sanitizeState({
    objects: [
      {
        id: "recon_environment",
        type: "glb",
        asset: "majoor_omnicam/reconstruction/abc123/environment.glb [input]",
        reconstruction: { version: 1, role: "environment", provider: "comfy_moge", confidence: 0.9 },
      },
    ],
  });

  assert.equal(state.reconstruction_appearance, "source_texture");
});

test("an explicit neutral choice survives sanitization", () => {
  const state = sanitizeState({ reconstruction_appearance: "neutral" });
  assert.equal(state.reconstruction_appearance, "neutral");
});

test("an invalid value falls back to source_texture, not neutral", () => {
  const state = sanitizeState({ reconstruction_appearance: "bogus" });
  assert.equal(state.reconstruction_appearance, "source_texture");
});
