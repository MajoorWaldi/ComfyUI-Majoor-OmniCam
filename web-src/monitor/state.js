const STATES = new Set(["READY", "WARNING", "BLOCKED", "OUTDATED", "OFFLINE"]);

export function createMonitorState() {
  return { status: "OFFLINE", snapshot: null, fingerprint: "", error: "", connected: false };
}

export function reduceMonitorState(state, action) {
  switch (action.type) {
    case "OFFLINE": return { ...state, status: "OFFLINE", connected: false, error: "" };
    case "SOURCE_CHANGED": return { ...state, status: "OUTDATED", connected: true, error: "" };
    case "REFRESHING": return { ...state, status: "OUTDATED", error: "" };
    case "ERROR": return { ...state, status: "BLOCKED", error: String(action.error || "Monitor refresh failed") };
    case "SNAPSHOT": {
      const snapshot = action.snapshot || {};
      const preflight = String(snapshot.preflight?.state || "READY").toUpperCase();
      const health = String(snapshot.health?.state || "READY").toUpperCase();
      const status = preflight === "BLOCKED" || health === "BLOCKED" ? "BLOCKED"
        : preflight === "WARNING" || health === "WARNING" ? "WARNING" : "READY";
      return { ...state, status: STATES.has(status) ? status : "BLOCKED", snapshot, fingerprint: snapshot.fingerprint || "", connected: true, error: "" };
    }
    default: return state;
  }
}

