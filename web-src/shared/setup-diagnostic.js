export function setupBadgeModel(issues) {
  const entries = Array.isArray(issues) ? issues : [];
  if (!entries.length) return { tone: "ok", label: "Core ready" };
  const count = entries.length;
  return {
    tone: entries.some((issue) => issue?.severity === "error") ? "error" : "warn",
    label: count === 1 ? "1 optional adapter issue" : `${count} optional adapter issues`,
  };
}
