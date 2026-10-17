import { expect, test } from "@playwright/test";

async function mount(page, mode = "scale") {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => window.omnicamNode?.__majoorOmniCam?.webgl);
  await page.locator('[data-object-id="qa_cube"]').click();
  return page.evaluate(async (mode) => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.setTransformMode(mode);
    const { Vector3 } = await import("/web-src/three-runtime.js");
    const obj = ui.state.objects.find((o) => o.id === "qa_cube");
    const v = new Vector3(...obj.position).project(ui.webgl.activeCamera);
    const rect = ui.interactionElement.getBoundingClientRect();
    return { x: rect.left + (v.x + 1) * rect.width / 2, y: rect.top + (1 - v.y) * rect.height / 2 };
  }, mode);
}

test("center scale stays finite and proportional under subpixel pointer movement", async ({ page }) => {
  const point = await mount(page);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  const sizes = [];
  for (const dx of [0, 0.25, 0.5, 1, 2, 4, 8]) {
    await page.mouse.move(point.x + dx, point.y - dx);
    sizes.push(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "qa_cube").size));
  }
  await page.mouse.up();
  expect(Math.max(...sizes.flat())).toBeLessThan(1.3);
  expect(sizes.flat().every(Number.isFinite)).toBe(true);
});


test("scale stops on release, undo restores the start, and Escape cancels", async ({ page }) => {
  const point = await mount(page);
  const size = () => page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "qa_cube").size);
  const before = await size();
  await page.mouse.move(point.x, point.y); await page.mouse.down();
  await page.mouse.move(point.x + 20, point.y - 10); await page.mouse.up();
  const after = await size(); expect(after[0]).toBeGreaterThan(before[0]);
  await page.mouse.move(point.x + 60, point.y - 40);
  expect(await size()).toEqual(after);
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.undo());
  expect(await size()).toEqual(before);
  await page.mouse.move(point.x, point.y); await page.mouse.down();
  await page.mouse.move(point.x + 15, point.y - 15);
  await page.keyboard.press("Escape");
  expect(await size()).toEqual(before);
  await page.mouse.move(point.x + 50, point.y - 50); await page.mouse.up();
  expect(await size()).toEqual(before);
});

test("snapped scaling of a tiny object does not jump its dimensions on the first move", async ({ page }) => {
  const point = await mount(page);
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.objects.find((o) => o.id === "qa_cube").size = [0.01, 0.02, 0.01];
    ui.state.spatial_snap_mode = "grid"; ui.render();
  });
  await page.mouse.move(point.x, point.y); await page.mouse.down();
  await page.mouse.move(point.x + 0.5, point.y - 0.5); await page.mouse.up();
  const size = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.objects.find((o) => o.id === "qa_cube").size);
  expect(size).toEqual([0.01, 0.02, 0.01]);
});
