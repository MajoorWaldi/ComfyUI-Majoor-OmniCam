// OMNICAM_HUMANOID_V1 in the browser: the canonical joint set plus the
// Mixamo / generic-GLTF / OmniCam-native auto-mapper the Rig Mapper runs on a
// freshly loaded model (design spec sections 21-22). A pure mirror of
// omnicam/assets/rig.py -- no DOM, no three.js.

export const OMNICAM_HUMANOID_V1 = "omnicam_humanoid_v1";

export const REQUIRED_JOINTS = Object.freeze([
  "root", "pelvis", "spine", "chest", "neck", "head",
  "clavicle_l", "upper_arm_l", "lower_arm_l", "hand_l",
  "clavicle_r", "upper_arm_r", "lower_arm_r", "hand_r",
  "upper_leg_l", "lower_leg_l", "foot_l", "toe_l",
  "upper_leg_r", "lower_leg_r", "foot_r", "toe_r",
]);

export const OPTIONAL_JOINTS = Object.freeze(["eye_l", "eye_r", "hand_tip_l", "hand_tip_r"]);
export const CANONICAL_JOINTS = Object.freeze([...REQUIRED_JOINTS, ...OPTIONAL_JOINTS]);

const REQUIRED_INDEX = new Map(REQUIRED_JOINTS.map((joint, index) => [joint, index]));
const MIXAMO_PREFIX = /^mixamorig[:_ ]?/i;
const SEPARATORS = /[\s_\-.:|]+/g;

const ALIASES = {
  root: ["root", "reference", "armature", "rootjnt"],
  pelvis: ["hips", "pelvis", "hip", "cog", "root"],
  spine: ["spine", "spine1", "spine01", "abdomen", "lowerback", "back"],
  chest: ["chest", "spine2", "spine3", "spine02", "spine03", "upperchest", "thorax", "ribcage"],
  neck: ["neck", "neck1", "neck01"],
  head: ["head"],
  clavicle_l: ["leftshoulder", "shoulderl", "claviclel", "leftclavicle", "collarl"],
  upper_arm_l: ["leftarm", "arml", "upperarml", "leftupperarm", "leftshoulder2"],
  lower_arm_l: ["leftforearm", "forearml", "lowerarml", "leftlowerarm", "leftelbow"],
  hand_l: ["lefthand", "handl", "lefthandwrist", "wristl"],
  clavicle_r: ["rightshoulder", "shoulderr", "clavicler", "rightclavicle", "collarr"],
  upper_arm_r: ["rightarm", "armr", "upperarmr", "rightupperarm", "rightshoulder2"],
  lower_arm_r: ["rightforearm", "forearmr", "lowerarmr", "rightlowerarm", "rightelbow"],
  hand_r: ["righthand", "handr", "righthandwrist", "wristr"],
  upper_leg_l: ["leftupleg", "leftupperleg", "upperlegl", "leftthigh", "thighl", "legl"],
  lower_leg_l: ["leftleg", "leftlowerleg", "lowerlegl", "leftshin", "shinl", "leftcalf", "calfl", "leftknee"],
  foot_l: ["leftfoot", "footl", "leftankle", "anklel"],
  toe_l: ["lefttoebase", "lefttoe", "toel", "leftball", "balll"],
  upper_leg_r: ["rightupleg", "rightupperleg", "upperlegr", "rightthigh", "thighr", "legr"],
  lower_leg_r: ["rightleg", "rightlowerleg", "lowerlegr", "rightshin", "shinr", "rightcalf", "calfr", "rightknee"],
  foot_r: ["rightfoot", "footr", "rightankle", "ankler"],
  toe_r: ["righttoebase", "righttoe", "toer", "rightball", "ballr"],
  eye_l: ["lefteye", "eyel"],
  eye_r: ["righteye", "eyer"],
  hand_tip_l: ["lefthandtip", "handtipl", "leftmiddle1", "leftfingers"],
  hand_tip_r: ["righthandtip", "handtipr", "rightmiddle1", "rightfingers"],
};

export function normalizeBoneName(name) {
  return String(name || "")
    .trim()
    .replace(MIXAMO_PREFIX, "")
    .replace(SEPARATORS, "")
    .toLowerCase();
}

function sideVariants(normalised) {
  const out = [normalised];
  if (normalised.startsWith("left")) out.push(`${normalised.slice(4)}l`);
  else if (normalised.startsWith("right")) out.push(`${normalised.slice(5)}r`);
  if (normalised.endsWith("left")) out.push(`${normalised.slice(0, -4)}l`);
  else if (normalised.endsWith("right")) out.push(`${normalised.slice(0, -5)}r`);
  return [...new Set(out)];
}

function matchAlias(alias, variantsByName, used, exact) {
  for (const [name, variants] of variantsByName) {
    if (used.has(name)) continue;
    if (exact) {
      if (variants.includes(alias)) return name;
    } else if (variants.some((variant) => variant.includes(alias) || alias.includes(variant))) {
      return name;
    }
  }
  return null;
}

/** Best-effort `{ canonicalJoint: sourceBoneName }` for a list of runtime bones. */
export function autoMapBones(boneNames) {
  const originals = (boneNames || []).map(String).filter((name) => name.trim());
  const variantsByName = originals.map((name) => [name, sideVariants(normalizeBoneName(name))]);
  const used = new Set();
  const mapping = {};

  for (const exact of [true, false]) {
    for (const [canonical, aliases] of Object.entries(ALIASES)) {
      if (mapping[canonical]) continue;
      for (const alias of aliases) {
        const hit = matchAlias(alias, variantsByName, used, exact);
        if (hit != null) {
          mapping[canonical] = hit;
          used.add(hit);
          break;
        }
      }
    }
  }
  if (!mapping.root && mapping.pelvis) mapping.root = mapping.pelvis;
  return mapping;
}

export function missingRequiredJoints(boneMap) {
  const resolved = new Set(
    Object.entries(boneMap || {})
      .filter(([, bone]) => String(bone || "").trim())
      .map(([joint]) => joint),
  );
  return REQUIRED_JOINTS.filter((joint) => !resolved.has(joint));
}

export function rigIsComplete(boneMap) {
  return missingRequiredJoints(boneMap).length === 0;
}

/** "rigged" | "incomplete" | "none" from a rig binding or a character block. */
export function rigStatus(rigOrCharacter) {
  const boneMap =
    rigOrCharacter?.bone_map || rigOrCharacter?.rig?.bone_map || null;
  if (!boneMap || !Object.keys(boneMap).length) return "none";
  return rigIsComplete(boneMap) ? "rigged" : "incomplete";
}

export { REQUIRED_INDEX };
