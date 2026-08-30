const STATES = new Set(["READY", "WARNING", "BLOCKED", "OUTDATED", "CONNECTED", "OFFLINE"]);

export function createMonitorState() {
  return { status: "OFFLINE", snapshot: null, fingerprint: "", error: "", connected: false, risk: "LOW" };
}

export function reduceMonitorState(state, action) {
  switch (action.type) {
    case "OFFLINE": return { ...state, status: "OFFLINE", connected: false, error: "" };
    // Wired to a producer whose track only materialises at execution time.
    // Valid graph, nothing to preview: not the same thing as OFFLINE.
    case "CONNECTED": return { ...state, status: "CONNECTED", connected: true, snapshot: null, error: "" };
    case "SOURCE_CHANGED": return { ...state, status: "OUTDATED", connected: true, error: "" };
    case "REFRESHING": return { ...state, status: "OUTDATED", error: "" };
    case "ERROR": return { ...state, status: "BLOCKED", error: String(action.error || "Monitor refresh failed") };
    case "SNAPSHOT": {
      const snapshot = action.snapshot || {};
      // Motion risk is deliberately absent from this decision: it is an
      // OmniCam heuristic, and letting it drive the headline verdict is how
      // the badge stopped meaning anything.
      const preflight = String(snapshot.preflight?.state || "READY").toUpperCase();
      const status = STATES.has(preflight) ? preflight : "BLOCKED";
      return {
        ...state, status, snapshot, fingerprint: snapshot.fingerprint || "",
        connected: true, error: "", risk: String(snapshot.preflight?.risk || "LOW"),
      };
    }
    default: return state;
  }
}
