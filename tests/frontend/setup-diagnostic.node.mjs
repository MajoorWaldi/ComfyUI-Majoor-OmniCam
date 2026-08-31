import assert from "node:assert/strict";
import test from "node:test";

import { setupBadgeModel } from "../../web-src/shared/setup-diagnostic.js";

test("global setup copy says core ready while optional adapters need attention", () => {
  assert.deepEqual(setupBadgeModel([]), { tone: "ok", label: "Core ready" });
  assert.deepEqual(setupBadgeModel([{ severity: "warning" }]), {
    tone: "warn", label: "1 optional adapter issue",
  });
  assert.deepEqual(setupBadgeModel([{ severity: "warning" }, { severity: "info" }]), {
    tone: "warn", label: "2 optional adapter issues",
  });
});
