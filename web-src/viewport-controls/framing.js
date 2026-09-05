import { add, cameraBasis, dot, mul, quaternionFromEuler, rotateQuaternion, sampleObjectWorldTransform, sub } from "../director/core.js";

function corners(min, max) {
  const points = [];
  for (const x of [min[0], max[0]]) for (const y of [min[1], max[1]]) for (const z of [min[2], max[2]]) points.push([x, y, z]);
  return points;
}

function objectCorners(ui, object) {
  const bounds = ui.webgl?.getObjectWorldBounds?.(object.id);
  if (bounds) return corners(bounds.min, bounds.max);
  const transform = sampleObjectWorldTransform(ui.state.objects, object, ui.frame || 0);
  const center = (object.type === "model" || object.type === "glb")
    ? ui.webgl?.getObjectWorldCenter?.(object.id) || transform.position : transform.position;
  const half = transform.size.map((v) => Math.max(0.01, Math.abs(v)) / 2);
  const quaternion = transform.quaternion || quaternionFromEuler(transform.rotation);
  return corners(half.map((v) => -v), half).map((point) => add(center, rotateQuaternion(point, quaternion)));
}

// Fit in camera space so a portrait viewport, camera roll and selection depth
// all contribute to the required distance. No camera-track schema changes.
export function frameObjects(ui, camera, fallback, options = {}) {
  const visible = ui.state.objects.filter((o) => o.enabled !== false);
  // `all` is what A / Home ask for: every visible object regardless of the
  // selection, Maya's "frame all". Hidden objects never count in either mode.
  const selected = options.all ? visible : visible.filter((o) => ui.selectedObjectIds?.has(o.id));
  const objects = selected.length ? selected : [fallback];
  const points = objects.flatMap((object) => objectCorners(ui, object));
  const min = [0, 1, 2].map((i) => Math.min(...points.map((p) => p[i])));
  const max = [0, 1, 2].map((i) => Math.max(...points.map((p) => p[i])));
  const center = min.map((v, i) => (v + max[i]) / 2);
  const { right, up, forward } = cameraBasis(camera);
  const aspect = Math.max(1, ui.canvas?.width || ui.state.width || 1280) / Math.max(1, ui.canvas?.height || ui.state.height || 720);
  const tanY = Math.tan((camera.fov || 35) * Math.PI / 360);
  const tanX = tanY * aspect;
  let distance = 2;
  let halfHeight = 0.1;
  for (const point of points) {
    const relative = sub(point, center);
    const x = Math.abs(dot(relative, right));
    const y = Math.abs(dot(relative, up));
    const z = dot(relative, forward);
    distance = Math.max(distance, 1.15 * x / tanX - z, 1.15 * y / tanY - z, (camera.near || 0.01) * 2 - z);
    halfHeight = Math.max(halfHeight, 1.15 * y, 1.15 * x / aspect);
  }
  camera.target = center;
  camera.position = sub(center, mul(forward, distance));
  if (camera.camera_type === "orthographic") camera.zoom = Math.max(0.01, 5 / halfHeight);
}
