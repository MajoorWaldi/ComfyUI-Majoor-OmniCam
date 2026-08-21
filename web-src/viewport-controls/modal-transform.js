// Blender-style modal object transforms shared by keyboard, snapping and groups.
import { add, cameraBasis, cloneTransform, mul, rotateEuler, sub } from "../director/core.js";

const AXES = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
const snap = (value, step) => Math.round(value / step) * step;

export function selectedTransformObjects(ui) {
  const ids = ui.selectedObjectIds instanceof Set && ui.selectedObjectIds.size
    ? ui.selectedObjectIds
    : new Set(ui.selectedObjectId ? [ui.selectedObjectId] : []);
  return ui.state.objects.filter((object) => ids.has(object.id) && !object.locked);
}

export function beginModalTransform(ui, mode) {
  const objects = selectedTransformObjects(ui);
  if (!objects.length || !["translate", "rotate", "scale"].includes(mode)) return false;
  ui.checkpoint(`${mode[0].toUpperCase()}${mode.slice(1)} selection`);
  for (const object of objects) ui.beginObjectEdit(object);
  const snapshots = objects.map((object) => ({ object, transform: cloneTransform(object) }));
  const pivot = snapshots.reduce((sum, item) => add(sum, item.transform.position), [0, 0, 0]).map((value) => value / snapshots.length);
  const fallback = [ui.canvas.width * 0.5, ui.canvas.height * 0.5];
  const start = ui.lastViewportPointer || fallback;
  const rect = ui.interactionElement.getBoundingClientRect();
  const lastEvent = ui.lastPointerEvent || { clientX: rect.left + start[0] * rect.width / ui.canvas.width, clientY: rect.top + start[1] * rect.height / ui.canvas.height };
  ui.modalTransform = { mode, axis: null, numeric: "", start, lastEvent, snapshots, pivot };
  ui.setTransformMode(mode);
  ui.setStatus(`${mode.toUpperCase()} · move mouse · X/Y/Z constrain · type value · Enter confirm · Esc cancel`);
  ui.render();
  return true;
}

function numericValue(session) {
  if (!session.numeric || session.numeric === "-" || session.numeric === ".") return null;
  const value = Number(session.numeric);
  return Number.isFinite(value) ? value : null;
}

function snappedGroupOffset(ui, session, positions, pointer, temporarySnap) {
  const mode = temporarySnap ? "grid" : ui.state.spatial_snap_mode;
  if (mode === "grid") {
    const step = ui.state.spatial_grid_size || 0.5;
    return positions.map((position) => position.map((value) => snap(value, step)));
  }
  if (mode === "vertex" && pointer) {
    const hit = ui.webgl?.pickSubElement?.(pointer[0], pointer[1], ui.canvas.width, ui.canvas.height, "vertex");
    if (hit?.point && !session.snapshots.some((item) => item.object.id === hit.objectId)) {
      const transformedPivot = positions.reduce((sum, position) => add(sum, position), [0, 0, 0])
        .map((value) => value / positions.length);
      const offset = sub(hit.point, transformedPivot);
      return positions.map((position) => add(position, offset));
    }
  }
  return positions;
}

export function updateModalTransform(ui, event) {
  const session = ui.modalTransform;
  if (!session) return false;
  session.lastEvent = event;
  const rect = ui.interactionElement.getBoundingClientRect();
  const pointer = [
    ((event.clientX - rect.left) * ui.canvas.width) / Math.max(1, rect.width),
    ((event.clientY - rect.top) * ui.canvas.height) / Math.max(1, rect.height),
  ];
  ui.lastViewportPointer = pointer;
  const dx = pointer[0] - session.start[0], dy = pointer[1] - session.start[1];
  const precision = event.shiftKey ? 0.1 : 1;
  const typed = numericValue(session);
  const axis = session.axis ? AXES[session.axis] : null;
  const camera = ui.state.view_mode === "camera" ? ui.camera : ui.state.editor_views[ui.state.view_mode];
  const basis = cameraBasis(camera);
  const worldScale = camera.camera_type === "orthographic"
    ? 10 / (Math.max(0.01, camera.zoom || 1) * Math.max(1, ui.canvas.height))
    : Math.hypot(...sub(camera.position, camera.target)) * 25e-4;

  let positions = session.snapshots.map((item) => [...item.transform.position]);
  if (session.mode === "translate") {
    const amount = typed ?? (dx - dy) * worldScale * precision;
    const delta = axis ? mul(axis, amount) : add(mul(basis.right, dx * worldScale * precision), mul(basis.up, -dy * worldScale * precision));
    positions = positions.map((position) => add(position, delta));
    positions = snappedGroupOffset(ui, session, positions, pointer, event.ctrlKey || event.metaKey);
  }

  const angle = session.mode === "rotate" ? (typed ?? (dx - dy) * 0.5 * precision) : 0;
  const factor = session.mode === "scale" ? Math.max(0.01, typed ?? 1 + (dx - dy) * 0.01 * precision) : 1;
  const rotationAxis = axis || AXES.z;
  const snapping = event.ctrlKey || event.metaKey || ui.state.spatial_snap_mode === "grid";
  session.snapshots.forEach((item, index) => {
    const object = item.object;
    if (session.mode === "translate") object.position = positions[index];
    if (session.mode === "rotate") {
      const snappedAngle = snapping ? snap(angle, 15) : angle;
      const deltaRotation = mul(rotationAxis, snappedAngle);
      object.position = add(session.pivot, rotateEuler(sub(item.transform.position, session.pivot), deltaRotation));
      object.rotation = add(item.transform.rotation, deltaRotation);
    }
    if (session.mode === "scale") {
      const snappedFactor = snapping ? snap(factor, 0.1) : factor;
      const factors = axis ? axis.map((value) => value ? snappedFactor : 1) : [snappedFactor, snappedFactor, snappedFactor];
      const relative = sub(item.transform.position, session.pivot);
      object.position = add(session.pivot, relative.map((value, component) => value * factors[component]));
      object.size = item.transform.size.map((value, component) => Math.max(0.01, value * factors[component]));
    }
    ui.commitObjectEdit(object);
  });
  ui.refreshInspector(); ui.render();
  const suffix = `${session.axis ? ` ${session.axis.toUpperCase()}` : ""}${session.numeric ? ` = ${session.numeric}` : ""}`;
  ui.setStatus(`${session.mode.toUpperCase()}${suffix}`);
  return true;
}

export function confirmModalTransform(ui) {
  if (!ui.modalTransform) return false;
  ui.modalTransform = null; ui.editingKeyFrame = null;
  ui.scheduleSerialize(); ui.refreshKeys(); ui.drawCurveEditor(); ui.render(); ui.setStatus("Transform confirmed");
  return true;
}

export function cancelModalTransform(ui) {
  if (!ui.modalTransform) return false;
  ui.modalTransform = null; ui.undo(); ui.setStatus("Transform cancelled");
  return true;
}

export function handleModalTransformKey(ui, event) {
  const session = ui.modalTransform;
  if (!session) return false;
  const key = event.key.toLowerCase();
  if (key === "escape") return cancelModalTransform(ui);
  if (key === "enter" || key === " ") return confirmModalTransform(ui);
  if (AXES[key]) { session.axis = session.axis === key ? null : key; updateModalTransform(ui, session.lastEvent); return true; }
  if (/^[0-9]$/.test(key) || key === "." || key === "," || (key === "-" && !session.numeric)) { session.numeric += key === "," ? "." : key; updateModalTransform(ui, session.lastEvent); return true; }
  if (key === "backspace") { session.numeric = session.numeric.slice(0, -1); updateModalTransform(ui, session.lastEvent); return true; }
  return true;
}
