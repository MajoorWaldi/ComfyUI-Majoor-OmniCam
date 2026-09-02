import { expect, test } from "@playwright/test";

test("Motion Track tools author, edit and serialize the scene", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15_000 });
  await expect(page.locator("#status")).toHaveText("ready");

  // Motion authoring lives in its own workspace now: the viewport motion
  // toolbar and the track panel are only shown while the Motion tab is active.
  await page.locator('[data-tab="motion"]').click();

  const tools = page.locator("button[data-motion-tool]");
  await expect(tools).toHaveCount(5);
  const canvas = page.locator(".viewport-wrap > canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();

  await page.locator('[data-motion-tool="track"]').click();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.55);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.62, { steps: 4 });
  await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.5, { steps: 4 });
  await page.mouse.up();

  await page.locator('[data-motion-tool="anchor"]').click();
  await canvas.click({ position: { x: box.width * 0.7, y: box.height * 0.65 } });
  await page.locator('[data-motion-tool="project"]').click();
  await canvas.click({ position: { x: box.width * 0.55, y: box.height * 0.55 } });
  // Camera Motion Field presets sit in the collapsed Advanced disclosure.
  await page.locator(".motion-advanced > summary").click();
  await page.locator('[data-motion-preset="balanced"]').click();

  await expect(page.locator("[data-motion-layer-id]")).toHaveCount(4);
  await expect(page.locator("[data-motion-timeline-id]")).toHaveCount(4);
  await expect(page.locator('button[data-motion-tool="project"]')).toHaveAttribute("aria-pressed", "true");

  await page.locator("[data-motion-layer-id]").first().click();
  await page.locator('[data-role="motion-interpolation"]').selectOption("smooth");
  await page.locator('[data-role="motion-key-visible"]').uncheck();
  await page.evaluate(() => { window.omnicamNode.__majoorOmniCam.state.playback_range = [24, 72]; });
  await page.locator('[data-motion-layer-action="retime"]').click();

  const result = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const stored = JSON.parse(ui.stateWidget.value);
    return {
      layers: stored.motion_layers.map((layer) => ({
        kind: layer.source_kind,
        interpolation: layer.keys[0].interpolation,
        visible: layer.keys[0].visible,
        times: layer.keys.map((key) => key.time_seconds),
      })),
      selected: stored.selected_motion_layer_id,
      tool: stored.motion_tool,
    };
  });
  expect(result.layers.map((layer) => layer.kind)).toEqual(["manual_2d", "static_anchor", "world_point", "camera_field"]);
  expect(result.layers[0].interpolation).toBe("smooth");
  expect(result.layers[0].visible).toBe(false);
  expect(result.layers[0].times[0]).toBe(1);
  expect(result.layers[0].times.at(-1)).toBe(3);
  expect(new Set(result.layers[0].times.slice(1).map((time, index) => time - result.layers[0].times[index])).size).toBe(1);
  expect(result.selected).toBeTruthy();
  expect(result.tool).toBe("project");
  await page.screenshot({ path: "test-results/motion-tracks-qa.png", fullPage: true });
});
