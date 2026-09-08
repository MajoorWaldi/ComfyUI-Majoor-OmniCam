import {
  cancelCameraPathDraw,
  startCameraPathDraw,
} from "../director/camera-path-draw.js";

export function bindCameraPathDraw(ui, signal) {
  for (const button of ui.root.querySelectorAll('[data-act="draw-camera-path"]')) {
    button.addEventListener("click", () => {
      if (ui.cameraPathDraw?.active) cancelCameraPathDraw(ui);
      else startCameraPathDraw(ui);
    }, { signal });
  }

  for (const button of ui.root.querySelectorAll('[data-act="draw-camera-path-extend"]')) {
    button.addEventListener("click", () => {
      if (ui.cameraPathDraw?.active) cancelCameraPathDraw(ui);
      else startCameraPathDraw(ui, { mode: "extend" });
    }, { signal });
  }

  ui.root.addEventListener("contextmenu", (event) => {
    const suppress = Date.now() <= Number(ui.cameraPathSuppressContextMenuUntil || 0);
    if (!suppress && !ui.cameraPathDraw?.active) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    ui.cameraPathSuppressContextMenuUntil = 0;
    if (ui.cameraPathDraw?.active) cancelCameraPathDraw(ui);
  }, { capture: true, signal });
}
