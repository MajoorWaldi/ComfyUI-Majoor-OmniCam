// Event bindings and settings sync for reconstruction DOM controls.

// Mirrors omnicam/reconstruction/settings.py::QUALITY_PRESETS exactly (only
// the two fields this panel exposes as separate number inputs). "custom" has
// no entry there and none here either -- it is the one quality that keeps
// whatever the user typed into those two fields.
const QUALITY_PRESETS = {
  fast: { triangle_budget: 40_000, discontinuity_threshold: 0.06 },
  balanced: { triangle_budget: 120_000, discontinuity_threshold: 0.04 },
  high: { triangle_budget: 250_000, discontinuity_threshold: 0.03 },
};

/**
 * Keep the Triangle Budget / Edge Threshold inputs from lying about what a
 * fast/balanced/high run will actually use: the backend (geometry.py)
 * resolves both fields from the quality preset for every quality except
 * "custom", so editing them while on a preset quality would change what's
 * displayed without changing what runs. Disabling them documents that, and
 * writing the preset's own values keeps the display honest; "custom" hands
 * both fields back to the user.
 */
export function applyQualityPreset(root, quality) {
  if (!root) return;
  const budgetEl = root.querySelector('[data-role="reconstruction-triangle-budget"]');
  const thresholdEl = root.querySelector('[data-role="reconstruction-edge-threshold"]');
  const preset = QUALITY_PRESETS[quality];

  if (budgetEl) {
    budgetEl.disabled = Boolean(preset);
    if (preset) budgetEl.value = String(preset.triangle_budget);
  }
  if (thresholdEl) {
    thresholdEl.disabled = Boolean(preset);
    if (preset) thresholdEl.value = String(preset.discontinuity_threshold);
  }
}

export function readReconstructionSettings(root) {
  if (!root) return {};

  const getVal = (role) => root.querySelector(`[data-role="${role}"]`)?.value;
  const getChecked = (role) => Boolean(root.querySelector(`[data-role="${role}"]`)?.checked);

  return {
    provider: getVal("reconstruction-provider") || "comfy_moge",
    mode: getVal("reconstruction-mode") || "geometry",
    quality: getVal("reconstruction-quality") || "balanced",
    checkpoint: getVal("reconstruction-checkpoint") || "auto",
    recover_fov: getChecked("reconstruction-recover-fov"),
    source_texture: getChecked("reconstruction-source-texture"),
    detect_ground: getChecked("reconstruction-detect-ground"),
    detect_walls: getChecked("reconstruction-detect-walls"),
    triangle_budget: Number(getVal("reconstruction-triangle-budget")) || 120000,
    // The backend field is discontinuity_threshold (ReconstructionSettings);
    // "edge_threshold" is only the DOM role name.
    discontinuity_threshold: Number(getVal("reconstruction-edge-threshold")) || 0.04,
    scene_scale: Number(getVal("reconstruction-scene-scale")) || 1.0,
  };
}

export function bindReconstructionControls(
  root,
  {
    onRun = () => {},
    onStop = () => {},
    onOpenDirector = () => {},
    onSettingsChange = () => {},
    listen = (target, event, handler) => target?.addEventListener?.(event, handler),
  } = {}
) {
  if (!root) return () => {};

  const unbinders = [];
  const track = (target, event, handler) => {
    listen(target, event, handler);
    unbinders.push(() => target?.removeEventListener?.(event, handler));
  };

  const roles = [
    "reconstruction-provider",
    "reconstruction-mode",
    "reconstruction-quality",
    "reconstruction-checkpoint",
    "reconstruction-recover-fov",
    "reconstruction-source-texture",
    "reconstruction-detect-ground",
    "reconstruction-detect-walls",
    "reconstruction-triangle-budget",
    "reconstruction-edge-threshold",
    "reconstruction-scene-scale",
  ];

  const handleInput = () => {
    const current = readReconstructionSettings(root);
    onSettingsChange(current);
  };

  for (const role of roles) {
    const el = root.querySelector(`[data-role="${role}"]`);
    if (!el) continue;
    const evtName = el.tagName === "SELECT" || el.type === "checkbox" ? "change" : "input";
    track(el, evtName, handleInput);
  }

  const qualityEl = root.querySelector('[data-role="reconstruction-quality"]');
  if (qualityEl) {
    track(qualityEl, "change", () => {
      applyQualityPreset(root, qualityEl.value);
      handleInput();
    });
  }
  // Sync once at bind time -- the DOM's own hardcoded defaults (120000/0.04)
  // happen to match "balanced", but the disabled state and the guarantee
  // that a redraw of the panel shows what will actually run still need to
  // be established here, not just left as a lucky coincidence.
  applyQualityPreset(root, qualityEl?.value);

  const runBtn = root.querySelector('[data-role="reconstruction-run"]');
  if (runBtn) track(runBtn, "click", onRun);

  const stopBtn = root.querySelector('[data-role="reconstruction-stop"]');
  if (stopBtn) track(stopBtn, "click", onStop);

  const openBtn = root.querySelector('[data-role="reconstruction-open-director"]');
  if (openBtn) track(openBtn, "click", onOpenDirector);

  return () => {
    for (const off of unbinders.splice(0)) off();
  };
}

