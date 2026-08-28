// Bindings for the Director shell chrome introduced with the panelled layout:
// the Lens card's millimetre field, the Motion card's smoothing slider, the
// outliner filter, the dope-sheet channel toggles, and the two view toggles.

import { t } from "../omnicam-i18n.js";
import { focalLengthToFov, formatFocalLength } from "../lens.js";
import { captureBaseline, smoothKeyframes } from "../path-smoothing.js";
import { renderDopeRows } from "../dope-sheet-view.js";
import { exportCamera, importCameraFile, loadExchangeFormats, pickCameraFile } from "../camera-exchange.js";

function bindLensCard(ui, signal) {
  const focal = ui.root.querySelector('[data-role="camera-focal"]');
  const fov = ui.root.querySelector('[data-role="camera-fov"]');
  if (!focal || !fov) return;

  // The two fields are two readouts of one value. Each pushes to the camera and
  // lets the regular refresh cycle write the other one back.
  focal.addEventListener("input", () => {
    const next = focalLengthToFov(focal.value);
    fov.value = String(Math.round(next * 100) / 100);
    fov.dispatchEvent(new Event("input", { bubbles: true }));
  }, { signal });
  fov.addEventListener("input", () => {
    if (document.activeElement !== focal) focal.value = formatFocalLength(fov.value);
  }, { signal });
}

function bindPathSmoothing(ui, signal) {
  const slider = ui.root.querySelector('[data-role="path-smoothing"]');
  const readout = ui.root.querySelector('[data-role="path-smoothing-value"]');
  if (!slider) return;
  const show = () => {
    if (readout) readout.textContent = `${slider.value}%`;
  };

  // Smoothing always recomputes from an untouched baseline, so dragging back to
  // 0% restores exactly the keys the animator authored.
  const baselineFor = (camera) => {
    if (ui.smoothingBaseline?.cameraId !== camera.id) {
      ui.smoothingBaseline = { cameraId: camera.id, keys: captureBaseline(camera.keyframes) };
    }
    return ui.smoothingBaseline.keys;
  };

  slider.addEventListener("input", show, { signal });
  slider.addEventListener("change", () => {
    const camera = ui.activeCameraTrack();
    if (!camera) return;
    ui.checkpoint("Path smoothing");
    const amount = Number(slider.value) / 100;
    // state.keyframes is a live alias of the active camera's array, and
    // syncActiveCameraTrack() copies it back the other way. Replacing only one
    // side means the sync silently restores the unsmoothed keys.
    const smoothed = smoothKeyframes(baselineFor(camera), amount);
    camera.keyframes = smoothed;
    ui.state.keyframes = smoothed;
    ui.state.path_smoothing = amount;
    ui.syncActiveCameraTrack();
    ui.refreshKeys();
    ui.setFrame(ui.frame, false, false);
    ui.setStatus(amount > 0
      ? t("Path smoothing set to {percent}%").replace("{percent}", String(slider.value))
      : t("Path smoothing cleared"));
  }, { signal });
  show();
}

function bindOutlinerSearch(ui, signal) {
  const search = ui.root.querySelector('[data-role="outliner-search"]');
  if (!search) return;
  search.addEventListener("input", () => {
    ui.outlinerFilter = search.value.trim().toLowerCase();
    ui.refreshObjects();
  }, { signal });
}

function bindDopeChannels(ui, signal) {
  const boxes = [...ui.root.querySelectorAll("[data-dope-channel]")];
  if (!boxes.length) return;
  ui.dopeChannels = new Set(boxes.filter((box) => box.checked).map((box) => box.dataset.dopeChannel));
  for (const box of boxes) {
    box.addEventListener("change", () => {
      ui.dopeChannels = new Set(boxes.filter((item) => item.checked).map((item) => item.dataset.dopeChannel));
      renderDopeRows(ui);
    }, { signal });
  }
}

function bindViewToggles(ui, signal) {
  ui.root.querySelector('[data-act="toggle-fullscreen"]')?.addEventListener("click", () => {
    const expanded = ui.root.classList.toggle("oc-fullscreen");
    ui.node?.setDirtyCanvas?.(true, true);
    ui.scheduleResizeAndRender?.();
    ui.setStatus(expanded ? t("Viewport maximized") : t("Viewport restored"));
  }, { signal });

  ui.root.querySelector('[data-act="toggle-graph"]')?.addEventListener("click", (event) => {
    const graph = ui.root.querySelector(".curve-editor");
    if (!graph) return;
    graph.open = !graph.open;
    event.currentTarget.classList.toggle("active", graph.open);
    if (graph.open) ui.drawCurveEditor();
  }, { signal });
}

function bindCameraExchange(ui, signal) {
  loadExchangeFormats(ui);
  ui.root.querySelector('[data-act="import-camera"]')?.addEventListener("click", () => pickCameraFile(ui), { signal });
  ui.root.querySelector('[data-act="export-camera"]')?.addEventListener("click", () => exportCamera(ui), { signal });
  const input = ui.root.querySelector('[data-role="camera-file"]');
  input?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    await importCameraFile(ui, file);
  }, { signal });
}

export function bindDirectorChrome(ui, signal) {
  bindCameraExchange(ui, signal);
  bindLensCard(ui, signal);
  bindPathSmoothing(ui, signal);
  bindOutlinerSearch(ui, signal);
  bindDopeChannels(ui, signal);
  bindViewToggles(ui, signal);
}
