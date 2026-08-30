// Director header bar and footer bar.
//
// The header carries identity (node name), the live status pill, and an
// overflow menu for everything that is neither a viewport tool nor a per-shot
// setting: playblast output routing, the H3 helper, adapter diagnostics and
// cache maintenance.

import { t } from "../i18n.js";
import { brandMarkup } from "./brand.js";

export function headerMarkup() {
  return `
    <div class="oc-header">
      ${brandMarkup("OmniCam Director")}
      <span class="oc-header-spacer"></span>
      <details class="toolbar-menu oc-overflow" data-menu="output">
        <summary title="${t("Output & diagnostics")}"><i class="pi pi-ellipsis-h"></i></summary>
        <div class="menu-panel right">
          <div class="menu-title">${t("Output")}</div>
          <label>${t("Playblast camera")} <select data-role="playblast-camera"></select></label>
          <div class="menu-section" data-density-min="animation">
            <label>${t("H3 preset")} <select data-role="proxy-preset">
              <option value="balanced">${t("Balanced")}</option>
              <option value="parallax">${t("Parallax")}</option>
              <option value="subject">${t("Subject")}</option>
              <option value="debug">${t("Debug")}</option>
            </select></label>
            <label>${t("Encoder")} <select data-role="encoder">
              <option value="auto">${t("WebCodecs")}</option>
              <option value="realtime">${t("Realtime fallback")}</option>
            </select></label>
            <button data-act="h3-setup" class="primary" title="${t("Create the H3 reference nodes")}"><i class="pi pi-bolt"></i> ${t("H3 Setup")}</button>
          </div>
          <div class="menu-section" data-density-min="advanced">
            <div class="menu-divider"></div>
            <div class="menu-title">${t("Maintenance")}</div>
            <button data-act="clear-caches" title="${t("Clear WebGL textures, temporary files and memory caches")}"><i class="pi pi-trash"></i> ${t("Clear Caches & Clean")}</button>
          </div>
          <div class="menu-divider"></div>
          <div class="setup-badge" data-role="setup-badge" hidden></div>
          <div data-role="setup-issues"></div>
        </div>
      </details>
      <span class="oc-status-pill" data-role="status"><span class="oc-status-dot"></span>${t("Ready")}</span>
    </div>`;
}

export function footerMarkup() {
  return `
    <div class="oc-footer">
      <details class="help oc-help">
        <summary><i class="pi pi-question-circle"></i> ${t("OmniCam Help")}</summary>
        <div class="oc-help-body">
          <p>${t("Compose a frame, press I, scrub, move the camera and press I again. Space previews the move; Playblast records the neutral motion reference.")}</p>
          <p>${t("The proxy communicates camera motion, not final appearance. Use H3 Setup for Omni Reference, Wan Native Camera for core Plücker conditioning, or the pinned ATI/LTX adapters for their supported workflows.")}</p>
        </div>
      </details>
      <span class="oc-footer-spacer"></span>
      <button class="oc-playblast" data-act="record" title="${t("Record proxy playblast")}"><span class="oc-playblast-dot"></span>${t("Playblast")}</button>
    </div>`;
}
