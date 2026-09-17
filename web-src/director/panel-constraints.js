// Pure, DOM-independent constraint math for the Director's resizable panels.
// Extracted from panel-resize.js's per-drag clamp (Director modal audit
// Lot 4) so the "neighbor panels + central minimum" rule is unit-testable
// without a browser: the left and side columns compete for the same row in
// .oc-body (left | resize | stage | resize | side), and each was previously
// bounded only by its own static PANEL_LAYOUT max -- so on a narrow window,
// both columns near their max could squeeze the central stage to nothing
// even though neither individually exceeded its own limit.

// Below this, the viewport stops being usable for orbiting/picking; matches
// the .viewport-wrap min-height floor's spirit (styles.js) for the width axis.
export const MIN_CENTRAL_STAGE_WIDTH = 360;

/**
 * Effective max for one horizontal side column (left_width or side_width)
 * given the OTHER column's current width and the container's total width, so
 * growing one can never squeeze the central stage below MIN_CENTRAL_STAGE_WIDTH
 * -- even where the column's own static max would otherwise allow it.
 *
 * Returns `staticMax` unchanged when containerWidth is unknown/non-finite
 * (e.g. an unmounted/hidden root during a test), since there's nothing to
 * constrain against yet.
 */
export function maxSideColumnWidth({ containerWidth, otherColumnWidth = 0, resizeGutterWidth = 18, staticMax }) {
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) return staticMax;
  const available = containerWidth - otherColumnWidth - resizeGutterWidth - MIN_CENTRAL_STAGE_WIDTH;
  return Math.max(0, Math.min(staticMax, available));
}
