import { expect, test } from "@playwright/test";

// Exercises the shared WorkbenchHost contract (docs/superpowers/plans/
// 2026-09-16-director-extractor-workbench.md section 6): mount produces an
// accessible dialog, focus is contained and restored, Escape/close route
// through onRequestClose, a refusal keeps the host mounted, and dispose is
// idempotent. Runs against a real browser DOM (Playwright) rather than a
// hand-mocked node:test double, since WorkbenchHost is DOM-shaped through
// and through (backdrop mount, focus containment, resize wiring).

test("WorkbenchHost mount/focus/escape/maximize/dispose contract", async ({ page }) => {
  await page.goto("/tests/frontend/workbench-host-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading");
  const result = await page.evaluate(() => window.omnicamWorkbenchTest);
  expect(result.error, result.error).toBeUndefined();

  expect(result.backdropMounted).toBe(true);
  expect(result.role).toBe("dialog");
  expect(result.ariaModal).toBe("true");
  expect(result.hasAriaLabelledby).toBe(true);
  expect(result.titleText).toBe("Scene 01");
  expect(result.contentHasButtons).toBe(true);
  expect(result.mountedGetter).toBe(true);
  expect(result.resizeCalledOnMount).toBe(true);

  expect(result.tabWrapsToFirst).toBe(true);

  expect(result.maximizedClassAdded).toBe(true);
  expect(result.resizeCalledOnMaximize).toBe(true);

  expect(result.refusedCloseKeepsMounted).toBe(true);

  expect(result.backdropClickDoesNotClose).toBe(true);

  expect(result.escapeReason).toBe("escape");
  expect(result.disposedAfterEscape).toBe(true);
  expect(result.backdropRemovedFromDom).toBe(true);

  expect(result.disposeIdempotent).toBe(true);
});
