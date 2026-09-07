// Wiping cached results, in both Extractor modes.
//
// Two independent caches exist: the reconstruction disk cache (fingerprint-keyed
// GLBs and manifests, server-side) and this node's own persisted widgets
// (result-cache.js's scene/fingerprint/source, frontend-only, survive a
// workflow save). "Clear Cache" empties both and returns the node to IDLE.

import { confirmAction } from "../director/ui-services.js";
import { t } from "../i18n.js";
import { FINGERPRINT_WIDGET, SCENE_WIDGET, SOURCE_WIDGET } from "./result-cache.js";
import { createExtractorState } from "./state.js";

function widget(node, name) {
  return node?.widgets?.find((item) => item.name === name) || null;
}

export async function clearExtractorCache(ui) {
  const proceed = await confirmAction(
    t("Clear Cache"),
    t("Deletes every cached reconstruction (GLBs, manifests, source images) from disk, and forgets this node's cached track and reconstruction results. This cannot be undone."),
  );
  if (!proceed) return false;

  if (ui.state.jobId) void ui.client.stopSolve(ui.state.jobId).catch(() => {});
  if (ui.reconstruction?.state?.jobId) {
    void ui.reconstruction.client.stopJob(ui.reconstruction.state.jobId).catch(() => {});
  }

  try {
    await ui.reconstruction.client.clearCache();
  } catch (error) {
    ui.dispatch({ type: "FAILED", error: String(error?.message || error) });
    return false;
  }

  for (const name of [SCENE_WIDGET, FINGERPRINT_WIDGET, SOURCE_WIDGET]) {
    const item = widget(ui.node, name);
    if (item) item.value = "";
  }
  ui.node.setDirtyCanvas?.(true, true);

  ui.overlay.clear();
  ui.diagnostics.clear();
  ui.result = { raw: null, refined: null };
  ui.sourceKey = "";
  ui.state = createExtractorState();
  ui.reconstruction?.dispatch({ type: "RESET" });
  ui.render();
  ui.refreshSource();
  return true;
}
