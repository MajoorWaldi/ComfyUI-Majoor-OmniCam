// Event bindings and settings sync for reconstruction DOM controls.

export function readReconstructionSettings(root) {
  if (!root) return {};

  const getVal = (role) => root.querySelector(`[data-role="${role}"]`)?.value;
  const getChecked = (role) => Boolean(root.querySelector(`[data-role="${role}"]`)?.checked);

  return {
    provider: getVal("reconstruction-provider") || "comfy_moge",
    mode: getVal("reconstruction-mode") || "geometry",
    quality: getVal("reconstruction-quality") || "balanced",
    recover_fov: getChecked("reconstruction-recover-fov"),
    source_texture: getChecked("reconstruction-source-texture"),
    detect_ground: getChecked("reconstruction-detect-ground"),
    detect_walls: getChecked("reconstruction-detect-walls"),
    triangle_budget: Number(getVal("reconstruction-triangle-budget")) || 100000,
    edge_threshold: Number(getVal("reconstruction-edge-threshold")) || 1.0,
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

  const roles = [
    "reconstruction-provider",
    "reconstruction-mode",
    "reconstruction-quality",
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
    listen(el, evtName, handleInput);
  }

  const runBtn = root.querySelector('[data-role="reconstruction-run"]');
  if (runBtn) listen(runBtn, "click", onRun);

  const stopBtn = root.querySelector('[data-role="reconstruction-stop"]');
  if (stopBtn) listen(stopBtn, "click", onStop);

  const openBtn = root.querySelector('[data-role="reconstruction-open-director"]');
  if (openBtn) listen(openBtn, "click", onOpenDirector);
}
