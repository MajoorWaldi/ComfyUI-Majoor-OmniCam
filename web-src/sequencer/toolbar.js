/**
 * Toolbar DOM component for OmniCam Sequencer.
 */

import { SPEED_PRESETS, applySpeedPreset } from "./retime-provider.js";

export function createSequencerToolbar(ui) {
  const bar = document.createElement("div");
  bar.className = "top omnicam-sequencer-toolbar";

  function makeBtn(label, icon, onClick, title = "") {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = `${icon ? icon + " " : ""}${label}`;
    btn.title = title;
    btn.onclick = onClick;
    return btn;
  }

  bar.appendChild(makeBtn("Prev", '<i class="pi pi-step-backward"></i>', () => ui.movePlayhead(-1), "Previous frame"));
  const playBtn = makeBtn("Play", '<i class="pi pi-play"></i>', () => ui.startPlayback(), "Play Timeline");
  playBtn.dataset.seqAction = "play";
  bar.appendChild(playBtn);
  bar.appendChild(makeBtn("Stop", '<i class="pi pi-stop"></i>', () => ui.stopPlayback(), "Stop Timeline"));
  bar.appendChild(makeBtn("Next", '<i class="pi pi-step-forward"></i>', () => ui.movePlayhead(1), "Next frame"));

  // Split
  const splitBtn = makeBtn("Split", '<i class="pi pi-clone"></i>', () => ui.splitAtPlayhead(), "Split selected clip at current playhead position");
  splitBtn.dataset.seqAction = "split";
  bar.appendChild(splitBtn);
  bar.appendChild(makeBtn("Duplicate", '<i class="pi pi-copy"></i>', () => ui.duplicateSelected(), "Duplicate selected clip"));
  const disableBtn = makeBtn("Disable", '<i class="pi pi-eye-slash"></i>', () => ui.setSelectedEnabled(false), "Disable selected clip without disconnecting it");
  disableBtn.dataset.seqAction = "disable";
  bar.appendChild(disableBtn);
  bar.appendChild(makeBtn("Enable", '<i class="pi pi-eye"></i>', () => ui.setSelectedEnabled(true), "Enable selected clip"));
  bar.appendChild(makeBtn("Reset", '<i class="pi pi-refresh"></i>', () => ui.resetSelected(), "Reset selected clip state"));
  bar.appendChild(makeBtn("Mute", "M", () => ui.toggleSelectedAudio("mute"), "Mute selected audio clip"));
  bar.appendChild(makeBtn("Solo", "S", () => ui.toggleSelectedAudio("solo"), "Solo selected audio clip"));

  // Ripple Toggle
  const rippleBtn = makeBtn("Ripple: ON", '<i class="pi pi-forward"></i>', () => {
    ui.state.timeline.ripple = !ui.state.timeline.ripple;
    rippleBtn.innerHTML = `<i class="pi pi-forward"></i> Ripple: ${ui.state.timeline.ripple ? "ON" : "OFF"}`;
    rippleBtn.style.color = ui.state.timeline.ripple ? "#68d391" : "#a0aec0";
    ui.syncToWidgets();
  }, "Toggle Ripple Editing mode");
  rippleBtn.style.color = "#68d391";
  bar.appendChild(rippleBtn);

  // Divider
  const div = document.createElement("div");
  div.className = "toolbar-divider";
  bar.appendChild(div);

  // Retime Presets Selector
  const presetSelect = document.createElement("select");
  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.innerText = "⚡ Speed Preset...";
  presetSelect.appendChild(defaultOpt);

  for (const p of SPEED_PRESETS) {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.innerText = p.name;
    presetSelect.appendChild(opt);
  }

  presetSelect.onchange = () => {
    if (!presetSelect.value) return;
    ui.applySpeedPresetToSelected(presetSelect.value);
    presetSelect.value = "";
  };
  bar.appendChild(presetSelect);

  // Zoom buttons
  const zoomInBtn = makeBtn("", '<i class="pi pi-search-plus"></i>', () => ui.zoom(1.25), "Zoom in timeline");
  const zoomOutBtn = makeBtn("", '<i class="pi pi-search-minus"></i>', () => ui.zoom(0.8), "Zoom out timeline");
  bar.appendChild(zoomInBtn);
  bar.appendChild(zoomOutBtn);

  // Timecode / Frame display
  const timeDisplay = document.createElement("span");
  timeDisplay.className = "omnicam-seq-time-display";
  timeDisplay.innerText = "00:00:00:00 (Frame 0)";
  bar.appendChild(timeDisplay);
  ui.timeDisplay = timeDisplay;

  return bar;
}
