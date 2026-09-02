// Motion creation workflows. These are a thin artist-facing vocabulary on top
// of the existing motion tools -- no new state:
//
//   Draw Path      -> tool "track"   -> source_kind manual_2d
//   Track Object   -> tool "project" -> source_kind object_point (object selected)
//   World Point    -> tool "project" -> source_kind world_point
//   Screen Anchor  -> tool "anchor"  -> source_kind static_anchor
//
// The actual layer creation still happens in interactions.js on the next
// viewport pointer event.

import { setMotionTool } from "./editing.js";
import { syncToolButtons } from "./interactions.js";

const WORKFLOWS = {
  draw: { tool: "track", label: "Draw Path", hint: "Draw a trajectory in the Camera View. Release to finish, Esc to cancel." },
  object: { tool: "project", label: "Track Object", hint: "Click the selected object in the viewport to follow it." },
  world: { tool: "project", label: "World Point", hint: "Click a surface or point in the viewport to pin a fixed 3D point." },
  anchor: { tool: "anchor", label: "Screen Anchor", hint: "Click to place a control point at a fixed screen position." },
};

export function beginMotionCreation(ui, kind) {
  const flow = WORKFLOWS[kind];
  if (!flow) return;
  if (kind === "object" && !(ui.state.objects || []).some((item) => item.id === ui.selectedObjectId)) {
    ui.setStatus("Select a scene object first, then choose Track Object.");
    return;
  }
  ui.checkpoint?.(`Motion: ${flow.label}`);
  setMotionTool(ui.state, flow.tool);
  ui.motionCreatingLabel = flow.label;
  syncToolButtons(ui);
  ui.render();
  ui.setStatus(flow.hint);
}

export function cancelMotionCreation(ui) {
  if ((ui.state.motion_tool || "select") === "select" && !ui.motionTrackDraft) return;
  setMotionTool(ui.state, "select");
  ui.motionTrackDraft = null;
  ui.motionCreatingLabel = "";
  syncToolButtons(ui);
  ui.render();
  ui.setStatus("Motion creation cancelled.");
}

export function bindMotionCreation(ui, signal) {
  for (const button of ui.root.querySelectorAll("[data-motion-create]")) {
    button.addEventListener("click", () => beginMotionCreation(ui, button.dataset.motionCreate), { signal });
  }
  ui.root.querySelector("[data-motion-create-cancel]")?.addEventListener("click", () => cancelMotionCreation(ui), { signal });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") cancelMotionCreation(ui);
  }, { signal });
}
