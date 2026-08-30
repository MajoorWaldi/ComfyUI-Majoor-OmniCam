// Small renderers for the Extractor's readout panels.
//
// Split out of index.js so the orchestration stays readable, and so the parts
// that turn data into DOM can be tested without a node, a graph or a socket.
//
// Every one of them writes through textContent. A solver warning or a filename
// is untrusted text, and the panel must never be a place where it becomes
// markup.

const NUMBER = (value, digits = 3) => (Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : "--");

function row(doc, label, value) {
  const element = doc.createElement("div");
  element.className = "oc-row";
  const name = doc.createElement("span");
  name.textContent = label;
  const content = doc.createElement("span");
  content.textContent = value;
  element.append(name, content);
  return element;
}

export function renderRows(container, rows, emptyText = "Nothing to show") {
  if (!container) return 0;
  const doc = container.ownerDocument;
  container.replaceChildren();
  if (!rows.length) {
    const empty = doc.createElement("div");
    empty.className = "oc-empty";
    empty.textContent = emptyText;
    container.append(empty);
    return 0;
  }
  for (const [label, value] of rows) container.append(row(doc, label, value));
  return rows.length;
}

/** Position, orientation and lens of the camera at the current frame. */
export function cameraRows(camera, frame) {
  if (!camera) return [];
  const [x, y, z] = (camera.position || [0, 0, 0]).map(Number);
  const [tx, ty, tz] = (camera.target || [0, 0, -1]).map(Number);
  const forward = [tx - x, ty - y, tz - z];
  const length = Math.hypot(...forward) || 1;
  const pan = Math.atan2(-forward[0] / length, -forward[2] / length) * (180 / Math.PI);
  const tilt = Math.asin(Math.max(-1, Math.min(1, forward[1] / length))) * (180 / Math.PI);
  return [
    ["Frame", String(frame)],
    ["X", NUMBER(x)],
    ["Y", NUMBER(y)],
    ["Z", NUMBER(z)],
    ["Pan", `${NUMBER(pan, 1)}°`],
    ["Tilt", `${NUMBER(tilt, 1)}°`],
    ["Roll", `${NUMBER(camera.roll || 0, 1)}°`],
    ["FOV", `${NUMBER(camera.fov, 1)}°`],
  ];
}

/**
 * The anomaly review list.
 *
 * Each row offers the three actions the refinement stack understands. None of
 * them touch the raw solve: they are settings, re-applied on every refine.
 */
export function renderAnomalies(container, anomalies, { onAction = () => {}, actions = {} } = {}) {
  if (!container) return 0;
  const doc = container.ownerDocument;
  container.replaceChildren();
  if (!anomalies?.length) {
    const empty = doc.createElement("div");
    empty.className = "oc-empty";
    empty.textContent = "No anomalies detected";
    container.append(empty);
    return 0;
  }
  for (const anomaly of anomalies) {
    const item = doc.createElement("div");
    item.className = "oc-anomaly";

    const text = doc.createElement("div");
    text.className = "oc-anomaly-text";
    const title = doc.createElement("strong");
    title.textContent = `⚠ Frame ${anomaly.frame}`;
    const detail = doc.createElement("small");
    detail.textContent = anomaly.detail || anomaly.kind || "";
    text.append(title, detail);
    item.append(text);

    const current = actions[String(anomaly.frame)] || "ignore";
    for (const action of ["interpolate", "ignore", "exclude"]) {
      const button = doc.createElement("button");
      button.type = "button";
      button.textContent = action.toUpperCase();
      button.dataset.action = action;
      button.dataset.frame = String(anomaly.frame);
      if (action === current) button.setAttribute("aria-selected", "true");
      button.addEventListener("click", () => onAction(anomaly.frame, action));
      item.append(button);
    }
    container.append(item);
  }
  return anomalies.length;
}

/** Warnings the solver produced, shown once and without embellishment. */
export function warningRows(warnings) {
  return (warnings || []).map((warning, index) => [`Note ${index + 1}`, String(warning)]);
}
