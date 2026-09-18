import { expect, test } from "@playwright/test";

const open = page => page.locator("#host .oc-node-shell-open").click();
const close = page => page.locator('[data-workbench-act="close"]').click();
const result = {
  target_profile: ["external_reference_video"],
  capabilities: [{capabilities: [{display: "Regression capability", state: "available"}]}],
  preflight: [{id: "regression", label: "Retained execution", state: "READY"}],
};

test.beforeEach(async ({page}) => {
  await page.goto("/tests/frontend/workbench-monitor-mount.html");
  await expect(page.locator("#status")).toHaveText("ready");
  await expect(page.locator("#host .oc-node-shell-open")).toBeVisible();
});

test("closed Monitor retains executions and blocked preflights and can reopen", async ({page}) => {
  await page.evaluate(message => window.monitorNode.onExecuted(message), result);
  await open(page);
  await expect(page.locator('[data-role="profile-preflight"]')).toContainText("Retained execution");
  await expect(page.locator('[data-role="output-status"]')).toContainText("OUTPUT GENERATED");
  await close(page);
  await expect(page.locator(".oc-workbench-backdrop")).toHaveCount(0);
  await expect(page.locator("#host .oc-node-shell-open")).toBeVisible();
  await page.evaluate(message => {
    message.preflight[0].state = "BLOCKED";
    window.monitorNode.__majoorOmniCamMonitorRuntime.blockedPreflight(message);
  }, result);
  await open(page);
  await expect(page.locator('[data-role="output-status"]')).toContainText("NO OUTPUT");
  await close(page);
  await open(page);
  await expect(page.locator('[data-role="profile-preflight"]')).toContainText("BLOCKED");
  await page.evaluate(() => window.monitorNode.onRemoved());
  await expect(page.locator(".oc-workbench-backdrop")).toHaveCount(0);
});

for (const width of [850, 430]) {
  test(`Monitor fits ${width}x600 and its bottom controls remain reachable`, async ({page}) => {
    await page.setViewportSize({width, height: 600});
    await open(page);
    const box = await page.locator(".oc-workbench-window").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(box.y + box.height).toBeLessThanOrEqual(600);
    expect(await page.locator(".oc-monitor").evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    await page.locator('[data-setting="target_fps"]').fill("30");
    await page.locator('[data-setting="target_fps"]').press("Tab");
    expect(await page.evaluate(() => window.monitorNode.widgets.find(w => w.name === "target_fps").value)).toBe(30);
    await close(page);
    await expect(page.locator("#host .oc-node-shell-open")).toBeVisible();
  });
}

test("Monitor follows ComfyUI light theme variables", async ({page}) => {
  await page.evaluate(() => {
    for (const [key, value] of Object.entries({"--bg-color":"#ffffff", "--comfy-menu-bg":"#eeeeee", "--input-text":"#222222"})) {
      document.documentElement.style.setProperty(key, value);
    }
  });
  await open(page);
  expect(await page.locator(".oc-workbench-window").evaluate(el => getComputedStyle(el).backgroundColor)).toBe("rgb(255, 255, 255)");
  expect(await page.locator(".oc-workbench-title").evaluate(el => getComputedStyle(el).color)).toBe("rgb(34, 34, 34)");
});

test("Monitor opens with French controls and translated execution status", async ({page}, testInfo) => {
  await page.addInitScript(() => { window.__omnicamPresetSettings = {"Comfy.Locale": "fr"}; });
  await page.goto("/tests/frontend/workbench-monitor-mount.html");
  await expect(page.locator("#host .oc-node-shell-open")).toHaveText("OUVRIR MONITOR");
  await page.evaluate(message => window.monitorNode.onExecuted(message), result);
  await open(page);
  await expect(page.locator('[data-role="output-status"]')).toContainText("RÉSULTAT GÉNÉRÉ");
  await expect(page.getByLabel("Largeur", {exact: true})).toBeVisible();
  await page.screenshot({path: testInfo.outputPath("monitor-fr.png")});
});
