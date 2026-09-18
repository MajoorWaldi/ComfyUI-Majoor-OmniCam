import { expect, test } from "@playwright/test";

// Compact shell contract (migration plan section 8): no canvas/media, status/
// meta/progress render from setters only, the Open button fires onOpen, and
// dispose() detaches its listener without touching the DOM tree itself.

test("createNodeShell renders status/meta/progress and disposes its listener", async ({ page }) => {
  await page.goto("/tests/frontend/node-shell-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading");
  const result = await page.evaluate(() => window.omnicamNodeShellTest);
  expect(result.error, result.error).toBeUndefined();

  expect(result.noCanvas).toBe(true);
  expect(result.noVideo).toBe(true);
  expect(result.buttonLabel).toBe("OPEN EXTRACTOR");

  expect(result.statusText).toBe("Tracking");
  expect(result.metaText).toBe("Frame 184 / 292");
  expect(result.progressActive).toBe("true");
  expect(result.progressWidth).toBe("63%");
  expect(result.progressHiddenAfterClear).toBe(true);

  expect(result.opensAfterClick).toBe(1);
  expect(result.opensAfterDispose).toBe(1);
});
