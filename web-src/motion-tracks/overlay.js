import { projectWorldSource } from "./projection.js";

export function visibleLayerPoints(state, layer, frame, width, height) {
  if (["world_point", "object_point", "camera_field"].includes(layer.source_kind)) {
    const projected = projectWorldSource(state, layer.source, frame, width, height);
    return projected ? [projected] : [];
  }
  return (layer.keys || []).map((key) => ({ ...key }));
}

export function drawMotionOverlay(ui) {
  if (ui.recording) return;
  const context = ui.ctx, width = ui.canvas.width, height = ui.canvas.height;
  context.save();
  for (const layer of ui.state.motion_layers || []) {
    if (!layer.enabled) continue;
    const points = visibleLayerPoints(ui.state, layer, ui.frame, width, height);
    if (!points.length) continue;
    context.strokeStyle = layer.id === ui.state.selected_motion_layer_id ? "#ffcc4d" : "#41d9c5";
    context.fillStyle = context.strokeStyle;
    context.lineWidth = layer.id === ui.state.selected_motion_layer_id ? 3 : 2;
    context.beginPath();
    points.forEach((point, index) => {
      const x = point.x * width, y = point.y * height;
      if (index) context.lineTo(x, y); else context.moveTo(x, y);
    });
    context.stroke();
    for (const point of points) {
      if (point.visible === false) continue;
      context.beginPath(); context.arc(point.x * width, point.y * height, 5, 0, Math.PI * 2); context.fill();
    }
  }
  context.restore();
}