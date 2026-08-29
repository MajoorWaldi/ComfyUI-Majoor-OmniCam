// The dope sheet's frame ruler: labelled major ticks, unlabelled minor ticks,
// and the playhead head that sits above every channel row.
//
// The ruler used to live inside the master key lane, which forced that lane to
// be tall enough to hold both the numbers and the key chips. Pulling it out
// lets every channel row -- master included -- be the same thin row, which is
// what a dope sheet is supposed to look like.

import { clamp } from "../omnicam-core.js";
import { onTimelineWheel, timelineFrameFromEvent, timelinePercentForFrame } from "../timeline-interaction.js";

// Step sizes a human reads without counting. The ruler picks the smallest one
// that still leaves MIN_LABEL_GAP pixels between two labels.
const NICE_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000];
const MIN_LABEL_GAP = 46;
const MINOR_PER_MAJOR = 5;
const FALLBACK_WIDTH = 640;

/**
 * The frame interval between two labelled ticks at the current zoom.
 *
 * @param {number} visibleFrames frames currently spanned by the ruler
 * @param {number} pixelWidth ruler width in CSS pixels
 * @returns {number} a step from NICE_STEPS
 */
export function rulerStep(visibleFrames, pixelWidth) {
  // An unmeasured element reports 0, which is not "a very narrow ruler" but
  // "no answer yet"; treating it as 1px picked the coarsest possible step.
  const width = pixelWidth > 0 ? pixelWidth : FALLBACK_WIDTH;
  const maxLabels = Math.max(2, Math.floor(width / MIN_LABEL_GAP));
  const rawStep = Math.max(1e-6, visibleFrames / maxLabels);
  return NICE_STEPS.find((step) => step >= rawStep) ?? NICE_STEPS[NICE_STEPS.length - 1];
}

/**
 * Tick positions for the visible frame window.
 *
 * @returns {{frame:number, percent:number, major:boolean}[]}
 */
export function rulerTicks(ui, pixelWidth) {
  const lastFrame = Math.max(1, ui.state.duration_frames - 1);
  const zoom = clamp(Number(ui.timelineZoom) || 1.0, 0.1, 50.0);
  const pan = Number(ui.timelinePan) || 0;
  const visibleFrames = lastFrame / zoom;
  const major = rulerStep(visibleFrames, pixelWidth);
  // Minor ticks only subdivide when the subdivision is still a whole frame.
  const minor = major >= MINOR_PER_MAJOR ? major / MINOR_PER_MAJOR : 0;
  const step = minor || major;

  const ticks = [];
  const first = Math.max(0, Math.floor(pan / step) * step);
  for (let frame = first; frame <= lastFrame + 1e-6; frame += step) {
    const rounded = Math.round(frame);
    const percent = timelinePercentForFrame(ui, rounded);
    if (percent < -1) continue;
    if (percent > 101) break;
    ticks.push({ frame: rounded, percent, major: Math.abs(rounded % major) < 1e-6 });
  }

  // A ruler whose last number is 140 on a 143-frame shot reads as if the shot
  // ended early. Pin the end frame, dropping the tick before it when the two
  // labels would otherwise overlap.
  const endPercent = timelinePercentForFrame(ui, lastFrame);
  if (endPercent <= 101 && !ticks.some((tick) => tick.major && tick.frame === lastFrame)) {
    const gapPercent = (MIN_LABEL_GAP / Math.max(1, pixelWidth)) * 100;
    // Demote, do not remove: the tick mark still belongs on the ruler, only
    // its number would collide. Scanning from the end for the last *major*
    // matters -- the final entry is usually a minor tick, and a loop that only
    // inspected ticks[length - 1] never demoted anything.
    for (let index = ticks.length - 1; index >= 0; index -= 1) {
      if (!ticks[index].major) continue;
      if (endPercent - ticks[index].percent >= gapPercent) break;
      ticks[index].major = false;
    }
    ticks.push({ frame: lastFrame, percent: endPercent, major: true });
  }
  return ticks;
}

/**
 * The ruler's width in CSS pixels, never zero.
 *
 * refreshKeys() can run before the node has been laid out (and while a
 * collapsed node is measured as 0 wide). A zero width made rulerStep() pick
 * its coarsest step, so the live node came up showing a single label at the
 * end of the shot instead of a ruler.
 */
function rulerWidth(host) {
  return host.clientWidth || host.parentElement?.clientWidth || FALLBACK_WIDTH;
}

/** Rebuilds the ruler in place. Called from refreshKeys(). */
export function renderRuler(ui) {
  const host = ui.root.querySelector('[data-role="ruler"]');
  if (!host) return;
  host.replaceChildren();

  for (const tick of rulerTicks(ui, rulerWidth(host))) {
    const mark = document.createElement("span");
    mark.className = tick.major ? "oc-tick major" : "oc-tick";
    mark.style.left = `${tick.percent}%`;
    host.appendChild(mark);
    if (!tick.major) continue;
    const label = document.createElement("span");
    label.className = "timeline-tick";
    label.textContent = String(tick.frame);
    label.style.left = `${tick.percent}%`;
    host.appendChild(label);
  }

  const percent = timelinePercentForFrame(ui, ui.frame);
  if (percent >= -1 && percent <= 101) {
    const head = document.createElement("span");
    head.className = "oc-playhead-head";
    head.style.left = `${percent}%`;
    host.appendChild(head);
  }
}

/**
 * Dragging anywhere on the ruler scrubs, the way it does in every NLE.
 *
 * The visible range slider was removed when the ruler took over that job; the
 * one behind [data-role="scrub"] is kept off-screen so keyboard and assistive
 * users still have a real, focusable scrubber.
 */
export function bindRulerScrub(ui, signal) {
  const ruler = ui.root.querySelector('[data-role="ruler"]');
  if (!ruler) return;

  // The label step depends on how many pixels the ruler has, so a resized node
  // needs a redraw. Row positions are percentages and do not.
  let lastWidth = 0;
  const observer = new ResizeObserver((entries) => {
    const width = Math.round(entries[0]?.contentRect.width ?? 0);
    if (!width || width === lastWidth) return;
    lastWidth = width;
    renderRuler(ui);
  });
  observer.observe(ruler);
  signal?.addEventListener("abort", () => observer.disconnect(), { once: true });

  const seek = (event) => {
    const frame = timelineFrameFromEvent(ui, event, ruler);
    if (Number.isFinite(frame)) ui.setFrame(frame, false, false);
  };

  ruler.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    ruler.setPointerCapture(event.pointerId);
    ruler.dataset.scrubbing = "1";
    seek(event);
  }, { signal });
  ruler.addEventListener("pointermove", (event) => {
    if (ruler.dataset.scrubbing === "1") seek(event);
  }, { signal });
  const release = (event) => {
    if (ruler.dataset.scrubbing !== "1") return;
    delete ruler.dataset.scrubbing;
    if (ruler.hasPointerCapture?.(event.pointerId)) ruler.releasePointerCapture(event.pointerId);
  };
  ruler.addEventListener("pointerup", release, { signal });
  ruler.addEventListener("pointercancel", release, { signal });
  ruler.addEventListener("wheel", (event) => onTimelineWheel(ui, event), { passive: false, signal });
}
