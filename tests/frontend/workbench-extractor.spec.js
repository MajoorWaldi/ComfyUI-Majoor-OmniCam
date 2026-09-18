import { expect, test } from "@playwright/test";

// Migration plan Task 14's regression suite, driven through the real
// compact-shell nodeCreated() path: closing the workbench must never cancel a
// queued solve (only node removal does), the result/mode/source restore on
// reopen, and repeated open/close cycles leave no DOM/canvas growth.

async function mount(page) {
  await page.goto("/tests/frontend/workbench-extractor-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 20000 });
  const error = await page.evaluate(() => window.omnicamMountError);
  expect(error, error).toBeUndefined();
  await page.evaluate(async () => {
    const { api } = await import("/tests/frontend/stubs/api.js");
    window.__jobCancelCalls = [];
    api.customFetch = async (path, options) => {
      if (path.endsWith("/cancel")) {
        window.__jobCancelCalls.push(path);
        return { ok: true, status: 200, json: async () => ({ cancelled: true }) };
      }
      return undefined;
    };
    // The chunk-internal "../../scripts/api.js" import a built ExtractorRuntime
    // resolves against is served from a separate virtual module by the test
    // server (see vite.test.config.mjs's serveComfyStubs), so it is not the
    // same object identity as this direct URL import -- swap the runtime's own
    // reference so its customFetch interception actually takes effect
    // (the same workaround agent-bridge.spec.js uses for the same reason).
    window.__omnicamStubApi = api;
  });
}

async function openExtractor(page) {
  await page.locator("#host-a .oc-node-shell-open").click();
  await page.waitForFunction(() => Boolean(window.omnicamNode.__majoorOmniCamExtractorRuntime?.workbench));
}

test("closing the workbench never cancels a queued solve; only node removal does", async ({ page }) => {
  await mount(page);
  await openExtractor(page);

  await page.evaluate(() => {
    const runtime = window.omnicamNode.__majoorOmniCamExtractorRuntime;
    runtime.api = window.__omnicamStubApi;
    runtime.queuePromptId = "prompt-close-test";
  });

  await page.locator('.oc-workbench-backdrop[data-kind="extractor"] [data-workbench-act="close"]').click();
  await expect(page.locator('.oc-workbench-backdrop[data-kind="extractor"]')).toHaveCount(0);

  expect(await page.evaluate(() => window.__jobCancelCalls)).toEqual([]);
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCamExtractorRuntime.queuePromptId)).toBe("prompt-close-test");

  await page.evaluate(() => window.omnicamNode.onRemoved());
  const calls = await page.evaluate(() => window.__jobCancelCalls);
  expect(calls).toHaveLength(1);
  expect(calls[0]).toContain("prompt-close-test");
});

test("reopening restores the runtime's solve result and extract mode with no re-solve", async ({ page }) => {
  await mount(page);
  await openExtractor(page);

  await page.evaluate(() => {
    const runtime = window.omnicamNode.__majoorOmniCamExtractorRuntime;
    runtime.setExtractMode("scene_reconstruct");
    runtime.dispatch({ type: "STATUS", status: { state: "COMPLETED" } });
  });

  await page.locator('.oc-workbench-backdrop[data-kind="extractor"] [data-workbench-act="close"]').click();
  await expect(page.locator('.oc-workbench-backdrop[data-kind="extractor"]')).toHaveCount(0);

  await openExtractor(page);
  const state = await page.evaluate(() => ({
    extractMode: window.omnicamNode.__majoorOmniCamExtractorRuntime.extractMode,
    solveState: window.omnicamNode.__majoorOmniCamExtractorRuntime.state.solveState,
  }));
  expect(state.extractMode).toBe("scene_reconstruct");
  expect(state.solveState).toBe("COMPLETED");
});

test("a Scene Reconstruct result that finishes while the workbench is closed is not lost, and shows on reopen", async ({ page }) => {
  await mount(page);
  await openExtractor(page);
  await page.evaluate(() => window.omnicamNode.__majoorOmniCamExtractorRuntime.setExtractMode("scene_reconstruct"));
  await page.locator('.oc-workbench-backdrop[data-kind="extractor"] [data-workbench-act="close"]').click();
  await expect(page.locator('.oc-workbench-backdrop[data-kind="extractor"]')).toHaveCount(0);

  // Simulate the solve finishing while closed: call the same runtime method
  // the native "executed" ComfyUI event drives (queue/events.js), rather than
  // re-testing that event wiring here.
  await page.evaluate(() => {
    const runtime = window.omnicamNode.__majoorOmniCamExtractorRuntime;
    runtime.executed({
      text: [JSON.stringify({
        kind: "omnicam_extractor_result_v2",
        mode: "scene_reconstruct",
        fingerprint: "closed-recon-fp",
        motion_scene: {
          version: 1,
          timeline: { duration_seconds: 2, authoring_fps: 24 },
          canvas: { width: 640, height: 360 },
          cameras: [{ id: "camera_1", name: "Camera 1", keyframes: [] }],
          active_camera_id: "camera_1", playblast_camera_id: "camera_1",
          objects: [{ id: "recon_obj", type: "cube", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [], enabled: true }],
        },
        reconstruction: { provider: "fake_provider" },
      })],
    });
  });

  const headless = await page.evaluate(() => {
    const runtime = window.omnicamNode.__majoorOmniCamExtractorRuntime;
    return { solveState: runtime.state.solveState, hasResult: Boolean(runtime.reconstructionResult) };
  });
  expect(headless.solveState).toBe("COMPLETED");
  expect(headless.hasResult).toBe(true);

  await openExtractor(page);
  const restoredFingerprint = await page.evaluate(
    () => window.omnicamNode.__majoorOmniCamExtractor.reconstruction.state.fingerprint,
  );
  expect(restoredFingerprint).toBe("closed-recon-fp");
});

test("opening and closing repeatedly leaves no growth in DOM nodes (migration plan Task 20)", async ({ page }) => {
  await mount(page);

  const idleCount = await page.evaluate(() => document.querySelectorAll("*").length);

  for (let i = 0; i < 5; i++) {
    await openExtractor(page);
    await page.locator('.oc-workbench-backdrop[data-kind="extractor"] [data-workbench-act="close"]').click();
    await expect(page.locator('.oc-workbench-backdrop[data-kind="extractor"]')).toHaveCount(0);
  }

  const settledCount = await page.evaluate(() => document.querySelectorAll("*").length);
  expect(settledCount).toBeLessThanOrEqual(idleCount + 5);
  expect(await page.locator(".oc-workbench-backdrop").count()).toBe(0);
});
