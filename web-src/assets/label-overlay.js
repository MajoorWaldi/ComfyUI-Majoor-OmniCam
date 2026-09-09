// One pooled HTML overlay above the WebGL canvas that draws every visible
// object label (design spec section 14). Each update projects a world anchor
// through the live viewport camera and moves an existing DOM node -- no second
// renderer, no node churn. Labels are editor-only: `update()` hides the whole
// layer during a recording / clean capture.

import { sampleObjectWorldTransform } from "../director/core.js";
import {
  labelAnchorWorld,
  labelText,
  sanitizeLabelSettings,
  shouldShowLabel,
} from "./labels.js";

export function createLabelOverlay(ui, options = {}) {
  const host = options.container || ui.root?.querySelector(".viewport-wrap") || ui.root;
  const layer = document.createElement("div");
  layer.className = "oc-label-layer";
  layer.setAttribute("aria-hidden", "true");
  host?.appendChild(layer);

  const pool = [];
  let settings = sanitizeLabelSettings(ui.state?.metadata?.viewport_labels);

  function nodeAt(index) {
    if (!pool[index]) {
      const node = document.createElement("div");
      node.className = "oc-label";
      layer.appendChild(node);
      pool[index] = node;
    }
    return pool[index];
  }

  function selectedIdSet() {
    if (ui.selectedObjectIds instanceof Set && ui.selectedObjectIds.size) return ui.selectedObjectIds;
    return new Set([ui.selectedObjectId].filter(Boolean));
  }

  function update() {
    const project = ui.webgl?.projectWorldToScreen;
    const suppressed = settings.mode === "off" || ui.recording || ui.capturingClean || !project;
    if (suppressed) {
      layer.hidden = true;
      return;
    }
    layer.hidden = false;

    const selected = selectedIdSet();
    const frame = Number(ui.frame) || 0;
    const objects = Array.isArray(ui.state?.objects) ? ui.state.objects : [];
    let used = 0;

    for (const object of objects) {
      if (!shouldShowLabel(object, { mode: settings.mode, selectedIds: selected })) continue;
      const text = labelText(object, settings.content);
      if (!text) continue;
      const transform = sampleObjectWorldTransform(objects, object, frame) || {
        position: object.position,
        size: object.size,
      };
      const screen = ui.webgl.projectWorldToScreen(labelAnchorWorld(transform, object.type));
      if (!screen || screen.behind) continue;

      const node = nodeAt(used);
      used += 1;
      node.hidden = false;
      node.textContent = text; // never innerHTML -- design spec section 32
      node.style.transform = `translate(-50%, -100%) translate(${Math.round(screen.x)}px, ${Math.round(screen.y)}px)`;
      const annotationColor = settings.content === "annotation" ? object.annotation?.color : "";
      node.style.setProperty("--oc-label-accent", annotationColor || "");
      node.classList.toggle("is-annotation", settings.content === "annotation" && Boolean(annotationColor));
    }
    for (let i = used; i < pool.length; i += 1) pool[i].hidden = true;
  }

  function commit(next) {
    settings = sanitizeLabelSettings({ ...settings, ...next });
    ui.state.metadata = { ...(ui.state.metadata || {}), viewport_labels: { ...settings } };
    ui.serialize?.();
    update();
  }

  update();

  return {
    update,
    get settings() {
      return { ...settings };
    },
    setMode(mode) {
      commit({ mode });
    },
    setContent(content) {
      commit({ content });
    },
    dispose() {
      layer.remove();
      pool.length = 0;
    },
  };
}
