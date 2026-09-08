// Outliner panel: scene tree + object transform. Motion Tracks now live in
// their own Motion panel (template/panels/motion-panel.js).

import { t } from "../../i18n.js";

export function outlinerPanel() {
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="scene">
      <div class="oc-side-toolbar">
        <button class="icon-button" data-act="load-model" title="${t("Import 3D Model (+)")}"><i class="pi pi-plus"></i></button>
        <button class="icon-button" data-act="add-camera" title="${t("Create camera from current view")}"><i class="pi pi-video"></i></button>
        <input class="oc-search" data-role="outliner-search" type="search" placeholder="${t("Search")}" aria-label="${t("Filter the outliner")}">
      </div>
      <div class="outliner-quick-bar">
        <button data-object-type="card" title="${t("Add Card (+)")}"><i class="pi pi-image"></i> ${t("Card")}</button>
        <button data-object-type="cube" title="${t("Add Cube (+)")}"><i class="pi pi-stop"></i> ${t("Cube")}</button>
        <button data-object-type="sphere" title="${t("Add Sphere (+)")}"><i class="pi pi-circle"></i> ${t("Sphere")}</button>
        <button data-object-type="cylinder" title="${t("Add Cylinder (+)")}"><i class="pi pi-database"></i> ${t("Cylinder")}</button>
        <button data-object-type="torus" title="${t("Add Torus (+)")}"><i class="pi pi-circle"></i> ${t("Torus")}</button>
        <button data-object-type="human" title="${t("Add Human (+)")}"><i class="pi pi-user"></i> ${t("Human")}</button>
        <button data-object-type="null" title="${t("Add Null (+)")}"><i class="pi pi-plus"></i> ${t("Null")}</button>
      </div>
      <div class="outliner-filter-chips" data-role="outliner-filter-chips">
        <button type="button" class="oc-chip active" data-filter="all">${t("All")}</button>
        <button type="button" class="oc-chip" data-filter="cameras">${t("Cameras")}</button>
        <button type="button" class="oc-chip" data-filter="objects">${t("Objects")}</button>
        <button type="button" class="oc-chip" data-filter="hidden">${t("Hidden")}</button>
      </div>
      <div class="scene-tree" data-role="objects"></div>
      <div class="oc-resize-v" data-role="outliner-resize" role="separator" aria-orientation="horizontal" tabindex="0"
           title="${t("Drag to resize the outliner — double-click to reset")}" aria-label="${t("Resize the outliner")}"></div>
      <div class="oc-card" data-role="object-panel">
        <div class="oc-card-title" style="display:flex;align-items:center;justify-content:space-between;gap:6px">
          <span data-role="selected-name">${t("Object Transform")}</span>
          <div style="display:flex;align-items:center;gap:4px">
            <span class="oc-recon-badge" data-role="object-recon-badge" hidden></span>
            <button class="icon-button oc-lock-btn" type="button" data-act="toggle-object-lock" data-role="object-lock-toggle" title="${t("Lock / unlock object")}"><i class="pi pi-lock-open"></i></button>
          </div>
        </div>
        <div class="oc-field-row">
          <span class="oc-field-label">${t("Material")}</span>
          <select data-role="object-material" title="${t("Viewport material")}">
            <option value="textured">${t("Textures")}</option>
            <option value="wireframe_texture">${t("Wireframe + Texture")}</option>
            <option value="checker">${t("Checker")}</option>
            <option value="neutral">${t("Neutral")}</option>
            <option value="wireframe_neutral">${t("Wireframe + Clay")}</option>
            <option value="wireframe">${t("Wireframe")}</option>
            <option value="matte">${t("Matte Dark")}</option>
          </select>
          <input data-role="object-color" type="color" value="#8c929b" title="${t("Object Color")}">
        </div>
        <div class="oc-field-row">
          <span class="oc-field-label">${t("Parent")}</span>
          <select data-role="object-parent" title="${t("Parent object")}"><option value="">${t("No parent")}</option></select>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${t("Position")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="object-x" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="object-y" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="object-z" type="number" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="position" title="${t("Reset Position")}">⟲</button>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${t("Rotation")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="object-rx" type="number" step="1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="object-ry" type="number" step="1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="object-rz" type="number" step="1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="rotation" title="${t("Reset Rotation")}">⟲</button>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${t("Scale")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="object-sx" type="number" min="0.01" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="object-sy" type="number" min="0.01" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="object-sz" type="number" min="0.01" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="scale" title="${t("Reset Scale")}">⟲</button>
        </div>
        <div class="animation-row" data-role="animation-row" hidden><i class="pi pi-play-circle"></i><select data-role="animation-select" title="${t("Animation clip")}"></select></div>
      </div>
      <div class="oc-field-row"><span class="oc-field-label">${t("Upstream reference")}</span>
        <select data-role="reference-select"><option value="0">${t("Upstream 1")}</option></select>
      </div>
    </div>`;
}
