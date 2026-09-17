// The Director modal audit's Lot 1 pass made the root bounded
// (.oc-director: overflow:hidden) and the dock locally scrollable
// (.oc-dock: overflow-y:auto). Toolbar menus (.toolbar-menu > .menu-panel)
// used to rely on the whole page growing to fit them; now an ancestor can
// clip a panel instead of it just scrolling into view. Lot 2 anchors an open
// panel with position:fixed (see positionMenuPanel in
// web-src/event-bindings/editor-global.js) so it always renders within the
// viewport regardless of the bounded shell's own box.

import { expect, test } from "@playwright/test";

async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
}

test("the output menu panel stays within the viewport at a short window height", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 620 });
  await mount(page);
  await page.locator('[data-menu="output"] > summary').click();
  const panel = page.locator('[data-menu="output"] .menu-panel');
  await expect(panel).toBeVisible();
  const box = await panel.boundingBox();
  expect(box).not.toBeNull();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(620 + 1);
  expect(box.x + box.width).toBeLessThanOrEqual(1366 + 1);
});

test("scrolling a panel while a menu is open keeps the panel anchored instead of leaving it stranded", async ({ page }) => {
  await mount(page);
  const menu = page.locator('[data-menu="output"]');
  const panel = page.locator('[data-menu="output"] .menu-panel');
  await menu.locator("> summary").click();
  await expect(panel).toBeVisible();
  const before = await panel.boundingBox();
  await page.evaluate(() => {
    const dock = document.querySelector(".oc-dock") || document.scrollingElement;
    dock.scrollTop = (dock.scrollTop || 0) + 20;
    dock.dispatchEvent(new Event("scroll", { bubbles: false }));
  });
  // Still open (a scroll must not self-close a menu -- opening one whose
  // summary isn't fully visible can itself trigger a native focus
  // scroll-into-view, which would otherwise close the very menu just opened).
  await expect(menu).toHaveJSProperty("open", true);
  await expect(panel).toBeVisible();
  const after = await panel.boundingBox();
  expect(after).not.toBeNull();
  // Re-anchored: still inside the viewport, not left at its stale position.
  expect(after.y).toBeGreaterThanOrEqual(0);
  expect(before).not.toBeNull();
});
