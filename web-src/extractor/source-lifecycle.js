import { api } from "../comfy-runtime.js";
import { annotatedAssetUrl } from "../shared/managed-assets.js";
import { resizeTrackingOverlay, syncUpstreamPreviewCanvas } from "./source-stage.js";
import { resolveInteractiveExtractorSource } from "./source-resolver.js";

export function refreshExtractorSource(ui) {
  const resolved = resolveInteractiveExtractorSource(ui.node, ui.node.graph);
  const sourceKey = resolved.ref ? `${resolved.ref.kind}:${resolved.ref.value}` : "";
  if (sourceKey !== (ui.sourceKey || "")) {
    const priorJobId = ui.state.jobId;
    ui.sourceKey = sourceKey;
    ui.describing = "";
    ui.sourceViewer.fps = 24;
    ui.sourceViewer.frameCount = 0;
    if (priorJobId) void ui.client.stopSolve(priorJobId).catch(() => {});
    ui.dispatch({ type: "SOURCE_RESET", source: { ...resolved, playbackError: "" } });
  }
  const reloaded = ui.sourceViewer.setSource(
    resolved.available && resolved.ref ? annotatedAssetUrl(api, resolved.ref.value) : "",
  );
  ui.dispatch({ type: "SOURCE", source: reloaded ? { ...resolved, playbackError: "" } : resolved });
  if (resolved.available && resolved.ref) void describeExtractorSource(ui, resolved);
  else adoptExtractorSourceLength(ui, 0);
  syncUpstreamPreviewCanvas(ui, resolved);
  return resolved;
}

export async function describeExtractorSource(ui, resolved) {
  if (ui.describing === resolved.ref?.value) return null;
  ui.describing = resolved.ref?.value;
  try {
    const payload = await ui.client.describeSource(resolved.ref);
    if (ui.disposed || ui.sourceKey !== `${resolved.ref.kind}:${resolved.ref.value}`) return null;
    const info = payload?.info || null;
    ui.dispatch({ type: "SOURCE", source: { info } });
    if (info) {
      ui.sourceViewer.fps = Number(info.fps) || ui.sourceViewer.fps;
      adoptExtractorSourceLength(ui, Number(info.frame_count) || 0);
      resizeTrackingOverlay(ui, info);
    }
    return info;
  } catch (error) {
    console.warn("[OmniCam] could not describe the extractor source", error);
    return null;
  }
}

export function adoptExtractorSourceLength(ui, frameCount) {
  const total = Math.max(0, Math.round(Number(frameCount) || 0));
  if (total === ui.state.frameCount) return;
  ui.sourceViewer.frameCount = total;
  ui.state.frameCount = total;
  if (!ui.disposed) ui.render();
}
