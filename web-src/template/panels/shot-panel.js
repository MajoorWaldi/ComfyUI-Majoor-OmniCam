// Shot panel: keyframe editor for the selected camera key.

import { t } from "../../i18n.js";

export function shotPanel() {
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
          <label class="oc-axis x"><input data-role="key-px" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><input data-role="key-py" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><input data-role="key-pz" type="number" step="0.1" aria-label="Z"></label>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${t("Target XYZ")}</span>
          <label class="oc-axis x"><input data-role="key-tx" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><input data-role="key-ty" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><input data-role="key-tz" type="number" step="0.1" aria-label="Z"></label>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("FOV")}</span><input data-role="key-fov" type="number" min="5" max="150" step="0.1"></div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Roll")}</span><input data-role="key-roll" type="number" min="-180" max="180" step="0.1"></div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Zoom")}</span><input data-role="key-zoom" type="number" min="0.01" step="0.05"></div>
        <details class="oc-more" data-density-min="advanced"><summary>${t("Projection & Clipping")}</summary>
          <div class="oc-field-row"><span class="oc-field-label">${t("Camera")}</span>
            <select data-role="key-camera-type"><option value="perspective">${t("Perspective")}</option><option value="orthographic">${t("Orthographic")}</option></select>
          </div>
          <div class="oc-field-row"><span class="oc-field-label">${t("Near Clip")}</span><input data-role="key-near" type="number" min="0.0001" step="0.001"></div>
          <div class="oc-field-row"><span class="oc-field-label">${t("Far Clip")}</span><input data-role="key-far" type="number" min="0.0002" step="1"></div>
        </details>
      </div>
    </div>`;
}
