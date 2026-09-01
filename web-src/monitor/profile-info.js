import { escapeHtml } from "./html.js";

export async function loadMonitorProfileInfo(api) {
  const response = await api.fetchApi("/majoor/omnicam/monitor/profiles");
  if (!response.ok) throw new Error(`Monitor profile catalog failed (${response.status})`);
  return response.json();
}

export function renderMonitorProfileInfo(root, payload) {
  const target = root.querySelector('[data-role="profile-capabilities"]');
  if (!target) return;
  const profiles = Array.isArray(payload?.profiles) ? payload.profiles : [];
  const capabilities = Array.isArray(payload?.capabilities?.capabilities)
    ? payload.capabilities.capabilities
    : [];
  const capabilityById = new Map(capabilities.map((entry) => [String(entry.adapter), entry]));
  const capabilityId = {
    wan_camera_native: "wan_native",
    wan_move_native: "wan_tracks_native",
    wan_track_native: "wan_tracks_native",
    wanvideo_ati: "wan_ati",
    h3_api: "h3",
  };
  target.innerHTML = profiles.length
    ? profiles.map((profile) => {
        const capability = profile.capability || capabilityById.get(capabilityId[profile.id] || String(profile.id));
        const state = capability?.state || "available";
        return `<div class="oc-row"><span><strong>${escapeHtml(profile.display_name)}</strong><br><small>${escapeHtml(profile.semantic)} · ${escapeHtml(profile.frame_policy)}</small></span><span class="oc-state" data-state="${escapeHtml(state)}">${escapeHtml(state)}</span></div>`;
      }).join("")
    : '<div class="oc-empty">No Monitor profile is available.</div>';
}
