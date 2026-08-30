import { escapeHtml } from "./html.js";

export const ADAPTER_LABELS = {
  h3: "MiniMax H3 · Comfy API",
  h3_native: "MiniMax H3 · Native",
  wan_native: "Wan Camera",
  wan_ati: "Wan 2.1 ATI · WanVideoWrapper",
  wan_tracks_native: "Wan Motion Tracks",
  ltx_motion_track: "LTX 2.5 Motion Track",
  ltx: "LTX Proxy Guide (legacy)",
};

/**
 * How directly the authored camera survives the translation to this target.
 * Wan Camera receives real extrinsics and intrinsics; the trajectory adapters
 * receive projected 2D points that only *suggest* focal length, roll and
 * depth. Saying so in the panel is the difference between a Monitor that
 * reports and one that flatters.
 */
const FIDELITY_LABELS = {
  numeric_camera: "numeric camera conditioning",
  motion_transfer: "motion transfer from a reference clip",
  trajectory_approximation: "2D trajectory approximation",
  proxy_passthrough: "sampled proxy frames",
};

export function renderAdapterDetails(container, snapshot) {
  const preflight = snapshot?.preflight;
  if (!container || !preflight) return;
  const adapter = snapshot?.adapter || {};
  const label = adapter.display_name || ADAPTER_LABELS[preflight.adapter] || preflight.adapter;
  const fidelity = FIDELITY_LABELS[adapter.fidelity];
  const control = fidelity
    ? `<div class="oc-row"><span>Control path</span><strong>${escapeHtml(fidelity)}</strong></div>`
    : "";
  const rule = adapter.length_rule
    ? `<div class="oc-row"><span>Frame count</span><strong>${escapeHtml(adapter.length_rule)}</strong></div>`
    : "";
  container.innerHTML = `<div class="oc-row"><span>Capability</span><strong>${escapeHtml(preflight.capability_state || "unknown")}</strong></div><div class="oc-row"><span>Selected route</span><strong>${escapeHtml(label)}</strong></div>${control}${rule}`;
}
