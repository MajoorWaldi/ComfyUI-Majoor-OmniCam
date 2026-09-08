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
