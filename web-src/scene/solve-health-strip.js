// Renders the per-frame solve-health band above the dope sheet.
//
// Cells are reused when the frame count is unchanged, so a scrub only rewrites
// classes. One delegated pointer handler seeks the timeline; one delegated
// hover handler drives a single shared readout -- no per-cell tooltip widget.

import { normalizeSolveHealth } from "./solve-health.js";

let bound = new WeakSet();

function readoutText(entry) {
  if (!entry) return "";
  const score = entry.score === null || entry.score === undefined
    ? ""
    : ` · ${Math.round(entry.score * 100)}%`;
  return `F${entry.frame} · ${entry.state}${score}`;
}

export function renderSolveHealthStrip(ui) {
  const strip = ui.root?.querySelector?.('[data-role="solve-health-strip"]');
  const host = ui.root?.querySelector?.('[data-role="solve-health-cells"]');
  if (!strip || !host) return;

  const frames = normalizeSolveHealth(ui.state?.metadata, ui.state?.duration_frames);
  const hasSignal = frames.some((entry) => entry.state !== "unknown");
  strip.classList.toggle("oc-health-strip-empty", !hasSignal);

  if (host.childElementCount !== frames.length) {
    host.replaceChildren(...frames.map(() => {
      const cell = document.createElement("span");
      cell.className = "oc-health-cell";
      return cell;
    }));
  }
  const cells = host.children;
  for (let i = 0; i < frames.length; i += 1) {
    const cell = cells[i];
    const entry = frames[i];
    cell.dataset.frame = String(entry.frame);
    cell.dataset.state = entry.state;
    cell.dataset.score = entry.score === null ? "" : String(entry.score);
    cell.classList.toggle("at-playhead", entry.frame === ui.frame);
  }

  if (bound.has(host)) return;
  bound.add(host);

  host.addEventListener("pointerdown", (event) => {
    const cell = event.target.closest?.(".oc-health-cell");
    if (!cell) return;
    const frame = Number(cell.dataset.frame);
    if (Number.isInteger(frame)) ui.setFrame(frame);
  });

  const readout = ui.root.querySelector('[data-role="solve-health-readout"]');
  host.addEventListener("pointermove", (event) => {
    const cell = event.target.closest?.(".oc-health-cell");
    if (!readout) return;
    if (!cell) { readout.textContent = ""; return; }
    readout.textContent = readoutText({
      frame: Number(cell.dataset.frame),
      state: cell.dataset.state,
      score: cell.dataset.score === "" ? null : Number(cell.dataset.score),
    });
  });
  host.addEventListener("pointerleave", () => { if (readout) readout.textContent = ""; });
}

// Test-only: drop the delegated-binding memo so a fresh mount re-binds.
export function _resetSolveHealthStripBindings() {
  bound = new WeakSet();
}
