import { expect, test } from "@playwright/test";

// Extractor mounts its full panel inline as the node's own DOM widget -- no
// compact shell, no "OPEN EXTRACTOR" button, no modal. ExtractorRuntime still
// owns the queued solve exactly as before (only node removal cancels it);
// the only thing that changed is that the panel attaching to it happens once,
// immediately, instead of on demand each time a workbench opens.

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
    window.omnicamNode.__majoorOmniCamExtractorRuntime.api = api;
  });
}

test("the panel is visible immediately, with no open button and no modal", async ({page}) => {
  await mount(page);
  await expect(page.locator(".oc-extractor")).toBeVisible();
  await expect(page.locator(".oc-node-shell-open")).toHaveCount(0);
  await expect(page.locator(".oc-workbench-backdrop")).toHaveCount(0);
  expect(await page.evaluate(() => Boolean(window.omnicamNode.__majoorOmniCamExtractor))).toBe(true);
});

test("node removal cancels a queued solve", async ({page}) => {
  await mount(page);

  await page.evaluate(() => {
    const runtime = window.omnicamNode.__majoorOmniCamExtractorRuntime;
    runtime.queuePromptId = "prompt-removal-test";
  });

  await page.evaluate(() => window.omnicamNode.onRemoved());
  const calls = await page.evaluate(() => window.__jobCancelCalls);
  expect(calls).toHaveLength(1);
  expect(calls[0]).toContain("prompt-removal-test");
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCamExtractorRuntime.disposed)).toBe(true);
});

test("a Scene Reconstruct result reaches the always-attached panel directly", async ({page}) => {
  await mount(page);
  await page.evaluate(() => window.omnicamNode.__majoorOmniCamExtractorRuntime.setExtractMode("scene_reconstruct"));

  await page.evaluate(() => {
    const runtime = window.omnicamNode.__majoorOmniCamExtractorRuntime;
    runtime.executed({
      text: [JSON.stringify({
        kind: "omnicam_extractor_result_v2",
        mode: "scene_reconstruct",
        fingerprint: "inline-recon-fp",
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

  const state = await page.evaluate(() => ({
    solveState: window.omnicamNode.__majoorOmniCamExtractorRuntime.state.solveState,
    fingerprint: window.omnicamNode.__majoorOmniCamExtractor.reconstruction.state.fingerprint,
  }));
  expect(state.solveState).toBe("COMPLETED");
  expect(state.fingerprint).toBe("inline-recon-fp");
});
