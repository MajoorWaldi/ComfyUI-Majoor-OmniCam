// Camera Inspector panel.

import { t } from "../../i18n.js";
import { LENS_PRESETS } from "../../lens.js";

export function inspectorPanel() {
  const lensButtons = LENS_PRESETS.map((mm) => `<button data-lens="${mm}">${mm}mm</button>`).join("");
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="camera" hidden>
      <div class="oc-card">
        <div class="oc-card-title"><i class="pi pi-video"></i> <span data-role="inspector-camera-name">${t("Camera")}</span>
          <input data-role="camera-color" type="color" value="#4aa3ef" title="${t("Camera Color")}">
        </div>

        <div class="oc-section">${t("Lens")}</div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Sensor / Gate")}</span>
          <select data-role="camera-sensor-preset">
            <option value="custom">${t("Custom")}</option>
            <option value="full_frame">${t("Full Frame 35mm (36×24)")}</option>
            <option value="super_35">${t("Super 35 (24.89×18.66)")}</option>
            <option value="m43">${t("Micro 4/3 (17.3×13)")}</option>
            <option value="cinema_16_9">${t("16:9 Digital Cinema")}</option>
            <option value="mobile_9_16">${t("Mobile 9:16 Vertical")}</option>
          </select>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Focal Length")}</span>
          <input data-role="camera-focal" type="number" min="4" max="800" step="0.5"><span class="oc-unit">mm</span>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("FOV")}</span>
          <input data-role="camera-fov" type="number" min="5" max="150" step="0.1"><span class="oc-unit">°</span>
        </div>
        <div class="oc-lens-presets">${lensButtons}</div>

        <div class="oc-section">${t("Transform")}</div>
        <div class="oc-vec-row"><span class="oc-field-label">${t("Position")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="camera-px" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="camera-py" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="camera-pz" type="number" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="camera-pos" title="${t("Reset Position")}">⟲</button>
        </div>
        <div class="oc-vec-row"><span class="oc-field-label">${t("Target XYZ")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="camera-tx" type="number" step="0.1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="camera-ty" type="number" step="0.1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="camera-tz" type="number" step="0.1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="camera-target" title="${t("Reset Target")}">⟲</button>
        </div>
        <div class="oc-vec-row" title="${t("Pitch/Yaw/Roll: an alternative to Target XYZ, aiming the camera directly like a Maya/Blender rotate channel. Editing either one keeps the other in sync.")}">
          <span class="oc-field-label">${t("Rotation")}</span>
          <label class="oc-axis x"><span class="oc-axis-tag">X</span><input data-role="camera-rx" type="number" min="-90" max="90" step="1" aria-label="X"></label>
          <label class="oc-axis y"><span class="oc-axis-tag">Y</span><input data-role="camera-ry" type="number" step="1" aria-label="Y"></label>
          <label class="oc-axis z"><span class="oc-axis-tag">Z</span><input data-role="camera-rz" type="number" min="-180" max="180" step="1" aria-label="Z"></label>
          <button type="button" class="oc-axis-reset" data-act="reset-vector" data-target="rotation" title="${t("Reset Rotation")}">⟲</button>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Roll")}</span>
          <input data-role="camera-roll" type="number" min="-180" max="180" step="0.1"><span class="oc-unit">°</span>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Look At")}</span>
          <select data-role="camera-target-object" title="${t("Track / Follow Moving Target Object")}">
            <option value="">${t("Manual Target (No Tracking)")}</option>
          </select>
        </div>
        <div class="oc-field-row" data-role="camera-aim-bone-row" hidden><span class="oc-field-label">${t("Aim Bone")}</span>
          <select data-role="camera-aim-bone" title="${t("Aim at a bone inside the tracked rig instead of its origin")}">
            <option value="">${t("Whole object")}</option>
          </select>
        </div>

        <div class="oc-section">${t("Motion")}</div>
        <div class="oc-field-row oc-slider-row"><span class="oc-field-label">${t("Path Smoothing")}</span>
          <input data-role="path-smoothing" type="range" min="0" max="100" step="1" value="0">
          <span class="oc-slider-value" data-role="path-smoothing-value">0%</span>
        </div>
        <div class="oc-field-row oc-slider-row"><span class="oc-field-label">${t("Simplify Keys")}</span>
          <input data-role="key-simplify" type="range" min="0" max="100" step="1" value="0" title="${t("Drop keys that barely change the motion. Replayed from the pre-simplify keys, so 0% restores them.")}">
          <span class="oc-slider-value" data-role="key-simplify-value">${t("Off")}</span>
        </div>
        <div class="oc-field-row">
          <span class="oc-field-label">${t("Keys")} <span data-role="key-count">0</span></span>
          <select data-role="key-op-scope" title="${t("Which tracks the key operations act on")}">
            <option value="camera">${t("Active camera")}</option>
            <option value="all_cameras">${t("All cameras")}</option>
            <option value="object">${t("Active object")}</option>
          </select>
          <button data-act="keys-reduce" title="${t("Decimate down to a target key count")}"><i class="pi pi-minus-circle"></i> ${t("Reduce…")}</button>
          <button data-act="keys-clean" title="${t("Remove duplicate, too-close and redundant keys")}"><i class="pi pi-filter"></i> ${t("Clean")}</button>
        </div>

        <div class="oc-card-actions">
          <button class="primary" data-act="key" title="${t("Insert / Update Keyframe at Playhead (I)")}"><i class="pi pi-key"></i> ${t("Insert Key (I)")}</button>
          <button data-act="reset-camera" title="${t("Reset active camera")}"><i class="pi pi-refresh"></i> ${t("Reset Cam")}</button>
        </div>
      </div>

      <details class="oc-more" data-density-min="advanced"><summary>${t("Projection & Clipping")}</summary>
        <div class="oc-field-row"><span class="oc-field-label">${t("Projection")}</span>
          <select data-role="camera-type"><option value="perspective">${t("Perspective")}</option><option value="orthographic">${t("Orthographic")}</option></select>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Near Clip")}</span><input data-role="camera-near" type="number" min="0.0001" step="0.001"></div>
        <div class="oc-field-row oc-chip-row"><span class="oc-field-label">${t("Near Presets")}</span>
          <div class="oc-chip-group">
            <button type="button" class="oc-chip-btn" data-act="set-near-preset" data-near="0.001" title="${t("Interior (0.001)")}">0.001</button>
            <button type="button" class="oc-chip-btn" data-act="set-near-preset" data-near="0.01" title="${t("Standard (0.01)")}">0.01</button>
            <button type="button" class="oc-chip-btn" data-act="set-near-preset" data-near="0.1" title="${t("Large (0.1)")}">0.1</button>
          </div>
        </div>
        <div class="oc-field-row"><span class="oc-field-label">${t("Far Clip")}</span><input data-role="camera-far" type="number" min="0.0002" step="1"></div>
      </details>
    </div>`;
}
