export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

export function diagnosticState(value) {
  const normalized = String(value || "").toLowerCase();
  return ["ready", "warning", "blocked", "risk", "pass", "connected", "unknown"].includes(normalized)
    ? normalized
    : "unknown";
}

