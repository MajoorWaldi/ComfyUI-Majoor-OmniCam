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
      <button class="vp-tool" data-act="draw-camera-path" aria-pressed="false"
              title="${t("Draw Camera Path (perspective or top / front / side view)")}" aria-label="${t("Draw Camera Path")}">
        <i class="pi pi-pencil"></i>
      </button>
      <button class="vp-tool" data-act="draw-camera-path-extend" aria-pressed="false"
              title="${t("Continue Camera Path — draw a new segment from the active camera's last key")}" aria-label="${t("Continue Camera Path")}">
        <i class="pi pi-arrow-right"></i>
      </button>
      <button class="vp-tool" data-act="toggle-gizmo-space" data-role="gizmo-space-toggle"
              title="${t("Toggle Transform Space (World / Local)")}">
        <span class="vp-space-badge" data-role="gizmo-space-badge">W</span>
      </button>
      <button class="vp-tool" data-act="toggle-spatial-snap" data-role="spatial-snap-toggle"
              title="${t("Toggle Snapping (Grid / None)")}">
        <i class="pi pi-magnet"></i>
      </button>
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

function motionTools() {
  return `
    <div class="motion-tools" role="toolbar" aria-label="${t("Motion track tools")}">
      <button class="active" data-motion-tool="select" aria-pressed="true" title="${t("Select motion track")}"><i class="pi pi-arrow-up-left"></i></button>
      <button data-motion-tool="track" aria-pressed="false" title="${t("Draw motion track")}"><i class="pi pi-pencil"></i></button>
      <button data-motion-tool="anchor" aria-pressed="false" title="${t("Add static screen anchor")}"><i class="pi pi-map-marker"></i></button>
      <button data-motion-tool="project" aria-pressed="false" title="${t("Project selected object or world point")}"><i class="pi pi-bullseye"></i></button>
      <button data-motion-tool="erase" aria-pressed="false" title="${t("Erase motion track")}"><i class="pi pi-eraser"></i></button>
    </div>`;
}

export function viewportMarkup() {
  return `
    <div class="viewport-wrap">
      <canvas tabindex="0" role="img" aria-label="${t("3D scene viewport. Drag to orbit, scroll to zoom, F to frame the selection, right-click for the context menu.")}"></canvas>

      <div class="viewport-tally-banner" data-role="tally-banner" hidden>
        <span class="tally-dot"></span>
        <span class="tally-text" data-role="tally-text">REC KEY @ F0</span>
      </div>

      <div class="vp-camera-hud" data-role="camera-hud" hidden>
        <button type="button" class="hud-cam-lock" data-act="toggle-camera-lock" title="${t("Lock Camera View (prevent accidental navigation)")}">
          <i class="pi pi-lock-open" data-role="cam-lock-icon"></i>
        </button>
        <span class="hud-cam-name" data-role="hud-cam-name">Camera</span>
        <span class="hud-divider">·</span>
        <span class="hud-cam-lens" data-role="hud-cam-lens">35mm</span>
        <span class="hud-cam-fov" data-role="hud-cam-fov">54.4°</span>
        <span class="hud-divider">·</span>
        <span class="hud-cam-dist" data-role="hud-cam-dist">Target: 4.2m</span>
        <button type="button" class="hud-roll-reset" data-act="reset-camera-roll" data-role="hud-roll-reset" title="${t("Reset roll to 0°")}" hidden>
          <i class="pi pi-undo"></i> <span data-role="hud-roll-val">0°</span>
        </button>
      </div>

      <div class="extractor-import-banner" data-role="extractor-import-banner" hidden>
        <i class="pi pi-video"></i>
        <span data-role="extractor-import-text"></span>
        <button type="button" class="ei-import" data-act="import-extractor-camera">${t("Import as Camera")}</button>
        <button type="button" class="ei-dismiss" data-act="dismiss-extractor-camera" title="${t("Dismiss")}" aria-label="${t("Dismiss")}"><i class="pi pi-times"></i></button>
      </div>

      ${viewPills()}
      ${motionTools()}

      <div class="vp-corner">
        <div class="vp-overlay-group" role="group" aria-label="${t("Quick Overlays")}">
          <button type="button" class="vp-overlay-btn" data-act="toggle-grid-overlay" data-role="overlay-grid-btn" title="${t("Toggle Floor Grid")}"><i class="pi pi-th-large"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-wireframe-overlay" data-role="overlay-wireframe-btn" title="${t("Toggle Wireframe on Shaded / Mesh Edges")}"><i class="pi pi-box"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-gizmo-overlay" data-role="overlay-gizmo-btn" title="${t("Toggle Transform Gizmos")}"><i class="pi pi-arrows-alt"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-guides-overlay" data-role="overlay-guides-btn" title="${t("Toggle Composition Guides (Rule of Thirds)")}"><i class="pi pi-hashtag"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-safe-areas-overlay" data-role="overlay-safe-btn" title="${t("Toggle Safe Areas")}"><i class="pi pi-stop"></i></button>
          <button type="button" class="vp-overlay-btn" data-act="toggle-radar-overlay" data-role="overlay-radar-btn" title="${t("Toggle 2D Radar Mini-Map")}"><i class="pi pi-compass"></i></button>
        </div>
        <select class="vp-pill vp-pill-select vp-shading-select" data-role="shading-mode-select" title="${t("Viewport Shading Mode")}">
          <option value="omni_ref">Omni Ref</option>
          <option value="graybox">Graybox</option>
          <option value="textured">${t("Textured")}</option>
          <option value="wireframe">Wireframe</option>
          <option value="wireframe_texture">${t("Wireframe + Texture")}</option>
          <option value="grid">Grid</option>
          <option value="beauty">Beauty</option>
        </select>
        <span class="vp-zoom" data-role="viewport-zoom" title="${t("Viewport zoom")}">1.00x</span>
        <button class="vp-tool" data-act="toggle-fullscreen" title="${t("Toggle Fullscreen Viewport")}"><i class="pi pi-window-maximize"></i></button>
      </div>

      ${toolRail()}

      <svg class="vp-axis" data-role="viewport-axis" viewBox="0 0 52 52" width="52" height="52"
           aria-label="${t("World axis navigation")}" role="group">
        <circle data-axis-center cx="26" cy="26" r="4" tabindex="0" role="button" aria-label="${t("Frame selection")}"></circle>
      </svg>

      <span class="vp-state" data-role="viewport-state"></span>
      <div class="vp-floating-transport" data-role="floating-transport" hidden>
        <button type="button" class="ft-btn" data-act="ft-step-back" title="${t("Previous Keyframe")}"><i class="pi pi-step-backward"></i></button>
        <button type="button" class="ft-btn ft-play" data-act="ft-toggle-play" title="${t("Play / Pause (Space)")}"><i class="pi pi-play" data-role="ft-play-icon"></i></button>
        <button type="button" class="ft-btn" data-act="ft-step-forward" title="${t("Next Keyframe")}"><i class="pi pi-step-forward"></i></button>
        <span class="ft-time" data-role="ft-timecode">00:00:00:00</span>
        <span class="ft-frame" data-role="ft-frame">F0</span>
        <button type="button" class="ft-btn" data-act="ft-add-key" title="${t("Add Keyframe (I)")}"><i class="pi pi-key"></i></button>
      </div>
      <div class="vp-hint">${t("Orbit: MMB · Pan: Shift+MMB · Dolly: Scroll · Fly: WASD / QE")}</div>
    </div>`;
}
