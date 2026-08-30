import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("template contract permits hooks shared by different OmniCam components", () => {
  const result = spawnSync(process.execPath, ["scripts/check_template_contract.mjs"], {
    cwd: new URL("../..", import.meta.url),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr);
});
