import { expect, test } from "@playwright/test";

// The camera preview strip and what happens to the lower deck when it is off.

async function mount(page, extraCameras = 0) {
  await page.setViewportSize({ width: 1180, height: 1600 });
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 30000 });
  if (extraCameras) {
    await page.evaluate((count) => {
      const ui = window.omnicamNode.__majoorOmniCam;
      for (let index = 0; index < count; index += 1) ui.addCamera();
      ui.refreshKeys();
    }, extraCameras);
  }
  await page.waitForTimeout(500);
}

test("every camera is visible in the strip instead of scrolled off sideways", async ({ page }) => {
  await mount(page, 3);
  // Regression: the strip kept grid-auto-flow:column with a 220px minimum per
  // tile from when it was a full-width row, so four cameras needed 898px of
  // horizontal scroll inside a 216px sidebar and none was fully visible.
  const report = await page.evaluate(() => {
    const strip = document.querySelector('[data-role="camera-previews"]');
    const stripBox = strip.getBoundingClientRect();
    return {
      tiles: strip.querySelectorAll(".camera-preview-tile").length,
      overflowsSideways: strip.scrollWidth > strip.clientWidth + 1,
      allWithinWidth: [...strip.querySelectorAll(".camera-preview-tile")]
        .every((tile) => tile.getBoundingClientRect().right <= stripBox.right + 1),
    };
  });
  expect(report.tiles).toBe(4);
  expect(report.overflowsSideways).toBe(false);
  expect(report.allWithinWidth).toBe(true);
});

test("a preview tile has the shot's aspect, not its own box's", async ({ page }) => {
  await mount(page, 1);
  // A tile that is not the shot's shape shows a framing the render will never
  // produce. The old tiles came out at 1.04 on a 16:9 shot.
  for (const [width, height] of [[1280, 720], [1024, 1024], [832, 480]]) {
    const ratios = await page.evaluate(async ([w, h]) => {
      const ui = window.omnicamNode.__majoorOmniCam;
      ui.state.width = w;
      ui.state.height = h;
      ui.refreshCameraPreviews();
      // The backing store is re-measured on the next frame, once the new CSS
      // aspect has been laid out.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return [...document.querySelectorAll(".camera-preview-tile")].map((tile) => {
        const box = tile.getBoundingClientRect();
        const canvas = tile.querySelector("canvas");
        return { tile: box.width / box.height, backing: canvas.width / canvas.height };
      });
    }, [width, height]);
    const expected = width / height;
    for (const ratio of ratios) {
      expect(Math.abs(ratio.tile - expected)).toBeLessThan(0.04);
      // The backing store must not be reshaped by a per-axis minimum.
      expect(Math.abs(ratio.backing - expected)).toBeLessThan(0.08);
    }
  }
});

test("hiding the previews gives the timeline the whole row", async ({ page }) => {
  await mount(page);
  const width = async () => page.evaluate(() => ({
    lower: Math.round(document.querySelector(".oc-lower").clientWidth),
    timeline: Math.round(document.querySelector(".oc-timeline").clientWidth),
  }));
  const shown = await width();
  expect(shown.timeline).toBeLessThan(shown.lower - 200);

  // Regression: [hidden] takes the preview out of the grid entirely, so the
  // timeline became the first item and landed in the 236px column with 902px
  // sitting empty beside it.
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.toggleCameraView());
  await page.waitForTimeout(200);
  const hidden = await width();
  expect(hidden.timeline).toBeGreaterThan(hidden.lower - 40);

  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.toggleCameraView());
  await page.waitForTimeout(200);
  expect((await width()).timeline).toBe(shown.timeline);
});

test("the resolution gate masks the viewport, not only the preview tiles", async ({ page }) => {
  await mount(page);
  // Regression: the checkbox was read by the preview tiles only. In the main
  // viewport it did nothing, which is the one place the shot is framed.
  const sample = async () => page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.view_mode = "camera";
    ui.state.width = 1024;
    ui.state.height = 1024;
    ui.render();
    const canvas = ui.canvas;
    const context = canvas.getContext("2d");
    // Sample a corner, not the mid-height edge: a 1:1 gate letterboxes the
    // longer axis, so the mid-height row is only masked when the canvas is
    // landscape. On a slow CI layout the viewport wrap can come up portrait,
    // its bars land top/bottom, and the render-area outline's antialiased edge
    // then reads *brighter* than the bare background. Every corner is inside a
    // bar whichever way the letterbox falls.
    const px = context.getImageData(2, 2, 1, 1).data;
    return px[0] + px[1] + px[2];
  });
  const ungated = await sample();
  await page.evaluate(() => { window.omnicamNode.__majoorOmniCam.state.resolution_gate = true; });
  const gated = await sample();
  expect(gated).toBeLessThan(ungated);
});

test("framing aids are disabled in the orbit views instead of silently inert", async ({ page }) => {
  await mount(page);
  // Regression: guides, safe areas, the gate and the ratio are drawn only when
  // view_mode is "camera". Outside it they stayed clickable and did nothing.
  const state = async () => page.evaluate(() => ["guides", "safe-areas", "resolution-gate", "aspect-ratio"]
    .map((role) => document.querySelector(`[data-role="${role}"]`)?.disabled));

  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.view_mode = "camera";
    ui.updateEditState();
  });
  expect(await state()).toEqual([false, false, false, false]);

  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.view_mode = "perspective";
    ui.updateEditState();
  });
  expect(await state()).toEqual([true, true, true, true]);
});
