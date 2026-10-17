import { expect, test } from "@playwright/test";

async function mount(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => window.omnicamNode?.__majoorOmniCam?.webgl);
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    window.__nativeToasts = [];
    ui.app.extensionManager.toast = Object.fromEntries(["success", "error", "warning"].map((tone) =>
      [tone, (message) => window.__nativeToasts.push({ tone, message })]));
    ui.root.querySelector('[data-role="encoder"]').value = "realtime";
    ui.state.duration_frames = 2; ui.state.fps = 24;
  });
}

test("playblast emits one native success only after upload completes", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.api.customFetch = async (path) => {
      if (path !== "/majoor/omnicam/upload_playblast") return;
      window.__beforeUploadToasts = [...window.__nativeToasts];
      return { ok: true, json: async () => ({ path: "omnicam/playblasts/test.webm", name: "test.webm" }) };
    };
  });
  const outcome = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.makePlayblast());
  expect(outcome.ok).toBe(true);
  expect(await page.evaluate(() => window.__beforeUploadToasts)).toEqual([]);
  expect(await page.evaluate(() => window.__nativeToasts)).toEqual([
    { tone: "success", message: "Playblast ready: test.webm" },
  ]);
});

test("playblast upload failure emits a native error and no success", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => {
    window.omnicamNode.__majoorOmniCam.api.customFetch = async (path) => path === "/majoor/omnicam/upload_playblast"
      ? { ok: false, text: async () => "Upload failed" } : undefined;
  });
  const outcome = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.makePlayblast());
  expect(outcome.ok).toBe(false);
  const notices = await page.evaluate(() => window.__nativeToasts);
  expect(notices).toHaveLength(1); expect(notices[0].tone).toBe("error");
  expect(notices[0].message).toContain("Upload failed");
});


test("unsupported recording emits one native error before any upload", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => { window.MediaRecorder = undefined; });
  const outcome = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.makePlayblast());
  expect(outcome.ok).toBe(false);
  expect(await page.evaluate(() => window.__nativeToasts)).toEqual([
    { tone: "error", message: "Playblast failed: MediaRecorder unsupported in this browser" },
  ]);
});
