import { expect, test } from "@playwright/test";

test("a workflow load that beats the lazy chunk still restores the Director", async ({ page }) => {
  await page.goto("/tests/frontend/director-workflow-load.html");
  await expect(page.locator("#status")).toHaveText("ready", { timeout: 20_000 });
  const result = await page.evaluate(() => window.omnicamLoad);
  expect(result.attached).toBe(true);
  // The Director's own constructor re-reads the widgets, so the state survives
  // even though the attach lands after configure(); this pins that end-to-end
  // result down rather than the mechanism that produces it.
  expect(result.cameraIds).toEqual(["from_workflow_a", "from_workflow_b"]);
  expect(result.width).toBe(1920);
  expect(result.height).toBe(1080);
  expect(result.fps).toBe(30);
  expect(result.duration).toBe(8);
});

test("a node deleted while its chunk loads is never attached", async ({ page }) => {
  await page.goto("/tests/frontend/director-removed-during-load.html");
  await expect(page.locator("#status")).toHaveText("ready", { timeout: 20_000 });
  const result = await page.evaluate(() => window.omnicamRemoved);
  // Attaching here would leak a DOM widget and a WebGL context on a dead node.
  expect(result.attached).toBe(false);
  expect(result.widgetAdded).toBe(false);
  expect(result.hostChildren).toBe(0);
});
