import { expect, test } from "@playwright/test";

// Mirrors navigation-interactions.spec.js: the director mount boots a full
// three.js viewport that is well past expect()'s 5s default on CI's software
// renderer, so wait on the mount flag with a dedicated budget and keep a mount
// failure loud instead of an opaque timeout.
async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(
    () => document.querySelector("#status")?.textContent !== "loading",
    null,
    { timeout: 30000 },
  );
  const mountResult = await page.evaluate(() => window.omnicamMount);
  expect(await page.locator("#status").textContent(), mountResult?.error ?? "no error").toBe("ready");
}

test("Draw Camera Path creates one camera across the active playback range", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => {
    window.omnicamNode.__majoorOmniCam.state.playback_range = [12, 48];
  });

  const button = page.locator('[data-act="draw-camera-path"]');
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.view_mode)).toBe("top");

  const canvas = page.locator(".viewport-wrap > canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.65);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.45, { steps: 8 });
  await page.mouse.move(box.x + box.width * 0.72, box.y + box.height * 0.30, { steps: 10 });
  await page.mouse.up();

  const result = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const track = ui.activeCameraTrack();
    return {
      count: ui.state.cameras.length,
      first: track.keyframes[0].frame,
      last: track.keyframes.at(-1).frame,
      keys: track.keyframes.length,
      active: Boolean(ui.cameraPathDraw?.active),
    };
  });

  expect(result.count).toBe(2);
  expect(result.first).toBe(12);
  expect(result.last).toBe(48);
  expect(result.keys).toBeGreaterThanOrEqual(2);
  expect(result.keys).toBeLessThanOrEqual(32);
  expect(result.active).toBe(false);
  await expect(button).toHaveAttribute("aria-pressed", "false");
});

test("a stroke drawn in the front view varies camera height", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.playback_range = [0, 40];
    ui.setViewMode("front");
  });

  await page.locator('[data-act="draw-camera-path"]').click();
  // A fresh draw keeps an axis view the animator already chose.
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.view_mode)).toBe("front");

  const canvas = page.locator(".viewport-wrap > canvas");
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.75);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.4, { steps: 10 });
  await page.mouse.move(box.x + box.width * 0.78, box.y + box.height * 0.2, { steps: 10 });
  await page.mouse.up();

  const heights = await page.evaluate(() =>
    window.omnicamNode.__majoorOmniCam.activeCameraTrack().keyframes.map((k) => k.camera.position[1]));
  expect(heights.length).toBeGreaterThanOrEqual(2);
  expect(Math.max(...heights) - Math.min(...heights)).toBeGreaterThan(1);
});

test("Continue Camera Path appends a segment to the active camera", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.playback_range = [0, 30];
  });

  const canvas = page.locator(".viewport-wrap > canvas");
  const box = await canvas.boundingBox();
  const stroke = async (a, b, c) => {
    await page.mouse.move(box.x + box.width * a.x, box.y + box.height * a.y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * b.x, box.y + box.height * b.y, { steps: 8 });
    await page.mouse.move(box.x + box.width * c.x, box.y + box.height * c.y, { steps: 8 });
    await page.mouse.up();
  };

  await page.locator('[data-act="draw-camera-path"]').click();
  await stroke({ x: 0.25, y: 0.7 }, { x: 0.45, y: 0.5 }, { x: 0.6, y: 0.45 });
  const before = await page.evaluate(() => {
    const t = window.omnicamNode.__majoorOmniCam.activeCameraTrack();
    return { cameras: window.omnicamNode.__majoorOmniCam.state.cameras.length, keys: t.keyframes.length, last: t.keyframes.at(-1).frame };
  });
  expect(before.cameras).toBe(2);

  const extend = page.locator('[data-act="draw-camera-path-extend"]');
  await extend.click();
  await expect(extend).toHaveAttribute("aria-pressed", "true");
  await stroke({ x: 0.6, y: 0.45 }, { x: 0.72, y: 0.35 }, { x: 0.85, y: 0.28 });

  const after = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const t = ui.activeCameraTrack();
    return {
      cameras: ui.state.cameras.length,
      keys: t.keyframes.length,
      last: t.keyframes.at(-1).frame,
      sorted: t.keyframes.every((k, i, all) => i === 0 || k.frame > all[i - 1].frame),
      active: Boolean(ui.cameraPathDraw?.active),
    };
  });
  expect(after.cameras).toBe(2); // no new camera
  expect(after.keys).toBeGreaterThan(before.keys);
  expect(after.last).toBeGreaterThan(before.last);
  expect(after.sorted).toBe(true);
  expect(after.active).toBe(false);
});

test("Escape and RMB cancel without creating a camera", async ({ page }) => {
  await mount(page);
  const button = page.locator('[data-act="draw-camera-path"]');
  const canvas = page.locator(".viewport-wrap > canvas");
  const box = await canvas.boundingBox();

  await button.click();
  await page.mouse.move(box.x + 100, box.y + 100);
  await page.mouse.down();
  await page.mouse.move(box.x + 240, box.y + 180, { steps: 6 });
  await page.keyboard.press("Escape");
  await page.mouse.up();

  expect(await page.evaluate(() => ({
    cameras: window.omnicamNode.__majoorOmniCam.state.cameras.length,
    drawing: window.omnicamNode.__majoorOmniCam.cameraPathDraw,
  }))).toEqual({ cameras: 1, drawing: null });

  await button.click();
  await page.mouse.click(box.x + 180, box.y + 140, { button: "right" });
  expect(await page.evaluate(() => ({
    cameras: window.omnicamNode.__majoorOmniCam.state.cameras.length,
    drawing: window.omnicamNode.__majoorOmniCam.cameraPathDraw,
  }))).toEqual({ cameras: 1, drawing: null });
});
