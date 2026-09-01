import { escapeHtml } from "./html.js";

export async function loadMonitorProfileInfo(api) {
  const response = await api.fetchApi("/majoor/omnicam/monitor/profiles");
  if (!response.ok) throw new Error(`Monitor profile catalog failed (${response.status})`);
  return response.json();
}

export function renderMonitorProfileInfo(root, payload) {
  // Its own slot: the post-run capability report owns profile-capabilities, and
  // the two used to overwrite each other depending on which rendered last.
  const target = root.querySelector('[data-role="profile-catalogue"]');
  if (!target) return;
  const profiles = Array.isArray(payload?.profiles) ? payload.profiles : [];
  const capabilities = Array.isArray(payload?.capabilities?.capabilities)
    ? payload.capabilities.capabilities
    : [];
  // Capability contracts are keyed by profile id, so a lookup is enough. The
  // translation table that used to sit here mapped both Wan track profiles onto
  // one contract and had no entry for LTX at all.
  const capabilityById = new Map(capabilities.map((entry) => [String(entry.adapter), entry]));
  target.innerHTML = profiles.length
    ? profiles.map((profile) => {
        const capability = profile.capability || capabilityById.get(String(profile.id));
        // No information is not good news. Defaulting to "available" made a
        // profile with no contract render green, which is the opposite of what
        // a preflight is for.
        const state = capability?.state || "missing";
        return `<div class="oc-row"><span><strong>${escapeHtml(profile.display_name)}</strong><br><small>${escapeHtml(profile.semantic)} · ${escapeHtml(profile.frame_policy)}</small></span><span class="oc-state" data-state="${escapeHtml(state)}">${escapeHtml(state)}</span></div>`;
      }).join("")
    : '<div class="oc-empty">No Monitor profile is available.</div>';
}
