// DOM event listeners, split by UI responsibility.

import { bindEditorAndGlobal } from "./event-bindings/editor-global.js";
import { bindTransportAndMedia } from "./event-bindings/transport-media.js";
import { bindDirectorChrome } from "./event-bindings/director-chrome.js";
import { bindViewportSettings } from "./event-bindings/viewport-settings.js";
import { bindMotionTrackEvents } from "./motion-tracks/interactions.js";

export function syncMirroredControl(root, role, source, property = "value") {
  for (const control of root.querySelectorAll(`[data-role="${role}"]`)) {
    if (control !== source) control[property] = source[property];
  }
}

export function bind(ui) {
  ui.abortController = new AbortController();
  const signal = ui.abortController.signal;
  const q = (selector) => ui.root.querySelector(selector);
  bindMotionTrackEvents(ui, signal);
  bindTransportAndMedia(ui, q, signal);
  bindViewportSettings(ui, q, signal);
  bindEditorAndGlobal(ui, q, signal);
  bindDirectorChrome(ui, signal);
}
