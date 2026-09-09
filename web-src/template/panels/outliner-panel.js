// Outliner panel: scene tree + object transform. Motion Tracks now live in
// their own Motion panel (template/panels/motion-panel.js).

import { t } from "../../i18n.js";
import {
  sphereIcon,
  cubeIcon,
  pyramidIcon,
  sunLightIcon,
  pointLightIcon,
  spotLightIcon,
  cameraIcon,
  assetsIcon,
} from "../object-icons.js";

export function outlinerPanel() {
  return `
    <div class="inspector-tab-content oc-side-body" data-tab-panel="scene">
      <div class="oc-side-toolbar">
        <button class="icon-button" data-act="load-model" title="${t("Import 3D Model (+)")}"><i class="pi pi-plus"></i></button>
        <button class="icon-button" data-act="add-camera" title="${t("Create camera from current view")}"><i class="pi pi-video"></i></button>
        <input class="oc-search" data-role="outliner-search" type="search" placeholder="${t("Search")}" aria-label="${t("Filter the outliner")}">
      </div>
      <div class="oc-outliner-add-bar">
        <details class="toolbar-menu oc-add-menu" data-menu="add-object">
          <summary class="oc-add-summary-btn" title="${t("Add object (+)")}">
            <i class="pi pi-plus" style="font-size:11px"></i>
            <span>${t("Add object")}</span>
            <i class="pi pi-chevron-down" style="font-size:9px;margin-left:auto;opacity:0.7"></i>
          </summary>
          <div class="menu-panel oc-add-menu-panel">
            <div class="oc-add-header">${t("Add object")}</div>
            <button type="button" class="oc-add-menu-item" data-object-type="sphere">
              ${sphereIcon} <span>${t("Sphere")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="cube">
              ${cubeIcon} <span>${t("Cube")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="pyramid">
              ${pyramidIcon} <span>${t("Pyramide")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="sun_light">
              ${sunLightIcon} <span>${t("Sun light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="point_light">
              ${pointLightIcon} <span>${t("Point light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-object-type="spot_light">
              ${spotLightIcon} <span>${t("Spot light")}</span>
            </button>
            <button type="button" class="oc-add-menu-item" data-act="add-camera">
              ${cameraIcon} <span>${t("Camera")}</span>
            </button>
            <div class="oc-add-menu-item oc-has-submenu" tabindex="0">
              ${assetsIcon} <span>${t("Assets")}</span>
              <i class="pi pi-chevron-right oc-submenu-arrow"></i>
              <div class="oc-add-submenu">
                <button type="button" class="oc-add-menu-item" data-object-type="card"><i class="pi pi-image"></i> <span>${t("Card")}</span></button>
                <button type="button" class="oc-add-menu-item" data-object-type="cylinder"><i class="pi pi-database"></i> <span>${t("Cylinder")}</span></button>
                <button type="button" class="oc-add-menu-item" data-object-type="torus"><i class="pi pi-circle"></i> <span>${t("Torus")}</span></button>
                <button type="button" class="oc-add-menu-item" data-object-type="human"><i class="pi pi-user"></i> <span>${t("Human")}</span></button>
                <button type="button" class="oc-add-menu-item" data-object-type="null"><i class="pi pi-plus"></i> <span>${t("Null")}</span></button>
                <div class="menu-divider"></div>
                <button type="button" class="oc-add-menu-item" data-act="load-model"><i class="pi pi-box"></i> <span>${t("Import 3D Model (+)")}</span></button>
              </div>
            </div>
          </div>
        </details>
      </div>
      <div class="outliner-filter-chips" data-role="outliner-filter-chips">
        <button type="button" class="oc-chip active" data-filter="all">${t("All")}</button>
        <button type="button" class="oc-chip" data-filter="cameras">${t("Cameras")}</button>
        <button type="button" class="oc-chip" data-filter="objects">${t("Objects")}</button>
        <button type="button" class="oc-chip" data-filter="lights">${t("Lights")}</button>
        <button type="button" class="oc-chip" data-filter="hidden">${t("Hidden")}</button>
      </div>
      <div class="oc-batch-toolbar" data-role="outliner-batch-bar" hidden>
        <span class="oc-batch-badge" data-role="batch-count">0 ${t("selected")}</span>
        <div class="oc-batch-actions">
          <button type="button" class="icon-button" data-act="batch-toggle-visibility" title="${t("Toggle visibility (H)")}"><i class="pi pi-eye"></i></button>
          <button type="button" class="icon-button" data-act="batch-toggle-lock" title="${t("Toggle lock (L)")}"><i class="pi pi-lock"></i></button>
          <button type="button" class="icon-button" data-act="batch-duplicate" title="${t("Duplicate selection (Shift+D)")}"><i class="pi pi-copy"></i></button>
          <button type="button" class="icon-button danger" data-act="batch-delete" title="${t("Delete selection (Del)")}"><i class="pi pi-trash"></i></button>
          <button type="button" class="icon-button" data-act="batch-deselect" title="${t("Deselect all (Alt+A)")}"><i class="pi pi-times"></i></button>
        </div>
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
      </div>
      <div class="oc-field-row"><span class="oc-field-label">${t("Upstream reference")}</span>
        <select data-role="reference-select"><option value="0">${t("Upstream 1")}</option></select>
      </div>
    </div>`;
}
