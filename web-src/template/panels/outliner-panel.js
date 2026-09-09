// Scene tab body: the selected object's transform + display properties.
//
// Scene browsing (search, the add-object menu, filter chips, batch actions and
// the object tree) moved to template/left-panel.js. This panel now only holds
// the contextual object editor for the current selection.

import { t } from "../../i18n.js";

export function outlinerPanel() {
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="scene">
      <div class="oc-card" data-role="object-panel">
        <div class="oc-card-title" style="display:flex;align-items:center;justify-content:space-between;gap:6px">
          <span data-role="selected-name">${t("Object Transform")}</span>
          <div style="display:flex;align-items:center;gap:4px">
            <span class="oc-recon-badge" data-role="object-recon-badge" hidden></span>
            <button class="icon-button oc-lock-btn" type="button" data-act="toggle-object-lock" data-role="object-lock-toggle" title="${t("Lock / unlock object")}"><i class="pi pi-lock-open"></i></button>
          </div>
        </div>
        <div class="oc-field-row" data-role="material-row">
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
        <div class="oc-field-row" data-role="light-props-row" hidden>
          <span class="oc-field-label">${t("Light")}</span>
          <input data-role="object-light-color" type="color" value="#ffffff" title="${t("Light Color")}">
          <label style="display:flex;align-items:center;gap:3px;font-size:11px;color:var(--oc-text-dim,#94a3b8)">
            ${t("Intensity")}
            <input data-role="object-intensity" type="number" min="0" max="100" step="0.1" value="2.2" style="width:52px">
          </label>
          <label style="display:flex;align-items:center;gap:3px;font-size:11px;color:var(--oc-text-dim,#94a3b8)">
            <input data-role="object-cast-shadow" type="checkbox" checked>
            ${t("Shadow")}
          </label>
        </div>
        <div class="oc-field-row" data-role="spot-props-row" hidden>
          <span class="oc-field-label">${t("Spot Cone")}</span>
          <label style="display:flex;align-items:center;gap:3px;font-size:11px;color:var(--oc-text-dim,#94a3b8)">
            ${t("Angle")}
            <input data-role="object-cone-angle" type="number" min="1" max="90" step="1" value="45" style="width:48px">°
          </label>
          <label style="display:flex;align-items:center;gap:3px;font-size:11px;color:var(--oc-text-dim,#94a3b8)">
            ${t("Soft")}
            <input data-role="object-penumbra" type="number" min="0" max="1" step="0.05" value="0.25" style="width:48px">
          </label>
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
        <div class="oc-vec-row" data-role="rotation-row"><span class="oc-field-label">${t("Rotation")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="object-rx" type="number" step="1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="object-ry" type="number" step="1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="object-rz" type="number" step="1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="rotation" title="${t("Reset Rotation")}">⟲</button>
        </div>
        <div class="oc-vec-row" data-role="scale-row"><span class="oc-field-label">${t("Scale")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="object-sx" type="number" min="0.01" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="object-sy" type="number" min="0.01" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="object-sz" type="number" min="0.01" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="scale" title="${t("Reset Scale")}">⟲</button>
        </div>
        <div class="animation-row" data-role="animation-row" hidden><i class="pi pi-play-circle"></i><select data-role="animation-select" title="${t("Animation clip")}"></select></div>
        <div class="oc-field-row oc-labels-row">
          <span class="oc-field-label">${t("Tags")}</span>
          <input data-role="object-tags" type="text" placeholder="${t("hero, subject")}" title="${t("Machine-semantic tags, comma separated")}" style="flex:1;min-width:0">
        </div>
        <div class="oc-field-row oc-labels-row">
          <span class="oc-field-label">${t("Label")}</span>
          <input data-role="object-annotation" type="text" maxlength="128" placeholder="${t("Visible viewport label")}" style="flex:1;min-width:0">
          <input data-role="object-annotation-color" type="color" value="#8d7ee8" title="${t("Label colour")}">
          <select data-role="object-annotation-anchor" title="${t("Label anchor")}">
            <option value="top">${t("Top")}</option>
            <option value="center">${t("Center")}</option>
            <option value="bottom">${t("Bottom")}</option>
          </select>
        </div>
      </div>
      <div class="oc-field-row"><span class="oc-field-label">${t("Upstream reference")}</span>
        <select data-role="reference-select"><option value="0">${t("Upstream 1")}</option></select>
      </div>
    </div>`;
}
