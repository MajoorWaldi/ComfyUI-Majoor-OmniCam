// Solver diagnostics painted over the source video.
//
// This is a window onto the solve, never a control on it. Nothing drawn here
// feeds back into the backend: the points are what the solver reported, and
// hiding the overlay changes no result.
//
// Everything is capped. A dense SIFT frame can carry thousands of features, and
// stroking all of them at 24 fps turns the panel into a slideshow, so the
// overlay draws a bounded sample and says so.

export const MAX_POINTS = 300;
export const MAX_VECTORS = 300;

export const POINT_COLORS = {
  accepted: "#46a758",
  weak: "#e5a23c",
  rejected: "#e5484d",
  current: "#8b7bd8",
};

/** Take at most ``limit`` items, evenly spread rather than just the first N. */
export function decimate(items, limit) {
  const list = Array.isArray(items) ? items : [];
  if (list.length <= limit) return list.slice();
  const step = list.length / limit;
  const result = [];
  for (let index = 0; index < limit; index += 1) result.push(list[Math.floor(index * step)]);
  return result;
}

/** Map normalized or pixel feature coordinates onto the displayed canvas. */
export function projectPoint(point, { sourceWidth, sourceHeight, width, height }) {
  const x = Number(point?.x ?? point?.[0]) || 0;
  const y = Number(point?.y ?? point?.[1]) || 0;
  // Values inside the unit square are treated as normalized; anything larger is
  // already in source pixels.
  const normalized = x <= 1 && y <= 1 && x >= 0 && y >= 0;
  const scaleX = normalized ? width : width / Math.max(1, sourceWidth || width);
  const scaleY = normalized ? height : height / Math.max(1, sourceHeight || height);
  return [x * scaleX, y * scaleY];
}

export class TrackingOverlay {
  constructor(canvas) {
    this.canvas = canvas;
    this.points = [];
    this.vectors = [];
    this.frame = 0;
    this.state = "unknown";
  }

  setDiagnostics({ points = [], vectors = [], frame = 0, state = "unknown" } = {}) {
    this.points = decimate(points, MAX_POINTS);
    this.vectors = decimate(vectors, MAX_VECTORS);
    this.frame = Number(frame) || 0;
    this.state = String(state || "unknown");
    this.draw();
  }

  clear() {
    this.points = [];
    this.vectors = [];
    const context = this.canvas?.getContext?.("2d");
    if (context) context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  draw({ sourceWidth = 0, sourceHeight = 0 } = {}) {
    const context = this.canvas?.getContext?.("2d");
    const width = this.canvas?.width || 0;
    const height = this.canvas?.height || 0;
    if (!context || !width || !height) return { points: this.points.length, vectors: this.vectors.length };
    const projection = { sourceWidth, sourceHeight, width, height };

    context.clearRect(0, 0, width, height);
    context.lineWidth = 1;
    for (const vector of this.vectors) {
      const [x0, y0] = projectPoint(vector.from ?? vector, projection);
      const [x1, y1] = projectPoint(vector.to ?? vector, projection);
      context.strokeStyle = POINT_COLORS[vector.state] || POINT_COLORS.accepted;
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.stroke();
    }
    for (const point of this.points) {
      const [x, y] = projectPoint(point, projection);
      context.fillStyle = POINT_COLORS[point.state] || POINT_COLORS.accepted;
      context.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
    if (this.state === "weak" || this.state === "bad") {
      // A border rather than a badge: it has to be visible while the user is
      // looking at the footage, not at the panel chrome.
      context.strokeStyle = this.state === "bad" ? POINT_COLORS.rejected : POINT_COLORS.weak;
      context.lineWidth = 2;
      context.strokeRect(1, 1, width - 2, height - 2);
    }
    return { points: this.points.length, vectors: this.vectors.length };
  }

  dispose() {
    this.clear();
    this.canvas = null;
  }
}
