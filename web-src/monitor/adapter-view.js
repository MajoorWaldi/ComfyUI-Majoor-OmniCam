export const ADAPTER_LABELS = { h3: "MiniMax H3 Omni Reference", wan_native: "Wan Native Camera", wan_ati: "WanVideoWrapper ATI", wan_tracks_native: "Wan Native Tracks", ltx: "LTX Guide Frames" };
import { escapeHtml } from "./html.js";

export function renderAdapterDetails(container, snapshot) {
  const preflight = snapshot?.preflight; if (!container || !preflight) return;
  container.innerHTML = `<div class="oc-row"><span>Capability</span><strong>${escapeHtml(preflight.capability_state || "unknown")}</strong></div><div class="oc-row"><span>Selected route</span><strong>${escapeHtml(ADAPTER_LABELS[preflight.adapter] || preflight.adapter)}</strong></div>`;
}
