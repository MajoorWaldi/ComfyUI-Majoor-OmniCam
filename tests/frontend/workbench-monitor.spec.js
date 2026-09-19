import { expect, test } from "@playwright/test";

// Monitor mounts its full panel inline as the node's own DOM widget -- no
// compact shell, no "OPEN MONITOR" button, no modal. The panel is present
// immediately after nodeCreated() and lives for the node's whole lifetime.
const result = {
  target_profile: ["external_reference_video"],
  capabilities: [{capabilities: [{display: "Regression capability", state: "available"}]}],
  preflight: [{id: "regression", label: "Retained execution", state: "READY"}],
  final_prompt: ["A stone tower at blue hour.\n\nThe camera pushes in."],
};

test.beforeEach(async ({page}) => {
  await page.goto("/tests/frontend/workbench-monitor-mount.html");
  await expect(page.locator("#status")).toHaveText("ready");
});

test("the panel is visible immediately, with no open button and no modal", async ({page}) => {
  await expect(page.locator(".oc-monitor")).toBeVisible();
  await expect(page.locator(".oc-node-shell-open")).toHaveCount(0);
  await expect(page.locator(".oc-workbench-backdrop")).toHaveCount(0);
});

test("execution and blocked-preflight messages render directly, with no separate restore step", async ({page}) => {
  await page.evaluate(message => window.monitorNode.onExecuted(message), result);
  await expect(page.locator('[data-role="profile-preflight"]')).toContainText("Retained execution");
  await expect(page.locator('[data-role="output-status"]')).toContainText("OUTPUT GENERATED");

  await page.evaluate(message => {
    message.preflight[0].state = "BLOCKED";
    window.monitorNode.__majoorOmniCamMonitor.blockedPreflight(message);
  }, result);
  await expect(page.locator('[data-role="profile-preflight"]')).toContainText("BLOCKED");
  await expect(page.locator('[data-role="output-status"]')).toContainText("NO OUTPUT");
});

test("the Compiled Prompt card shows a placeholder until something compiles", async ({page}) => {
  const prompt = page.locator('[data-role="compiled-prompt"]');
  await expect(prompt).toHaveAttribute("data-empty", "1");
  await expect(prompt).toContainText("Queue the workflow");
});

test("execution fills the Compiled Prompt card with the real final_prompt", async ({page}) => {
  await page.evaluate(message => window.monitorNode.onExecuted(message), result);
  const prompt = page.locator('[data-role="compiled-prompt"]');
  await expect(prompt).toHaveAttribute("data-empty", "0");
  await expect(prompt).toHaveText("A stone tower at blue hour.\n\nThe camera pushes in.");
});

test("a blocked preflight still shows the previewed final_prompt", async ({page}) => {
  await page.evaluate(message => {
    message.preflight[0].state = "BLOCKED";
    window.monitorNode.__majoorOmniCamMonitor.blockedPreflight(message);
  }, result);
  await expect(page.locator('[data-role="compiled-prompt"]')).toHaveText(
    "A stone tower at blue hour.\n\nThe camera pushes in.",
  );
});

test("the Copy button copies the compiled prompt and shows a Copied state", async ({page}) => {
  await page.addInitScript(() => {
    window.__omnicamCopiedText = null;
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async (text) => { window.__omnicamCopiedText = text; } },
      configurable: true,
    });
  });
  await page.goto("/tests/frontend/workbench-monitor-mount.html");
  await expect(page.locator("#status")).toHaveText("ready");
  await page.evaluate(message => window.monitorNode.onExecuted(message), result);

  const copyButton = page.locator('[data-act="copy-compiled-prompt"]');
  await copyButton.click();
  await expect.poll(() => page.evaluate(() => window.__omnicamCopiedText))
    .toBe("A stone tower at blue hour.\n\nThe camera pushes in.");
  await expect(copyButton).toHaveAttribute("title", "Copied");
});

test("node removal disposes the panel cleanly", async ({page}) => {
  await page.evaluate(() => window.monitorNode.onRemoved());
  const disposed = await page.evaluate(() => window.monitorNode.__majoorOmniCamMonitor?.disposed);
  expect(disposed).toBe(true);
});

for (const width of [850, 430]) {
  test(`Monitor fits ${width}x600 and its bottom controls remain reachable`, async ({page}) => {
    await page.setViewportSize({width, height: 600});
    expect(await page.locator(".oc-monitor").evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    await page.locator('[data-setting="target_fps"]').fill("30");
    await page.locator('[data-setting="target_fps"]').press("Tab");
    expect(await page.evaluate(() => window.monitorNode.widgets.find(w => w.name === "target_fps").value)).toBe(30);
  });
}

test("Monitor follows ComfyUI light theme variables", async ({page}) => {
  await page.evaluate(() => {
    for (const [key, value] of Object.entries({"--bg-color":"#ffffff", "--comfy-menu-bg":"#eeeeee", "--input-text":"#222222"})) {
      document.documentElement.style.setProperty(key, value);
    }
  });
  expect(await page.locator(".oc-monitor").evaluate(el => getComputedStyle(el).backgroundColor)).toBe("rgb(255, 255, 255)");
});

test("Monitor mounts with French controls and translated execution status", async ({page}) => {
  await page.addInitScript(() => { window.__omnicamPresetSettings = {"Comfy.Locale": "fr"}; });
  await page.goto("/tests/frontend/workbench-monitor-mount.html");
  await expect(page.locator("#status")).toHaveText("ready");
  await page.evaluate(message => window.monitorNode.onExecuted(message), result);
  await expect(page.locator('[data-role="output-status"]')).toContainText("RÉSULTAT GÉNÉRÉ");
  await expect(page.getByLabel("Largeur", {exact: true})).toBeVisible();
});
