import { expect, test } from "@playwright/test";

async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent === "ready", null, { timeout: 15000 });
}

test("a scene with no solve health shows a neutral grey strip, not fake green", async ({ page }) => {
  await mount(page);
  const states = await page.evaluate(() => {
    const cells = [...document.querySelectorAll('[data-role="solve-health-cells"] .oc-health-cell')];
    return {
      count: cells.length,
      allUnknown: cells.every((c) => c.dataset.state === "unknown"),
      empty: document.querySelector('[data-role="solve-health-strip"]').classList.contains("oc-health-strip-empty"),
    };
  });
  expect(states.count).toBe(120);
  expect(states.allUnknown).toBe(true);
  expect(states.empty).toBe(true);
});

test("normalized health colours the band and a cell click seeks the timeline", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.metadata = {
      solve_health_v1: { source: "extractor", frames: [
        { frame: 0, state: "good", score: 0.97 },
        { frame: 10, state: "warning", score: 0.55 },
        { frame: 20, state: "bad" },
      ] },
    };
    ui.refreshKeys();
  });

  const cell10 = page.locator('[data-role="solve-health-cells"] .oc-health-cell').nth(10);
  await expect(cell10).toHaveAttribute("data-state", "warning");
  await expect(page.locator('[data-role="solve-health-cells"] .oc-health-cell').nth(20)).toHaveAttribute("data-state", "bad");

  await cell10.click({ force: true });
  const frame = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.frame);
  expect(frame).toBe(10);
});
