import { expect, test } from "@playwright/test";

// The live Director inside its node (web-src/director/inline-view.js): the
// real editor in a compact layout, moved -- not rebuilt -- into the modal by
// OPEN DIRECTOR, and capped to MAX_LIVE_VIEWS live nodes at once.

async function mount(page) {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/tests/frontend/workbench-director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 20000 });
  const error = await page.evaluate(() => window.omnicamMountError);
  expect(error, error).toBeUndefined();
  await page.evaluate(() => {
    for (const id of ["#host-a", "#host-b"]) {
      Object.assign(document.querySelector(id).style, { width: "720px", height: "620px", display: "inline-block", verticalAlign: "top" });
    }
  });
  await page.waitForFunction(() => Boolean(window.omnicamNodeA.__majoorOmniCam?.webgl && window.omnicamNodeB.__majoorOmniCam?.webgl));
}

test("every node shows its live editor inline, and OPEN DIRECTOR moves that same instance into the modal and back", async ({ page }) => {
  await mount(page);
  await expect(page.locator('#host-a .oc-director-node[data-live="true"] .majoor-omnicam[data-inline="true"]')).toHaveCount(1);
  await expect(page.locator("#host-a .oc-inline-bar")).toBeVisible();
  await expect(page.locator("#host-a .oc-left")).toBeHidden();

  await page.evaluate(() => {
    window.__inlineUi = window.omnicamNodeA.__majoorOmniCam;
    window.__inlineWebgl = window.__inlineUi.webgl;
  });
  await page.locator("#host-a .oc-node-shell-open").click();
  await expect(page.locator('.oc-workbench-backdrop[data-kind="director"] .majoor-omnicam.oc-director')).toHaveCount(1);
  const expanded = await page.evaluate(() => ({
    same: window.omnicamNodeA.__majoorOmniCam === window.__inlineUi,
    sameWebgl: window.__inlineUi.webgl === window.__inlineWebgl,
    inline: window.__inlineUi.root.dataset.inline ?? null,
    inModal: Boolean(window.__inlineUi.root.closest(".oc-workbench-backdrop")),
  }));
  expect(expanded).toEqual({ same: true, sameWebgl: true, inline: null, inModal: true });
  await expect(page.locator('.oc-workbench-backdrop .oc-left')).toBeVisible();

  await page.locator('.oc-workbench-backdrop[data-kind="director"] [data-workbench-act="close"]').click();
  await expect(page.locator(".oc-workbench-backdrop")).toHaveCount(0);
  const collapsed = await page.evaluate(() => ({
    same: window.omnicamNodeA.__majoorOmniCam === window.__inlineUi,
    disposed: window.__inlineUi.disposed,
    inline: Boolean(window.__inlineUi.root.matches('#host-a [data-inline="true"]')),
  }));
  expect(collapsed).toEqual({ same: true, disposed: false, inline: true });
});

test("only MAX_LIVE_VIEWS nodes stay live: one more retires the least recently used to its card, and LIVE VIEW brings it back", async ({ page }) => {
  await mount(page);
  const { max } = await page.evaluate(async () => {
    const { MAX_LIVE_VIEWS } = await import("/web-src/director/inline-view.js");
    return { max: MAX_LIVE_VIEWS };
  });
  // The bundle under test and this direct import must agree on the cap.
  expect(max).toBe(4);

  // A and B come up concurrently; touch B then A so their order is known.
  await page.locator("#host-b .viewport-wrap > canvas").click({ position: { x: 40, y: 40 } });
  await page.locator("#host-a .viewport-wrap > canvas").click({ position: { x: 40, y: 40 } });

  // Three more Director nodes: 5 nodes for 4 live slots.
  await page.evaluate(async () => {
    const extension = window.__omnicamExtensions.find((item) => item.name === "Majoor.OmniCam.Director");
    window.__extraNodes = [];
    for (const id of [3, 4, 5]) {
      const host = document.createElement("div");
      host.id = `host-${id}`;
      Object.assign(host.style, { width: "520px", height: "480px", display: "inline-block", verticalAlign: "top" });
      document.body.append(host);
      const node = {
        id,
        comfyClass: "MajoorOmniCamDirector",
        widgets: window.omnicamNodeA.widgets
          .filter((w) => ["state_json", "recording_path", "card_asset", "width", "height", "fps", "duration_seconds", "render_mode"].includes(w.name))
          .map((w) => ({ name: w.name, value: w.value })),
        size: [520, 480], pos: [0, 0],
        graph: { setDirtyCanvas() {} },
        addDOMWidget(name, type, element) { host.appendChild(element); return { element, options: {} }; },
        setSize() {}, connect() { return true; },
      };
      await extension.nodeCreated(node);
      await new Promise((resolve) => {
        const poll = () => (node.__majoorOmniCam?.root?.isConnected ? resolve() : setTimeout(poll, 20));
        poll();
      });
      window.__extraNodes.push(node);
    }
  });
  await expect(page.locator('.oc-director-node[data-live="true"]')).toHaveCount(4);
  // B was the least recently used when node 5 came up: it is the one retired.
  await expect(page.locator("#host-b .oc-director-node")).toHaveAttribute("data-live", "false");
  expect(await page.evaluate(() => window.omnicamNodeB.__majoorOmniCam ?? null)).toBeNull();

  // Touch A again, then bring B back: the least recently used of the rest
  // (node 3) retires, not A.
  await page.locator("#host-a .viewport-wrap > canvas").click({ position: { x: 40, y: 40 } });
  await page.locator("#host-b .oc-node-shell-secondary").click();
  await expect(page.locator("#host-b .oc-director-node")).toHaveAttribute("data-live", "true");
  await expect(page.locator("#host-a .oc-director-node")).toHaveAttribute("data-live", "true");
  await expect(page.locator("#host-3 .oc-director-node")).toHaveAttribute("data-live", "false");
  await expect(page.locator('.oc-director-node[data-live="true"]')).toHaveCount(4);
});

test("the inline bar drives path display, Look At and Quick Camera through the editor's own handlers", async ({ page }) => {
  await mount(page);
  const bar = page.locator("#host-a .oc-inline-bar");

  await bar.locator('[data-role="show-camera-paths"]').uncheck();
  expect(await page.evaluate(() => window.omnicamNodeA.__majoorOmniCam.state.show_camera_paths)).toBe(false);

  const select = bar.locator('[data-role="camera-target-object"]');
  const objectId = await page.evaluate(() => window.omnicamNodeA.__majoorOmniCam.state.objects[0]?.id ?? null);
  if (objectId) {
    await select.selectOption(objectId);
    expect(await page.evaluate(() => window.omnicamNodeA.__majoorOmniCam.activeCameraTrack().target_object_id)).toBe(objectId);
  }

  const before = await page.evaluate(() => [...window.omnicamNodeA.__majoorOmniCam.camera.position]);
  await bar.locator(".oc-inline-angles > summary").click();
  await bar.locator('[data-camera-preset="left_profile"]').click();
  const after = await page.evaluate(() => {
    const camera = window.omnicamNodeA.__majoorOmniCam.camera;
    return { position: [...camera.position], target: [...camera.target] };
  });
  expect(after.position).not.toEqual(before);
  expect(after.position[0]).toBeLessThan(after.target[0]);
});

test("I in the inline viewport inserts a key on that node only", async ({ page }) => {
  await mount(page);
  const keyCount = (node) => page.evaluate((name) => window[name].__majoorOmniCam.state.keyframes.length, node);
  const beforeA = await keyCount("omnicamNodeA");
  const beforeB = await keyCount("omnicamNodeB");
  await page.evaluate(() => window.omnicamNodeA.__majoorOmniCam.setFrame(30));
  await page.locator("#host-a .viewport-wrap > canvas").click({ position: { x: 60, y: 60 } });
  await page.keyboard.press("i");
  expect(await keyCount("omnicamNodeA")).toBe(beforeA + 1);
  expect(await keyCount("omnicamNodeB")).toBe(beforeB);
});

test("a Director whose widget is not on screen (e.g. inside a closed subgraph) only goes live once it is laid out", async ({ page }) => {
  await mount(page);
  const state = await page.evaluate(async () => {
    const extension = window.__omnicamExtensions.find((item) => item.name === "Majoor.OmniCam.Director");
    const host = document.createElement("div");
    Object.assign(host.style, { width: "520px", height: "480px" });
    const node = {
      id: 9,
      comfyClass: "MajoorOmniCamDirector",
      widgets: window.omnicamNodeA.widgets
        .filter((w) => ["state_json", "recording_path", "card_asset", "width", "height", "fps", "duration_seconds", "render_mode"].includes(w.name))
        .map((w) => ({ name: w.name, value: w.value })),
      size: [520, 480], pos: [0, 0],
      graph: { setDirtyCanvas() {} },
      addDOMWidget(name, type, element) { host.appendChild(element); return { element, options: {} }; },
      setSize() {}, connect() { return true; },
    };
    await extension.nodeCreated(node);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const before = Boolean(node.__majoorOmniCam);
    document.body.append(host);
    window.__hiddenNode = node;
    return { before };
  });
  expect(state.before).toBe(false);
  await page.waitForFunction(() => Boolean(window.__hiddenNode.__majoorOmniCam?.root?.isConnected));
});

test("OPEN DIRECTOR right as the node first appears still opens the full editor", async ({ page }) => {
  await mount(page);
  await page.evaluate(async () => {
    const extension = window.__omnicamExtensions.find((item) => item.name === "Majoor.OmniCam.Director");
    const host = document.createElement("div");
    Object.assign(host.style, { width: "520px", height: "480px" });
    const node = {
      id: 11,
      comfyClass: "MajoorOmniCamDirector",
      widgets: window.omnicamNodeA.widgets
        .filter((w) => ["state_json", "recording_path", "card_asset", "width", "height", "fps", "duration_seconds", "render_mode"].includes(w.name))
        .map((w) => ({ name: w.name, value: w.value })),
      size: [520, 480], pos: [0, 0],
      graph: { setDirtyCanvas() {} },
      addDOMWidget(name, type, element) { host.appendChild(element); return { element, options: {} }; },
      setSize() {}, connect() { return true; },
    };
    await extension.nodeCreated(node);
    // First layout and the click land together: both ask for the editor.
    document.body.append(host);
    host.querySelector(".oc-node-shell-open").click();
    window.__raceNode = node;
  });
  await expect(page.locator('.oc-workbench-backdrop[data-node-id="11"] .majoor-omnicam.oc-director')).toHaveCount(1);
  expect(await page.evaluate(() => window.__raceNode.__majoorOmniCam.root.dataset.inline ?? null)).toBeNull();
});

// -- REC button on the node card ------------------------------------------------

/** Replace the editor's recorder: announces `frames` frames of progress, then resolves to `outcome`. */
async function stubRecorder(page, { frames = 4, outcome }) {
  await page.evaluate(({ frames, outcome }) => {
    const runtime = window.omnicamNodeA.__majoorOmniCamDirectorRuntime;
    window.__recorderCalls = [];
    const install = (ui) => {
      ui.makePlayblast = async (options) => {
        window.__recorderCalls.push(options ?? null);
        for (let frame = 1; frame <= frames; frame += 1) {
          runtime.dispatchEvent(new CustomEvent("playblastprogress", { detail: { frame, total: frames } }));
          await new Promise((resolve) => setTimeout(resolve, 60));
        }
        if (outcome.ok) runtime.recordingWidget.value = "omnicam/playblasts/stub.webm";
        return outcome;
      };
    };
    if (runtime.inlineView.ui) install(runtime.inlineView.ui);
    const attach = runtime.attachWorkbench.bind(runtime);
    runtime.attachWorkbench = (ui) => { install(ui); attach(ui); };
  }, { frames, outcome });
}

test("REC on the node records with the live editor at output size, shows the progress and the outcome, and never opens the modal", async ({ page }) => {
  await mount(page);
  await stubRecorder(page, { outcome: { ok: true, message: "Playblast ready: stub.webm" } });
  const record = page.locator("#host-a .oc-node-shell-record");
  await expect(record).toHaveText("● REC");
  await record.click();
  await expect(record).toBeDisabled();
  await expect(record).toHaveText(/^\d+\/4$/);
  await expect(page.locator("#host-a .oc-node-shell")).toHaveAttribute("data-recording", "true");
  await expect(record).toBeEnabled();
  await expect(record).toHaveText("● REC");
  await expect(page.locator("#host-a .oc-node-shell-status")).toHaveText("Playblast ready: stub.webm");
  expect(await page.locator(".oc-workbench-backdrop").count()).toBe(0);
  expect(await page.evaluate(() => window.__recorderCalls)).toEqual([{ inline: true }]);
  expect(await page.evaluate(() => window.omnicamNodeA.widgets.find((w) => w.name === "recording_path").value)).toBe("omnicam/playblasts/stub.webm");
  // B is untouched.
  await expect(page.locator("#host-b .oc-node-shell-record")).toHaveText("● REC");
});

test("REC reports a failed recording on the card instead of failing silently", async ({ page }) => {
  await mount(page);
  await stubRecorder(page, { frames: 2, outcome: { ok: false, message: "Playblast failed: no WebCodecs" } });
  await page.locator("#host-a .oc-node-shell-record").click();
  await expect(page.locator("#host-a .oc-node-shell-status")).toHaveText("Playblast failed: no WebCodecs");
  await expect(page.locator("#host-a .oc-node-shell-record")).toBeEnabled();
});

test("REC on a node retired to its card brings the live editor back first", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => window.omnicamNodeA.__majoorOmniCamDirectorRuntime.inlineView.hide());
  await expect(page.locator("#host-a .oc-director-node")).toHaveAttribute("data-live", "false");
  await stubRecorder(page, { outcome: { ok: true, message: "Playblast ready: stub.webm" } });
  await page.locator("#host-a .oc-node-shell-record").click();
  await expect(page.locator("#host-a .oc-director-node")).toHaveAttribute("data-live", "true");
  await expect(page.locator("#host-a .oc-node-shell-status")).toHaveText("Playblast ready: stub.webm");
  expect(await page.evaluate(() => window.__recorderCalls.length)).toBe(1);
  expect(await page.locator(".oc-workbench-backdrop").count()).toBe(0);
});

test("a second REC click while recording does nothing", async ({ page }) => {
  await mount(page);
  await stubRecorder(page, { frames: 6, outcome: { ok: true, message: "ok" } });
  const record = page.locator("#host-a .oc-node-shell-record");
  await record.click();
  await record.dispatchEvent("click");
  await expect(record).toBeEnabled();
  expect(await page.evaluate(() => window.__recorderCalls.length)).toBe(1);
});

test("while a recording runs the panel's resize leaves the canvas at the recording size, and the node is not retired", async ({ page }) => {
  await mount(page);
  const result = await page.evaluate(() => {
    const editor = window.omnicamNodeA.__majoorOmniCam;
    editor.recording = true;
    editor.canvas.width = 1280;
    editor.canvas.height = 720;
    editor.resizeCanvas();
    const duringRecording = [editor.canvas.width, editor.canvas.height];
    const retired = editor.runtime.inlineView.hide();
    editor.recording = false;
    editor.resizeCanvas();
    return { duringRecording, retired, afterRecording: [editor.canvas.width, editor.canvas.height] };
  });
  expect(result.duringRecording).toEqual([1280, 720]);
  expect(result.retired).toBe(false);
  expect(result.afterRecording).not.toEqual([1280, 720]);
});
