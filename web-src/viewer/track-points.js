// Bounded, inspection-only DPVO landmark cloud.

import { BufferGeometry, Float32BufferAttribute, Points, PointsMaterial } from "../three-runtime.js";

export const MAX_TRACK_POINTS = 8000;

export function buildTrackPoints(points, { limit = MAX_TRACK_POINTS, extent = 1 } = {}) {
  const accepted = [];
  for (const point of points || []) {
    const xyz = [Number(point?.x), Number(point?.y), Number(point?.z)];
    if (!xyz.every(Number.isFinite)) continue;
    accepted.push(xyz);
    if (accepted.length >= Math.max(0, Math.min(MAX_TRACK_POINTS, Number(limit) || 0))) break;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(accepted.flat(), 3));
  const size = Math.max(0.003, Math.min(0.12, Math.max(0.001, Number(extent) || 1) * 0.006));
  return new Points(geometry, new PointsMaterial({ color: 0x79c6e8, size, sizeAttenuation: true, transparent: true, opacity: 0.8 }));
}