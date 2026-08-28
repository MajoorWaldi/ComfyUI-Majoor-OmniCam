import { expect, test } from "@playwright/test";

// The dope sheet, its ruler and the graph editor's two tabs. These assert the
// wiring, not the pixels: every control in the lower deck must actually do
// something, and the ruler / graph / lanes must agree on where a frame is.

const KEY_FRAMES = [0, 17, 34, 50, 66, 83, 100, 120];

async function mount(page) {
  await page.setViewportSize({ width: 1180, height: 1500 });
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent !== "loading", null, { timeout: 15000 });
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
