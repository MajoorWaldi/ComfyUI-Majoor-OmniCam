// ui.characterRuntime -- a transient frontend helper that bridges a scene
// object to the bones of its loaded model (design spec section 29). It is
// never serialised and never handed to the future Agent; the Semantic Director
// API (character.get_rig) is the only mutation/read surface that is.

import { autoMapBones, rigStatus } from "./rig-profile.js";

export function createCharacterRuntime(ui) {
  const boneNames = (objectId) => ui.webgl?.getModelBoneNames?.(objectId) || [];

  return {
    /** Bones + a best-effort auto-map + completeness for one object. */
    getRigInfo(objectId) {
      const object = ui.state?.objects?.find((item) => item.id === objectId) || null;
      const names = boneNames(objectId);
      const autoMap = autoMapBones(names);
      return {
        objectId,
        assetId: object?.asset_id || null,
        isCharacter: object?.asset_kind === "character",
        rigProfile: object?.character?.rig_profile || null,
        boneNames: names,
        autoMap,
        autoMapStatus: rigStatus({ bone_map: autoMap }),
      };
    },

    /** The source bone name a canonical joint maps to, per the supplied map. */
    resolveJoint(objectId, canonicalJoint, boneMap) {
      const bone = (boneMap || {})[canonicalJoint];
      return bone && boneNames(objectId).includes(bone) ? bone : null;
    },

    /** World position of a canonical joint's bone, or null. */
    getJointWorldTransform(objectId, canonicalJoint, boneMap) {
      const bone = this.resolveJoint(objectId, canonicalJoint, boneMap);
      if (!bone) return null;
      return ui.webgl?.resolveModelBone?.(objectId, bone) || null;
    },

    /** Run the auto-mapper on whatever is loaded for this object now. */
    autoMap(objectId) {
      return autoMapBones(boneNames(objectId));
    },
  };
}
