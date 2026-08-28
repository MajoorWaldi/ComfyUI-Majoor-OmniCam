// ComfyUI Settings integration for OmniCam.
//
// Everything here is a *preference*: a default applied to newly created Director
// nodes, or a display choice. Nothing in this module changes a saved workflow --
// values already serialized on a node always win, because ComfyUI restores them
// after nodeCreated runs.

import { registerLocale, setLocale } from "./omnicam-i18n.js";
import { FR } from "./locales/fr.js";

export const SETTING_LOCALE = "MajoorOmniCam.Locale";
export const SETTING_FPS = "MajoorOmniCam.Defaults.Fps";
export const SETTING_RENDER_MODE = "MajoorOmniCam.Defaults.RenderMode";
export const SETTING_ENCODER = "MajoorOmniCam.Defaults.Encoder";
export const SETTING_QUALITY = "MajoorOmniCam.Viewport.Quality";
export const SETTING_ADAPTIVE = "MajoorOmniCam.Viewport.Adaptive";

const CATEGORY = ["OmniCam", "Director"];

export const OMNICAM_SETTINGS = [
  {
    id: SETTING_LOCALE,
    category: [...CATEGORY, "Language"],
    name: "Viewport language",
    tooltip: "Language of the OmniCam Director viewport. 'Follow ComfyUI' uses the ComfyUI locale.",
    type: "combo",
    options: [
      { text: "Follow ComfyUI", value: "auto" },
      { text: "English", value: "en" },
      { text: "Français", value: "fr" },
    ],
    defaultValue: "auto",
    onChange: () => applyLocale(),
  },
  {
    id: SETTING_FPS,
    category: [...CATEGORY, "Defaults"],
    name: "Default FPS",
    tooltip: "Frame rate applied to newly created Director nodes.",
    type: "slider",
    attrs: { min: 1, max: 120, step: 1 },
    defaultValue: 24,
  },
  {
    id: SETTING_RENDER_MODE,
    category: [...CATEGORY, "Defaults"],
    name: "Default proxy render mode",
    tooltip: "Render mode applied to newly created Director nodes.",
    type: "combo",
    options: ["omni_ref", "graybox", "grid", "point_field", "wireframe", "card_grid", "beauty"],
    defaultValue: "omni_ref",
  },
  {
    id: SETTING_QUALITY,
    category: [...CATEGORY, "Viewport"],
    name: "Studio quality",
    tooltip: "Image-based lighting and soft shadows in the editing viewport. Lower it on a modest GPU.",
    type: "combo",
    options: [
      { text: "Low (no shadows)", value: "low" },
      { text: "Balanced", value: "balanced" },
      { text: "High (2048px shadows)", value: "high" },
    ],
    defaultValue: "balanced",
    onChange: (value) => applyViewportQuality(value),
  },
  {
    id: SETTING_ADAPTIVE,
    category: [...CATEGORY, "Viewport"],
    name: "Drop quality when the viewport stutters",
    tooltip: "Steps the studio quality down automatically if navigation falls below ~40fps, and leaves it there for the session.",
    type: "boolean",
    defaultValue: true,
  },
  {
    id: SETTING_ENCODER,
    category: [...CATEGORY, "Defaults"],
    name: "Default playblast encoder",
    tooltip: "WebCodecs is deterministic; realtime is the MediaRecorder fallback.",
    type: "combo",
    options: [
      { text: "WebCodecs (deterministic)", value: "auto" },
      { text: "Realtime fallback", value: "realtime" },
    ],
    defaultValue: "auto",
  },
];

let appRef = null;

function readSetting(id, fallback) {
  try {
    const value = appRef?.extensionManager?.setting?.get(id);
    return value === undefined || value === null ? fallback : value;
  } catch {
    return fallback; // older frontends without extensionManager.setting
  }
}

/** Resolve the active locale from the OmniCam setting, falling back to ComfyUI's. */
export function applyLocale() {
  const preference = String(readSetting(SETTING_LOCALE, "auto"));
  const comfyLocale = String(readSetting("Comfy.Locale", "en") || "en").slice(0, 2).toLowerCase();
  setLocale(preference === "auto" ? comfyLocale : preference);
}

/** Every mounted Director, so a settings change reaches all of them at once. */
const liveDirectors = new Set();

export function registerDirector(ui) {
  liveDirectors.add(ui);
}

export function unregisterDirector(ui) {
  liveDirectors.delete(ui);
}

export function viewportQuality() {
  return String(readSetting(SETTING_QUALITY, "balanced"));
}

export function adaptiveQualityEnabled() {
  return readSetting(SETTING_ADAPTIVE, true) !== false;
}

export function applyViewportQuality(quality = viewportQuality()) {
  for (const ui of liveDirectors) {
    ui.webgl?.setViewportQuality?.(quality);
    ui.cameraWebgl?.setViewportQuality?.(quality);
    ui.invalidate?.();
  }
}

/** Preference-driven defaults for a *newly created* Director node. */
export function directorDefaults() {
  return {
    fps: Number(readSetting(SETTING_FPS, 24)) || 24,
    renderMode: String(readSetting(SETTING_RENDER_MODE, "omni_ref")),
    encoder: String(readSetting(SETTING_ENCODER, "auto")),
  };
}

export function registerOmniCamLocales(app) {
  appRef = app;
  registerLocale("fr", FR);
  applyLocale();
}

/**
 * Apply the preference defaults to a freshly created node. A workflow load
 * overwrites these afterwards, which is the intended precedence.
 */
export function applyDirectorDefaults(ui) {
  registerDirector(ui);
  const quality = viewportQuality();
  const adaptive = adaptiveQualityEnabled();
  for (const viewport of [ui.webgl, ui.cameraWebgl]) {
    if (!viewport) continue;
    viewport.adaptiveQuality = adaptive;
    viewport.onQualityDowngrade = (level) => ui.setStatus?.(
      t("Studio quality lowered to {level} to keep the viewport responsive").replace("{level}", level));
    viewport.setViewportQuality?.(quality);
  }
  const defaults = directorDefaults();
  if (ui.fpsWidget) ui.fpsWidget.value = defaults.fps;
  if (ui.modeWidget) ui.modeWidget.value = defaults.renderMode;
  const encoder = ui.root?.querySelector('[data-role="encoder"]');
  if (encoder) encoder.value = defaults.encoder;
  ui.syncFromWidgets?.();
}
