// Read-only inspector rows for a reconstructed object. Semantic + confidence
// values are rendered as TEXT only; metadata is never injected through
// innerHTML.

export function reconstructionInspectorRows(object) {
  const recon = object?.reconstruction;
  if (!recon) return [];
  const axis = recon.axis_confidence || {};
  return [
    ["Role", String(recon.role || "")],
    ["Semantic", String(recon.semantic || "")],
    ["Confidence", Number(recon.confidence ?? 0).toFixed(2)],
    ["Width", Number(axis.width ?? 0).toFixed(2)],
    ["Height", Number(axis.height ?? 0).toFixed(2)],
    ["Depth", Number(axis.depth ?? 0).toFixed(2)],
    ["Yaw", Number(axis.yaw ?? 0).toFixed(2)],
    ["Completion", String(recon.completion_provider || "none")],
  ];
}

// Role-based default lock/visibility for Director adoption.
export function reconstructionAdoptionDefaults(object, mode) {
  const role = object?.reconstruction?.role || "";
  if (role === "blockout_object") return { locked: false, visible: true };
  if (role === "room" || role === "reference") {
    const hideReference = role === "reference" && String(mode) === "blockout";
    return { locked: true, visible: !hideReference };
  }
  return { locked: true, visible: true };
}

// Render rows into a container using textContent only. Returns the element.
export function renderReconstructionRows(container, object, doc = globalThis.document) {
  if (!container) return container;
  container.textContent = "";
  for (const [key, value] of reconstructionInspectorRows(object)) {
    const row = doc.createElement("div");
    row.className = "omnicam-recon-row";
    const k = doc.createElement("span");
    k.className = "omnicam-recon-key";
    k.textContent = key;
    const v = doc.createElement("span");
    v.className = "omnicam-recon-value";
    v.textContent = value;
    row.append(k, v);
    container.append(row);
  }
  return container;
}
