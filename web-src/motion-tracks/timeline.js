export function renderMotionTimeline(ui) {
  const root = ui.root.querySelector('[data-role="motion-timeline"]');
  if (!root) return;
  root.replaceChildren();
  const duration = Math.max(1, ui.state.duration_frames / ui.state.fps);
  for (const layer of ui.state.motion_layers || []) {
    const rail = document.createElement("div");
    rail.className = "motion-timeline-rail"; rail.dataset.motionTimelineId = layer.id;
    rail.title = layer.label;
    const label = document.createElement("button");
    label.type = "button"; label.className = "motion-timeline-label"; label.textContent = layer.label;
    label.addEventListener("click", () => { ui.state.selected_motion_layer_id = layer.id; ui.render(); });
    const track = document.createElement("div"); track.className = "motion-timeline-track";
    for (const key of layer.keys || []) {
      const marker = document.createElement("button");
      marker.type = "button"; marker.className = "motion-key";
      marker.style.left = `${Math.max(0, Math.min(100, key.time_seconds / duration * 100))}%`;
      marker.title = `${layer.label} @ ${key.time_seconds.toFixed(2)}s`;
      marker.addEventListener("click", () => { ui.state.selected_motion_layer_id = layer.id; ui.setFrame(Math.round(key.time_seconds * ui.state.fps)); });
      track.appendChild(marker);
    }
    rail.append(label, track);
    root.appendChild(rail);
  }
}