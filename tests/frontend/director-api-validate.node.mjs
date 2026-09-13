// Pure structural validation for camera.create's clipping planes (design
// spec Task 8). validateDirectorTransaction() only needs ui._directorApiTxIds
// (a Set, lazily created) for replay protection -- a plain {} is a valid fake.

import test from "node:test";
import assert from "node:assert/strict";

import { DIRECTOR_API_VERSION } from "../../web-src/director-api/constants.js";
import { DEFAULT_CAMERA_FAR, DEFAULT_CAMERA_NEAR } from "../../web-src/director/core.js";
import { validateDirectorTransaction } from "../../web-src/director-api/validate.js";

function tx(camera, idSuffix = "1") {
  return {
    version: DIRECTOR_API_VERSION,
    id: `tx_${idSuffix}`,
    description: "test camera.create",
    operations: [{ type: "camera.create", camera }],
  };
}

function expectRejected(camera, idSuffix) {
  assert.throws(() => validateDirectorTransaction({}, tx(camera, idSuffix)), (error) => error.code === "BAD_VALUE");
}

function expectAccepted(camera, idSuffix) {
  assert.doesNotThrow(() => validateDirectorTransaction({}, tx(camera, idSuffix)));
}

test("DEFAULT_CAMERA_NEAR/FAR are exported and match defaultCamera()'s literals", async () => {
  assert.equal(DEFAULT_CAMERA_NEAR, 0.01);
  assert.equal(DEFAULT_CAMERA_FAR, 10000);
  const { defaultCamera } = await import("../../web-src/director/core.js");
  const camera = defaultCamera();
  assert.equal(camera.near, DEFAULT_CAMERA_NEAR);
  assert.equal(camera.far, DEFAULT_CAMERA_FAR);
});

test("camera.create rejects a negative far even with no near supplied", () => {
  expectRejected({ far: -1 }, "far_negative");
});

test("camera.create rejects a zero far even with no near supplied", () => {
  expectRejected({ far: 0 }, "far_zero");
});

test("camera.create rejects a far below the default near when near is omitted", () => {
  expectRejected({ far: 0.005 }, "far_below_default_near");
});

test("camera.create rejects far <= an explicitly supplied near", () => {
  expectRejected({ near: 1, far: 0.5 }, "far_below_near");
  expectRejected({ near: 1, far: 1 }, "far_equal_near");
});

test("camera.create accepts an empty camera payload (all defaults)", () => {
  expectAccepted({}, "defaults");
});

test("camera.create accepts an explicit near with a far above it", () => {
  expectAccepted({ near: 0.001, far: 10 }, "explicit_near");
});

test("camera.create accepts a far above the default near when near is omitted", () => {
  expectAccepted({ far: 100 }, "far_above_default_near");
});
