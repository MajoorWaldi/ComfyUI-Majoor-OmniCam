// Shared state-to-DOM rendering for the Extractor's Director-style transport.

import { qualityDetails } from "./quality-timeline.js";
import { timecode } from "./source-viewer.js";
import { renderRows, warningRows } from "./views.js";

export function renderFrameReadouts(ui) {
  const frameInput = ui.$("frame");
  if (frameInput) frameInput.value = String(ui.state.frame);
  const time = ui.$("time");
  if (time) time.textContent = timecode(ui.state.frame, ui.sourceViewer.fps);
  const readout = ui.$("frame-readout");
  if (readout) {
    readout.textContent = `${ui.state.frame} / ${Math.max(0, ui.state.frameCount - 1)}`
      + ` · ${timecode(ui.state.frame, ui.sourceViewer.fps)}`;
  }
  const rows = qualityDetails(ui.state.quality, ui.state.frame);
  renderRows(ui.$("quality-details"), [...rows, ...warningRows(ui.state.warnings)], "No solve yet");
}

export function renderExtractorRuler(ui) {
  const ruler = ui.$("extractor-ruler");
  const playhead = ui.$("extractor-playhead");
  const total = Math.max(1, ui.state.frameCount);
  if (!ruler || !playhead) return;
  const ticks = Math.min(12, total - 1 || 1);
  ruler.replaceChildren();
  for (let index = 0; index <= ticks; index += 1) {
    const frame = Math.round((index / ticks) * (total - 1));
    const left = `${(index / ticks) * 100}%`;
    const tick = ruler.ownerDocument.createElement("i");
    tick.className = `oc-tick${index % 2 === 0 ? " major" : ""}`;
    tick.style.left = left;
    ruler.append(tick);
    if (index % 2 === 0) {
      const label = ruler.ownerDocument.createElement("span");
      label.className = "timeline-tick";
      label.style.left = left;
      label.textContent = String(frame);
      ruler.append(label);
    }
  }
  playhead.style.left = `${(Math.max(0, Math.min(total - 1, ui.state.frame)) / Math.max(1, total - 1)) * 100}%`;
}
