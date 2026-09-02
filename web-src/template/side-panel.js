// Right-hand side panel: shell + tabs only. Each workspace lives in its own
// file under template/panels/.
//
// Tab buttons keep both `.inspector-tab` and `data-tab`, and panels keep both
// `.inspector-tab-content` and `data-tab-panel`, because
// event-bindings/viewport-settings.js switches them with the selector
// ".inspector-tab, [data-tab]".

import { t } from "../i18n.js";
import { outlinerPanel } from "./panels/outliner-panel.js";
import { motionPanel } from "./panels/motion-panel.js";
import { inspectorPanel } from "./panels/inspector-panel.js";
import { shotPanel } from "./panels/shot-panel.js";
import { healthPanel } from "./panels/health-panel.js";

export function sidePanelMarkup() {
  return `
    <div class="viewport-inspector oc-side" data-role="viewport-inspector">
      <div class="inspector-tabs oc-side-tabs">
        <button class="inspector-tab active" data-tab="scene">${t("Outliner")}</button>
        <button class="inspector-tab" data-tab="motion">${t("Motion")}</button>
        <button class="inspector-tab" data-tab="camera">${t("Inspector")}</button>
        <button class="inspector-tab" data-tab="display">${t("Shot")}</button>
        <button class="inspector-tab" data-tab="health" data-density-min="animation">${t("Health")}</button>
      </div>
      ${outlinerPanel()}
      ${motionPanel()}
      ${inspectorPanel()}
      ${shotPanel()}
      ${healthPanel()}
    </div>`;
}
