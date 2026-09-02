import { expect, test } from "@playwright/test";

// The dope sheet, its ruler and the graph editor's two tabs. These assert the
// wiring, not the pixels: every control in the lower deck must actually do
// something, and the ruler / graph / lanes must agree on where a frame is.

const KEY_FRAMES = [0, 17, 34, 50, 66, 83, 100, 120];

async function mount(page) {
  await page.setViewportSize({ width: 1180, height: 1500 });
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 30000 });
  await page.evaluate((frames) => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.state.duration_frames = 121;
    frames.forEach((frame, index) => {
      ui.setFrame(frame);
      ui.camera.position = [5 + index * 0.8, 1 + index * 0.3, -1 - (index % 3) * 0.4];
      ui.camera.target = [0, 1 + (index % 3) * 0.2, 0];
      ui.camera.fov = 35 + (index % 2) * 6;
      ui.camera.roll = (index % 4) * 2;
      ui.insertKeyframe();
    });
    ui.setFrame(52);
    ui.refreshKeys();
  }, KEY_FRAMES);
  await page.waitForTimeout(200);
}

test("the ruler labels round frames and always ends on the last frame", async ({ page }) => {
  await mount(page);
  const labels = await page.locator('[data-role="ruler"] .timeline-tick').allTextContents();
  expect(labels.map(Number)).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]);
});

test("every dope channel gets a lane, and its keys line up with the ruler", async ({ page }) => {
  await mount(page);
  // Master lane plus the three derived channel lanes.
  expect(await page.locator('[data-role="keys"] .key').count()).toBe(KEY_FRAMES.length);
  expect(await page.locator(".oc-dope-row").count()).toBe(3);

  // The master lane and the ruler must place frame 50 at the same x.
  const { keyX, tickX } = await page.evaluate(() => {
    const key = [...document.querySelectorAll('[data-role="keys"] .key')].find((el) => el.dataset.keyFrame === "50");
    const tick = [...document.querySelectorAll('[data-role="ruler"] .timeline-tick')].find((el) => el.textContent === "50");
    return { keyX: key.getBoundingClientRect().left, tickX: tick.getBoundingClientRect().left };
  });
  expect(Math.abs(keyX - tickX)).toBeLessThan(8);
});

test("shift-click keeps the selected key group", async ({ page }) => {
  await mount(page);
  const first = page.locator('[data-role="keys"] .key[data-key-frame="17"]');
  const second = page.locator('[data-role="keys"] .key[data-key-frame="50"]');
  await first.click();
  await second.click({ modifiers: ["Shift"] });
  expect(await page.evaluate(() => [...window.omnicamNode.__majoorOmniCam.selectedKeyFrames].sort((a, b) => a - b)))
    .toEqual([17, 50]);
});

test("unticking a channel removes its lane and only its lane", async ({ page }) => {
  await mount(page);
  await page.locator('[data-dope-channel="roll"]').uncheck();
  await page.waitForTimeout(150);
  expect(await page.locator(".oc-dope-row").count()).toBe(2);
  expect(await page.locator('.oc-dope-row[data-channel="roll"]').count()).toBe(0);
  await page.locator('[data-dope-channel="roll"]').check();
  await page.waitForTimeout(150);
  expect(await page.locator('.oc-dope-row[data-channel="roll"]').count()).toBe(1);
});

test("the playhead follows the zoomed timeline instead of frame/duration", async ({ page }) => {
  await mount(page);
  // Regression: the fast scrub path positioned the playhead as frame/lastFrame,
  // which is only correct at zoom 1 with no pan.
  const offset = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.timelineZoom = 4;
    ui.timelinePan = 40;
    ui.setFrame(52, false, false);
    const line = document.querySelector('[data-role="dope-playhead"]');
    const track = document.querySelector('[data-role="dope-tracks"]');
    return (line.getBoundingClientRect().left - track.getBoundingClientRect().left) / track.getBoundingClientRect().width;
  });
  // frame 52, pan 40, span 120/4 = 30 -> (52-40)/30 = 0.4
  expect(offset).toBeGreaterThan(0.36);
  expect(offset).toBeLessThan(0.44);
});

test("dragging the ruler scrubs the timeline", async ({ page }) => {
  await mount(page);
  const box = await page.locator('[data-role="ruler"]').boundingBox();
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
  await page.mouse.up();
  const frame = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.frame);
  expect(frame).toBeGreaterThan(80);
  expect(frame).toBeLessThanOrEqual(120);
});

test("the full camera timeline scrubs from any channel lane", async ({ page }) => {
  await mount(page);
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.setFrame(0, false, false));
  const row = page.locator('.oc-dope-row[data-channel="roll"]');
  const box = await row.boundingBox();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2);
  await page.mouse.up();
  const frame = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.frame);
  expect(frame).toBeGreaterThanOrEqual(20);
  expect(frame).toBeLessThan(60);
});

test("the camera timeline exposes a full ruler and four aligned channel labels", async ({ page }) => {
  await mount(page);
  expect(await page.locator('[data-role="ruler"] .timeline-tick').count()).toBeGreaterThan(1);
  expect((await page.locator('.oc-dope-label').allTextContents()).map((text) => text.trim())).toEqual(["Camera", "Look At", "Focal Length", "Roll"]);
  const height = await page.locator('[data-role="dope-tracks"]').evaluate((element) => element.getBoundingClientRect().height);
  expect(height).toBeGreaterThanOrEqual(160);
});

test("the graph tabs swap the stage and disable the controls that do not apply", async ({ page }) => {
  await mount(page);
  const canvas = page.locator('[data-role="curve-canvas"]');
  const sheet = page.locator('[data-role="graph-dope"]');
  await expect(canvas).toBeVisible();
  await expect(sheet).toBeHidden();

  await page.locator('[data-graph-tab="dope"]').click();
  await expect(canvas).toBeHidden();
  await expect(sheet).toBeVisible();
  // One lane per graphed component: Position X/Y/Z + Focal Length + Roll.
  expect(await page.locator(".oc-gdope-row").count()).toBe(5);
  await expect(page.locator('[data-act="curve-fit"]')).toBeDisabled();
  // The <details> must not have collapsed: the tabs live inside its <summary>.
  await expect(page.locator(".oc-graph")).toHaveAttribute("open", "");

  await page.locator('[data-graph-tab="curves"]').click();
  await expect(canvas).toBeVisible();
  await expect(sheet).toBeHidden();
  await expect(page.locator('[data-act="curve-fit"]')).toBeEnabled();
});

test("the channel list names the channels the graph is actually drawing", async ({ page }) => {
  await mount(page);
  const listed = async () => (await page.locator('[data-role="curve-legend"] [data-channel-filter]').allTextContents()).slice(1);

  // Regression: the group labels used to be assigned by option index, so
  // adding a fourth group made the select name a group it was not showing.
  await expect(page.locator('[data-role="curve-group"]')).toHaveValue("camera");
  expect(await page.locator('[data-role="curve-group"] option:checked').textContent())
    .toContain("Camera");
  expect(await listed()).toEqual(["Position X", "Position Y", "Position Z", "Focal Length", "Roll"]);

  await page.locator('[data-role="curve-group"]').selectOption("lens");
  await page.waitForTimeout(150);
  expect(await listed()).toEqual(["FOV", "Roll", "Zoom"]);
  expect(await page.locator('[data-role="curve-group"] option:checked').textContent())
    .toContain("FOV / Roll / Zoom");
});

test("soloing a channel narrows the graph to that channel", async ({ page }) => {
  await mount(page);
  await page.locator('[data-role="curve-legend"] [data-channel-filter="1"]').click();
  await page.waitForTimeout(150);
  const state = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    return { filter: ui.curveChannelFilter, drawn: ui.curveChannels().map((channel) => channel.name) };
  });
  expect(state.filter).toBe("1");
  expect(state.drawn).toEqual(["Position Y"]);
});

test("a refresh between pointerdown and pointerup does not swallow the click", async ({ page }) => {
  await mount(page);
  // Regression: refreshKeys() rebuilt the channel list and the dope rows every
  // time it ran -- which is every frame of playback. The button under the
  // pointer was replaced mid-gesture, so the click event never fired and the
  // chips and diamonds were dead whenever anything was refreshing.
  const chip = page.locator('[data-role="curve-legend"] [data-channel-filter="2"]');
  const box = await chip.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.refreshKeys());
  await page.mouse.up();
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.curveChannelFilter)).toBe("2");

  const diamond = page.locator('.oc-dope-row[data-channel="roll"] .oc-dope-key').nth(2);
  const diamondBox = await diamond.boundingBox();
  await page.mouse.move(diamondBox.x + diamondBox.width / 2, diamondBox.y + diamondBox.height / 2);
  await page.mouse.down();
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.refreshKeys());
  await page.mouse.up();
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.frame)).toBe(KEY_FRAMES[2]);
});

test("a click that jitters a couple pixels on a key does not retime it", async ({ page }) => {
  await mount(page);
  // Real report: with several keys placed, users could not click around the
  // timeline without nudging one. The jitter between a pointerdown and its
  // pointerup on a real mouse is a few pixels -- exactly what this simulates.
  const key = page.locator('[data-role="keys"] .key[data-key-frame="50"]');
  const box = await key.boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 2, cy + 1); // sub-threshold jitter
  await page.mouse.up();
  const frames = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.timelineKeyframes().map((k) => k.frame));
  expect(frames).toContain(50);
});

test("a deliberate drag on a key still retimes it", async ({ page }) => {
  await mount(page);
  const key = page.locator('[data-role="keys"] .key[data-key-frame="50"]');
  const box = await key.boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 60, cy); // well past the dead zone
  await page.mouse.up();
  const frames = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.timelineKeyframes().map((k) => k.frame));
  expect(frames).not.toContain(50);
});

// The multi-camera edit. It lives in its own tab of the lower deck, next to the
// Graph Editor and the Dope Sheet -- as a strip above the dope rows it was too
// small to read and hidden behind a checkbox in a menu, so nobody found it.
async function openEditTab(page, { withCuts = true } = {}) {
  await mount(page);
  await page.evaluate((withCuts) => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.addCamera();
    ui.addCamera();
    ui.state.sequence = withCuts
      ? {
          enabled: true,
          cuts: [
            { camera_id: ui.state.cameras[0].id, start: 0 },
            { camera_id: ui.state.cameras[1].id, start: 40 },
            { camera_id: ui.state.cameras[2].id, start: 80 },
          ],
          recording_path: "",
        }
      : { enabled: false, cuts: [], recording_path: "" };
  }, withCuts);
  await page.locator('[data-graph-tab="sequence"]').click();
  await page.waitForTimeout(150);
}

test("the edit stage only exists while its tab is showing", async ({ page }) => {
  await mount(page);
  // The other two tabs must not pay for a view they are not showing.
  expect(await page.locator('[data-role="sequence-lane"]').count()).toBe(0);

  await openEditTab(page);
  expect(await page.locator('[data-role="sequence-lane"]').count()).toBe(1);
  expect(await page.locator(".oc-sequence-shot").count()).toBe(3);
  await expect(page.locator('[data-role="graph-sequence"]')).toBeVisible();

  await page.locator('[data-graph-tab="curves"]').click();
  await expect(page.locator('[data-role="graph-sequence"]')).toBeHidden();
});

test("the empty edit offers auto-split instead of a blank strip", async ({ page }) => {
  await openEditTab(page, { withCuts: false });
  await expect(page.locator(".oc-sequence-lane .oc-sequence-empty")).toBeVisible();
  expect(await page.locator(".oc-sequence-shot").count()).toBe(0);

  await page.locator('.oc-sequence-toolbar button', { hasText: "Auto-split" }).click();
  await page.waitForTimeout(150);
  expect(await page.locator(".oc-sequence-shot").count()).toBe(3);
});

test("dragging a shot boundary trims the cut", async ({ page }) => {
  await openEditTab(page);
  const handle = page.locator(".oc-sequence-shot").nth(1).locator(".oc-sequence-handle");
  const box = await handle.boundingBox();
  const lane = await page.locator('[data-role="sequence-lane"]').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  // Drag to roughly halfway along the lane, i.e. about frame 60 of 120.
  await page.mouse.move(lane.x + lane.width * 0.5, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(150);

  const cuts = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.sequence.cuts.map((cut) => cut.start));
  expect(cuts[0]).toBe(0);
  expect(cuts[1]).toBeGreaterThan(45);
  expect(cuts[1]).toBeLessThan(80);
  expect(cuts[2]).toBe(80);
});

test("the playblast selector offers the edit as a target", async ({ page }) => {
  await openEditTab(page);
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.refreshCameraSelectors());
  const values = await page.locator('[data-role="playblast-camera"] option').evaluateAll(
    (options) => options.map((option) => option.value));
  expect(values).toContain("__sequence__");

  // Selecting it makes the recorded camera follow the cuts frame by frame.
  const followed = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    ui.setPlayblastCamera("__sequence__");
    return [0, 39, 40, 79, 80, 119].map((frame) => {
      ui.frame = frame;
      return ui.playblastCameraAtFrame().position.join(",");
    });
  });
  expect(new Set(followed).size).toBeGreaterThan(1);
});

// The trim drag used to attach window-level pointermove listeners with no
// pointer capture, so a lost pointerup left them alive and every mouse move
// anywhere on the page kept retiming the cut -- "le pointeur déplace tout seul
// même si on n'est plus dans le node".
test("a finished trim does not keep following the pointer", async ({ page }) => {
  await openEditTab(page);
  const handle = page.locator(".oc-sequence-shot").nth(1).locator(".oc-sequence-handle");
  const box = await handle.boundingBox();
  const lane = await page.locator('[data-role="sequence-lane"]').boundingBox();

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(lane.x + lane.width * 0.45, box.y + box.height / 2, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(100);

  const settled = await page.evaluate(() => ({
    dragging: window.omnicamNode.__majoorOmniCam.sequenceDrag,
    start: window.omnicamNode.__majoorOmniCam.state.sequence.cuts[1].start,
  }));
  expect(settled.dragging).toBeFalsy();

  // Sweep the pointer clear across the page; the cut must not move.
  await page.mouse.move(lane.x + lane.width * 0.9, box.y + 400, { steps: 10 });
  await page.mouse.move(10, 10, { steps: 10 });
  await page.waitForTimeout(100);
  const after = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.sequence.cuts[1].start);
  expect(after).toBe(settled.start);
});

test("split at the playhead hands the new shot the next camera", async ({ page }) => {
  await openEditTab(page, { withCuts: false });
  await page.locator('.oc-sequence-toolbar button', { hasText: "Auto-split" }).click();
  await page.waitForTimeout(120);

  await page.evaluate(() => { window.omnicamNode.__majoorOmniCam.setFrame(20); });
  await page.locator('.oc-sequence-toolbar button', { hasText: "Split at playhead" }).click();
  await page.waitForTimeout(120);

  const cams = await page.evaluate(() =>
    window.omnicamNode.__majoorOmniCam.state.sequence.cuts.map((cut) => cut.camera_id));
  // The first shot was split; its new right half must differ from its left half.
  expect(cams.length).toBe(4);
  expect(cams[0]).not.toBe(cams[1]);
});

// Keyboard shortcuts are scoped by zone now. Ctrl+Z must reach OmniCam (not
// ComfyUI's graph undo), Delete in the sequence editor removes a shot, and the
// viewport-only keys must not fire from the sequence stage.
test("shortcuts are scoped to the panel that has focus", async ({ page }) => {
  await openEditTab(page);
  const stage = page.locator('[data-role="graph-sequence"]');
  await stage.evaluate((element) => element.focus());

  // A bare digit is a viewport select-mode key; it must do nothing here.
  const modeBefore = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.select_mode);
  await page.keyboard.press("Digit1");
  await page.waitForTimeout(60);
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.select_mode)).toBe(modeBefore);

  // Delete removes the shot under the playhead, not a keyframe.
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.setFrame(60));
  const shotsBefore = await page.locator(".oc-sequence-shot").count();
  await page.keyboard.press("Delete");
  await page.waitForTimeout(120);
  expect(await page.locator(".oc-sequence-shot").count()).toBe(shotsBefore - 1);

  // Ctrl+Z is consumed by OmniCam and brings the shot back.
  await page.keyboard.press("Control+z");
  await page.waitForTimeout(150);
  expect(await page.locator(".oc-sequence-shot").count()).toBe(shotsBefore);
});

test("the same key does different things in the viewport and the sequence editor", async ({ page }) => {
  await openEditTab(page, { withCuts: false });
  await page.locator('.oc-sequence-toolbar button', { hasText: "Auto-split" }).click();
  await page.waitForTimeout(120);

  // S in the sequence stage splits; S in the viewport starts a scale transform.
  await page.locator('[data-role="graph-sequence"]').evaluate((el) => el.focus());
  await page.evaluate(() => window.omnicamNode.__majoorOmniCam.setFrame(20));
  const before = await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.sequence.cuts.length);
  await page.keyboard.press("s");
  await page.waitForTimeout(120);
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.sequence.cuts.length)).toBe(before + 1);

  // A modal transform needs a selected object.
  await page.locator('[data-object-id="qa_cube"]').click({ position: { x: 30, y: 13 } });
  await page.locator(".viewport-wrap > canvas").focus();
  await page.keyboard.press("s");
  await page.waitForTimeout(80);
  expect(await page.evaluate(() => Boolean(window.omnicamNode.__majoorOmniCam.modalTransform))).toBeTruthy();
});
