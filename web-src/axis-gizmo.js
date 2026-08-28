// Viewport corner axis gizmo.
//
// Drawn as an SVG overlay rather than a second WebGL pass, for one decisive
// reason: the playblast records the <canvas>, and a proxy playblast must stay a
// neutral motion reference (AGENTS.md §7). A DOM overlay is excluded from the
// capture for free, with no cleanCapture flag to remember and no extra draw
// call in the render loop.
//
// The maths is a straight reuse of the camera basis the projector already uses,
// so the gizmo can never drift from what the viewport shows.

import { cameraBasis } from "./omnicam-core.js";

export const AXES = [
  { id: "x", label: "X", vector: [1, 0, 0], color: "#e5484d" },
  { id: "y", label: "Y", vector: [0, 1, 0], color: "#46a758" },
  { id: "z", label: "Z", vector: [0, 0, 1], color: "#4a8fe7" },
];

/**
 * Screen-space direction of each world axis, as seen by `camera`.
 *
 * Returns, per axis: `x`/`y` in a [-1, 1] square with y already flipped for
 * screen coordinates, and `depth` = how much the axis points at the viewer
 * (+1 straight out of the screen, -1 straight into it). Callers use `depth`
 * for draw order and fading, so an axis pointing away reads as behind.
 *
 * @param {object} camera canonical camera state (position, target, roll, up)
 * @returns {Array<{id:string,label:string,color:string,x:number,y:number,depth:number}>}
 */
export function axisScreenDirections(camera) {
  const { right, up, forward } = cameraBasis(camera || {});
  return AXES.map((axis) => {
    const [ax, ay, az] = axis.vector;
    const screenX = ax * right[0] + ay * right[1] + az * right[2];
    const screenY = ax * up[0] + ay * up[1] + az * up[2];
    const depth = -(ax * forward[0] + ay * forward[1] + az * forward[2]);
    return { id: axis.id, label: axis.label, color: axis.color, x: screenX, y: -screenY, depth };
  });
}

/**
 * Painter's order: axes pointing away are drawn first so the ones coming at the
 * viewer overlap them, which is what makes the little rig read as 3D.
 */
export function sortedByDepth(directions) {
  return [...directions].sort((a, b) => a.depth - b.depth);
}

/** Tip opacity: full when the axis faces the viewer, dimmed when it points away. */
export function axisOpacity(depth) {
  return 0.45 + 0.55 * ((Math.max(-1, Math.min(1, depth)) + 1) / 2);
}
