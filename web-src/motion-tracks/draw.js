import { createMotionLayer, deleteMotionLayer } from "./editing.js";
import { normalizedPointer } from "./projection.js";

export function simplifyDrawnPoints(points, threshold = 0.006) {
  if (points.length < 3) return points;
  const kept = [points[0]];
  for (const point of points.slice(1, -1)) {
    const previous = kept.at(-1);
    if (Math.hypot(point.x - previous.x, point.y - previous.y) >= threshold) kept.push(point);
  }
  kept.push(points.at(-1));
  return kept;
}

export function nearestMotionLayer(layers, point, threshold = 0.035) {
  let best = null, bestDistance = threshold;
  for (const layer of layers || []) for (const key of layer.keys || []) {
    const distance = Math.hypot(key.x - point.x, key.y - point.y);
    if (distance <= bestDistance) { best = layer; bestDistance = distance; }
  }
  return best;
}

export function commitDrawnTrack(state, points, startSeconds, endSeconds) {
  const simplified = simplifyDrawnPoints(points);
  if (simplified.length < 2) return null;
  const span = Math.max(0, endSeconds - startSeconds);
  return createMotionLayer(state, {
    sourceKind: "manual_2d",
    label: `Track ${(state.motion_layers || []).length + 1}`,
    keys: simplified.map((point, index) => ({ ...point, time_seconds: startSeconds + span * index / (simplified.length - 1) })),
  });
}

export function pointerPoint(ui, event) {
  return normalizedPointer(event, ui.interactionElement);
}

export function eraseAtPoint(state, point) {
  const layer = nearestMotionLayer(state.motion_layers, point);
  if (!layer) return null;
  deleteMotionLayer(state, layer.id);
  return layer;
}