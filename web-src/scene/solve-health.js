// Provider-neutral per-frame solve health, normalised from the additive
// `metadata.solve_health_v1` block the Extractor may attach. This is UI-facing
// metadata only -- it never bumps the MotionScene version and never carries a
// provider-specific metric.
//
// Contract (metadata.solve_health_v1):
//   { source, frames: [{ frame, state: good|warning|bad|unknown, score? }] }
//   - score is optional and, when present, finite in [0,1]
//   - a missing block, or a frame with no entry, is "unknown" (neutral grey),
//     never a fabricated "good".

export const SOLVE_HEALTH_STATES = new Set(["good", "warning", "bad", "unknown"]);

export function normalizeSolveHealth(metadata, durationFrames) {
  const length = Math.max(0, Math.floor(Number(durationFrames) || 0));
  const out = Array.from({ length }, (_, frame) => ({ frame, state: "unknown", score: null }));

  const source = metadata?.solve_health_v1;
  if (!source || !Array.isArray(source.frames)) return out;

  for (const item of source.frames) {
    const frame = Number(item?.frame);
    if (!Number.isInteger(frame) || frame < 0 || frame >= out.length) continue;

    const state = SOLVE_HEALTH_STATES.has(item?.state) ? item.state : "unknown";
    const rawScore = item?.score;
    let score = null;
    if (rawScore !== undefined && rawScore !== null) {
      const numeric = Number(rawScore);
      score = Number.isFinite(numeric) ? Math.max(0, Math.min(1, numeric)) : null;
    }
    out[frame] = { frame, state, score };
  }
  return out;
}
