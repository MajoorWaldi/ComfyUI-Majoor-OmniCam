// FK pose state: the pure layer behind the Pose editor (design spec sections
// 25-26). A pose is a sparse map of canonical joint -> local rotation
// quaternion [x,y,z,w] plus an optional root offset. Evaluation order is
//   asset rest pose  ->  pose preset  ->  scene joint overrides
// and this module owns the middle-and-right of that chain. Quaternion
// validation mirrors omnicam/assets/pose_library.py. No DOM, no three.js.

import { REQUIRED_INDEX } from "./rig-profile.js";

export const IDENTITY_QUAT = Object.freeze([0, 0, 0, 1]);
export const MAX_POSE_JOINTS = 128;
export const HUMANOID_PROFILE = "omnicam_humanoid_v1";

const SLUG = /^[a-z0-9][a-z0-9_-]*$/;
const QUAT_NORM_TOLERANCE = 1e-3;

const isFinite3 = (a) => Array.isArray(a) && a.length === 3 && a.every((n) => Number.isFinite(Number(n)));

/** Normalise a quaternion to unit length, or null when it is not a usable one. */
export function normalizeQuaternion(raw) {
  if (!Array.isArray(raw) || raw.length !== 4) return null;
  const values = raw.map(Number);
  if (values.some((n) => !Number.isFinite(n))) return null;
  const length = Math.hypot(...values);
  if (length <= 1e-8) return null;
  // Accept a slightly off-unit quaternion by renormalising; reject a grossly
  // non-unit one (a sign the client sent the wrong thing).
  if (Math.abs(length - 1) > QUAT_NORM_TOLERANCE && !(length > 0.5 && length < 2)) return null;
  return values.map((n) => n / length);
}

export function isIdentityQuat(quat, tolerance = 1e-4) {
  const n = normalizeQuaternion(quat);
  if (!n) return false;
  return Math.abs(n[0]) < tolerance && Math.abs(n[1]) < tolerance
    && Math.abs(n[2]) < tolerance && Math.abs(Math.abs(n[3]) - 1) < tolerance;
}

function sanitizeJoints(raw) {
  const joints = {};
  if (!raw || typeof raw !== "object") return joints;
  let count = 0;
  for (const [key, value] of Object.entries(raw)) {
    if (count >= MAX_POSE_JOINTS) break;
    const joint = String(key).trim().toLowerCase();
    if (!SLUG.test(joint) || joint.length > 64) continue;
    const quat = normalizeQuaternion(value);
    if (!quat || isIdentityQuat(quat)) continue; // identity == no override
    joints[joint] = quat;
    count += 1;
  }
  return joints;
}

/** A clean pose object, or a neutral pose when the input is unusable. */
export function sanitizePose(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const presetId = String(source.preset_id || "neutral").trim().toLowerCase();
  return {
    preset_id: SLUG.test(presetId) && presetId.length <= 80 ? presetId : "neutral",
    root_offset: isFinite3(source.root_offset) ? source.root_offset.map(Number) : [0, 0, 0],
    joints: sanitizeJoints(source.joints),
  };
}

/** The middle-and-right of the evaluation chain: preset joints, then overrides. */
export function evaluatePose({ preset, overrides } = {}) {
  const presetPose = sanitizePose(preset);
  const overridePose = sanitizePose(overrides);
  return {
    preset_id: overridePose.preset_id !== "neutral" ? overridePose.preset_id : presetPose.preset_id,
    root_offset: overrides?.root_offset ? overridePose.root_offset : presetPose.root_offset,
    joints: { ...presetPose.joints, ...overridePose.joints },
  };
}

export function poseFromCharacter(character) {
  return sanitizePose(character?.pose);
}

/** A new pose with `jointId` set to `quat` (or cleared when it is identity). */
export function withJointRotation(pose, jointId, quat) {
  const next = sanitizePose(pose);
  const joint = String(jointId || "").trim().toLowerCase();
  if (!SLUG.test(joint)) return next;
  const normalised = normalizeQuaternion(quat);
  if (!normalised || isIdentityQuat(normalised)) delete next.joints[joint];
  else next.joints[joint] = normalised;
  return next;
}

/** Canonical-joint order for a stable editor list / serialisation. */
export function orderedJointIds(joints) {
  return Object.keys(joints || {}).sort((a, b) => {
    const ia = REQUIRED_INDEX.has(a) ? REQUIRED_INDEX.get(a) : 999;
    const ib = REQUIRED_INDEX.has(b) ? REQUIRED_INDEX.get(b) : 999;
    return ia - ib || a.localeCompare(b);
  });
}

/** Sanitise a whole ``object.character`` block (rig_profile + pose; motion is
 * passed through untouched until Phase 7 owns it). */
export function sanitizeCharacterBlock(raw) {
  if (!raw || typeof raw !== "object") return null;
  const profile = raw.rig_profile === HUMANOID_PROFILE ? HUMANOID_PROFILE : null;
  return {
    rig_profile: profile,
    pose: sanitizePose(raw.pose),
    motion: raw.motion ?? null,
  };
}
