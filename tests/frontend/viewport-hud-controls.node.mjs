import test from "node:test";
import assert from "node:assert/strict";
import { updateCameraHud, updateFloatingTransport, updateViewportControls } from "../../web-src/viewport/viewport-hud.js";
import { SENSOR_PRESETS, focalLengthToFov } from "../../web-src/lens.js";

function makeElement(tag = "div") {
  const classes = new Set();
  const children = [];
  return {
    tagName: tag.toUpperCase(),
    textContent: "",
    hidden: false,
    className: "",
    title: "",
    value: "",
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (classes.has(c)) classes.delete(c);
          else classes.add(c);
        } else if (force) classes.add(c);
        else classes.delete(c);
      },
      contains: (c) => classes.has(c),
    },
    closest: function() { return this; },
    querySelector: function(selector) {
      return this._map?.[selector] || null;
    },
    querySelectorAll: function(selector) {
      return this._map?.[selector] ? [this._map[selector]] : [];
    },
  };
}

test("updateCameraHud reflects camera optics and lock state", () => {
  const hud = makeElement("div");
  const lockBtn = makeElement("button");
  const lockIcon = makeElement("i");
  const nameEl = makeElement("span");
  const lensEl = makeElement("span");
  const fovEl = makeElement("span");
  const distEl = makeElement("span");
  const rollReset = makeElement("button");
  const rollVal = makeElement("span");

  hud._map = {
    '[data-role="hud-cam-name"]': nameEl,
    '[data-role="cam-lock-icon"]': lockIcon,
    '[data-act="toggle-camera-lock"]': lockBtn,
    '[data-role="hud-cam-lens"]': lensEl,
    '[data-role="hud-cam-fov"]': fovEl,
    '[data-role="hud-cam-dist"]': distEl,
    '[data-role="hud-roll-reset"]': rollReset,
    '[data-role="hud-roll-val"]': rollVal,
  };

  const root = {
    querySelector(selector) {
      if (selector === '[data-role="camera-hud"]') return hud;
      return null;
    },
  };

  const ui = {
    root,
    state: {
      view_mode: "camera",
      camera_lock: false,
    },
    camera: {
      position: [0, 2, 5],
      target: [0, 1, 0],
      fov: 37.8,
      roll: 2.5,
    },
    viewportCamera() { return this.camera; },
    activeCameraTrack() { return { name: "Hero Camera" }; },
  };

  updateCameraHud(ui);

  assert.equal(hud.hidden, false);
  assert.equal(nameEl.textContent, "Hero Camera");
  assert.equal(lensEl.textContent, "35.0mm");
  assert.equal(fovEl.textContent, "37.8°");
  assert.match(distEl.textContent, /Tgt: 5\.10m/);
  assert.equal(rollReset.hidden, false);
  assert.equal(rollVal.textContent, "+2.5°");

  // Lock camera
  ui.state.camera_lock = true;
  updateCameraHud(ui);
  assert.equal(lockIcon.className, "pi pi-lock");
});

test("updateViewportControls updates W/L space badge and snap button", () => {
  const spaceBadge = makeElement("span");
  const snapBtn = makeElement("button");
  const gridBtn = makeElement("button");
  const shadingSelect = makeElement("select");

  const root = {
    querySelector(selector) {
      if (selector === '[data-role="gizmo-space-badge"]') return spaceBadge;
      if (selector === '[data-role="spatial-snap-toggle"]') return snapBtn;
      if (selector === '[data-role="overlay-grid-btn"]') return gridBtn;
      if (selector === '[data-role="shading-mode-select"]') return shadingSelect;
      return null;
    },
  };

  const ui = {
    root,
    state: {
      gizmo_space: "local",
      spatial_snap_mode: "grid",
      show_grid: true,
      render_mode: "beauty",
    },
  };

  updateViewportControls(ui);

  assert.equal(spaceBadge.textContent, "L");
  assert.equal(snapBtn.classList.contains("active"), true);
  assert.equal(gridBtn.classList.contains("active"), true);
  assert.equal(shadingSelect.value, "beauty");
});

test("SENSOR_PRESETS calculate accurate field of view", () => {
  assert.ok(SENSOR_PRESETS.full_frame);
  assert.ok(SENSOR_PRESETS.super_35);
  const fovFullFrame = focalLengthToFov(50, SENSOR_PRESETS.full_frame.height);
  const fovSuper35 = focalLengthToFov(50, SENSOR_PRESETS.super_35.height);
  assert.ok(fovFullFrame > fovSuper35);
});

test("updateViewportControls updates overlay-cull-btn active state and title", () => {
  const cullBtn = makeElement("button");
  const root = {
    querySelector(selector) {
      if (selector === '[data-role="overlay-cull-btn"]') return cullBtn;
      return null;
    },
  };
  const ui = { root, state: { backface_culling: false } };
  updateViewportControls(ui);
  assert.equal(cullBtn.classList.contains("active"), false);
  assert.match(cullBtn.title, /Off/i);

  ui.state.backface_culling = true;
  updateViewportControls(ui);
  assert.equal(cullBtn.classList.contains("active"), true);
  assert.match(cullBtn.title, /On/i);
});
