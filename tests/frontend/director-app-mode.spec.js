import { expect, test } from "@playwright/test";

test("App host displays the same Director and returns its state to the graph", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(
    () => document.querySelector("#status")?.textContent !== "loading",
    null,
    { timeout: 30000 },
  );
  const mountResult = await page.evaluate(() => window.omnicamMount);
  expect(await page.locator("#status").textContent(), mountResult?.error ?? "no error").toBe("ready");
  const initial = await page.evaluate(() => {
    const runtime = window.omnicamNode.__majoorOmniCamDirectorRuntime;
    runtime.inlineView.collapse();
    window.appModeEditor = runtime.inlineView.ui;
    window.appModeState = runtime.node.widgets.find((w) => w.name === "state_json").value;
    const host = document.createElement("section");
    host.dataset.testid = "app-mode-widget-item";
    host.style.width = "360px";
    // ComfyUI's graph/readonly wrapper can leave pointer-events inherited as
    // none after the DOM widget moves to another surface.
    host.style.pointerEvents = "none";
    const content = document.createElement("div");
    content.inert = true;
    host.append(content);
    document.body.append(host);
    content.append(document.querySelector(".oc-director-node"));
    return Boolean(window.appModeEditor);
  });
  expect(initial).toBe(true);
  const viewer = page.locator('.oc-director-node[data-app-mode="true"]');
  await expect(viewer).toBeVisible();
  await expect(viewer.locator(".viewport-wrap > canvas").first()).toBeVisible();
  await viewer.locator('[data-view="top"]').click({ timeout: 5000 });
  await expect.poll(() => page.evaluate(() => window.appModeEditor.state.view_mode)).toBe("top");
  await viewer.locator('[data-view="perspective"]').click();
  await page.evaluate(() => {
    document.querySelector('[data-testid="app-mode-widget-item"]').dataset.testid = "builder-widget-item";
  });
  await expect.poll(() => page.evaluate(() => document.querySelector('[data-testid="builder-widget-item"] > div').inert)).toBe(true);
  await page.evaluate(() => {
    document.querySelector('[data-testid="builder-widget-item"]').dataset.testid = "app-mode-widget-item";
  });
  await viewer.locator('[data-view="top"]').click();
  expect(await viewer.evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(420);
  await viewer.evaluate((el) => { el.style.height = "500px"; });
  expect(await viewer.evaluate((el) => el.getBoundingClientRect().height)).toBe(500);
  const result = await page.evaluate(async () => {
    const runtime = window.omnicamNode.__majoorOmniCamDirectorRuntime;
    // An edit made while hosted in App Mode must reach the workflow widget.
    window.appModeEditor.state.objects.find((object) => object.id === "qa_cube").enabled = false;
    window.appModeEditor.serialize();
    window.appModeState = runtime.node.widgets.find((w) => w.name === "state_json").value;
    const root = document.querySelector(".oc-director-node");
    document.querySelector("#host").append(root);
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    return {
      sameEditor: runtime.inlineView.ui === window.appModeEditor,
      sameState: runtime.node.widgets.find((w) => w.name === "state_json").value === window.appModeState,
      appLayoutRemoved: root.dataset.appMode === undefined,
      editSaved: JSON.parse(window.appModeState).objects.find((object) => object.id === "qa_cube").enabled === false,
      builderLockRestored: document.querySelector('[data-testid="app-mode-widget-item"] > div').inert,
    };
  });
  expect(result).toEqual({ sameEditor: true, sameState: true, appLayoutRemoved: true, editSaved: true, builderLockRestored: true });
});
