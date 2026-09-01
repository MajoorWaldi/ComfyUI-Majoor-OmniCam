export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

// Capability states are not preflight states, but they share this styling
// vocabulary. Mapping them explicitly is what keeps a missing downstream from
// rendering in the same neutral grey as "we did not check".
const CAPABILITY_STATES = {
  verified: "pass",
  detected_unverified: "warning",
  incompatible: "blocked",
  missing: "blocked",
};

export function diagnosticState(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized in CAPABILITY_STATES) return CAPABILITY_STATES[normalized];
  return ["ready", "warning", "blocked", "risk", "pass", "connected", "unknown"].includes(normalized)
    ? normalized
    : "unknown";
}

