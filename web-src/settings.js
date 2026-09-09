// ComfyUI Settings integration for OmniCam: reading preferences and seeding a
// new Director node with them. The catalogue itself lives in settings/catalogue.js.
//
// Everything here is a *preference*: a default applied to newly created Director
// nodes, or a display choice. Nothing in this module changes a saved workflow --
// values already serialized on a node always win, because ComfyUI restores them
// after nodeCreated runs.

// `t` was used by applyDirectorDefaults() without being imported, so a quality
// downgrade threw a ReferenceError instead of showing its status message.
import { getLocale, registerLocale, setLocale, t } from "./i18n.js";
import { FR } from "./locales/fr.js";
import {
  SETTING_ADAPTIVE, SETTING_ASPECT_RATIO, SETTING_AUTO_KEY, SETTING_BG_COLOR, SETTING_BURN_IN,
  SETTING_CAMERA_VIEW_VISIBLE, SETTING_CARD_FIT, SETTING_DEFAULT_INTERP, SETTING_DOLLY_SENSITIVITY,
  SETTING_DURATION, SETTING_ENABLE_SHORTCUTS, SETTING_ENCODER, SETTING_EXTRACTOR_BACKEND,
  SETTING_FLY_SPEED, SETTING_FPS, SETTING_GIZMO_MODE, SETTING_GIZMO_SPACE, SETTING_GUIDES,
  SETTING_HEIGHT, SETTING_INVERT_ORBIT_Y, SETTING_LOCALE, SETTING_LOOP_PLAYBACK,
  SETTING_MONITOR_PROFILE, SETTING_NAVIGATION_PROFILE, SETTING_ORBIT_SENSITIVITY,
  SETTING_PAN_SENSITIVITY, SETTING_PLAYBLAST_GRID, SETTING_PLAYBLAST_QUALITY,
  SETTING_PLAYBLAST_RESOLUTION, SETTING_POINT_COLOR, SETTING_POINT_DENSITY, SETTING_POINT_SPREAD,
  SETTING_PREVIEW_LAYOUT, SETTING_QUALITY, SETTING_RENDER_MODE, SETTING_RESOLUTION_GATE,
  SETTING_SAFE_AREAS, SETTING_SELECT_MODE, SETTING_SHOW_CAMERA_GIZMOS, SETTING_SHOW_CAMERA_PATHS,
  SETTING_SHOW_GIZMO, SETTING_SHOW_GRID, SETTING_SHOW_HELPER_AXES, SETTING_SHOW_LOOK_AT,
  SETTING_SHOW_RADAR, SETTING_SHOW_VERTICES, SETTING_SHOW_WIREFRAME, SETTING_SNAP_ENABLED,
  SETTING_SNAP_FRAMES, SETTING_SNAP_GRID_SIZE, SETTING_SNAP_MODE, SETTING_SPEED_HEATMAP,
  SETTING_TIMECODE_MODE, SETTING_UI_DENSITY, SETTING_UNDO_LIMIT, SETTING_VIEW_MODE,
  SETTING_WIDTH, SETTING_ZOOM_SENSITIVITY,
  buildOmniCamSettings,
} from "./settings/catalogue.js";

export * from "./settings/catalogue.js";

/** The catalogue, with its two live-apply handlers wired to this module. */
export const OMNICAM_SETTINGS = buildOmniCamSettings({
  onLocaleChange: () => applyLocale(),
  onQualityChange: (value) => applyViewportQuality(value),
  onAdaptiveChange: () => applyViewportQuality(),
});

let appRef = null;

function readSetting(id, fallback) {
  try {
    const value = appRef?.extensionManager?.setting?.get(id);
    return value === undefined || value === null ? fallback : value;
  } catch {
    return fallback; // older frontends without extensionManager.setting
  }
}

export function writeSetting(id, value) {
  try {
    appRef?.extensionManager?.setting?.set?.(id, value);
  } catch (error) {
    console.warn("OmniCam: writeSetting failed", id, value, error);
  }
}

export function readSettingValue(id, fallback) {
  return readSetting(id, fallback);
}

export function resetOmniCamSettingsToDefaults() {
  for (const def of OMNICAM_SETTINGS) {
    if (def.defaultValue !== undefined) {
      writeSetting(def.id, def.defaultValue);
      def.onChange?.(def.defaultValue);
    }
  }
}

function numericSetting(id, fallback, minimum, maximum, integer = false) {
  const value = Number(readSetting(id, fallback));
  const bounded = Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback;
  return integer ? Math.round(bounded) : bounded;
}

function booleanSetting(id, fallback) {
  const value = readSetting(id, fallback);
  return typeof value === "boolean" ? value : fallback;
}

/** One of `allowed`, or the fallback: a stale stored value must not reach state. */
function choiceSetting(id, fallback, allowed) {
  const value = String(readSetting(id, fallback));
  return allowed.includes(value) ? value : fallback;
}

// ComfyUI's colour picker stores bare hex ("121212"), while the editor and its
// <input type="color"> want "#121212".
function colorSetting(id, fallback) {
  const value = String(readSetting(id, fallback) || "").trim();
  const hex = value.startsWith("#") ? value.slice(1) : value;
  return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex.toLowerCase()}` : fallback;
}

/** Resolve the active locale from the OmniCam setting, falling back to ComfyUI's. */
export function applyLocale() {
  const preference = String(readSetting(SETTING_LOCALE, "auto"));
  const comfyLocale = String(readSetting("Comfy.Locale", "en") || "en").slice(0, 2).toLowerCase();
  const next = preference === "auto" ? comfyLocale : preference;
  const changed = next !== getLocale();
  setLocale(next);
  if (!changed) return;
  // Templates resolve their t() strings once, at build time, so a live switch
  // only reaches the parts that re-render from state. Re-run those on every
  // mounted Director, and say plainly that the rest needs a reload rather than
  // leaving a half-translated UI with no explanation.
  for (const ui of liveDirectors) {
    if (ui.disposed) continue;
    try {
      ui.syncFromWidgets?.(false);
      ui.refreshKeys?.();
      ui.refreshObjects?.();
      ui.refreshInspector?.();
      ui.render?.();
      ui.setStatus?.(t("Language updated — reload the workflow to translate every label."));
    } catch (error) {
      console.warn("OmniCam: live locale refresh failed", error);
    }
  }
}

/** Every mounted Director, so a settings change reaches all of them at once. */
const liveDirectors = new Set();

export function registerDirector(ui) {
  liveDirectors.add(ui);
}

export function unregisterDirector(ui) {
  liveDirectors.delete(ui);
}

/** True while at least one Director UI is mounted; the key interceptor's fast path. */
export function anyDirectorsLive() {
  for (const ui of liveDirectors) {
    if (!ui.disposed) return true;
  }
  return false;
}

/** The mounted Director whose root contains `target`, or active interacting director. */
export function directorForTarget(target) {
  for (const ui of liveDirectors) {
    if (!ui.disposed && (ui.drag || ui.boxSelection || ui.gizmoDrag || ui.activePointerId != null)) {
      return ui;
    }
  }
  if (target instanceof Node) {
    for (const ui of liveDirectors) {
      if (!ui.disposed && ui.root?.contains(target)) return ui;
    }
  }
  if (liveDirectors.size === 1) {
    const [sole] = liveDirectors;
    if (sole && !sole.disposed) return sole;
  }
  return null;
}

export function viewportQuality() {
  return String(readSetting(SETTING_QUALITY, "balanced"));
}

export function adaptiveQualityEnabled() {
  return readSetting(SETTING_ADAPTIVE, true) !== false;
}

export function omniCamShortcutsEnabled() {
  return readSetting(SETTING_ENABLE_SHORTCUTS, true) !== false;
}

export function applyViewportQuality(quality = viewportQuality()) {
  for (const ui of liveDirectors) {
    if (ui.disposed) continue;
    // configureDirectorViewports() reapplies both the quality preset and the
    // adaptive-downgrade flag to the already-mounted viewports. DirectorUI has
    // no invalidate() (the old call here was a silent no-op), so repaint
    // through the real path instead.
    configureDirectorViewports(ui);
    if (ui.requestRender) ui.requestRender("quality");
    else ui.render?.();
    ui.renderCameraView?.();
  }
}

/** Preference-driven defaults for a *newly created* Director node. */
export function directorDefaults() {
  return {
    fps: numericSetting(SETTING_FPS, 24, 1, 120, true),
    durationSeconds: numericSetting(SETTING_DURATION, 5, 1, 120, true),
    width: numericSetting(SETTING_WIDTH, 1280, 64, 4096, true),
    height: numericSetting(SETTING_HEIGHT, 720, 64, 4096, true),
    renderMode: String(readSetting(SETTING_RENDER_MODE, "omni_ref")),
    encoder: String(readSetting(SETTING_ENCODER, "auto")),
    playblastResolution: choiceSetting(SETTING_PLAYBLAST_RESOLUTION, "output", ["viewport", "half", "output", "double"]),
    playblastQuality: choiceSetting(SETTING_PLAYBLAST_QUALITY, "balanced", ["low", "balanced", "high"]),
    playblastGrid: booleanSetting(SETTING_PLAYBLAST_GRID, false),

    pointDensity: choiceSetting(SETTING_POINT_DENSITY, "balanced", ["none", "sparse", "balanced", "dense", "ultra"]),
    pointSpread: choiceSetting(SETTING_POINT_SPREAD, "all_views", ["all_views", "ground_focus", "dome"]),
    pointColor: colorSetting(SETTING_POINT_COLOR, "#cbd5e1"),
    cardFit: choiceSetting(SETTING_CARD_FIT, "contain", ["contain", "cover", "stretch"]),
    backgroundColor: colorSetting(SETTING_BG_COLOR, "#121212"),

    showGrid: booleanSetting(SETTING_SHOW_GRID, true),
    showRadar: booleanSetting(SETTING_SHOW_RADAR, false),
    showCameraPaths: booleanSetting(SETTING_SHOW_CAMERA_PATHS, true),
    showCameraGizmos: booleanSetting(SETTING_SHOW_CAMERA_GIZMOS, true),
    showLookAt: booleanSetting(SETTING_SHOW_LOOK_AT, true),
    showHelperAxes: booleanSetting(SETTING_SHOW_HELPER_AXES, true),
    showGizmo: booleanSetting(SETTING_SHOW_GIZMO, true),
    guides: booleanSetting(SETTING_GUIDES, true),
    safeAreas: booleanSetting(SETTING_SAFE_AREAS, false),
    resolutionGate: booleanSetting(SETTING_RESOLUTION_GATE, false),
    aspectRatio: choiceSetting(SETTING_ASPECT_RATIO, "auto", ["auto", "16:9", "4:3", "1:1", "9:16", "2.39:1"]),
    burnIn: booleanSetting(SETTING_BURN_IN, false),
    speedHeatmap: booleanSetting(SETTING_SPEED_HEATMAP, false),
    showWireframe: booleanSetting(SETTING_SHOW_WIREFRAME, false),
    showVertices: booleanSetting(SETTING_SHOW_VERTICES, false),

    selectMode: choiceSetting(SETTING_SELECT_MODE, "object", ["object", "vertex", "edge", "face"]),
    gizmoMode: choiceSetting(SETTING_GIZMO_MODE, "translate", ["translate", "rotate", "scale"]),
    gizmoSpace: choiceSetting(SETTING_GIZMO_SPACE, "world", ["world", "local"]),
    spatialSnapMode: choiceSetting(SETTING_SNAP_MODE, "none", ["none", "grid", "vertex"]),
    spatialGridSize: numericSetting(SETTING_SNAP_GRID_SIZE, 0.5, 0.01, 100),

    navigationProfile: choiceSetting(SETTING_NAVIGATION_PROFILE, "maya", ["maya", "blender"]),
    flySpeed: numericSetting(SETTING_FLY_SPEED, 1, 0.05, 5),
    invertOrbitY: booleanSetting(SETTING_INVERT_ORBIT_Y, false),
    zoomSensitivity: numericSetting(SETTING_ZOOM_SENSITIVITY, 1, 0.2, 3),
    orbitSensitivity: numericSetting(SETTING_ORBIT_SENSITIVITY, 1, 0.2, 3),
    panSensitivity: numericSetting(SETTING_PAN_SENSITIVITY, 1, 0.2, 3),
    dollySensitivity: numericSetting(SETTING_DOLLY_SENSITIVITY, 1, 0.2, 3),
    viewMode: choiceSetting(SETTING_VIEW_MODE, "camera", ["camera", "perspective", "front", "back", "top", "bottom", "right", "left"]),

    snapEnabled: booleanSetting(SETTING_SNAP_ENABLED, true),
    snapFrames: numericSetting(SETTING_SNAP_FRAMES, 1, 1, 24, true),
    autoKey: booleanSetting(SETTING_AUTO_KEY, false),
    defaultInterpolation: choiceSetting(SETTING_DEFAULT_INTERP, "ease", ["ease", "smooth", "bezier", "linear", "ease_in", "ease_out", "hold"]),
    timecodeMode: choiceSetting(SETTING_TIMECODE_MODE, "time", ["time", "timecode"]),
    loopPlayback: booleanSetting(SETTING_LOOP_PLAYBACK, false),

    uiDensity: choiceSetting(SETTING_UI_DENSITY, "advanced", ["basic", "animation", "advanced"]),
    previewLayout: choiceSetting(SETTING_PREVIEW_LAYOUT, "auto", ["auto", "1", "2", "4"]),
    cameraViewVisible: booleanSetting(SETTING_CAMERA_VIEW_VISIBLE, true),

    undoLimit: numericSetting(SETTING_UNDO_LIMIT, 100, 10, 500, true),

    extractorBackend: choiceSetting(SETTING_EXTRACTOR_BACKEND, "dpvo", ["dpvo", "pycolmap"]),
    monitorProfile: choiceSetting(SETTING_MONITOR_PROFILE, "wan_camera_native", ["wan_camera_native", "minimax_h3", "ltx_motion", "generic_video"]),
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
/**
 * Push the quality preferences onto a Director's WebGL viewports.
 *
 * The viewports are created asynchronously (three.js is loaded on demand), so
 * they are usually still null when applyDirectorDefaults runs. The Director
 * calls this again once they exist -- otherwise a fresh node would ignore the
 * quality preference until the next time it changed.
 */
export function configureDirectorViewports(ui) {
  const quality = viewportQuality();
  const adaptive = adaptiveQualityEnabled();
  for (const viewport of [ui.webgl, ui.cameraWebgl]) {
    if (!viewport) continue;
    viewport.adaptiveQuality = adaptive;
    viewport.onQualityDowngrade = (level) => ui.setStatus?.(
      t("Studio quality lowered to {level} to keep the viewport responsive").replace("{level}", level));
    viewport.setViewportQuality?.(quality);
  }
}

export function registerDirectorRuntime(ui) {
  registerDirector(ui);
  configureDirectorViewports(ui);
}

export function seedDirectorDefaults(ui) {
  const defaults = directorDefaults();
  if (ui.fpsWidget) ui.fpsWidget.value = defaults.fps;
  if (ui.durationWidget) ui.durationWidget.value = defaults.durationSeconds;
  if (ui.widthWidget) ui.widthWidget.value = defaults.width;
  if (ui.heightWidget) ui.heightWidget.value = defaults.height;
  if (ui.modeWidget) ui.modeWidget.value = defaults.renderMode;
  const encoder = ui.root?.querySelector('[data-role="encoder"]');
  if (encoder) encoder.value = defaults.encoder;
  ui.cameraSpeed = defaults.flySpeed;
  ui.history && (ui.history.limit = defaults.undoLimit);
  Object.assign(ui.state, {
    playblast_resolution: defaults.playblastResolution,
    playblast_quality: defaults.playblastQuality,
    playblast_grid: defaults.playblastGrid,

    point_density: defaults.pointDensity,
    point_spread: defaults.pointSpread,
    point_color: defaults.pointColor,
    card_fit: defaults.cardFit,
    viewport_bg_color: defaults.backgroundColor,

    show_grid: defaults.showGrid,
    show_radar: defaults.showRadar,
    show_camera_paths: defaults.showCameraPaths,
    show_camera_gizmos: defaults.showCameraGizmos,
    show_look_at: defaults.showLookAt,
    show_helper_axes: defaults.showHelperAxes,
    show_gizmo: defaults.showGizmo,
    guides: defaults.guides,
    safe_areas: defaults.safeAreas,
    resolution_gate: defaults.resolutionGate,
    aspect_ratio: defaults.aspectRatio,
    burn_in: defaults.burnIn,
    speed_heatmap: defaults.speedHeatmap,
    show_wireframe: defaults.showWireframe,
    show_vertices: defaults.showVertices,

    select_mode: defaults.selectMode,
    gizmo_mode: defaults.gizmoMode,
    gizmo_space: defaults.gizmoSpace,
    spatial_snap_mode: defaults.spatialSnapMode,
    spatial_grid_size: defaults.spatialGridSize,

    navigation_profile: defaults.navigationProfile,
    invert_orbit_y: defaults.invertOrbitY,
    zoom_sensitivity: defaults.zoomSensitivity,
    orbit_sensitivity: defaults.orbitSensitivity,
    pan_sensitivity: defaults.panSensitivity,
    dolly_sensitivity: defaults.dollySensitivity,
    view_mode: defaults.viewMode,

    snap_enabled: defaults.snapEnabled,
    snap_frames: defaults.snapFrames,
    auto_key: defaults.autoKey,
    default_interpolation: defaults.defaultInterpolation,
    timecode_mode: defaults.timecodeMode,
    loop_playback: defaults.loopPlayback,

    ui_density: defaults.uiDensity,
    preview_layout: defaults.previewLayout,
    camera_view_visible: defaults.cameraViewVisible,

    extractor_backend: defaults.extractorBackend,
    monitor_profile: defaults.monitorProfile,
  });
  ui.syncFromWidgets?.();
}

// Compatibility facade for callers that intentionally initialize a brand-new
// Director in one step. Workflow restoration must call only the runtime half.
export function applyDirectorDefaults(ui) {
  registerDirectorRuntime(ui);
  seedDirectorDefaults(ui);
}
