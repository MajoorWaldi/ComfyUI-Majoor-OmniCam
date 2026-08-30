// Renders the per-channel dope-sheet rows underneath the master key track.
//
// The master track ([data-role="keys"]) stays exactly as it was -- it owns all
// the drag, retime and selection behaviour. These rows are a read-and-select
// overlay: clicking a diamond jumps to and selects that key.

import { dopeSheetRows } from "./dope-sheet.js";
import { timelinePercentForFrame } from "./timeline-interaction.js";
import { updatePlayhead } from "./timeline/playhead.js";
import { t } from "./i18n.js";

/**
 * The tinted rail that joins a channel's first key to its last.
 *
 * Without it the diamonds read as unrelated dots; with it a row reads as one
 * animated span, which is how the eye finds "this channel is live from 12 to
 * 96" at a glance.
 */
function appendRail(track, frames, percentFor) {
  if (frames.length < 2) return;
  const start = percentFor(frames[0]);
  const end = percentFor(frames[frames.length - 1]);
  const rail = document.createElement("span");
  rail.className = "oc-dope-rail";
  rail.style.left = `${Math.max(0, Math.min(start, end))}%`;
  rail.style.width = `${Math.max(0, Math.abs(end - start))}%`;
  track.appendChild(rail);
}

function appendDiamonds(ui, track, row, keys, percentFor) {
  for (const frame of row.frames) {
    const percent = percentFor(frame);
    if (percent < -5 || percent > 105) continue;
    const diamond = document.createElement("button");
    diamond.type = "button";
    diamond.className = `oc-dope-key${frame === ui.frame ? " at-playhead" : ""}`;
    diamond.style.left = `${percent}%`;
    diamond.dataset.frame = String(frame);
    diamond.title = t("{channel} changes at frame {frame}")
      .replace("{channel}", t(row.label))
      .replace("{frame}", String(frame));
    diamond.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const key = keys.find((item) => item.frame === frame);
      if (!key) return;
      if (event.shiftKey) {
        ui.selectedKeyFrames = new Set(ui.selectedKeyFrames || [ui.selectedKeyFrame].filter((item) => item !== null));
        ui.selectedKeyFrames.has(frame) ? ui.selectedKeyFrames.delete(frame) : ui.selectedKeyFrames.add(frame);
        ui.selectedKeyFrame = ui.selectedKeyFrames.has(frame) ? frame : [...ui.selectedKeyFrames].at(-1) ?? null;
        ui.setFrame(frame, false, false);
        ui.updateKeyVisualState();
        ui.refreshKeyEditor();
        return;
      }
      ui.selectKeyframe(key);
    });
    track.appendChild(diamond);
  }
}

/**
 * Everything that changes where a diamond sits. Class-only state (playhead,
 * selection) is deliberately excluded so scrubbing does not rebuild the rows.
 */
function geometrySignature(ui, rows) {
  return [
    ui.state.duration_frames,
    Number(ui.timelineZoom) || 1,
    Number(ui.timelinePan) || 0,
    ...rows.map((row) => `${row.id}:${row.frames.join(",")}`),
  ].join("\u0000");
}

export function renderDopeRows(ui) {
  const host = ui.root.querySelector('[data-role="dope-rows"]');
  if (!host) return;

  // The master "camera" channel is already drawn by refreshKeys(); showing it
  // again here would just be a second copy of the same row.
  const enabled = new Set(ui.dopeChannels || []);
  enabled.delete("camera");

  const keys = ui.timelineKeyframes() || [];
  const rows = dopeSheetRows(keys, enabled);
  const signature = geometrySignature(ui, rows);

  // refreshKeys() runs on every playback frame. Rebuilding the diamonds there
  // destroyed them between a pointerdown and its pointerup, so clicking one
  // during or just after playback did nothing.
  if (host.dataset.signature !== signature) {
    host.dataset.signature = signature;
    host.replaceChildren();
    const percentFor = (frame) => timelinePercentForFrame(ui, frame);
    for (const row of rows) {
      const track = document.createElement("div");
      track.className = "oc-dope-row";
      track.dataset.channel = row.id;
      track.style.setProperty("--channel-color", row.color);
      appendRail(track, row.frames, percentFor);
      appendDiamonds(ui, track, row, keys, percentFor);
      host.appendChild(track);
    }
  }

  for (const diamond of host.querySelectorAll(".oc-dope-key")) {
    diamond.classList.toggle("at-playhead", Number(diamond.dataset.frame) === ui.frame);
  }
  updatePlayhead(ui);
}
