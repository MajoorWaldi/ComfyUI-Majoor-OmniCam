// Motion panel DOM <-> state sync. No business logic lives here: creation
// workflows are in creation.js, key/layer edits are in interactions.js. This
// module only reflects `state.motion_layers` / `state.selected_motion_layer_id`
// into the markup declared by template/panels/motion-panel.js.

import { t } from "../i18n.js";
import { projectWorldSource } from "./projection.js";

const WORLD_KINDS = ["world_point", "object_point", "camera_field"];

const BADGE = {
  manual_2d: "DRAW",
  object_point: "OBJECT",
  world_point: "WORLD",
  static_anchor: "SCREEN",
  camera_field: "FIELD",
};

function bindingLabel(state, layer) {
  const src = layer.source || {};
  if (layer.source_kind === "object_point" && src.object_id) {
    const object = (state.objects || []).find((item) => item.id === src.object_id);
    return object ? object.name || object.id : `${src.object_id} (missing)`;
  }
  if (layer.source_kind === "world_point") return "World point";
  if (layer.source_kind === "camera_field") return src.preset ? `${src.preset} field` : "Camera field";
  return "Screen";
}

// Screen-track targets (ATI, Wan Track, LTX Motion) encode visibility as a
// visible prefix: a track that is not visible on its first sample is dropped
// entirely. Warn about it in the editor instead of only at preflight.
function firstSampleVisible(state, layer) {
  if (WORLD_KINDS.includes(layer.source_kind)) {
    const projected = projectWorldSource(state, layer.source, 0, state.width || 1280, state.height || 720);
    return projected ? projected.visible !== false : false;
  }
  return layer.keys?.[0]?.visible !== false;
}

function nearestKey(layer, timeSeconds) {
  return (layer.keys || []).reduce(
    (best, key) => (best && Math.abs(best.time_seconds - timeSeconds) <= Math.abs(key.time_seconds - timeSeconds) ? best : key),
    null,
  );
}

export function renderMotionPanel(ui) {
  const root = ui.root.querySelector('[data-role="motion-layers"]');
  if (!root) return;
  const layers = ui.state.motion_layers || [];
  const selectedId = ui.state.selected_motion_layer_id;

  root.replaceChildren();
  for (const layer of layers) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "motion-layer-row";
    row.dataset.motionLayerId = layer.id;
    row.classList.toggle("active", layer.id === selectedId);
    row.innerHTML = `<i class="pi ${layer.enabled ? "pi-eye" : "pi-eye-slash"}"></i><span></span><small class="motion-badge"></small>`;
    row.querySelector("span").textContent = layer.label;
    row.querySelector("small").textContent = BADGE[layer.source_kind] || "TRACK";
    row.addEventListener("click", () => {
      ui.state.selected_motion_layer_id = layer.id;
      ui.render();
    });
    root.appendChild(row);
  }

  const empty = ui.root.querySelector('[data-role="motion-layers-empty"]');
  if (empty) empty.hidden = Boolean(layers.length);

  renderSelectedTrack(ui);
  renderCreatingBanner(ui);
}

function renderSelectedTrack(ui) {
  const card = ui.root.querySelector('[data-role="motion-selected"]');
  if (!card) return;
  const layer = (ui.state.motion_layers || []).find((item) => item.id === ui.state.selected_motion_layer_id) || null;
  card.hidden = !layer;
  if (!layer) return;

  const fps = Math.max(1, Number(ui.state.fps) || 24);
  const frames = (layer.keys || []).map((key) => Math.round(key.time_seconds * fps));
  const set = (role, value) => {
    const el = card.querySelector(`[data-role="${role}"]`);
    if (el) el.textContent = value;
  };
  set("motion-sel-name", layer.label);
  set("motion-sel-type", BADGE[layer.source_kind] || "TRACK");
  set("motion-sel-binding", bindingLabel(ui.state, layer));
  set("motion-sel-start", frames.length ? Math.min(...frames) : 0);
  set("motion-sel-end", frames.length ? Math.max(...frames) : 0);

  const missing = layer.source_kind === "object_point"
    && layer.source?.object_id
    && !(ui.state.objects || []).some((item) => item.id === layer.source.object_id);
  card.classList.toggle("motion-invalid", Boolean(missing));

  const hiddenAtStart = !missing && !firstSampleVisible(ui.state, layer);
  card.classList.toggle("motion-warn", hiddenAtStart);
  const warn = card.querySelector('[data-role="motion-sel-warn"]');
  if (warn) {
    warn.hidden = !hiddenAtStart;
    warn.textContent = hiddenAtStart
      ? t("Not visible on the first frame — ATI, Wan Track and LTX Motion drop tracks hidden at frame 0. Move the point into frame at frame 0 or switch to Screen Anchor.")
      : "";
  }

  const interp = card.querySelector('[data-role="motion-interpolation"]');
  if (interp) interp.value = layer.keys?.[0]?.interpolation || "linear";

  const visible = card.querySelector('[data-role="motion-key-visible"]');
  if (visible) {
    const key = nearestKey(layer, (ui.frame || 0) / fps);
    visible.checked = key ? key.visible !== false : true;
  }

  const toggle = card.querySelector('[data-motion-layer-action="toggle"] i');
  if (toggle) toggle.className = `pi ${layer.enabled ? "pi-eye" : "pi-eye-slash"}`;
}

function renderCreatingBanner(ui) {
  const banner = ui.root.querySelector('[data-role="motion-creating"]');
  if (!banner) return;
  const active = ui.state.motion_tool && ui.state.motion_tool !== "select";
  banner.hidden = !active;
  if (!active) return;
  const label = banner.querySelector('[data-role="motion-creating-label"]');
  if (label) label.textContent = ui.motionCreatingLabel || "Creating motion track";
}
