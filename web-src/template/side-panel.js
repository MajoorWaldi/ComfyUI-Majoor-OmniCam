// Right-hand side panel: Outliner / Inspector / Shot.
//
// Tab buttons keep both `.inspector-tab` and `data-tab`, and panels keep both
// `.inspector-tab-content` and `data-tab-panel`, because editor.js switches
// them with the selector ".inspector-tab, [data-tab]".

import { t } from "../omnicam-i18n.js";
import { LENS_PRESETS } from "../lens.js";

function outlinerPanel() {
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="scene">
      <div class="oc-side-toolbar">
        <button class="icon-button" data-act="load-model" title="${t("Import 3D Model (+)")}"><i class="pi pi-plus"></i></button>
        <button class="icon-button" data-act="add-camera" title="${t("Create camera from current view")}"><i class="pi pi-video"></i></button>
        <input class="oc-search" data-role="outliner-search" type="search" placeholder="${t("Search")}" aria-label="${t("Filter the outliner")}">
      </div>
      <div class="outliner-quick-bar">
        <button data-object-type="ground" title="${t("Add Ground (+)")}"><i class="pi pi-minus"></i> ${t("Ground")}</button>
        <button data-object-type="cube" title="${t("Add Cube (+)")}"><i class="pi pi-stop"></i> ${t("Cube")}</button>
        <button data-object-type="sphere" title="${t("Add Sphere (+)")}"><i class="pi pi-circle"></i> ${t("Sphere")}</button>
        <button data-object-type="human" title="${t("Add Human (+)")}"><i class="pi pi-user"></i> ${t("Human")}</button>
        <button data-object-type="null" title="${t("Add Null (+)")}"><i class="pi pi-plus"></i> ${t("Null")}</button>
      </div>
      <div class="scene-tree" data-role="objects"></div>
      <div class="oc-card" data-role="object-panel">
        <div class="oc-card-title" data-role="selected-name">${t("Object Transform")}</div>
        <div class="oc-field-row">
          <span class="oc-field-label">${t("Material")}</span>
          <select data-role="object-material" title="${t("Viewport material")}">
            <option value="textured">${t("Textures")}</option><option value="checker">${t("Checker")}</option>
            <option value="neutral">${t("Neutral")}</option><option value="wireframe">${t("Wireframe")}</option>
          </select>
          <input data-role="object-color" type="color" value="#8c929b" title="${t("Object Color")}">
        </div>
        <div class="oc-field-row">
          <span class="oc-field-label">${t("Parent")}</span>
          <select data-role="object-parent" title="${t("Parent object")}"><option value="">${t("No parent")}</option></select>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${t("Position")}</span>
          <label class="oc-axis x">X<input data-role="object-x" type="number" step="0.1"></label>
          <label class="oc-axis y">Y<input data-role="object-y" type="number" step="0.1"></label>
          <label class="oc-axis z">Z<input data-role="object-z" type="number" step="0.1"></label>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${t("Rotation")}</span>
          <label class="oc-axis x">X<input data-role="object-rx" type="number" step="1"></label>
          <label class="oc-axis y">Y<input data-role="object-ry" type="number" step="1"></label>
          <label class="oc-axis z">Z<input data-role="object-rz" type="number" step="1"></label>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${t("Scale")}</span>
          <label class="oc-axis x">X<input data-role="object-sx" type="number" min="0.01" step="0.1"></label>
          <label class="oc-axis y">Y<input data-role="object-sy" type="number" min="0.01" step="0.1"></label>
          <label class="oc-axis z">Z<input data-role="object-sz" type="number" min="0.01" step="0.1"></label>
        </div>
        <div class="animation-row" data-role="animation-row" hidden><i class="pi pi-play-circle"></i><select data-role="animation-select" title="${t("Animation clip")}"></select></div>
      </div>
      <div class="oc-field-row"><span class="oc-field-label">${t("Upstream reference")}</span>
        <select data-role="reference-select"><option value="0">${t("Upstream 1")}</option></select>
      </div>
    </div>`;
}

function inspectorPanel() {
  const lensButtons = LENS_PRESETS.map((mm) => `<button data-lens="${mm}">${mm}mm</button>`).join("");
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="camera" hidden>
      <div class="oc-card">
        <div class="oc-card-title"><i class="pi pi-video"></i> <span data-role="inspector-camera-name">${t("Camera")}</span>
          <input data-role="camera-color" type="color" value="#4aa3ef" title="${t("Camera Color")}">
        </div>

        <div class="oc-section">${t("Lens")}</div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Focal Length")}</span>
          <input data-role="camera-focal" type="number" min="4" max="800" step="0.5"><span class="oc-unit">mm</span>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("FOV")}</span>
          <input data-role="camera-fov" type="number" min="5" max="150" step="0.1"><span class="oc-unit">°</span>
        </div>
        <div class="oc-lens-presets">${lensButtons}</div>

        <div class="oc-section">${t("Transform")}</div>
        <div class="oc-vec-row"><span class="oc-field-label">${t("Position")}</span>
          <label class="oc-axis x">X<input data-role="camera-px" type="number" step="0.1"></label>
          <label class="oc-axis y">Y<input data-role="camera-py" type="number" step="0.1"></label>
          <label class="oc-axis z">Z<input data-role="camera-pz" type="number" step="0.1"></label>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${t("Target XYZ")}</span>
          <label class="oc-axis x">X<input data-role="camera-tx" type="number" step="0.1"></label>
          <label class="oc-axis y">Y<input data-role="camera-ty" type="number" step="0.1"></label>
          <label class="oc-axis z">Z<input data-role="camera-tz" type="number" step="0.1"></label>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Roll")}</span>
          <input data-role="camera-roll" type="number" min="-180" max="180" step="0.1"><span class="oc-unit">°</span>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Look At")}</span>
          <select data-role="camera-target-object" title="${t("Track / Follow Moving Target Object")}">
            <option value="">${t("Manual Target (No Tracking)")}</option>
          </select>
        </div>

        <div class="oc-section">${t("Motion")}</div>
        <div class="oc-field-row oc-slider-row"><span class="oc-field-label">${t("Path Smoothing")}</span>
          <input data-role="path-smoothing" type="range" min="0" max="100" step="1" value="0">
          <span class="oc-slider-value" data-role="path-smoothing-value">0%</span>
        </div>

        <div class="oc-card-actions">
          <button class="primary" data-act="key" title="${t("Insert / Update Keyframe at Playhead (I)")}"><i class="pi pi-key"></i> ${t("Insert Key (I)")}</button>
          <button data-act="reset-camera" title="${t("Reset active camera")}"><i class="pi pi-refresh"></i> ${t("Reset Cam")}</button>
        </div>
      </div>

      <details class="oc-more"><summary>${t("Projection & Clipping")}</summary>
        <div class="oc-field-row"><span class="oc-field-label">${t("Projection")}</span>
          <select data-role="camera-type"><option value="perspective">${t("Perspective")}</option><option value="orthographic">${t("Orthographic")}</option></select>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Near Clip")}</span><input data-role="camera-near" type="number" min="0.0001" step="0.001"></div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Far Clip")}</span><input data-role="camera-far" type="number" min="0.0002" step="1"></div>
      </details>
    </div>`;
}

function shotPanel() {
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="display" hidden>
      <div class="oc-card key-editor" data-role="key-editor" data-empty="true">
        <div class="oc-card-title"><i class="pi pi-key"></i> <span data-role="selected-key-label">${t("Key @ 0")}</span></div>
        <div class="oc-card-actions oc-key-actions">
          <button class="icon-button" data-act="update-key" title="${t("Update key from current 3D view")}"><i class="pi pi-refresh"></i></button>
          <button class="icon-button" data-act="view-key" title="${t("Jump Playhead & View to Key")}"><i class="pi pi-eye"></i></button>
          <button class="icon-button" data-act="copy-key" title="${t("Copy Keyframe (Ctrl+C)")}"><i class="pi pi-copy"></i></button>
          <button class="icon-button" data-act="paste-key" title="${t("Paste Keyframe at Playhead (Ctrl+V)")}"><i class="pi pi-clipboard"></i></button>
          <button class="icon-button" data-act="delete-key" title="${t("Delete Selected Keyframe (Del / Backspace)")}"><i class="pi pi-trash"></i></button>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Frame")}</span><input data-role="key-frame" type="number" min="0" value="0"></div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Interpolation")}</span>
          <select data-role="key-interp">
            <option value="ease">${t("Ease")}</option><option value="smooth">${t("Smooth")}</option>
            <option value="bezier">${t("Bezier")}</option><option value="linear">${t("Linear")}</option>
            <option value="ease_in">${t("Ease In")}</option><option value="ease_out">${t("Ease Out")}</option>
            <option value="hold">${t("Hold")}</option>
          </select>
        </div>
        <div class="key-interp-buttons">
          <button type="button" class="key-interp-btn active" data-interp="ease">${t("Ease")}</button>
          <button type="button" class="key-interp-btn" data-interp="smooth">${t("Smooth")}</button>
          <button type="button" class="key-interp-btn" data-interp="bezier">${t("Bezier")}</button>
          <button type="button" class="key-interp-btn" data-interp="linear">${t("Linear")}</button>
          <button type="button" class="key-interp-btn" data-interp="ease_in">${t("Ease In")}</button>
          <button type="button" class="key-interp-btn" data-interp="ease_out">${t("Ease Out")}</button>
          <button type="button" class="key-interp-btn" data-interp="hold">${t("Hold")}</button>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${t("Position")}</span>
          <label class="oc-axis x">X<input data-role="key-px" type="number" step="0.1"></label>
          <label class="oc-axis y">Y<input data-role="key-py" type="number" step="0.1"></label>
          <label class="oc-axis z">Z<input data-role="key-pz" type="number" step="0.1"></label>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${t("Target XYZ")}</span>
          <label class="oc-axis x">X<input data-role="key-tx" type="number" step="0.1"></label>
          <label class="oc-axis y">Y<input data-role="key-ty" type="number" step="0.1"></label>
          <label class="oc-axis z">Z<input data-role="key-tz" type="number" step="0.1"></label>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("FOV")}</span><input data-role="key-fov" type="number" min="5" max="150" step="0.1"></div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Roll")}</span><input data-role="key-roll" type="number" min="-180" max="180" step="0.1"></div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Zoom")}</span><input data-role="key-zoom" type="number" min="0.01" step="0.05"></div>
        <details class="oc-more"><summary>${t("Projection & Clipping")}</summary>
          <div class="oc-field-row"><span class="oc-field-label">${t("Camera")}</span>
            <select data-role="key-camera-type"><option value="perspective">${t("Perspective")}</option><option value="orthographic">${t("Orthographic")}</option></select>
          </div>
          <div class="oc-field-row"><span class="oc-field-label">${t("Near Clip")}</span><input data-role="key-near" type="number" min="0.0001" step="0.001"></div>
          <div class="oc-field-row"><span class="oc-field-label">${t("Far Clip")}</span><input data-role="key-far" type="number" min="0.0002" step="1"></div>
        </details>
      </div>
    </div>`;
}

export function sidePanelMarkup() {
  return `
    <div class="viewport-inspector oc-side" data-role="viewport-inspector">
      <div class="inspector-tabs oc-side-tabs">
        <button class="inspector-tab active" data-tab="scene">${t("Outliner")}</button>
        <button class="inspector-tab" data-tab="camera">${t("Inspector")}</button>
        <button class="inspector-tab" data-tab="display">${t("Shot")}</button>
      </div>
      ${outlinerPanel()}
      ${inspectorPanel()}
      ${shotPanel()}
    </div>`;
}
