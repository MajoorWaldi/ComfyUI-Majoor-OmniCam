// Scene Reconstruction "Result" modes and the geometry/segmentation/completion
// option groups they enable. Capabilities decide whether an option is
// selectable; unsupported options stay VISIBLE with a reason, never hidden.

export const RECON_RESULT_MODES = [
  { id: "depth_mesh", label: "Depth Mesh", geometry: ["moge"], multiView: false },
  { id: "blockout", label: "Blockout", geometry: ["moge"], multiView: false },
  { id: "hybrid", label: "Hybrid", geometry: ["moge"], multiView: false },
  { id: "scan", label: "Scan", geometry: ["vggt"], multiView: true },
];

// Legacy serialized names map onto current ones (see settings.py resolved_mode).
// Both legacy names ran MoGe-only depth-mesh + planes, so they resolve to
// depth_mesh -- never blockout/hybrid, which would add a SAM3 dependency.
const MODE_ALIASES = { geometry: "depth_mesh", layout: "depth_mesh" };

export function resolveResultMode(mode) {
  return MODE_ALIASES[mode] || mode || "blockout";
}

export function isMultiViewMode(mode) {
  return resolveResultMode(mode) === "scan";
}

export function usesSegmentation(mode) {
  return ["blockout", "hybrid", "scan"].includes(resolveResultMode(mode));
}

export function keepsDenseReference(mode) {
  const m = resolveResultMode(mode);
  return m === "depth_mesh" || m === "hybrid";
}

export const COMPLETION_POLICIES = [
  { id: "off", label: "Off" },
  { id: "low_depth_confidence", label: "Low confidence" },
  { id: "selected", label: "Selected" },
  { id: "all_bounded", label: "All bounded" },
];

// Given a capabilities payload from /reconstruction/capabilities, return the
// enable/disable + reason for a provider option so the panel can render it
// disabled-with-tooltip rather than removing it.
export function optionAvailability(capabilities, providerId) {
  const list = capabilities?.providers || capabilities?.segmentation || [];
  const found = Array.isArray(list)
    ? list.find((p) => p.provider_id === providerId)
    : null;
  if (!found) return { enabled: false, reason: "Provider not reported by this server" };
  return { enabled: Boolean(found.available), reason: found.reason || "" };
}
