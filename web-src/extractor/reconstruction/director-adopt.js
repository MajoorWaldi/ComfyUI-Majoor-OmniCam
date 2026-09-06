// Adoption of reconstructed scene assets and cameras into OmniCam Director.

import { annotatedAssetUrl } from "../../director/core.js";

export function uniqueSceneId(existingIds, baseId) {
  if (!existingIds || !existingIds.has(baseId)) return baseId;
  let suffix = 2;
  while (existingIds.has(`${baseId}_${suffix}`)) {
    suffix += 1;
  }
  return `${baseId}_${suffix}`;
}

export function isDirectorEmpty(directorUi) {
  const state = directorUi?.state;
  if (!state) return true;
  const objectCount = (state.objects || []).length;
  if (objectCount > 0) return false;

  const cameras = state.cameras || [];
  if (cameras.length <= 1) {
    const cam = cameras[0];
    const keyCount = (cam?.keyframes || []).length;
    return keyCount <= 1;
  }
  return false;
}

export function adoptReconstructedScene(directorUi, result, options = {}) {
  const scene = result?.motion_scene || result;
  if (!scene || !Array.isArray(scene.objects)) {
    throw new Error("Reconstruction result has no objects array");
  }

  const mode = options.mode || (isDirectorEmpty(directorUi) ? "replace" : "merge");

  if (mode === "replace") {
    directorUi.checkpoint?.("Adopt reconstructed scene (replace)");
    directorUi.state = JSON.parse(JSON.stringify(scene));

    for (const object of directorUi.state.objects || []) {
      if ((object.type === "glb" || object.type === "model") && object.asset) {
        directorUi.modelUrlsById?.set(object.id, annotatedAssetUrl(object.asset));
      }
    }
  } else {
    directorUi.checkpoint?.("Merge reconstructed environment");
    const existingObjIds = new Set((directorUi.state.objects || []).map((o) => o.id));
    const existingCamIds = new Set((directorUi.state.cameras || []).map((c) => c.id));

    for (const incomingObj of scene.objects) {
      const copy = JSON.parse(JSON.stringify(incomingObj));
      const safeId = uniqueSceneId(existingObjIds, copy.id);
      existingObjIds.add(safeId);
      copy.id = safeId;
      directorUi.state.objects.push(copy);

      if ((copy.type === "glb" || copy.type === "model") && copy.asset) {
        directorUi.modelUrlsById?.set(copy.id, annotatedAssetUrl(copy.asset));
      }
    }

    for (const incomingCam of scene.cameras || []) {
      const camCopy = JSON.parse(JSON.stringify(incomingCam));
      const safeCamId = uniqueSceneId(existingCamIds, camCopy.id);
      existingCamIds.add(safeCamId);
      camCopy.id = safeCamId;
      camCopy.enabled = false; // Disabled secondary camera on merge
      directorUi.state.cameras.push(camCopy);
    }
  }

  directorUi.serialize?.();
  directorUi.refreshObjects?.();
  directorUi.render?.();
  directorUi.setStatus?.("Adopted reconstructed scene into Director");
}
