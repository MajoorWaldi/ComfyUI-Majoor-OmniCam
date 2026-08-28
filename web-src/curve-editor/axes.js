// Graph editor axes.
//
// Both axes used to divide their visible span into a fixed number of equal
// parts, which produced labels like 9 / 18 / 28 / 37 on X and 45.3 / 32.4 /
// 19.6 on Y -- readable only by counting. They now snap to round numbers, and
// the X axis borrows the dope sheet's step function so the graph's grid lines
// land on the same frames as the ruler directly above it.

import { rulerStep } from "../timeline/ruler.js";

const NICE_MANTISSAS = [1, 2, 2.5, 5, 10];

/**
 * A round value-axis interval: 1, 2, 2.5 or 5 times a power of ten.
 *
 * @param {number} span the value range the axis must cover
 * @param {number} targetLines roughly how many grid lines to aim for
 */
export function niceStep(span, targetLines = 5) {
  const raw = Math.abs(span) / Math.max(1, targetLines);
  if (!(raw > 0) || !Number.isFinite(raw)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const mantissa = raw / magnitude;
  return (NICE_MANTISSAS.find((candidate) => candidate >= mantissa) ?? 10) * magnitude;
}

function formatValue(value, step) {
  // Show exactly as many decimals as the step needs, so 0.25 reads "0.25"
  // and 20 reads "20" rather than "20.00".
  const decimals = Math.max(0, Math.min(4, Math.ceil(-Math.log10(step))));
  return value.toFixed(decimals);
}

/** Vertical grid lines on round frame numbers, plus the current frame. */
export function drawTimeAxis(ctx, { left, right, top, width, graphWidth, graphHeight, height, timeMin, timeMax, totalDuration, xFor, frame }) {
  const step = rulerStep(timeMax - timeMin, graphWidth);
  ctx.strokeStyle = "#222228";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#6e727a";
  ctx.textAlign = "center";
  for (let value = Math.ceil(timeMin / step) * step; value <= timeMax; value += step) {
    const rounded = Math.round(value);
    if (rounded < 0 || rounded > totalDuration) continue;
    const x = xFor(rounded);
    if (x < left || x > width - right) continue;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + graphHeight);
    ctx.stroke();
    ctx.fillText(String(rounded), x, height - 6);
  }

  // The playhead frame is labelled in the accent colour, the way the reference
  // marks "52": it is the number the animator is actually looking for.
  const x = xFor(frame);
  if (x >= left && x <= width - right) {
    ctx.fillStyle = "#a78bfa";
    ctx.fillText(String(frame), x, height - 6);
  }
  ctx.textAlign = "left";
}

/** Horizontal grid lines on round values. Returns nothing; draws in place. */
export function drawValueAxis(ctx, { left, right, top, width, graphHeight, minimum, maximum, yFor }) {
  const step = niceStep(maximum - minimum, 4);
  ctx.strokeStyle = "#222228";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#6e727a";
  for (let value = Math.ceil(minimum / step) * step; value <= maximum; value += step) {
    const y = yFor(value);
    if (y < top - 1 || y > top + graphHeight + 1) continue;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(width - right, y);
    ctx.stroke();
    ctx.fillText(formatValue(value, step), 4, y + 3);
  }
}
