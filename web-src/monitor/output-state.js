export function outputState(currentFingerprint, executedFingerprint) {
  if (!executedFingerprint) return "OUTPUT NOT EXECUTED";
  return currentFingerprint === executedFingerprint ? "OUTPUT GENERATED" : "OUTPUT OUTDATED";
}

export function executionFingerprint(message) {
  const monitor = Array.isArray(message?.monitor) ? message.monitor[0] : message?.monitor;
  return monitor?.fingerprint || message?.ui?.monitor?.fingerprint || "";
}

