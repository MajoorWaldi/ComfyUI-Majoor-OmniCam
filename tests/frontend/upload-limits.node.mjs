// The frontend must refuse an oversized file before it reads it into memory
// (arrayBuffer / decodeAudioData / a blob URL / an upload). These ceilings
// mirror omnicam/routes.py; the backend stays authoritative.

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  MAX_BACKGROUND_SEQUENCE_FRAMES,
  UPLOAD_LIMITS,
  fileSizeError,
  sequenceLengthError,
} from "../../web-src/shared/upload-limits.js";

test("a file at or under the limit is accepted", () => {
  assert.equal(fileSizeError({ name: "a.png", size: UPLOAD_LIMITS.card }, "card"), null);
  assert.equal(fileSizeError({ name: "a.png", size: 10 }, "card"), null);
});

test("an oversized file is rejected with a human-readable reason", () => {
  const message = fileSizeError({ name: "huge.fbx", size: UPLOAD_LIMITS.fbx + 1 }, "fbx");
  assert.match(message, /huge\.fbx/);
  assert.match(message, /MB/);
});

test("an unmeasurable or unknown file never blocks", () => {
  assert.equal(fileSizeError({ name: "x", size: NaN }, "card"), null);
  assert.equal(fileSizeError({ name: "x", size: 1e12 }, "not-a-kind"), null);
  assert.equal(fileSizeError(null, "card"), null);
});

test("a background sequence longer than the frame cap is rejected", () => {
  assert.equal(sequenceLengthError(MAX_BACKGROUND_SEQUENCE_FRAMES), null);
  assert.match(sequenceLengthError(MAX_BACKGROUND_SEQUENCE_FRAMES + 1), /limited to/);
});

test("the client ceilings match routes.py's fixed constants", async () => {
  const routes = await readFile(new URL("../../omnicam/routes.py", import.meta.url), "utf8");
  const pyLimit = (name) => {
    const match = routes.match(new RegExp(`\\b${name}\\s*=\\s*([0-9_]+)\\s*\\*\\s*1024\\s*\\*\\s*1024`));
    return match ? Number(match[1].replace(/_/g, "")) * 1024 * 1024 : null;
  };
  assert.equal(UPLOAD_LIMITS.card, pyLimit("MAX_CARD_BYTES"));
  assert.equal(UPLOAD_LIMITS.model, pyLimit("MAX_MODEL_BYTES"));
  assert.equal(UPLOAD_LIMITS.fbx, pyLimit("MAX_FBX_MODEL_BYTES"));
});
