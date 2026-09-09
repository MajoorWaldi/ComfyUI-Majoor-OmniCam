import { expect, test } from "@playwright/test";

// The semantic API is attached to the live Director and a committed transaction
// is a single undo step.
test("ui.directorApi.execute mutates canonical state and undoes in one step", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent === "ready", null, { timeout: 15000 });

  const result = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const before = ui.state.objects.find((o) => o.id === "qa_cube").enabled;
    const tx = ui.directorApi.execute({
      version: 1,
      id: "tx_spec_1",
      description: "Hide QA cube",
      operations: [{ type: "object.set_enabled", objectId: "qa_cube", value: false }],
    });
    const afterExec = ui.state.objects.find((o) => o.id === "qa_cube").enabled;
    ui.undo();
    const afterUndo = ui.state.objects.find((o) => o.id === "qa_cube").enabled;
    return { ok: tx.ok, applied: tx.applied, before, afterExec, afterUndo };
  });

  expect(result.ok).toBe(true);
  expect(result.applied).toBe(1);
  expect(result.before).toBe(true);
  expect(result.afterExec).toBe(false);
  expect(result.afterUndo).toBe(true);
});

test("a validateOnly transaction leaves the workflow JSON byte-identical", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent === "ready", null, { timeout: 15000 });

  const result = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const widget = ui.node.widgets.find((w) => w.name === "state_json");
    const before = widget.value;
    const res = ui.directorApi.execute({
      version: 1,
      id: "tx_spec_dry",
      description: "dry run",
      validateOnly: true,
      operations: [{ type: "camera.look_at", point: [3, 3, 3] }],
    });
    return { ok: res.ok, validateOnly: res.validateOnly, changed: widget.value !== before };
  });

  expect(result.ok).toBe(true);
  expect(result.validateOnly).toBe(true);
  expect(result.changed).toBe(false);
});
