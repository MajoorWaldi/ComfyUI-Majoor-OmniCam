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

/**
 * Effective max for a vertical panel (the Outliner list, the Assets grid, the
 * Agent plan list) that lives inside a scrolling .oc-left-body, so dragging it
 * taller can never push its OWN resize handle (the last child in that
 * scrolling column) out of the visible, scrolled-to area. Found the hard way
 * (Director modal audit Lot 4 follow-up): once the handle scrolls out of
 * view, its laid-out position still overlaps whatever renders below .oc-left
 * (the dock), so a click "at" the handle's expected spot actually lands on
 * that instead -- looking like a broken/blank area, and making the panel
 * impossible to shrink back without scrolling first.
 *
 * `othersHeight` is the height every OTHER child in the scrolling column is
 * currently using (measure it as the sum of sibling offsetHeights, NOT
 * `container.scrollHeight - currentPanelHeight`: scrollHeight only reflects
 * actual content size when it OVERFLOWS the box -- when content fits, it is
 * defined to equal clientHeight regardless of how little of the box the
 * content actually uses, which silently made this always cap to the current
 * height with zero room to grow). Capping so the panel's own height never
 * exceeds containerClientHeight minus othersHeight keeps the whole column's
 * content within one visible, unscrolled screen.
 *
 * SAFETY_MARGIN_PX: measuring "othersHeight" as a sum of sibling offsetHeights
 * plus the container's row gap is an approximation -- integer-rounded
 * offsetHeight reads and gap math don't always add back up to exactly what
 * the browser's own layout produces, and it consistently erred slightly
 * optimistic (by ~15px) in testing. A fixed margin keeps the cap on the safe
 * (under-allocating) side rather than trying to model every rounding source.
 */
const SAFETY_MARGIN_PX = 24;

export function maxVerticalPanelHeight({ containerClientHeight, othersHeight, staticMax }) {
  if (!Number.isFinite(containerClientHeight) || containerClientHeight <= 0) return staticMax;
  const available = containerClientHeight - othersHeight - SAFETY_MARGIN_PX;
  return Math.max(0, Math.min(staticMax, available));
}
