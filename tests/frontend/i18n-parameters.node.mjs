import { test } from "node:test";
import assert from "node:assert/strict";
import { registerLocale, setLocale, t } from "../../web-src/i18n.js";
import FR from "../../web-src/locales/fr.js";

test("translated status parameters preserve literal user data and repeated placeholders", () => {
  registerLocale("fr", FR);
  setLocale("fr");
  assert.equal(t("Camera renamed: {value1}", {value1: "$& {value1} <Camera>"}), "Caméra renommée : $& {value1} <Camera>");
  assert.equal(t("Delete {value1} and its {value2} keyframe(s)?", {value1: "Cam A", value2: 3}), "Supprimer Cam A et ses 3 clé(s) ?");
  setLocale("en");
  assert.equal(t("{value1}/{value1}", {value1: 0}), "0/0");
  assert.equal(t("Missing {name}"), "Missing {name}");
});
