import { commitDrawnTrack, eraseAtPoint, nearestMotionLayer, pointerPoint } from "./draw.js";
import { createMotionLayer, deleteMotionLayer, retimeLayer, selectedMotionLayer, setLayerInterpolation, setMotionTool } from "./editing.js";
import { projectWorldSource } from "./projection.js";

const claim = (event) => { event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation?.(); };
const rangeSeconds = (ui) => {
  const range = ui.state.playback_range || [ui.frame, ui.state.duration_frames - 1];
  return [range[0] / ui.state.fps, range[1] / ui.state.fps];
};
const finish = (ui, message) => { ui.serialize(); ui.render(); ui.setStatus(message); };

export function syncToolButtons(ui) {
  for (const button of ui.root.querySelectorAll("[data-motion-tool]")) {
    const active = button.dataset.motionTool === ui.state.motion_tool;
    button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active));
  }
  ui.interactionElement.dataset.motionTool = ui.state.motion_tool;
}

function projectLayer(ui, point) {
  const object = ui.state.objects.find((item) => item.id === ui.selectedObjectId);
  const sourceKind = object ? "object_point" : "world_point";
  const source = object
    ? { object_id: object.id, local_point: [0, 0, 0] }
    : { point: ui.webgl?.intersectScenePoint?.(point.x * ui.canvas.width, point.y * ui.canvas.height, ui.canvas.width, ui.canvas.height) || [...ui.camera.target] };
  const projected = projectWorldSource(ui.state, source, ui.frame, ui.canvas.width, ui.canvas.height) || point;
  return createMotionLayer(ui.state, { sourceKind, label: object ? `${object.name || object.id} Track` : "World Anchor", keys: [{ time_seconds: ui.frame / ui.state.fps, x: projected.x, y: projected.y, visible: projected.visible !== false }], source });
}

export function bindMotionTrackEvents(ui, signal) {
  for (const button of ui.root.querySelectorAll("[data-motion-tool]")) {
    button.addEventListener("click", () => { setMotionTool(ui.state, button.dataset.motionTool); syncToolButtons(ui); ui.render(); }, { signal });
  }
  for (const button of ui.root.querySelectorAll("[data-motion-preset]")) {
    button.addEventListener("click", () => {
      ui.checkpoint("Add camera field");
      createMotionLayer(ui.state, { sourceKind: "camera_field", label: `${button.dataset.motionPreset} Field`, keys: [{ time_seconds: 0, x: 0.5, y: 0.5 }], source: { preset: button.dataset.motionPreset, point: [...ui.camera.target] } });
      finish(ui, `Camera field: ${button.dataset.motionPreset}`);
    }, { signal });
  }
  ui.root.querySelector('[data-role="motion-interpolation"]')?.addEventListener("change", (event) => {
    const layer = selectedMotionLayer(ui.state); if (!layer) return;
    ui.checkpoint("Set motion interpolation"); setLayerInterpolation(layer, event.target.value); finish(ui, `Motion interpolation: ${event.target.value}`);
  }, { signal });
  ui.root.querySelector('[data-role="motion-key-visible"]')?.addEventListener("change", (event) => {
    const layer = selectedMotionLayer(ui.state); if (!layer?.keys?.length) return;
    const time = ui.frame / ui.state.fps;
    const key = layer.keys.reduce((best, item) => Math.abs(item.time_seconds - time) < Math.abs(best.time_seconds - time) ? item : best);
    ui.checkpoint("Set motion visibility"); key.visible = event.target.checked; finish(ui, `Motion key ${key.visible ? "visible" : "hidden"}`);
  }, { signal });
  for (const button of ui.root.querySelectorAll("[data-motion-layer-action]")) {
    button.addEventListener("click", () => {
      const layer = selectedMotionLayer(ui.state); if (!layer) return;
      const action = button.dataset.motionLayerAction;
      ui.checkpoint(action === "delete" ? "Delete motion layer" : action === "retime" ? "Retime motion layer" : "Toggle motion layer");
      if (action === "delete") deleteMotionLayer(ui.state, layer.id);
      else if (action === "retime") { const [start, end] = rangeSeconds(ui); retimeLayer(layer, start, end); }
      else layer.enabled = !layer.enabled;
      finish(ui, action === "delete" ? "Motion layer deleted" : action === "retime" ? "Motion layer retimed" : `Motion layer ${layer.enabled ? "enabled" : "disabled"}`);
    }, { signal });
  }
  const canvas = ui.interactionElement;
  canvas.addEventListener("pointerdown", (event) => {
    const tool = ui.state.motion_tool;
    if (tool === "select" || event.button !== 0) return;
    claim(event); canvas.setPointerCapture?.(event.pointerId);
    const point = pointerPoint(ui, event);
    if (tool === "track") { ui.checkpoint("Draw motion track"); ui.motionTrackDraft = { pointerId: event.pointerId, points: [point] }; return; }
    ui.checkpoint(tool === "erase" ? "Erase motion track" : "Add motion anchor");
    if (tool === "anchor") createMotionLayer(ui.state, { sourceKind: "static_anchor", label: `Anchor ${(ui.state.motion_layers || []).length + 1}`, keys: [{ time_seconds: ui.frame / ui.state.fps, ...point, interpolation: "hold" }] });
    else if (tool === "project") projectLayer(ui, point);
    else if (tool === "erase") eraseAtPoint(ui.state, point);
    finish(ui, `Motion tool: ${tool}`);
  }, { capture: true, signal });
  canvas.addEventListener("pointermove", (event) => {
    if (ui.motionTrackDraft?.pointerId !== event.pointerId) return;
    claim(event); ui.motionTrackDraft.points.push(pointerPoint(ui, event)); ui.render();
  }, { capture: true, signal });
  const endDraw = (event) => {
    const draft = ui.motionTrackDraft;
    if (draft?.pointerId !== event.pointerId) return;
    claim(event); ui.motionTrackDraft = null;
    const [start, end] = rangeSeconds(ui);
    const layer = commitDrawnTrack(ui.state, draft.points, start, end);
    finish(ui, layer ? `Motion track: ${layer.label}` : "Motion track needs a longer stroke");
  };
  canvas.addEventListener("pointerup", endDraw, { capture: true, signal });
  canvas.addEventListener("pointercancel", endDraw, { capture: true, signal });
  canvas.addEventListener("click", (event) => {
    if (ui.state.motion_tool !== "select" || event.button !== 0) return;
    const layer = nearestMotionLayer(ui.state.motion_layers, pointerPoint(ui, event));
    if (layer) { ui.state.selected_motion_layer_id = layer.id; ui.render(); }
  }, { signal });
  syncToolButtons(ui);
}