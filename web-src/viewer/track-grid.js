// Ground plane and axes for the read-only track viewer.
//
// Same visual language as the Director viewport, because the two show the same
// world and a camera path that looks different in each is a camera path nobody
// trusts. The grid adapts its spacing to the size of the solve: a monocular
// track has arbitrary scale, so a fixed one-metre grid is meaningless.

import { AxesHelper, Group, GridHelper } from "../three-runtime.js";

export const GRID_COLOR = 0x2c2c38;
export const GRID_CENTER_COLOR = 0x3a3a48;

/** A grid spacing that lands somewhere between 8 and 40 divisions for `extent`. */
export function gridSpacing(extent) {
  const span = Math.max(1e-6, Number(extent) || 0);
  const raw = span / 16;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  for (const step of [1, 2, 5, 10]) {
    if (raw <= step * magnitude) return step * magnitude;
  }
  return 10 * magnitude;
}

export function buildTrackGrid(extent = 10) {
  const group = new Group();
  group.name = "omnicam-track-grid";
  const spacing = gridSpacing(extent);
  const size = Math.max(spacing * 8, Number(extent) * 2 || spacing * 8);
  const divisions = Math.max(4, Math.min(80, Math.round(size / spacing)));

  const grid = new GridHelper(size, divisions, GRID_CENTER_COLOR, GRID_COLOR);
  grid.name = "grid";
  group.add(grid);

  const axes = new AxesHelper(Math.max(spacing, size * 0.08));
  axes.name = "axes";
  group.add(axes);
  return group;
}

/** Replace a grid in place when the solve's extent changes materially. */
export function refreshTrackGrid(group, extent) {
  if (!group) return null;
  const next = buildTrackGrid(extent);
  for (const child of [...group.children]) {
    group.remove(child);
    disposeObject(child);
  }
  for (const child of [...next.children]) group.add(child);
  return group;
}

export function disposeObject(object) {
  object?.traverse?.((child) => {
    child.geometry?.dispose?.();
    const material = child.material;
    if (Array.isArray(material)) material.forEach((item) => item?.dispose?.());
    else material?.dispose?.();
  });
  object?.geometry?.dispose?.();
  const material = object?.material;
  if (Array.isArray(material)) material.forEach((item) => item?.dispose?.());
  else material?.dispose?.();
}
