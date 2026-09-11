import { expect, test } from "@playwright/test";

// The semantic API is attached to the live Director and a committed transaction
// is a single undo step.
test("ui.directorApi.execute mutates canonical state and undoes in one step", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent === "ready", null, { timeout: 15000 });

  const result = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const before = ui.state.objects.find((o) => o.id === "qa_cube").enabled;
    const tx = ui.directorApi.execute({
      version: 1,
      id: "tx_spec_1",
      description: "Hide QA cube",
      operations: [{ type: "object.set_enabled", objectId: "qa_cube", value: false }],
    });
    const afterExec = ui.state.objects.find((o) => o.id === "qa_cube").enabled;
    ui.undo();
    const afterUndo = ui.state.objects.find((o) => o.id === "qa_cube").enabled;
    return { ok: tx.ok, applied: tx.applied, before, afterExec, afterUndo };
  });

  expect(result.ok).toBe(true);
  expect(result.applied).toBe(1);
  expect(result.before).toBe(true);
  expect(result.afterExec).toBe(false);
  expect(result.afterUndo).toBe(true);
});

test("a validateOnly transaction leaves the workflow JSON byte-identical", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(() => document.querySelector("#status")?.textContent === "ready", null, { timeout: 15000 });

  const result = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const widget = ui.node.widgets.find((w) => w.name === "state_json");
    const before = widget.value;
    const res = ui.directorApi.execute({
      version: 1,
      id: "tx_spec_dry",
      description: "dry run",
      validateOnly: true,
      operations: [{ type: "camera.look_at", point: [3, 3, 3] }],
    });
    return { ok: res.ok, validateOnly: res.validateOnly, changed: widget.value !== before };
  });

  expect(result.ok).toBe(true);
  expect(result.validateOnly).toBe(true);
  expect(result.changed).toBe(false);
});

// Regression: a committed camera.transform used to be overwritten by
// syncActiveCameraTrack() inside serializeEditorState(), because that helper
// copies the (stale) viewport ui.camera back onto the active track *after*
// the transaction had already written the fresh values into it.
test("camera.transform survives live Director serialization into state_json", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(
    () => document.querySelector("#status")?.textContent === "ready",
    null,
    { timeout: 15000 },
  );

  const result = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const cameraId = ui.state.active_camera_id;

    const tx = ui.directorApi.execute({
      version: 1,
      id: "tx_camera_serialize_regression",
      description: "Move active camera",
      operations: [{
        type: "camera.transform",
        cameraId,
        position: [7, 3, -2],
        target: [0, 1, 0],
      }],
    });

    const serialized = JSON.parse(
      ui.node.widgets.find((w) => w.name === "state_json").value,
    );
    const camera = serialized.cameras.find((item) => item.id === cameraId);

    return {
      tx,
      position: camera.camera.position,
      target: camera.camera.target,
    };
  });

  expect(result.tx.ok).toBe(true);
  expect(result.position).toEqual([7, 3, -2]);
  expect(result.target).toEqual([0, 1, 0]);
});

test("camera.transform at a frame survives live Director serialization", async ({ page }) => {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(
    () => document.querySelector("#status")?.textContent === "ready",
    null,
    { timeout: 15000 },
  );

  const result = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const cameraId = ui.state.active_camera_id;

    const tx = ui.directorApi.execute({
      version: 1,
      id: "tx_camera_serialize_frame_regression",
      description: "Move active camera at frame 0",
      operations: [{
        type: "camera.transform",
        cameraId,
        frame: 0,
        position: [2, 2, 2],
      }],
    });

    const serialized = JSON.parse(
      ui.node.widgets.find((w) => w.name === "state_json").value,
    );
    const camera = serialized.cameras.find((item) => item.id === cameraId);
    const key = camera.keyframes.find((k) => k.frame === 0);

    return { tx, position: key.camera.position };
  });

  expect(result.tx.ok).toBe(true);
  expect(result.position).toEqual([2, 2, 2]);
});
