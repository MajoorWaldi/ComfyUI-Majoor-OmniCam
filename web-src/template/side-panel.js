// Right-hand Inspector: a selection-driven shell. The five panes keep their
// data-tab-panel names (scene / motion / camera / display / health) so every
// binding and the markup contract are unchanged; what switched is that a scene
// selection routes the pane (see inspector/context.js) instead of a tab row.
//
// The head carries the contextual title plus compact buttons for the three
// secondary modes. Motion / Shot / Health keep `data-tab` alongside
// `data-inspector-mode` so the density system still shows/hides Health by the
// same selector.

import { t } from "../i18n.js";
import { outlinerPanel } from "./panels/outliner-panel.js";
import { motionPanel } from "./panels/motion-panel.js";
import { inspectorPanel } from "./panels/inspector-panel.js";
import { shotPanel } from "./panels/shot-panel.js";
import { healthPanel } from "./panels/health-panel.js";

export function sidePanelMarkup() {
  return `
    <div class="viewport-inspector oc-side" data-role="viewport-inspector">
      <div class="oc-inspector-head oc-side-tabs">
        <strong class="oc-inspector-title" data-role="inspector-title">${t("Inspector")}</strong>
        <span class="oc-panel-spacer"></span>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="motion" data-tab="motion" aria-pressed="false">${t("Motion")}</button>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="shot" data-tab="display" aria-pressed="false">${t("Shot")}</button>
        <button class="oc-mode-btn inspector-tab" data-inspector-mode="health" data-tab="health" data-density-min="animation" aria-pressed="false">${t("Health")}</button>
      </div>
      ${outlinerPanel()}
      ${motionPanel()}
      ${inspectorPanel()}
      ${shotPanel()}
      ${healthPanel()}
    </div>`;
}
