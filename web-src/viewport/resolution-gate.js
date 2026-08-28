// The resolution gate: the letterbox mask showing which part of the view will
// actually be rendered.
//
// This lived twice, and the two copies disagreed. The camera preview tiles
// honoured the Resolution Gate checkbox and fell back to the shot's own
// width/height; the main viewport ignored the checkbox entirely and drew a
// gate only for an explicitly chosen ratio. So the control appeared wired but
// did nothing in the one place the user is actually framing the shot, and a
// non-16:9 output was never indicated at all.

const NAMED_RATIOS = { "16:9": 16 / 9, "4:3": 4 / 3, "1:1": 1, "9:16": 9 / 16, "2.39:1": 2.39 };

/**
 * The aspect the render will have, or null when nothing should be masked.
 *
 * "auto" is not "no gate": it means "whatever the node is set to output", so
 * it resolves to state.width / state.height. That only draws anything when the
 * output shape differs from the viewport's, which is exactly when it matters.
 */
export function gateAspect(state) {
  if (!state) return null;
  const named = NAMED_RATIOS[state.aspect_ratio];
  if (named) return named;
  if (!state.resolution_gate) return null;
  const width = Number(state.width) || 0;
  const height = Number(state.height) || 0;
  return width > 0 && height > 0 ? width / height : null;
}

/**
 * Draws the mask, and the render-area outline when the gate is switched on.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {object} state the editor state
 * @param {number} width canvas width in pixels
 * @param {number} height canvas height in pixels
 */
export function drawResolutionGate(context, state, width, height) {
  const target = gateAspect(state);
  if (!target || !(width > 0) || !(height > 0)) return;
  const current = width / height;
  if (Math.abs(current - target) < 1e-3) return;

  const outline = Boolean(state.resolution_gate);
  context.save();
  context.fillStyle = "#000000b3";
  if (current > target) {
    const visible = height * target;
    const bar = (width - visible) / 2;
    context.fillRect(0, 0, bar, height);
    context.fillRect(width - bar, 0, bar, height);
    if (outline) {
      context.strokeStyle = "#ffffff88";
      context.strokeRect(bar, 0, visible, height);
    }
  } else {
    const visible = width / target;
    const bar = (height - visible) / 2;
    context.fillRect(0, 0, width, bar);
    context.fillRect(0, height - bar, width, bar);
    if (outline) {
      context.strokeStyle = "#ffffff88";
      context.strokeRect(0, bar, width, visible);
    }
  }
  context.restore();
}
