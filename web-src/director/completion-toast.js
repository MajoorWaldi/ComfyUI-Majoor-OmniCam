// Route completion notices through ComfyUI's native toast manager only.
// No DOM, timers, persisted state or private frontend imports are needed.
export function notifyCompletion(owner, message, tone = "success") {
  if (!message || owner?.disposed || owner?.runtime?.disposed) return false;
  const app = owner?.app || owner?.runtime?.app;
  const toast = app?.extensionManager?.toast;
  if (!toast) return false;
  const kind = ["success", "error", "warning", "info"].includes(tone) ? tone : "info";
  try {
    if (typeof toast[kind] === "function") toast[kind](String(message));
    else if (typeof toast.add === "function") {
      // ComfyUI versions predating the typed success/error/warning helpers.
      toast.add({ severity: kind === "warning" ? "warn" : kind,
        summary: "OmniCam", detail: String(message), life: kind === "error" ? 8000 : 5000, closable: true });
    } else return false;
    return true;
  } catch {
    // A notification failure must never turn a completed operation into a failure.
    return false;
  }
}
