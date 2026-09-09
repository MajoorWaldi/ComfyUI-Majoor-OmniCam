import { expect, test } from "@playwright/test";

async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent === "ready", null, { timeout: 15000 });
}

test("the lower-deck editor is a plain section with Timeline / Graph / Sequence peers", async ({ page }) => {
  await mount(page);
  const graph = page.locator(".oc-graph");

  // Not a disclosure any more.
  expect(await graph.evaluate((el) => el.tagName)).toBe("SECTION");
  await expect(page.locator('[data-role="graph-tabs"] [data-graph-tab]')).toHaveCount(3);
  await expect(page.locator('[data-graph-tab="dope"]')).toHaveText("Timeline");

  // The transport toggle collapses it to just the mode row, no <details>.
  await expect(graph).not.toHaveClass(/oc-graph-collapsed/);
  await page.locator('[data-act="toggle-graph"]').click();
  await expect(graph).toHaveClass(/oc-graph-collapsed/);
  await expect(page.locator('[data-role="graph-tabs"]')).toBeVisible();
  await expect(page.locator(".oc-graph-body")).toBeHidden();

  await page.locator('[data-act="toggle-graph"]').click();
  await expect(graph).not.toHaveClass(/oc-graph-collapsed/);
  await expect(page.locator(".oc-graph-body")).toBeVisible();
});
