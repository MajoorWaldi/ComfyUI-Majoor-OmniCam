// Viewport surface and its overlay chrome.
//
// The <canvas> must stay a *direct* child of .viewport-wrap: viewport.js and
// the Playwright mount test both resolve it as ".viewport-wrap > canvas".

import { t } from "../i18n.js";

function toolRail() {
  return `
    <div class="vp-rail" role="toolbar" aria-label="${t("Viewport tools")}">
      <button class="vp-tool" data-act="clear-selection" title="${t("Select Object Tool (Q)")}"><i class="pi pi-arrow-up-left"></i></button>
      <button class="vp-tool" data-transform-mode="translate" title="${t("Translation gizmo (click)")}"><i class="pi pi-arrows-alt"></i></button>
      <button class="vp-tool" data-transform-mode="rotate" title="${t("Rotation gizmo (click)")}"><i class="pi pi-replay"></i></button>
      <button class="vp-tool" data-transform-mode="scale" title="${t("Scale gizmo (click)")}"><i class="pi pi-stop"></i></button>
      <span class="vp-rail-divider"></span>
      <button class="vp-tool" data-select-mode="vertex" data-density-min="advanced" title="${t("Vertex Selection Mode (1)")}"><i class="pi pi-circle"></i></button>
      <button class="vp-tool" data-select-mode="edge" data-density-min="advanced" title="${t("Edge Selection Mode (2)")}"><i class="pi pi-minus"></i></button>
      <button class="vp-tool" data-select-mode="face" data-density-min="advanced" title="${t("Face / Polygon Selection Mode (3)")}"><i class="pi pi-table"></i></button>
      <button class="vp-tool active" data-select-mode="object" title="${t("Object Selection Mode (4)")}"><i class="pi pi-box"></i></button>
      <span class="vp-rail-divider"></span>
      <button class="vp-tool" data-act="frame-target" title="${t("Frame Subject Target (F)")}"><i class="pi pi-expand"></i></button>
      <button class="vp-tool" data-act="select-look-at" data-density-min="advanced" title="${t("Select camera Look-At target")}"><i class="pi pi-bullseye"></i></button>
      <button class="vp-tool" data-act="toggle-inspector" title="${t("Toggle Inspector Panel (N)")}"><i class="pi pi-ellipsis-h"></i></button>
    </div>`;
}

function viewPills() {
  return `
    <div class="vp-pills" role="group" aria-label="${t("Quick viewport views")}">
      <div class="vp-quick-views">
        <button type="button" class="vp-view active" data-view="camera" aria-pressed="true" title="${t("Camera View")}">${t("Camera")}</button>
        <button type="button" class="vp-view" data-view="perspective" aria-pressed="false" title="${t("Perspective View")}">${t("Perspective")}</button>
        <button type="button" class="vp-view" data-view="front" aria-pressed="false" title="${t("Front View")}">${t("Front")}</button>
        <button type="button" class="vp-view" data-view="right" aria-pressed="false" title="${t("Right View")}">${t("Right")}</button>
        <button type="button" class="vp-view" data-view="top" aria-pressed="false" title="${t("Top View")}">${t("Top")}</button>
        <button type="button" class="vp-view" data-view="iso" aria-pressed="false" title="${t("Isometric View")}">${t("ISO")}</button>
      </div>
      <select class="vp-pill vp-pill-select" data-role="view-mode" aria-label="${t("More viewport views")}" title="${t("View mode: Camera (Numpad 0), Front/Back (1), Top/Bottom (7), Right/Left (3)")}">
        <option value="camera">${t("Camera View")}</option>
        <option value="perspective">${t("Perspective")}</option>
        <option value="iso">${t("Isometric View")}</option>
        <option value="front">${t("Front View")}</option>
        <option value="back">${t("Back View")}</option>
        <option value="top">${t("Top View")}</option>
        <option value="bottom">${t("Bottom View")}</option>
        <option value="right">${t("Right Side")}</option>
        <option value="left">${t("Left Side")}</option>
      </select>
      <select class="vp-pill vp-pill-select" data-role="active-camera-select" title="${t("Switch Active Camera")}"></select>
    </div>`;
}

export function viewportMarkup() {
  return `
    <div class="viewport-wrap">
      <canvas tabindex="0"></canvas>

      <div class="viewport-tally-banner" data-role="tally-banner" hidden>
        <span class="tally-dot"></span>
        <span class="tally-text" data-role="tally-text">REC KEY @ F0</span>
      </div>

      <div class="extractor-import-banner" data-role="extractor-import-banner" hidden>
        <i class="pi pi-video"></i>
        <span data-role="extractor-import-text"></span>
        <button type="button" class="ei-import" data-act="import-extractor-camera">${t("Import as Camera")}</button>
        <button type="button" class="ei-dismiss" data-act="dismiss-extractor-camera" title="${t("Dismiss")}" aria-label="${t("Dismiss")}"><i class="pi pi-times"></i></button>
      </div>

      ${viewPills()}

      <div class="vp-corner">
        <span class="vp-zoom" data-role="viewport-zoom" title="${t("Viewport zoom")}">1.00x</span>
        <button class="vp-tool" data-act="toggle-fullscreen" title="${t("Toggle Fullscreen Viewport")}"><i class="pi pi-window-maximize"></i></button>
      </div>

      ${toolRail()}

      <svg class="vp-axis" data-role="viewport-axis" viewBox="0 0 52 52" width="52" height="52"
           aria-label="${t("World axis navigation")}" role="group">
        <circle data-axis-center cx="26" cy="26" r="4" tabindex="0" role="button" aria-label="${t("Frame selection")}"></circle>
      </svg>

      <span class="vp-state" data-role="viewport-state"></span>
      <div class="vp-hint">${t("Orbit: MMB · Pan: Shift+MMB · Dolly: Scroll · Fly: WASD / QE")}</div>
    </div>`;
}
