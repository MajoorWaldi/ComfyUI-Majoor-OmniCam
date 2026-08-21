import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { sampleCamera } from "../../web-src/director/core.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const goldenPath = path.resolve(__dirname, "../fixtures/parity/camera_sampling.python-golden.json");
const golden = JSON.parse(fs.readFileSync(goldenPath, "utf8"));
const numericChannels = ["fov", "roll", "zoom", "near", "far"];
const vectorChannels = ["position", "target"];

function assertClose(actual, expected, epsilon, context) {
  const delta = Math.abs(actual - expected);
  assert.ok(delta < epsilon, `${context}: JS=${actual}, Python=${expected}, delta=${delta}, epsilon=${epsilon}`);
}

test("true JS ↔ Python camera sampling parity", () => {
  assert.equal(golden.generator, "scripts/generate_parity_fixture.py");
  assert.ok(golden.epsilon <= 1e-5);
  assert.ok(golden.cases.length >= 3);

  for (const parityCase of golden.cases) {
    assert.equal(parityCase.frames.length, parityCase.python_samples.length, `${parityCase.name}: incomplete Python golden`);
    for (const expected of parityCase.python_samples) {
      const actual = sampleCamera(parityCase.track, expected.frame, parityCase.track.objects);
      const prefix = `${parityCase.name} @ frame ${expected.frame}`;

      for (const channel of vectorChannels) {
        assert.equal(actual[channel].length, 3, `${prefix} ${channel} dimension`);
        for (let index = 0; index < 3; index += 1) {
          assertClose(actual[channel][index], expected[channel][index], golden.epsilon, `${prefix} ${channel}[${index}]`);
        }
      }
      for (const channel of numericChannels) {
        assertClose(actual[channel], expected[channel], golden.epsilon, `${prefix} ${channel}`);
      }
      assert.equal(actual.camera_type, expected.camera_type, `${prefix} camera_type`);
    }
  }
});
