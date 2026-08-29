// The multi-camera edit, shown in its own stage of the lower deck next to the
// Graph Editor and the Dope Sheet.
//
// Model: every camera is animated on one shared timeline, and the edit
// partitions it into shots (see director/sequence.js). A shot stores only its
// start; its end is the next shot's start. Trimming moves one boundary, which
// can never open a gap or an overlap.
//
// Two tracks, aligned to the same frame ruler as the main timeline:
//   - shots: one block per cut, coloured by its camera;
//   - audio: the project waveform, for cutting to the beat. It is the global
//     track, not per-shot, so it is shown but not edited here.

import { t } from "./omnicam-i18n.js";
import {
  autoSequenceCuts, removeCut, sequenceCuts, splitCutAtFrame, trimCutStart,
} from "./director/sequence.js";
import { timelineFrameFromEvent, timelinePercentForFrame } from "./timeline-interaction.js";

const CAMERA_COLORS = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"];

function cameraOf(ui, cameraId) {
  const index = ui.state.cameras.findIndex((camera) => camera.id === cameraId);
  const camera = index >= 0 ? ui.state.cameras[index] : null;
  return { camera, color: camera?.color || CAMERA_COLORS[Math.max(0, index) % CAMERA_COLORS.length] };
}

// Serialize + repaint after a mutation. Callers take the undo checkpoint
// *before* they mutate, so an undo lands on the pre-edit state.
function commit(ui) {
  ui.scheduleSerialize();
  ui.refreshKeys();
  ui.refreshCameraSelectors();
  ui.render();
}

/** Re-place blocks and playhead from the current cuts without rebuilding them. */
function layoutTrack(ui, track) {
  const cuts = sequenceCuts(ui.state);
  for (const block of track.querySelectorAll(".oc-sequence-shot")) {
    const cut = cuts[Number(block.dataset.cutIndex)];
    if (!cut) continue;
    const left = timelinePercentForFrame(ui, cut.start);
    const right = timelinePercentForFrame(ui, cut.end + 1);
    block.style.left = `${left}%`;
    block.style.width = `${Math.max(0.4, right - left)}%`;
  }
  const playhead = track.querySelector(".oc-sequence-playhead");
  if (playhead) playhead.style.left = `${timelinePercentForFrame(ui, ui.frame)}%`;
}

function autoSplit(ui) {
  ui.checkpoint("Auto-split shots");
  ui.state.sequence = {
    ...(ui.state.sequence || { recording_path: "" }),
    enabled: true,
    cuts: autoSequenceCuts(ui.state),
  };
  commit(ui);
  ui.setStatus(t("Split into {count} shots").replace("{count}", String(ui.state.sequence.cuts.length)));
}

function toolButton(text, title, onClick, { disabled = false } = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "curve-mode";
  button.title = title;
  button.textContent = text;
  button.disabled = disabled;
  button.addEventListener("click", onClick);
  return button;
}

function toolbar(ui, cuts) {
  const bar = document.createElement("div");
  bar.className = "oc-sequence-toolbar";
  const oneCamera = ui.state.cameras.length < 2;

  bar.appendChild(toolButton(
    t("Auto-split shots"), t("Split the timeline evenly across every camera"),
    () => autoSplit(ui), { disabled: oneCamera },
  ));

  if (cuts.length) {
    bar.appendChild(toolButton(
      t("Split at playhead"), t("Cut the current shot in two at the playhead"),
      () => {
        // null camera -> the next one, so the split is visible immediately.
        ui.checkpoint("Split shot");
        if (splitCutAtFrame(ui.state, ui.frame, null)) commit(ui);
        else ui.setStatus(t("Move the playhead inside a shot first"));
      },
      { disabled: oneCamera },
    ));
    bar.appendChild(toolButton(
      t("Clear edit"), t("Remove every shot and stop cutting the timeline"),
      () => {
        ui.checkpoint("Clear edit");
        ui.state.sequence = { ...ui.state.sequence, enabled: false, cuts: [] };
        commit(ui);
        ui.setStatus(t("Multi-camera edit cleared"));
      },
    ));
  }

  bar.appendChild(toolButton(
    ui.audioWaveformPeaks?.length ? t("Replace audio") : t("Load audio"),
    t("Load an audio track to cut against"),
    () => ui.root.querySelector('[data-role="audio-file"]')?.click(),
  ));

  if (cuts.length) {
    const summary = document.createElement("span");
    summary.className = "oc-sequence-summary";
    summary.textContent = t("{count} shots · drag a divider to trim · right-click a shot for its camera")
      .replace("{count}", String(cuts.length));
    bar.appendChild(summary);
  }
  return bar;
}

/** Start a boundary drag with pointer capture, so it cannot leak past release. */
function beginTrim(ui, event, handle, track, resolvedIndex) {
  event.preventDefault();
  event.stopPropagation();
  // Pointer capture routes every follow-up event to the handle, bypassing
  // LiteGraph's canvas drag and any other listener, and guarantees a
  // lostpointercapture even when the button is released off-window. The old
  // window-level listeners could survive a lost pointerup and then retimed the
  // cut on every mouse move anywhere on the page.
  try { handle.setPointerCapture(event.pointerId); } catch { /* older engines */ }
  ui.checkpoint("Trim cut");
  ui.sequenceDrag = true;

  const move = (moveEvent) => {
    if (!(moveEvent.buttons & 1)) return finish();
    if (trimCutStart(ui.state, resolvedIndex, timelineFrameFromEvent(ui, moveEvent, track))) {
      layoutTrack(ui, track);
    }
  };
  const finish = () => {
    handle.removeEventListener("pointermove", move);
    handle.removeEventListener("pointerup", finish);
    handle.removeEventListener("pointercancel", finish);
    handle.removeEventListener("lostpointercapture", finish);
    try { handle.releasePointerCapture(event.pointerId); } catch { /* already released */ }
    if (!ui.sequenceDrag) return;
    ui.sequenceDrag = false;
    ui.scheduleSerialize();
    ui.refreshKeys();
    ui.refreshCameraSelectors();
    ui.render();
    ui.setStatus(t("Cut trimmed"));
  };
  handle.addEventListener("pointermove", move);
  handle.addEventListener("pointerup", finish);
  handle.addEventListener("pointercancel", finish);
  handle.addEventListener("lostpointercapture", finish);
}

function shotContextMenu(ui, event, cut, resolvedIndex, cutCount) {
  event.preventDefault();
  event.stopPropagation();
  const { camera } = cameraOf(ui, cut.camera_id);
  ui.contextMenu?.show(event, camera?.name || t("Shot"), [
    ...ui.state.cameras.map((option) => ({
      label: t("Use {name}").replace("{name}", option.name),
      icon: "pi-video",
      disabled: option.id === cut.camera_id,
      run: () => {
        ui.checkpoint("Change shot camera");
        ui.state.sequence.cuts[resolvedIndex].camera_id = option.id;
        commit(ui);
      },
    })),
    null,
    {
      label: t("Split at playhead"),
      icon: "pi-arrows-h",
      disabled: ui.frame <= cut.start || ui.frame > cut.end,
      run: () => {
        ui.checkpoint("Split shot");
        if (splitCutAtFrame(ui.state, ui.frame, null)) commit(ui);
      },
    },
    {
      label: t("Remove shot"),
      icon: "pi-trash",
      danger: true,
      disabled: cutCount === 1,
      run: () => {
        ui.checkpoint("Remove shot");
        if (removeCut(ui.state, resolvedIndex)) commit(ui);
      },
    },
  ]);
}

function shotBlock(ui, cut, index, track) {
  const { camera, color } = cameraOf(ui, cut.camera_id);
  const block = document.createElement("div");
  block.className = "oc-sequence-shot";
  block.dataset.cutIndex = String(index);
  block.style.left = `${timelinePercentForFrame(ui, cut.start)}%`;
  block.style.width = `${Math.max(0.4, timelinePercentForFrame(ui, cut.end + 1) - timelinePercentForFrame(ui, cut.start))}%`;
  block.style.setProperty("--shot-color", color);
  if (!camera?.recording_path) block.classList.add("no-proxy");
  block.title = t("{name} · F{start}-{end}")
    .replace("{name}", camera?.name || cut.camera_id)
    .replace("{start}", String(cut.start))
    .replace("{end}", String(cut.end));

  const name = document.createElement("span");
  name.className = "oc-sequence-name";
  name.textContent = camera?.name || cut.camera_id;
  block.appendChild(name);

  // Every shot but the first owns the divider that opens it.
  if (index > 0) {
    const handle = document.createElement("span");
    handle.className = "oc-sequence-handle";
    handle.title = t("Drag to trim the cut");
    handle.addEventListener("pointerdown", (event) => beginTrim(ui, event, handle, track, index));
    block.appendChild(handle);
  }

  block.addEventListener("contextmenu", (event) => shotContextMenu(ui, event, cut, index, track.__cutCount));
  // Clicking a shot puts keyboard focus on the sequence stage, so Delete / S
  // act on the edit and not on whatever was focused before.
  block.addEventListener("pointerdown", () => {
    ui.root.querySelector('[data-role="graph-sequence"]')?.focus?.({ preventScroll: true });
  });
  return block;
}

function audioTrack(ui) {
  const wrap = document.createElement("div");
  wrap.className = "oc-sequence-audio";
  const peaks = ui.audioWaveformPeaks;
  if (!peaks?.length) {
    const hint = document.createElement("span");
    hint.className = "oc-sequence-empty oc-sequence-audio-empty";
    hint.textContent = t("No audio track. Load one to cut to the beat.");
    wrap.appendChild(hint);
    return wrap;
  }
  const canvas = document.createElement("canvas");
  canvas.className = "oc-sequence-waveform";
  wrap.appendChild(canvas);
  // Sized on the next frame, once the flex layout has given the wrap a width.
  requestAnimationFrame(() => {
    const width = Math.max(1, Math.round(wrap.clientWidth));
    const height = Math.max(1, Math.round(wrap.clientHeight));
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const lastFrame = Math.max(1, ui.state.duration_frames - 1);
    const zoom = Math.min(50, Math.max(0.1, Number(ui.timelineZoom) || 1));
    const pan = Number(ui.timelinePan) || 0;
    const span = lastFrame / zoom;
    ctx.fillStyle = "#f2d06b";
    for (let i = 0; i < peaks.length; i++) {
      const frame = (i / (peaks.length - 1)) * lastFrame;
      const x = ((frame - pan) / Math.max(1e-6, span)) * width;
      if (x < -4 || x > width + 4) continue;
      const barH = peaks[i] * height * 0.9;
      ctx.fillRect(x, (height - barH) / 2, Math.max(1, (width / peaks.length) * zoom - 0.5), barH);
    }
  });
  return wrap;
}

/** Build the edit stage into `host`. Called only while the Sequence tab shows. */
export function renderSequenceLane(ui, host) {
  if (!host) return;
  const existingTrack = host.querySelector('[data-role="sequence-track"]');
  // A trim in progress owns the DOM: rebuilding would drop the handle the
  // pointer capture is bound to.
  if (ui.sequenceDrag && existingTrack) {
    layoutTrack(ui, existingTrack);
    return;
  }

  const cuts = sequenceCuts(ui.state);
  host.replaceChildren(toolbar(ui, cuts));

  const trackWrap = document.createElement("div");
  trackWrap.className = "oc-sequence-tracks";
  trackWrap.dataset.role = "sequence-track";
  trackWrap.__cutCount = cuts.length;

  const shotLane = document.createElement("div");
  shotLane.className = "oc-sequence-lane";
  shotLane.dataset.role = "sequence-lane";
  shotLane.setAttribute("aria-label", t("Multi-camera edit"));

  if (!cuts.length) {
    const empty = document.createElement("span");
    empty.className = "oc-sequence-empty";
    empty.textContent = ui.state.cameras.length > 1
      ? t("No shots yet. Auto-split hands each camera a slice of the timeline.")
      : t("Add a second camera, then Auto-split to cut between them.");
    shotLane.appendChild(empty);
  } else {
    for (const [index, cut] of cuts.entries()) {
      const left = timelinePercentForFrame(ui, cut.start);
      const right = timelinePercentForFrame(ui, cut.end + 1);
      if (right < -5 || left > 105) continue;
      shotLane.appendChild(shotBlock(ui, cut, index, trackWrap));
    }
  }
  trackWrap.appendChild(shotLane);
  trackWrap.appendChild(audioTrack(ui));

  const playhead = document.createElement("span");
  playhead.className = "oc-sequence-playhead";
  playhead.style.left = `${timelinePercentForFrame(ui, ui.frame)}%`;
  trackWrap.appendChild(playhead);

  host.appendChild(trackWrap);
}
