// Left panel: scene structure. Everything that browses or restructures the
// scene -- search, the add-object menu, the category filter chips, batch
// actions and the object tree itself -- lives here, out of the right-hand
// contextual Inspector.
//
// The panel carries two tabs: SCENE (the outliner, unchanged) and ASSETS (the
// unified-catalog browser, driven by web-src/assets/panel.js). Selectors under
// SCENE moved verbatim from panels/outliner-panel.js so every existing event
// binding in event-bindings/ and scene/outliner.js keeps working; only their
// DOM home changed.

import { t } from "../i18n.js";
import {
  sphereIcon,
  cubeIcon,
  pyramidIcon,
  sunLightIcon,
  pointLightIcon,
  spotLightIcon,
  cameraIcon,
  assetsIcon,
} from "./object-icons.js";

// Markup only -- all imperative wiring (provider status, credential
// Replace/Remove/Test, Preview/Apply/Cancel) lives in web-src/agent/panel.js,
// lazy-loaded the first time this tab is opened (see assets/panel.js's
// switchView(), which owns tab visibility for all three left-panel tabs).
function agentTabMarkup() {
  return `
    <div class="oc-left-body oc-assets" data-role="agent-tab" hidden>
      <div class="oc-asset-panel" data-role="agent-panel">
        <div class="oc-asset-toolbar" data-role="agent-model-row">
          <select class="oc-search" data-role="agent-model-select" aria-label="${t("Model")}">
            <option value="">${t("Loading models...")}</option>
          </select>
          <button type="button" class="icon-button" data-agent-act="model-refresh"
                  title="${t("Refresh model list")}"><i class="pi pi-refresh"></i></button>
        </div>
        <div class="oc-asset-toolbar" data-role="agent-credential-row">
          <span class="oc-asset-status hint" data-role="agent-provider-label"></span>
          <span class="oc-asset-status hint" data-role="agent-credential-status"></span>
          <button type="button" class="icon-button" data-agent-act="credential-replace"
                  title="${t("Set credential")}"><i class="pi pi-key"></i></button>
          <button type="button" class="icon-button" data-agent-act="credential-remove"
                  title="${t("Remove credential")}"><i class="pi pi-trash"></i></button>
          <button type="button" class="icon-button" data-agent-act="credential-test"
                  title="${t("Test connection")}"><i class="pi pi-bolt"></i></button>
        </div>
        <div class="oc-asset-toolbar" data-role="agent-credential-form" hidden>
          <input class="oc-search" data-role="agent-credential-input" type="password" autocomplete="new-password"
                 placeholder="${t("Paste API key...")}" aria-label="${t("Credential")}">
          <button type="button" class="oc-btn oc-btn--primary" data-agent-act="credential-save">${t("Save")}</button>
        </div>
        <p class="oc-asset-status hint" data-role="agent-hint"></p>
        <textarea class="oc-search oc-agent-describe" data-role="agent-describe" rows="2"
                  placeholder="${t("Describe the shot...")}" aria-label="${t("Describe the shot")}"></textarea>
        <div class="oc-asset-toolbar">
          <strong>${t("Planned changes")}</strong>
        </div>
        <ul class="oc-asset-status hint" data-role="agent-plan" style="list-style:none;padding:0;margin:0"></ul>
        <div class="oc-asset-foot">
          <button type="button" class="oc-btn" data-agent-act="preview">${t("Preview")}</button>
          <button type="button" class="oc-btn oc-btn--primary" data-agent-act="apply" disabled>${t("Apply")}</button>
          <button type="button" class="oc-btn" data-agent-act="cancel" disabled>${t("Cancel")}</button>
        </div>
      </div>
    </div>`;
}

function assetsTabMarkup() {
  return `
    <div class="oc-left-body oc-assets" data-role="assets-tab" hidden>
      <div class="oc-asset-panel" data-role="assets-panel">
        <div class="oc-asset-toolbar">
          <input class="oc-search" data-role="asset-search" type="search"
                 placeholder="${t("Search assets...")}" aria-label="${t("Search assets")}">
          <button type="button" class="icon-button" data-asset-act="asset-import"
                  title="${t("Import 3D Model (+)")}"><i class="pi pi-upload"></i></button>
          <button type="button" class="icon-button" data-asset-act="local-toggle"
                  title="${t("Install a character pack you downloaded (Quaternius / local)")}"><i class="pi pi-folder-open"></i></button>
        </div>
        <div class="oc-asset-local" data-role="asset-local-form" hidden>
          <input class="oc-search" data-role="asset-local-folder" type="text"
                 placeholder="${t("Absolute path to the extracted pack folder")}" spellcheck="false">
          <input class="oc-search" data-role="asset-local-note" type="text"
                 placeholder="${t("License note (e.g. Quaternius QAL v1.0)")}" spellcheck="false">
          <div class="oc-asset-local-actions">
            <button type="button" class="oc-btn" data-asset-act="local-scan">${t("Scan")}</button>
            <button type="button" class="oc-btn oc-btn--primary" data-asset-act="local-install">${t("Install characters")}</button>
          </div>
        </div>
        <div class="oc-asset-kinds" data-role="asset-kinds"></div>
        <div class="oc-asset-grid" data-role="asset-grid"></div>
        <div class="oc-asset-foot">
          <button type="button" class="oc-btn" data-asset-act="asset-add">${t("Add to scene")}</button>
          <span class="oc-asset-status hint" data-role="asset-status"></span>
        </div>
        <input type="file" data-role="asset-import-file" accept=".glb,.fbx" hidden>
      </div>
    </div>`;
}

export function leftPanelMarkup() {
  return `
    <aside class="oc-left" data-role="scene-panel" aria-label="${t("Scene")}">
      <div class="oc-left-tabs" data-role="left-tabs" role="tablist">
        <button type="button" class="oc-left-tab active" data-asset-view="scene" role="tab">${t("Scene")}</button>
        <button type="button" class="oc-left-tab" data-asset-view="assets" role="tab">${t("Assets")}</button>
        <button type="button" class="oc-left-tab" data-asset-view="agent" role="tab">${t("Agent")}</button>
      </div>
      <div class="oc-left-body" data-role="scene-tab">
      <div class="oc-panel-head">
        <strong>${t("Scene")}</strong>
        <span class="oc-panel-spacer"></span>
        <button class="icon-button" data-act="add-camera" title="${t("Create camera from current view")}"><i class="pi pi-video"></i></button>
        <button class="icon-button" data-act="load-model" title="${t("Import 3D Model (+)")}"><i class="pi pi-plus"></i></button>
      </div>
      <input class="oc-search" data-role="outliner-search" type="search" placeholder="${t("Search")}" aria-label="${t("Filter the outliner")}">
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
      </div>
      ${assetsTabMarkup()}
      ${agentTabMarkup()}
    </aside>`;
}
