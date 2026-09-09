// Dirty-domain bitmask shared by the render scheduler (director/methods/render.js)
// and the semantic Director API (director-api/). A high-frequency operation
// marks only the domains it actually changed; requestUiUpdate() then repaints
// just those on the next animation frame.

export const UI_DIRTY = Object.freeze({
  viewport: 1 << 0,
  previews: 1 << 1,
  timeline: 1 << 2,
  inspector: 1 << 3,
  outliner: 1 << 4,
  motion: 1 << 5,
  status: 1 << 6,
  all: (1 << 7) - 1,
});

export function mergeDirty(current = 0, next = 0) {
  return (current | next) >>> 0;
}

export function hasDirty(mask, flag) {
  return (mask & flag) !== 0;
}
