// Viewport surface and its overlay chrome.
//
// The <canvas> must stay a *direct* child of .viewport-wrap: viewport.js and
// the Playwright mount test both resolve it as ".viewport-wrap > canvas".

import { t } from "../omnicam-i18n.js";

function toolRail() {
  return `
    <div class="vp-rail" role="toolbar" aria-label="${t("Viewport tools")}">
      <button class="vp-tool" data-act="clear-selection" title="${t("Select Object Tool (Q)")}"><i class="pi pi-arrow-up-left"></i></button>
      <button class="vp-tool" data-transform-mode="translate" title="${t("Translation gizmo (click)")}"><i class="pi pi-arrows-alt"></i></button>
      <button class="vp-tool" data-transform-mode="rotate" title="${t("Rotation gizmo (click)")}"><i class="pi pi-replay"></i></button>
      <button class="vp-tool" data-transform-mode="scale" title="${t("Scale gizmo (click)")}"><i class="pi pi-stop"></i></button>
      <span class="vp-rail-divider"></span>
      <button class="vp-tool" data-select-mode="vertex" title="${t("Vertex Selection Mode (1)")}"><i class="pi pi-circle"></i></button>
      <button class="vp-tool" data-select-mode="edge" title="${t("Edge Selection Mode (2)")}"><i class="pi pi-minus"></i></button>
      <button class="vp-tool" data-select-mode="face" title="${t("Face / Polygon Selection Mode (3)")}"><i class="pi pi-table"></i></button>
      <button class="vp-tool active" data-select-mode="object" title="${t("Object Selection Mode (4)")}"><i class="pi pi-box"></i></button>
      <span class="vp-rail-divider"></span>
      <button class="vp-tool" data-act="frame-target" title="${t("Frame Subject Target (F)")}"><i class="pi pi-expand"></i></button>
      <button class="vp-tool" data-act="select-look-at" title="${t("Select camera Look-At target")}"><i class="pi pi-bullseye"></i></button>
      <button class="vp-tool" data-act="toggle-inspector" title="${t("Toggle Inspector Panel (N)")}"><i class="pi pi-ellipsis-h"></i></button>
    </div>`;
}

function viewPills() {
  return `
    <div class="vp-pills">
      <select class="vp-pill vp-pill-select" data-role="view-mode" title="${t("View mode: Camera (Numpad 0), Front/Back (1), Top/Bottom (7), Right/Left (3)")}">
        <option value="perspective">${t("Perspective")}</option>
        <option value="camera">${t("Camera View")}</option>
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

      ${viewPills()}

      <div class="vp-corner">
        <span class="vp-zoom" data-role="viewport-zoom" title="${t("Viewport zoom")}">1.00x</span>
        <button class="vp-tool" data-act="toggle-fullscreen" title="${t("Toggle Fullscreen Viewport")}"><i class="pi pi-window-maximize"></i></button>
      </div>

      ${toolRail()}

      <svg class="vp-axis" data-role="viewport-axis" viewBox="0 0 52 52" width="52" height="52"
           aria-label="${t("World axis orientation")}" role="img"></svg>

      <span class="vp-state" data-role="viewport-state"></span>
      <div class="vp-hint">${t("Orbit: MMB · Pan: Shift+MMB · Dolly: Scroll · Fly: WASD / QE")}</div>
    </div>`;
}
