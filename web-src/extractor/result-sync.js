// Handing a cleaned solve to the Director.
//
// Applying is explicit and manual, and that is the whole design. While the user
// is experimenting with smoothing and trims, the Director must not be
// redecorated on every slider move -- so nothing leaves this panel until APPLY
// is pressed, and once the settings change again the applied result is marked
// OUTDATED rather than silently republished.
//
// Applying also never queues the graph. It writes the workflow-serialized cache
// and nudges the Directors downstream, which then import by fingerprint exactly
// as they do after a normal execution.

import { notifyDownstreamDirectors } from "./director-link.js";
import { cacheExtractorResult, motionSceneFromTrack } from "./result-cache.js";

export class ResultApplyError extends Error {}

/**
 * Store a refined track as this Extractor's applied result.
 *
 * @returns {{fingerprint: string, notified: number}}
 */
export function applyRefinedTrack(node, { track, state } = {}) {
  if (state !== "COMPLETED") {
    // A stopped or failed solve leaves a partial trajectory on screen. It is
    // reviewable, and it is not a camera anyone should ship.
    throw new ResultApplyError("Only a completed solve can be applied to the Director.");
  }
  const keyframes = track?.keyframes;
  if (!Array.isArray(keyframes) || !keyframes.length) {
    throw new ResultApplyError("This solve produced no camera keys to apply.");
  }
  const fingerprint = String(track?.metadata?.extractor_fingerprint || "");
  if (!fingerprint) {
    throw new ResultApplyError("This track carries no extractor fingerprint.");
  }

  const motionScene = motionSceneFromTrack(track);
  if (!motionScene) {
    throw new ResultApplyError("This solve cannot be wrapped in a canonical motion scene.");
  }
  cacheExtractorResult(node, {
    motionScene,
    track,
    fingerprint,
    solver_coverage: Number(track?.metadata?.solver_coverage ?? track?.metadata?.confidence) || 0,
  });
  const notified = notifyDownstreamDirectors(node);
  return { fingerprint, notified };
}

/** Whether the current refined result still matches what was applied. */
export function appliedStatus(appliedFingerprint, refinedFingerprint) {
  if (!appliedFingerprint) return "NOT APPLIED";
  return appliedFingerprint === refinedFingerprint ? "APPLIED" : "OUTDATED";
}
