import { expect, test } from "@playwright/test";

// Migration plan Task 11's regression suite: workbench persistence and
// teardown across open/close/reopen, node removal while open, and the
// one-heavy-workbench-at-a-time policy, driven exactly the way a user would
// (clicking OPEN DIRECTOR / the workbench close button), against the real
// compact-shell nodeCreated() path -- not a direct constructor call.

async function mount(page) {
  await page.goto("/tests/frontend/workbench-director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 20000 });
  const error = await page.evaluate(() => window.omnicamMountError);
  expect(error, error).toBeUndefined();
}

test("open, edit, close, reopen: the edit survives with no workbench mounted in between", async ({ page }) => {
  await mount(page);

  await page.locator("#host-a .oc-node-shell-open").click();
  await page.waitForFunction(() => Boolean(window.omnicamNodeA.__majoorOmniCamDirectorRuntime?.workbench));

  await page.evaluate(() => {
    const ui = window.omnicamNodeA.__majoorOmniCam;
    ui.state.cameras[0].name = "Renamed Camera";
    ui.serialize();
  });

  await expect(page.locator('.oc-workbench-backdrop[data-kind="director"]')).toHaveCount(1);
  await page.locator('.oc-workbench-backdrop[data-kind="director"] [data-workbench-act="close"]').click();
  await expect(page.locator('.oc-workbench-backdrop[data-kind="director"]')).toHaveCount(0);

  // Canonical state lives on the runtime with no workbench mounted.
  const persisted = await page.evaluate(() => window.omnicamNodeA.__majoorOmniCamDirectorRuntime.state.cameras[0].name);
  expect(persisted).toBe("Renamed Camera");
  const widgetValue = await page.evaluate(() => {
    const raw = window.omnicamNodeA.widgets.find((w) => w.name === "state_json").value;
    return JSON.parse(raw).cameras[0].name;
  });
  expect(widgetValue).toBe("Renamed Camera");

  await page.locator("#host-a .oc-node-shell-open").click();
  await page.waitForFunction(() => Boolean(window.omnicamNodeA.__majoorOmniCamDirectorRuntime?.workbench));
  const reopenedName = await page.evaluate(() => window.omnicamNodeA.__majoorOmniCam.state.cameras[0].name);
  expect(reopenedName).toBe("Renamed Camera");
});

test("deleting the node while its workbench is open disposes the host and the WebGL viewport", async ({ page }) => {
  await mount(page);

  await page.locator("#host-a .oc-node-shell-open").click();
  await page.waitForFunction(() => Boolean(window.omnicamNodeA.__majoorOmniCamDirectorRuntime?.workbench));
  await page.waitForFunction(() => Boolean(window.omnicamNodeA.__majoorOmniCam?.webgl));

  // Capture the live workbench/runtime references before removal deletes the
  // node's own markers to them.
  await page.evaluate(() => {
    window.__omnicamCapturedUi = window.omnicamNodeA.__majoorOmniCam;
    window.__omnicamCapturedRuntime = window.omnicamNodeA.__majoorOmniCamDirectorRuntime;
    window.omnicamNodeA.onRemoved();
  });

  await expect(page.locator('.oc-workbench-backdrop[data-kind="director"]')).toHaveCount(0);
  const state = await page.evaluate(() => ({
    workbenchDisposed: window.__omnicamCapturedUi?.disposed,
    webglDisposed: window.__omnicamCapturedUi?.webgl?.disposed,
    runtimeDisposed: window.__omnicamCapturedRuntime?.disposed,
  }));
  expect(state.workbenchDisposed).toBe(true);
  expect(state.webglDisposed).toBe(true);
  expect(state.runtimeDisposed).toBe(true);
});

test("only one heavy workbench exists at a time: its full-screen modal blocks reaching another node's Open button, and closing it frees the second to open cleanly", async ({ page }) => {
  await mount(page);

  await page.locator("#host-a .oc-node-shell-open").click();
  await page.waitForFunction(() => Boolean(window.omnicamNodeA.__majoorOmniCamDirectorRuntime?.workbench));

  // A real user cannot reach node B's Open button while A's body-level modal
  // (migration plan section 4.3) covers the page -- a real click times out
  // instead of landing, exactly as Playwright's actionability check reports.
  const reachedB = await page.locator("#host-b .oc-node-shell-open")
    .click({ timeout: 1000 }).then(() => true).catch(() => false);
  expect(reachedB).toBe(false);
  expect(await page.evaluate(() => Boolean(window.omnicamNodeB.__majoorOmniCamDirectorRuntime?.workbench))).toBe(false);

  // Close A, exactly as a user must, then B opens cleanly and only one
  // backdrop ever exists.
  await page.locator('.oc-workbench-backdrop[data-kind="director"] [data-workbench-act="close"]').click();
  await expect(page.locator('.oc-workbench-backdrop[data-kind="director"]')).toHaveCount(0);

  await page.locator("#host-b .oc-node-shell-open").click();
  await page.waitForFunction(() => Boolean(window.omnicamNodeB.__majoorOmniCamDirectorRuntime?.workbench));
  await expect(page.locator('.oc-workbench-backdrop[data-kind="director"]')).toHaveCount(1);
  const nodeId = await page.evaluate(() => document.querySelector('.oc-workbench-backdrop[data-kind="director"]')?.dataset.nodeId);
  expect(nodeId).toBe("2");
});

test("the session manager still switches workbenches when opened programmatically (e.g. a future non-modal host, or an Agent-driven open)", async ({ page }) => {
  await mount(page);

  await page.locator("#host-a .oc-node-shell-open").click();
  await page.waitForFunction(() => Boolean(window.omnicamNodeA.__majoorOmniCamDirectorRuntime?.workbench));

  // Simulate node B's shell Open click without going through the (blocked)
  // real click -- proves workbenchSessions.open()'s switch-and-close-previous
  // path, which tests/frontend/workbench-session-manager.node.mjs already
  // covers in isolation; this confirms it wired up correctly end-to-end.
  await page.evaluate(() => window.omnicamNodeB.widgets); // ensure node B is settled
  await page.locator("#host-b .oc-node-shell-open").dispatchEvent("click");
  await page.waitForFunction(() => Boolean(window.omnicamNodeB.__majoorOmniCamDirectorRuntime?.workbench));

  await expect(page.locator('.oc-workbench-backdrop[data-kind="director"]')).toHaveCount(1);
  const state = await page.evaluate(() => ({
    aWorkbenchAttached: Boolean(window.omnicamNodeA.__majoorOmniCamDirectorRuntime?.workbench),
    bNodeId: document.querySelector('.oc-workbench-backdrop[data-kind="director"]')?.dataset.nodeId,
  }));
  expect(state.aWorkbenchAttached).toBe(false);
  expect(state.bNodeId).toBe("2");
});

test("opening and closing repeatedly leaves no growth in DOM nodes or WebGL viewport instances (migration plan Task 20)", async ({ page }) => {
  await mount(page);

  const idleCount = await page.evaluate(() => document.querySelectorAll("*").length);

  for (let i = 0; i < 5; i++) {
    await page.locator("#host-a .oc-node-shell-open").click();
    await page.waitForFunction(() => Boolean(window.omnicamNodeA.__majoorOmniCam?.webgl));
    await page.locator('.oc-workbench-backdrop[data-kind="director"] [data-workbench-act="close"]').click();
    await expect(page.locator('.oc-workbench-backdrop[data-kind="director"]')).toHaveCount(0);
  }

  const settledCount = await page.evaluate(() => document.querySelectorAll("*").length);
  // Exact equality would be brittle against unrelated DOM churn; this only
  // guards against the failure mode that matters -- a workbench (or its
  // canvas/media elements) never getting removed and piling up over repeated
  // open/close cycles.
  expect(settledCount).toBeLessThanOrEqual(idleCount + 5);
  expect(await page.locator("canvas").count()).toBe(0);
  expect(await page.locator(".oc-workbench-backdrop").count()).toBe(0);
});
