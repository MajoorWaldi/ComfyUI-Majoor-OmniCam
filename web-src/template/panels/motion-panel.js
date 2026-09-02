// Motion panel: a dedicated workspace for Motion Tracks, moved out of the
// Outliner. This file is markup only -- all DOM<->state sync lives in
// motion-tracks/panel.js, and the creation workflows in motion-tracks/creation.js.
//
// The control data-roles (`motion-layers`, `motion-interpolation`,
// `motion-key-visible`, `motion-layer-action`, `motion-preset`) are unchanged
// from the old Outliner markup, so motion-tracks/interactions.js keeps binding
// them by selector with no change.

import { t } from "../../i18n.js";

export function motionPanel() {
  return `
    <div class="inspector-tab-content oc-side-body motion-panel" data-tab-panel="motion" hidden>

      <div class="oc-section">${t("Create Motion")}</div>
      <div class="motion-create-grid">
        <button type="button" class="motion-create-btn" data-motion-create="draw">
          <i class="pi pi-pencil"></i><b>${t("Draw Path")}</b><small>${t("Draw movement onscreen")}</small>
        </button>
        <button type="button" class="motion-create-btn" data-motion-create="object">
          <i class="pi pi-bullseye"></i><b>${t("Track Object")}</b><small>${t("Follow a scene object")}</small>
        </button>
        <button type="button" class="motion-create-btn" data-motion-create="world">
          <i class="pi pi-plus-circle"></i><b>${t("World Point")}</b><small>${t("Track a fixed 3D point")}</small>
        </button>
        <button type="button" class="motion-create-btn" data-motion-create="anchor">
          <i class="pi pi-map-marker"></i><b>${t("Screen Anchor")}</b><small>${t("Fixed screen position")}</small>
        </button>
      </div>

      <div class="motion-creating" data-role="motion-creating" hidden>
        <span data-role="motion-creating-label">${t("Drawing motion")}</span>
        <button type="button" class="icon-button" data-motion-create-cancel title="${t("Cancel (Esc)")}"><i class="pi pi-times"></i></button>
      </div>

      <div class="oc-section">${t("Tracks")}</div>
      <div class="motion-empty" data-role="motion-layers-empty">
        ${t("No motion tracks yet. Control subject movement independently from the camera.")}
      </div>
      <div class="motion-layer-list" data-role="motion-layers"></div>

      <div class="oc-section">${t("Path Preview")}</div>
      <div class="motion-preview-wrap" title="${t("Motion paths in screen space. Click a path to select it.")}">
        <canvas class="motion-preview" data-role="motion-preview"></canvas>
        <div class="motion-preview-empty" data-role="motion-preview-empty">${t("Motion paths appear here in screen space.")}</div>
      </div>

      <div class="oc-card motion-selected" data-role="motion-selected" hidden>
        <div class="oc-card-title">
          <span data-role="motion-sel-name">${t("Selected Track")}</span>
          <span class="motion-badge" data-role="motion-sel-type">DRAW</span>
        </div>
        <div class="motion-sel-warn" data-role="motion-sel-warn" hidden></div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Binding")}</span>
          <span data-role="motion-sel-binding" class="oc-field-value">${t("Screen")}</span>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Timing")}</span>
          <span class="oc-field-value"><span data-role="motion-sel-start">0</span> &ndash; <span data-role="motion-sel-end">0</span></span>
        </div>
        <div class="motion-layer-controls">
          <select data-role="motion-interpolation" title="${t("Motion interpolation")}">
            <option value="linear">${t("Linear")}</option><option value="smooth">${t("Smooth")}</option><option value="hold">${t("Hold")}</option>
          </select>
          <label title="${t("Motion key visibility")}"><input data-role="motion-key-visible" type="checkbox" checked> ${t("Visible")}</label>
          <button class="icon-button" data-motion-layer-action="toggle" title="${t("Enable or disable motion layer")}"><i class="pi pi-eye"></i></button>
          <button class="icon-button" data-motion-layer-action="delete" title="${t("Delete motion layer")}"><i class="pi pi-trash"></i></button>
        </div>
        <button type="button" class="motion-fit-btn" data-motion-layer-action="retime" title="${t("Remap keys onto the current playback range")}">
          <i class="pi pi-clock"></i> ${t("Fit to Playback Range")}
        </button>
      </div>

      <details class="oc-more motion-advanced">
        <summary>${t("Advanced")} &middot; ${t("Camera Motion Field")} <span class="motion-badge experimental">EXPERIMENTAL</span></summary>
        <div class="motion-preset-bar" aria-label="${t("Camera field presets")}">
          <button data-motion-preset="balanced" title="${t("Balanced camera field")}">${t("Balanced")}</button>
          <button data-motion-preset="foreground" title="${t("Foreground camera field")}">${t("Foreground")}</button>
          <button data-motion-preset="subject" title="${t("Subject camera field")}">${t("Subject")}</button>
          <button data-motion-preset="ground_parallax" title="${t("Ground parallax camera field")}">${t("Ground")}</button>
          <button data-motion-preset="depth_layers" title="${t("Depth layers camera field")}">${t("Depth")}</button>
        </div>
      </details>

      <div class="oc-section">${t("Model Compatibility")}</div>
      <div class="motion-compat">
        <div><i class="pi pi-check"></i> Wan Move</div>
        <div><i class="pi pi-check"></i> Wan Track</div>
        <div><i class="pi pi-check"></i> ATI</div>
        <div><i class="pi pi-check"></i> LTX Motion</div>
        <p>${t("Motion Tracks are consumed by screen-track profiles. Generic video does not use them directly.")}</p>
      </div>
    </div>`;
}
