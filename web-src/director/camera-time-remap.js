// Camera Time Remap / Speed Ramp authoring.
//
// This deliberately builds on camera-path-timing.js instead of creating a
// second timing model. A key's optional timing.weight remains an authoring
// preference; Apply Remap bakes that preference into ordinary keyframe frame
// positions. MotionScene therefore stays model-independent and schema-stable.

import {
  cameraPathTimingWeight,
  redistributeCameraPathTiming,
  setCameraPathTimingWeight,
} from "./camera-path-timing.js";

export const TIME_REMAP_PRESETS = Object.freeze([
  "custom",
  "constant",
  "ease_in",
  "ease_out",
  "ease_in_out",
]);

function cloneKeys(keys) {
  return (keys || []).map((key) => ({
    ...key,
    camera: key.camera ? {
      ...key.camera,
      position: [...(key.camera.position || [])],
      target: [...(key.camera.target || [])],
    } : key.camera,
    ...(key.timing ? { timing: { ...key.timing } } : {}),
    ...(key.tangents ? { tangents: structuredClone(key.tangents) } : {}),
    ...(key.references ? { references: structuredClone(key.references) } : {}),
  }));
}

function distance3(a, b) {
  const pa = a?.camera?.position || [0, 0, 0];
  const pb = b?.camera?.position || [0, 0, 0];
  return Math.hypot(
    Number(pb[0] || 0) - Number(pa[0] || 0),
    Number(pb[1] || 0) - Number(pa[1] || 0),
    Number(pb[2] || 0) - Number(pa[2] || 0),
  );
}

/** Normalized cumulative chord-length progress for each authored key. */
export function cameraPathProgress(keys) {
  const sorted = [...(keys || [])].sort((a, b) => a.frame - b.frame);
  if (!sorted.length) return [];
  const cumulative = [0];
  for (let index = 1; index < sorted.length; index += 1) {
    cumulative.push(cumulative[index - 1] + distance3(sorted[index - 1], sorted[index]));
  }
  const total = cumulative.at(-1) || 0;
  if (total <= 1e-9) {
    return sorted.map((_, index) => sorted.length <= 1 ? 0 : index / (sorted.length - 1));
  }
  return cumulative.map((value) => value / total);
}

function presetWeight(progress, preset) {
  const p = Math.max(0, Math.min(1, Number(progress) || 0));
  // Absolute scale is irrelevant because redistribution normalizes total cost.
  // 1.75 ↔ 0.25 gives a clear ramp while staying comfortably inside the
  // existing 0.1..10 Timing Weight contract.
  if (preset === "ease_in") return 1.75 - 1.5 * p;
  if (preset === "ease_out") return 0.25 + 1.5 * p;
  if (preset === "ease_in_out") return 0.25 + 1.5 * Math.abs(2 * p - 1);
  return 1.0;
}

/**
 * Return cloned keys with a timing-weight preset authored onto them.
 * `strength=0` is exactly the existing weights; `strength=1` is full preset.
 */
export function applyTimingWeightPreset(keys, { preset = "constant", strength = 1 } = {}) {
  const sorted = cloneKeys(keys).sort((a, b) => a.frame - b.frame);
  if (preset === "custom") return sorted;
  if (!TIME_REMAP_PRESETS.includes(preset)) return sorted;
  const mix = Math.max(0, Math.min(1, Number(strength) || 0));
  const progress = cameraPathProgress(sorted);
  return sorted.map((key, index) => {
    const current = cameraPathTimingWeight(key);
    const target = presetWeight(progress[index], preset);
    // Strength fades from the artist's current authoring preference, not from
    // an arbitrary zero, so reducing it is non-destructive and predictable.
    const weight = current + (target - current) * mix;
    return setCameraPathTimingWeight(key, weight);
  });
}

/**
 * Bake a preset (or the currently authored Custom weights) into key times.
 * The first/last frames and every camera value stay untouched.
 */
export function applyCameraTimeRemap(keys, {
  preset = "custom",
  strength = 1,
  startFrame = null,
  endFrame = null,
} = {}) {
  const sorted = cloneKeys(keys).sort((a, b) => a.frame - b.frame);
  if (sorted.length < 2) return { ok: false, reason: "not_enough_keys" };
  const mix = Math.max(0, Math.min(1, Number(strength) || 0));
  if (preset !== "custom" && mix <= 0) return { ok: true, keys: sorted };
  if (!["custom", "constant"].includes(preset) && sorted.length < 3) {
    return { ok: false, reason: "needs_timing_anchor" };
  }
  const weighted = preset === "custom"
    ? sorted
    : applyTimingWeightPreset(sorted, { preset, strength: mix });
  const start = startFrame == null ? weighted[0].frame : Number(startFrame);
  const end = endFrame == null ? weighted.at(-1).frame : Number(endFrame);
  const result = redistributeCameraPathTiming(weighted, { startFrame: start, endFrame: end });
  if (!result.ok) return result;
  return { ok: true, keys: result.keys };
}
