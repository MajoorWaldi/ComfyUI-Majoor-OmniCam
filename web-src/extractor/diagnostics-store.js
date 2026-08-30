// Bounded, live-only feature telemetry indexed by source frame.
//
// This deliberately has no serialization path: diagnostics help inspect a
// current solve but are not part of the camera-track contract.

export class FrameDiagnosticsStore {
  constructor({ maxFrames = 180 } = {}) {
    this.maxFrames = Math.max(1, Math.floor(Number(maxFrames) || 180));
    this.frames = new Map();
  }

  set(frame, { points = [], vectors = [], state = "unknown" } = {}) {
    const key = Math.max(0, Math.floor(Number(frame) || 0));
    const diagnostics = { frame: key, points: Array.isArray(points) ? points : [],
      vectors: Array.isArray(vectors) ? vectors : [], state: String(state || "unknown") };
    this.frames.delete(key);
    this.frames.set(key, diagnostics);
    while (this.frames.size > this.maxFrames) this.frames.delete(this.frames.keys().next().value);
    return diagnostics;
  }

  get(frame) {
    return this.frames.get(Math.max(0, Math.floor(Number(frame) || 0))) || null;
  }

  clear() {
    this.frames.clear();
  }

  dispose() {
    this.clear();
  }
}
