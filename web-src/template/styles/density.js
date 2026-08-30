// Interface density (Basic / Animation / Advanced): progressive disclosure of
// chrome, not three different layouts. `setDensity()` only ever stamps
// `data-density` on the root; every element that should disappear below a
// tier just declares the tier it needs via `data-density-min`, and these two
// rules do the hiding. No JS toggling, so nothing here can drift out of sync
// with the DOM the way a manual show/hide pass could.
//
// Tier order is basic < animation < advanced: an element tagged "animation"
// needs at least the Animation tier, so it is hidden only in Basic; one
// tagged "advanced" needs the top tier, so it is hidden in both of the others.
export const DENSITY_STYLES = `
      .majoor-omnicam .menu-section{display:flex;flex-direction:column;gap:5px}
      .majoor-omnicam[data-density="basic"] [data-density-min="animation"],
      .majoor-omnicam[data-density="basic"] [data-density-min="advanced"],
      .majoor-omnicam[data-density="animation"] [data-density-min="advanced"]{display:none !important}
`;
