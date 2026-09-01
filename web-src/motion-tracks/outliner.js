export function renderMotionOutliner(ui) {
  const root = ui.root.querySelector('[data-role="motion-layers"]');
  if (!root) return;
  root.replaceChildren();
  for (const layer of ui.state.motion_layers || []) {
    const row = document.createElement("button");
    row.type = "button"; row.className = "motion-layer-row"; row.dataset.motionLayerId = layer.id;
    row.classList.toggle("active", layer.id === ui.state.selected_motion_layer_id);
    row.innerHTML = `<i class="pi ${layer.enabled ? "pi-eye" : "pi-eye-slash"}"></i><span></span><small>${layer.source_kind}</small>`;
    row.querySelector("span").textContent = layer.label;
    row.addEventListener("click", () => { ui.state.selected_motion_layer_id = layer.id; ui.render(); });
    root.appendChild(row);
  }
  const empty = ui.root.querySelector('[data-role="motion-layers-empty"]');
  if (empty) empty.hidden = Boolean(ui.state.motion_layers?.length);
}