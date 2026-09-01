export const MOTION_TOOLS = Object.freeze(["select", "track", "anchor", "project", "erase"]);
export const MOTION_SOURCE_KINDS = Object.freeze(["manual_2d", "static_anchor", "world_point", "object_point", "camera_field"]);
export const MOTION_INTERPOLATIONS = Object.freeze(["linear", "smooth", "hold"]);

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, finite(value)));

export function sanitizeMotionKey(key, durationSeconds) {
  return {
    time_seconds: Math.max(0, Math.min(durationSeconds, finite(key?.time_seconds))),
    x: clamp01(key?.x),
    y: clamp01(key?.y),
    visible: key?.visible !== false,
    interpolation: MOTION_INTERPOLATIONS.includes(key?.interpolation) ? key.interpolation : "linear",
  };
}

export function sanitizeMotionState(state) {
  const durationSeconds = Math.max(1 / Math.max(1, finite(state.fps, 24)), finite(state.duration_frames, 120) / Math.max(1, finite(state.fps, 24)));
  const used = new Set();
  state.motion_layers = (Array.isArray(state.motion_layers) ? state.motion_layers : []).slice(0, 256).map((raw, index) => {
    let id = String(raw?.id || `motion_${index + 1}`);
    if (used.has(id)) id = `motion_${index + 1}`;
    used.add(id);
    const sourceKind = MOTION_SOURCE_KINDS.includes(raw?.source_kind) ? raw.source_kind : "manual_2d";
    const keys = (Array.isArray(raw?.keys) ? raw.keys : [])
      .slice(0, 10000)
      .map((key) => sanitizeMotionKey(key, durationSeconds))
      .sort((a, b) => a.time_seconds - b.time_seconds);
    return {
      id,
      label: String(raw?.label || `Motion ${index + 1}`).slice(0, 80),
      enabled: raw?.enabled !== false,
      semantic: "screen_point",
      source_kind: sourceKind,
      keys,
      source: raw?.source && typeof raw.source === "object" ? { ...raw.source } : {},
    };
  }).filter((layer) => layer.keys.length);
  state.motion_tool = MOTION_TOOLS.includes(state.motion_tool) ? state.motion_tool : "select";
  state.selected_motion_layer_id = state.motion_layers.some((layer) => layer.id === state.selected_motion_layer_id)
    ? state.selected_motion_layer_id
    : state.motion_layers[0]?.id || null;
  return state;
}