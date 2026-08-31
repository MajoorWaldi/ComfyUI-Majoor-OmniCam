export const QUICK_VIEW_MODES = Object.freeze(["camera", "perspective", "front", "right", "top", "iso"]);

const AXIS_VIEWS = Object.freeze({
  x: ["right", "left"],
  y: ["top", "bottom"],
  z: ["front", "back"],
});

export function axisViewFor(axis, currentMode) {
  const views = AXIS_VIEWS[axis];
  if (!views) return null;
  return currentMode === views[0] ? views[1] : views[0];
}
