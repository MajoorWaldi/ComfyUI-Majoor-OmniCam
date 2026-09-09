// In-editor Preferences modal for OmniCam Director.
// Allows quick inspection and adjustment of OmniCam settings directly from the node.

import { t } from "../i18n.js";
import {
  OMNICAM_SETTINGS,
  readSettingValue,
  resetOmniCamSettingsToDefaults,
  writeSetting,
  SETTING_LOCALE,
  SETTING_QUALITY,
  SETTING_ADAPTIVE,
  SETTING_BG_COLOR,
  SETTING_NAVIGATION_PROFILE,
  SETTING_FLY_SPEED,
  SETTING_INVERT_ORBIT_Y,
  SETTING_ZOOM_SENSITIVITY,
  SETTING_ORBIT_SENSITIVITY,
  SETTING_PAN_SENSITIVITY,
  SETTING_DOLLY_SENSITIVITY,
  SETTING_ENABLE_SHORTCUTS,
  SETTING_SHOW_GRID,
  SETTING_SHOW_CAMERA_PATHS,
  SETTING_SHOW_CAMERA_GIZMOS,
  SETTING_SHOW_LOOK_AT,
  SETTING_SHOW_HELPER_AXES,
  SETTING_GUIDES,
  SETTING_SAFE_AREAS,
  SETTING_RESOLUTION_GATE,
  SETTING_ASPECT_RATIO,
  SETTING_SHOW_WIREFRAME,
  SETTING_SHOW_VERTICES,
  SETTING_CAMERA_VIEW_VISIBLE,
  SETTING_UI_DENSITY,
  SETTING_DEFAULT_INTERP,
  SETTING_AUTO_KEY,
  SETTING_SNAP_ENABLED,
  SETTING_SNAP_FRAMES,
  SETTING_TIMECODE_MODE,
  SETTING_LOOP_PLAYBACK,
  SETTING_UNDO_LIMIT,
  SETTING_FPS,
  SETTING_DURATION,
  SETTING_WIDTH,
  SETTING_HEIGHT,
  SETTING_RENDER_MODE,
  SETTING_ENCODER,
  SETTING_PLAYBLAST_RESOLUTION,
  SETTING_PLAYBLAST_QUALITY,
  SETTING_EXTRACTOR_BACKEND,
  SETTING_MONITOR_PROFILE,
} from "../settings.js";

const PREFERENCES_ICON = "🔘";

const PREF_TABS = [
  { id: "nav", label: () => t("Navigation & Controls"), icon: "pi-compass" },
  { id: "view", label: () => t("Display & Viewport"), icon: "pi-eye" },
  { id: "time", label: () => t("Timeline & Keys"), icon: "pi-clock" },
  { id: "defaults", label: () => t("Defaults & Pipeline"), icon: "pi-sliders-h" },
];

function triggerSettingChange(id, value) {
  const def = OMNICAM_SETTINGS.find((s) => s.id === id);
  def?.onChange?.(value);
}

function renderField(def) {
  const current = readSettingValue(def.id, def.defaultValue);
  const idAttr = `pref_${def.id.replace(/[^a-zA-Z0-9]/g, "_")}`;

  if (def.type === "boolean") {
    return `
      <div class="oc-pref-row toggle-row" title="${def.tooltip || ""}">
        <label for="${idAttr}" class="oc-pref-label">${t(def.name)}</label>
        <input type="checkbox" id="${idAttr}" data-setting-id="${def.id}" ${current ? "checked" : ""}>
      </div>`;
  }

  if (def.type === "combo") {
    const opts = (def.options || []).map((opt) => {
      const val = typeof opt === "object" ? opt.value : opt;
      const text = typeof opt === "object" ? opt.text : opt;
      const sel = String(current) === String(val) ? "selected" : "";
      return `<option value="${val}" ${sel}>${t(text)}</option>`;
    }).join("");
    return `
      <div class="oc-pref-row" title="${def.tooltip || ""}">
        <label for="${idAttr}" class="oc-pref-label">${t(def.name)}</label>
        <select id="${idAttr}" data-setting-id="${def.id}">${opts}</select>
      </div>`;
  }

  if (def.type === "slider") {
    const min = def.attrs?.min ?? 0;
    const max = def.attrs?.max ?? 100;
    const step = def.attrs?.step ?? 1;
    return `
      <div class="oc-pref-row slider-row" title="${def.tooltip || ""}">
        <label for="${idAttr}" class="oc-pref-label">${t(def.name)}</label>
        <div class="oc-pref-slider-group">
          <input type="range" id="${idAttr}" data-setting-id="${def.id}" min="${min}" max="${max}" step="${step}" value="${current}">
          <span class="oc-pref-val" data-val-for="${def.id}">${current}</span>
        </div>
      </div>`;
  }

  if (def.type === "color") {
    const hex = String(current || "121212").startsWith("#") ? String(current) : `#${current}`;
    return `
      <div class="oc-pref-row" title="${def.tooltip || ""}">
        <label for="${idAttr}" class="oc-pref-label">${t(def.name)}</label>
        <input type="color" id="${idAttr}" data-setting-id="${def.id}" value="${hex}">
      </div>`;
  }

  return "";
}

function getTabFields(tabId) {
  const settingMap = new Map(OMNICAM_SETTINGS.map((s) => [s.id, s]));
  const idsByTab = {
    nav: [
      SETTING_NAVIGATION_PROFILE,
      SETTING_FLY_SPEED,
      SETTING_INVERT_ORBIT_Y,
      SETTING_ZOOM_SENSITIVITY,
      SETTING_ORBIT_SENSITIVITY,
      SETTING_PAN_SENSITIVITY,
      SETTING_DOLLY_SENSITIVITY,
      SETTING_ENABLE_SHORTCUTS,
      SETTING_LOCALE,
    ],
    view: [
      SETTING_QUALITY,
      SETTING_ADAPTIVE,
      SETTING_BG_COLOR,
      SETTING_UI_DENSITY,
      SETTING_CAMERA_VIEW_VISIBLE,
      SETTING_SHOW_GRID,
      SETTING_SHOW_CAMERA_PATHS,
      SETTING_SHOW_CAMERA_GIZMOS,
      SETTING_SHOW_LOOK_AT,
      SETTING_SHOW_HELPER_AXES,
      SETTING_GUIDES,
      SETTING_SAFE_AREAS,
      SETTING_RESOLUTION_GATE,
      SETTING_ASPECT_RATIO,
      SETTING_SHOW_WIREFRAME,
      SETTING_SHOW_VERTICES,
    ],
    time: [
      SETTING_DEFAULT_INTERP,
      SETTING_AUTO_KEY,
      SETTING_SNAP_ENABLED,
      SETTING_SNAP_FRAMES,
      SETTING_TIMECODE_MODE,
      SETTING_LOOP_PLAYBACK,
      SETTING_UNDO_LIMIT,
    ],
    defaults: [
      SETTING_FPS,
      SETTING_DURATION,
      SETTING_WIDTH,
      SETTING_HEIGHT,
      SETTING_RENDER_MODE,
      SETTING_ENCODER,
      SETTING_PLAYBLAST_RESOLUTION,
      SETTING_PLAYBLAST_QUALITY,
      SETTING_EXTRACTOR_BACKEND,
      SETTING_MONITOR_PROFILE,
    ],
  };

  return (idsByTab[tabId] || []).map((id) => settingMap.get(id)).filter(Boolean);
}

export function preferenceTabFieldIds(tabId) {
  return getTabFields(tabId).map((def) => def.id);
}

export function preferencesTitleMarkup() {
  return `<span class="oc-pref-emoji" aria-hidden="true">${PREFERENCES_ICON}</span> ${t("OmniCam Preferences")}`;
}

export function openPreferencesModal(ui) {
  const existing = ui.root.querySelector(".oc-modal-backdrop");
  if (existing) {
    existing.querySelector(".oc-pref-dialog")?.focus();
    return;
  }

  const backdrop = document.createElement("div");
  backdrop.className = "oc-modal-backdrop";
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  backdrop.setAttribute("aria-label", t("OmniCam Preferences"));

  backdrop.innerHTML = `
    <div class="oc-modal-dialog oc-pref-dialog" tabindex="-1">
      <div class="oc-pref-header">
        <div class="oc-pref-title">${preferencesTitleMarkup()}</div>
        <button type="button" class="icon-button oc-pref-close" title="${t("Close")}"><i class="pi pi-times"></i></button>
      </div>
      <div class="oc-pref-tabs">
        ${PREF_TABS.map((tab, i) => `
          <button type="button" class="oc-pref-tab ${i === 0 ? "active" : ""}" data-tab="${tab.id}">
            <i class="pi ${tab.icon}"></i> <span>${tab.label()}</span>
          </button>
        `).join("")}
      </div>
      <div class="oc-pref-content">
        ${PREF_TABS.map((tab, i) => `
          <div class="oc-pref-pane ${i === 0 ? "active" : ""}" data-pane="${tab.id}">
            ${getTabFields(tab.id).map(renderField).join("")}
          </div>
        `).join("")}
      </div>
      <div class="oc-pref-footer">
        <button type="button" class="secondary" data-pref-act="reset-defaults">
          <i class="pi pi-undo"></i> ${t("Reset to Defaults")}
        </button>
        <span class="oc-pref-spacer"></span>
        <button type="button" class="primary" data-pref-act="close-dialog">${t("Done")}</button>
      </div>
    </div>
  `;

  const close = () => {
    backdrop.remove();
    ui.root.focus?.();
  };

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop || e.target.closest(".oc-pref-close, [data-pref-act='close-dialog']")) {
      close();
    }
  });

  backdrop.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
    }
  });

  // Tab switching
  backdrop.querySelectorAll(".oc-pref-tab").forEach((tabBtn) => {
    tabBtn.addEventListener("click", () => {
      const tabId = tabBtn.dataset.tab;
      backdrop.querySelectorAll(".oc-pref-tab").forEach((b) => b.classList.toggle("active", b === tabBtn));
      backdrop.querySelectorAll(".oc-pref-pane").forEach((p) => p.classList.toggle("active", p.dataset.pane === tabId));
    });
  });

  // Change listener for inputs
  backdrop.addEventListener("input", (e) => {
    const input = e.target;
    const settingId = input.dataset.settingId;
    if (!settingId) return;

    let value;
    if (input.type === "checkbox") {
      value = input.checked;
    } else if (input.type === "range" || input.type === "number") {
      value = Number(input.value);
      const valDisplay = backdrop.querySelector(`[data-val-for="${settingId}"]`);
      if (valDisplay) valDisplay.textContent = String(value);
    } else {
      value = input.value;
    }

    writeSetting(settingId, value);
    triggerSettingChange(settingId, value);
  });

  // Reset to defaults
  backdrop.querySelector('[data-pref-act="reset-defaults"]')?.addEventListener("click", () => {
    resetOmniCamSettingsToDefaults();
    // Refresh dialog fields
    for (const def of OMNICAM_SETTINGS) {
      const input = backdrop.querySelector(`[data-setting-id="${def.id}"]`);
      if (!input) continue;
      const val = def.defaultValue;
      if (input.type === "checkbox") {
        input.checked = Boolean(val);
      } else {
        input.value = String(val);
        const valDisplay = backdrop.querySelector(`[data-val-for="${def.id}"]`);
        if (valDisplay) valDisplay.textContent = String(val);
      }
    }
    ui.setStatus?.(t("Preferences reset to defaults"));
  });

  ui.root.appendChild(backdrop);
  backdrop.querySelector(".oc-modal-dialog")?.focus();
}
