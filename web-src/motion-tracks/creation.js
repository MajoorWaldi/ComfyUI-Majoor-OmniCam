// Motion creation workflows. These are a thin artist-facing vocabulary on top
// of the existing motion tools:
//
//   Draw Path      -> tool "track"   -> source_kind manual_2d
//   Track Object   -> tool "project" -> source_kind object_point
//   World Point    -> tool "project" -> source_kind world_point
//   Screen Anchor  -> tool "anchor"  -> source_kind static_anchor
//
// Track Object and World Point share one internal tool ("project"), so the
// tool alone cannot say which the artist asked for. `ui.motionCreationKind`
// carries that intent through to the next viewport pointer event, where
// interactions.js actually creates the layer. Without it, projectLayer() fell
// back to "is an object still selected?" and silently recorded object_point
// for a World Point the artist explicitly chose.

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
  // The intent the shared "project" tool cannot express on its own.
  ui.motionCreationKind = kind;
  syncToolButtons(ui);
  ui.render();
  ui.setStatus(flow.hint);
}

/** Returns true when there was a pending creation flow to cancel. */
export function cancelMotionCreation(ui) {
  if ((ui.state.motion_tool || "select") === "select" && !ui.motionTrackDraft) return false;
  setMotionTool(ui.state, "select");
  ui.motionTrackDraft = null;
  ui.motionCreatingLabel = "";
  ui.motionCreationKind = "";
  syncToolButtons(ui);
  ui.render();
  ui.setStatus("Motion creation cancelled.");
  return true;
}

export function bindMotionCreation(ui, signal) {
  for (const button of ui.root.querySelectorAll("[data-motion-create]")) {
    button.addEventListener("click", () => beginMotionCreation(ui, button.dataset.motionCreate), { signal });
  }
  ui.root.querySelector("[data-motion-create-cancel]")?.addEventListener("click", () => cancelMotionCreation(ui), { signal });
  // Escape is routed by the window-capture interceptor (commands.js) so it only
  // reaches the Director the event actually came from.
}
