import { MOTION_INTERPOLATIONS, MOTION_SOURCE_KINDS, MOTION_TOOLS } from "./state.js";

const idFor = (state) => {
  const used = new Set((state.motion_layers || []).map((layer) => layer.id));
  let index = used.size + 1;
  while (used.has(`motion_${index}`)) index += 1;
  return `motion_${index}`;
};

export function createMotionLayer(state, { sourceKind = "manual_2d", label, keys, source = {} }) {
  if (!MOTION_SOURCE_KINDS.includes(sourceKind)) throw new Error(`Unsupported motion source: ${sourceKind}`);
  const id = idFor(state);
  const layer = { id, label: label || `Motion ${id.split("_").at(-1)}`, enabled: true, semantic: "screen_point", source_kind: sourceKind, keys: keys.map((key) => ({ visible: true, interpolation: "linear", ...key })), source: { ...source } };
  state.motion_layers ||= [];
  state.motion_layers.push(layer);
  state.selected_motion_layer_id = id;
  return layer;
}

export function selectedMotionLayer(state) {
  return (state.motion_layers || []).find((layer) => layer.id === state.selected_motion_layer_id) || null;
}

export function setMotionTool(state, tool) {
  state.motion_tool = MOTION_TOOLS.includes(tool) ? tool : "select";
  return state.motion_tool;
}

export function setLayerInterpolation(layer, interpolation) {
  if (!MOTION_INTERPOLATIONS.includes(interpolation)) return;
  for (const key of layer.keys) key.interpolation = interpolation;
}

export function retimeLayer(layer, startSeconds, endSeconds) {
  if (!layer?.keys?.length || endSeconds < startSeconds) return;
  if (layer.keys.length === 1) {
    layer.keys[0].time_seconds = startSeconds;
    return;
  }
  const step = (endSeconds - startSeconds) / (layer.keys.length - 1);
  layer.keys.forEach((key, index) => { key.time_seconds = startSeconds + step * index; });
}

export function deleteMotionLayer(state, id) {
  state.motion_layers = (state.motion_layers || []).filter((layer) => layer.id !== id);
  if (state.selected_motion_layer_id === id) state.selected_motion_layer_id = state.motion_layers[0]?.id || null;
}