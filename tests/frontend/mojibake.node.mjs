import test from "node:test";
import assert from "node:assert/strict";

import { looksLikeMojibake, toMojibake } from "../../scripts/mojibake.mjs";

test("valid accented text is never flagged", () => {
  // The old rule matched a lone lead character, so every one of these failed CI.
  for (const text of [
    "câblez-les vers WanVideoATITracks",
    "déjà vu, ça va, être, hôtel, coût, naïve",
    "Bézier et Plücker",
    "fenêtre · 90° · — · …",
    "Éclairage à 45°, caméra à l'épaule",
  ]) {
    assert.equal(looksLikeMojibake(text), false, text);
  }
});

test("text mangled by a UTF-8 to Latin-1 read is flagged", () => {
  // Built by actually performing the mistake, not by hand-typing escapes.
  for (const text of ["Bézier", "Plücker", "supportée", "·", "°", "—", "→", "≈", "●", "★", "📷", "🎯"]) {
    const broken = toMojibake(text);
    assert.notEqual(broken, text, `${text} must actually change`);
    assert.equal(looksLikeMojibake(broken), true, `${text} -> ${broken}`);
  }
});

test("replacement characters and C1 controls are flagged on their own", () => {
  assert.equal(looksLikeMojibake("lost \uFFFD glyph"), true);
  assert.equal(looksLikeMojibake("stray \u0085 control"), true);
});

test("plain ASCII and empty input are clean", () => {
  assert.equal(looksLikeMojibake(""), false);
  assert.equal(looksLikeMojibake("Connect camera_embedding to camera_conditions."), false);
});
