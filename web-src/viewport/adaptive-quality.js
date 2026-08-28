// Steps the studio quality down when the viewport cannot keep up.
//
// AGENTS.md §10 asks for 60fps interaction at 720p. Image-based lighting and
// soft shadows can miss that on a modest GPU, so instead of guessing at load
// time we measure real frame cost and drop a level once it is clearly too slow.
//
// Rules that keep this from becoming annoying:
//   - it only ever steps DOWN, and at most to "low";
//   - it needs a sustained run of slow frames, not one hitch;
//   - it never steps back up on its own, because oscillating quality mid-drag
//     is worse than being one level too conservative.

export const LADDER = ["high", "balanced", "low"];

/** ~40fps. Below this the viewport feels laggy while orbiting. */
export const SLOW_FRAME_MS = 25;
export const SAMPLE_SIZE = 30;
export const SLOW_RATIO = 0.6;

export function createQualityMonitor(startQuality = "balanced") {
  return { quality: startQuality, samples: [], downgraded: false };
}

/** The next level down, or null when already at the bottom. */
export function nextLevelDown(quality) {
  const index = LADDER.indexOf(quality);
  if (index < 0 || index >= LADDER.length - 1) return null;
  return LADDER[index + 1];
}

/**
 * Feed one frame duration in milliseconds.
 *
 * @returns {string|null} the quality to switch to, or null to stay put.
 */
export function recordFrame(monitor, milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return null;
  monitor.samples.push(milliseconds);
  if (monitor.samples.length > SAMPLE_SIZE) monitor.samples.shift();
  if (monitor.samples.length < SAMPLE_SIZE) return null;

  const slow = monitor.samples.filter((sample) => sample > SLOW_FRAME_MS).length;
  if (slow / monitor.samples.length < SLOW_RATIO) return null;

  const next = nextLevelDown(monitor.quality);
  if (!next) return null;
  monitor.quality = next;
  monitor.downgraded = true;
  monitor.samples = [];
  return next;
}

/** Called when the user picks a quality by hand: trust them, start measuring afresh. */
export function resetMonitor(monitor, quality) {
  monitor.quality = quality;
  monitor.samples = [];
  monitor.downgraded = false;
  return monitor;
}
