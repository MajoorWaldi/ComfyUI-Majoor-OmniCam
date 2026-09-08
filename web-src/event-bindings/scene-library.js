// Scene toolbar menu: New / Open / Save / Reset. The work lives in
// director/scene-library.js; this only wires the four buttons.

import { newScene, openSceneDialog, resetScene, saveScene } from "../director/scene-library.js";

function wire(ui, signal, buttons, run) {
  for (const button of buttons) {
    button.addEventListener("click", () => {
      ui.closeMenus?.();
      Promise.resolve(run()).catch((error) => {
        console.error("[OmniCam] scene action failed", error);
        ui.setStatus?.(String(error?.message || error).slice(0, 160));
      });
    }, { signal });
  }
}

export function bindSceneLibrary(ui, signal) {
  wire(ui, signal, ui.root.querySelectorAll('[data-act="scene-new"]'), () => newScene(ui));
  wire(ui, signal, ui.root.querySelectorAll('[data-act="scene-open"]'), () => openSceneDialog(ui));
  wire(ui, signal, ui.root.querySelectorAll('[data-act="scene-save"]'), () => saveScene(ui));
  wire(ui, signal, ui.root.querySelectorAll('[data-act="scene-reset"]'), () => resetScene(ui));
}
