import { t } from "../i18n.js";

// Optional per-frame solve-health band, drawn above the dope sheet. Cells are
// filled by scene/solve-health-strip.js from the normalised
// metadata.solve_health_v1; with no metadata every cell reads neutral grey --
// never a fabricated green.
export function solveHealthStripMarkup() {
  return `
    <div class="oc-health-strip" data-role="solve-health-strip" data-density-min="animation">
      <span class="oc-health-strip-label">${t("Solve Health")}</span>
      <div class="oc-health-cells" data-role="solve-health-cells"
           role="group" aria-label="${t("Per-frame solve health")}"></div>
      <span class="oc-health-strip-readout" data-role="solve-health-readout" aria-live="polite"></span>
    </div>`;
}
