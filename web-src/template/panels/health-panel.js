// Camera Health. The body is rendered by motion-health/panel.js rather than
// declared here: its rows depend on the limit tables fetched from the server,
// so there is no honest static markup for them.

import { t } from "../../i18n.js";

export function healthPanel() {
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="health" data-density-min="animation" hidden>
      <div class="oc-card oc-health">
        <div class="oc-card-title"><i class="pi pi-heart"></i> ${t("Camera Health")}
          <span class="oc-health-badge" data-role="health-badge">${t("Checking")}</span>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Target model")}</span>
          <select data-role="health-profile" title="${t("Grade the shot against this model's recommended limits")}"></select>
        </div>
        <div data-role="health-body"></div>
      </div>
    </div>`;
}
