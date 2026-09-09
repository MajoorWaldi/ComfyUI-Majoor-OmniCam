import test from "node:test";
import assert from "node:assert/strict";

import {
  CANONICAL_JOINTS,
  OPTIONAL_JOINTS,
  REQUIRED_JOINTS,
  autoMapBones,
  missingRequiredJoints,
  normalizeBoneName,
  rigIsComplete,
  rigStatus,
} from "../../web-src/assets/character/rig-profile.js";

const MIXAMO = [
  "mixamorig:Hips", "mixamorig:Spine", "mixamorig:Spine1", "mixamorig:Spine2",
  "mixamorig:Neck", "mixamorig:Head",
  "mixamorig:LeftShoulder", "mixamorig:LeftArm", "mixamorig:LeftForeArm", "mixamorig:LeftHand",
  "mixamorig:RightShoulder", "mixamorig:RightArm", "mixamorig:RightForeArm", "mixamorig:RightHand",
  "mixamorig:LeftUpLeg", "mixamorig:LeftLeg", "mixamorig:LeftFoot", "mixamorig:LeftToeBase",
  "mixamorig:RightUpLeg", "mixamorig:RightLeg", "mixamorig:RightFoot", "mixamorig:RightToeBase",
];

const GENERIC = [
  "Hips", "Spine", "Chest", "Neck", "Head",
  "Shoulder.L", "UpperArm.L", "LowerArm.L", "Hand.L",
  "Shoulder.R", "UpperArm.R", "LowerArm.R", "Hand.R",
  "UpperLeg.L", "LowerLeg.L", "Foot.L", "Toe.L",
  "UpperLeg.R", "LowerLeg.R", "Foot.R", "Toe.R",
];

test("profile shape matches the spec", () => {
  assert.equal(REQUIRED_JOINTS.length, 22);
  assert.deepEqual([...OPTIONAL_JOINTS], ["eye_l", "eye_r", "hand_tip_l", "hand_tip_r"]);
  assert.equal(CANONICAL_JOINTS.length, 26);
});

test("normalizeBoneName strips the mixamo prefix and separators", () => {
  assert.equal(normalizeBoneName("mixamorig:LeftArm"), "leftarm");
  assert.equal(normalizeBoneName("UpperArm.L"), "upperarml");
  assert.equal(normalizeBoneName(" Spine 1 "), "spine1");
});

test("autoMapBones completes a Mixamo rig with L/R consistency", () => {
  const map = autoMapBones(MIXAMO);
  assert.ok(rigIsComplete(map), missingRequiredJoints(map).join());
  assert.equal(map.upper_arm_l, "mixamorig:LeftArm");
  assert.equal(map.upper_arm_r, "mixamorig:RightArm");
  assert.equal(map.root, map.pelvis); // rootless rig shares hips
});

test("autoMapBones completes a generic .L/.R rig", () => {
  const map = autoMapBones(GENERIC);
  assert.ok(rigIsComplete(map), missingRequiredJoints(map).join());
  assert.equal(map.chest, "Chest");
});

test("a sparse rig is incomplete, missing joints in canonical order", () => {
  const map = autoMapBones(["Hips", "Spine", "Head"]);
  assert.equal(rigIsComplete(map), false);
  const missing = missingRequiredJoints(map);
  assert.ok(missing.includes("hand_r"));
  assert.deepEqual(missing, REQUIRED_JOINTS.filter((j) => missing.includes(j)));
});

test("rigStatus reads a binding or a character block", () => {
  assert.equal(rigStatus(null), "none");
  assert.equal(rigStatus({ bone_map: {} }), "none");
  assert.equal(rigStatus({ bone_map: autoMapBones(["Hips", "Head"]) }), "incomplete");
  assert.equal(rigStatus({ rig: { bone_map: autoMapBones(MIXAMO) } }), "rigged");
});
