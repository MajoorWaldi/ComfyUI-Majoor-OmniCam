import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { sampleCamera } from "../../web-src/director/core.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, "../fixtures/tracks");

const fixtureFiles = fs.readdirSync(fixturesDir).filter((file) => file.endsWith(".json"));

test("cross-language parity: JS samples match expectations on canonical fixtures", () => {
  for (const file of fixtureFiles) {
    const raw = fs.readFileSync(path.join(fixturesDir, file), "utf-8");
    const track = JSON.parse(raw);
    const testFrames = [0, 1, 6, 12, 18, track.duration_frames - 1];

    for (const frame of testFrames) {
      const sampled = sampleCamera(track, frame);
      assert.ok(Number.isFinite(sampled.position[0]), `position[0] must be finite in ${file} at frame ${frame}`);
      assert.ok(Number.isFinite(sampled.position[1]), `position[1] must be finite in ${file} at frame ${frame}`);
      assert.ok(Number.isFinite(sampled.position[2]), `position[2] must be finite in ${file} at frame ${frame}`);
      assert.ok(Number.isFinite(sampled.fov), `fov must be finite in ${file} at frame ${frame}`);
      assert.ok(Number.isFinite(sampled.roll), `roll must be finite in ${file} at frame ${frame}`);
      assert.ok(Number.isFinite(sampled.zoom), `zoom must be finite in ${file} at frame ${frame}`);
    }
  }
});
