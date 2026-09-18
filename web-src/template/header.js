// Director header bar and footer bar.
//
// The header carries identity (node name), the live status pill, and an
// overflow menu for everything that is neither a viewport tool nor a per-shot
// setting: playblast output routing, the viewport proxy preset, adapter
// diagnostics and cache maintenance. (H3 Setup guidance lives on the Monitor
// node now, since it is about wiring things into Monitor, not Director state.)

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
            <label>${t("Proxy preset")} <select data-role="proxy-preset">
              <option value="clean_proxy">${t("Clean proxy")}</option>
              <option value="debug_motion">${t("Debug motion")}</option>
              <option value="cinematic_view">${t("Cinematic view")}</option>
            </select></label>
            <label>${t("Encoder")} <select data-role="encoder">
              <option value="auto">${t("WebCodecs")}</option>
              <option value="realtime">${t("Realtime fallback")}</option>
            </select></label>
          </div>
          <div class="menu-section" data-density-min="advanced">
            <div class="menu-divider"></div>
            <div class="menu-title">${t("Maintenance")}</div>
            <button data-act="clear-caches" title="${t("Clear WebGL textures, temporary files and memory caches")}"><i class="pi pi-trash"></i> ${t("Clear Caches & Clean")}</button>
            <button data-act="open-preferences" title="${t("Configure OmniCam preferences")}"><span aria-hidden="true">🔘</span> ${t("Preferences…")}</button>
          </div>
          <div class="menu-divider"></div>
          <div class="setup-badge" data-role="setup-badge" hidden></div>
          <div data-role="setup-issues"></div>
        </div>
      </details>
      <span class="oc-status-pill" data-role="status" role="status" aria-live="polite" aria-atomic="true"><span class="oc-status-dot"></span>${t("Ready")}</span>
    </div>`;
}

export function footerMarkup() {
  return `
    <div class="oc-footer">
      <span class="oc-status-badge" data-role="status-indicator">
        <span class="oc-status-dot"></span>
        <span data-role="engine-state">${t("READY")}</span>
      </span>
      <span class="oc-footer-sep">│</span>
      <span class="oc-footer-hints" data-role="mouse-hints">
        <span class="oc-key-hint">LMB</span> ${t("Select")} · 
        <span class="oc-key-hint">MMB</span> ${t("Orbit")} · 
        <span class="oc-key-hint">Shift+MMB</span> ${t("Pan")} · 
        <span class="oc-key-hint">Wheel</span> ${t("Dolly")} · 
        <span class="oc-key-hint">I</span> ${t("Key")}
      </span>
      <span class="oc-footer-spacer"></span>
      <details class="help oc-help">
        <summary><i class="pi pi-question-circle"></i> ${t("OmniCam Help")}</summary>
        <div class="oc-help-body">
          <p>${t("Compose a frame, press I, scrub, move the camera and press I again. Space previews the move; Playblast records the neutral motion reference.")}</p>
          <p>${t("The proxy communicates camera motion, not final appearance. Delivery profiles and model targets are compiled in OmniCam Monitor.")}</p>
        </div>
      </details>
    </div>`;
}
