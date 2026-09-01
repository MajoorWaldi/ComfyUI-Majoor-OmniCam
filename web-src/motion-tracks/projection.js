import { project, sampleCamera, worldTransform } from "../director/core.js";

export function normalizedPointer(event, element) {
  const rect = element.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width))),
    y: Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height))),
  };
}

export function projectWorldSource(state, source, frame, width, height) {
  const camera = sampleCamera(state, frame, state.objects);
  let point = source?.point;
  if (source?.object_id) {
    const object = state.objects.find((item) => item.id === source.object_id);
    if (!object) return null;
    const world = worldTransform(state.objects, object, frame);
    const local = Array.isArray(source.local_point) ? source.local_point : [0, 0, 0];
    point = [world.position[0] + local[0] * world.size[0], world.position[1] + local[1] * world.size[1], world.position[2] + local[2] * world.size[2]];
  }
  if (!Array.isArray(point)) return null;
  const screen = project(point, camera, width, height);
  if (!screen) return null;
  const x = screen[0] / width, y = screen[1] / height;
  return { x, y, visible: x >= 0 && x <= 1 && y >= 0 && y <= 1 };
}