import test from "node:test";
import assert from "node:assert/strict";

import {
  IDENTITY_QUAT,
  MAX_POSE_JOINTS,
  evaluatePose,
  isIdentityQuat,
  normalizeQuaternion,
  orderedJointIds,
  sanitizeCharacterBlock,
  sanitizePose,
  withJointRotation,
} from "../../web-src/assets/character/pose-state.js";

test("normalizeQuaternion renormalises a near-unit quat, rejects bad ones", () => {
  const n = normalizeQuaternion([0, 0, 0, 1.5]);
  assert.ok(Math.abs(Math.hypot(...n) - 1) < 1e-9);
  assert.equal(normalizeQuaternion([0, 0, 0]), null);
  assert.equal(normalizeQuaternion([0, 0, 0, 0]), null);
  assert.equal(normalizeQuaternion([0, 0, 0, Number.NaN]), null);
  assert.equal(normalizeQuaternion([9, 0, 0, 0]), null);
});

test("isIdentityQuat", () => {
  assert.equal(isIdentityQuat(IDENTITY_QUAT), true);
  assert.equal(isIdentityQuat([0, 0, 0, -1]), true);
  assert.equal(isIdentityQuat([0, 0.7071, 0, 0.7071]), false);
});

test("sanitizePose drops identity + invalid joints and clamps the slug", () => {
  const pose = sanitizePose({
    preset_id: "Arms Crossed!!",
    root_offset: [1, 2, 3],
    joints: {
      upper_arm_r: [0, 0.2588, 0, 0.9659],
      spine: IDENTITY_QUAT,
      "bad joint": [0, 0, 0, 1],
      neck: [1, 2, 3],
    },
  });
  assert.equal(pose.preset_id, "neutral"); // "Arms Crossed!!" is not a slug
  assert.deepEqual(pose.root_offset, [1, 2, 3]);
  assert.deepEqual(Object.keys(pose.joints), ["upper_arm_r"]);
});

test("sanitizePose enforces the 128-joint ceiling", () => {
  const joints = {};
  for (let i = 0; i < MAX_POSE_JOINTS + 20; i += 1) joints[`j${i}`] = [0, 0, 0.3827, 0.9239];
  assert.equal(Object.keys(sanitizePose({ joints }).joints).length, MAX_POSE_JOINTS);
});

test("evaluatePose layers preset then overrides", () => {
  const preset = { preset_id: "reaching", joints: { upper_arm_r: [0, 0, 0.3827, 0.9239], head: [0, 0.1305, 0, 0.9914] } };
  const overrides = { joints: { upper_arm_r: [0, 0, 0.7071, 0.7071] } };
  const merged = evaluatePose({ preset, overrides });
  assert.equal(merged.preset_id, "reaching");
  assert.deepEqual(merged.joints.upper_arm_r, normalizeQuaternion([0, 0, 0.7071, 0.7071]));
  assert.ok(merged.joints.head); // preset-only joint survives
});

test("withJointRotation sets, clears on identity, ignores a bad joint id", () => {
  let pose = sanitizePose({ joints: {} });
  pose = withJointRotation(pose, "Upper_Arm_R", [0, 0, 0.3827, 0.9239]);
  assert.ok(pose.joints.upper_arm_r);
  pose = withJointRotation(pose, "upper_arm_r", IDENTITY_QUAT);
  assert.equal("upper_arm_r" in pose.joints, false);
  assert.deepEqual(withJointRotation(pose, "bad id", [0, 0, 0.38, 0.92]).joints, {});
});

test("orderedJointIds follows the canonical joint order", () => {
  assert.deepEqual(orderedJointIds({ hand_r: 1, pelvis: 1, head: 1 }), ["pelvis", "head", "hand_r"]);
});

test("sanitizeCharacterBlock keeps rig_profile / pose / motion, nulls a bad profile", () => {
  assert.equal(sanitizeCharacterBlock(null), null);
  const block = sanitizeCharacterBlock({ rig_profile: "some_other", pose: { joints: { head: [0, 0.13, 0, 0.99] } }, motion: { clip_id: "walk" } });
  assert.equal(block.rig_profile, null);
  assert.ok(block.pose.joints.head);
  assert.equal(block.motion.clip_id, "walk");
  assert.equal(block.motion.speed, 1);
  assert.equal(block.motion.loop, true);
});
