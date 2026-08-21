// Undoable animation reset commands for Director cameras and scene objects.
import { cloneCamera, defaultCamera } from "./director/core.js";
import { t } from "./i18n.js";

function refreshAfterReset(ui) {
  ui.serialize(); ui.refreshObjects(); ui.refreshKeys(); ui.refreshKeyEditor();
  ui.refreshInspector(); ui.drawCurveEditor(); ui.render();
}

export function resetCameraAnimation(ui, id) {
  const track = ui.state.cameras.find((camera) => camera.id === id);
  if (!track) return;
  ui.checkpoint("Reset camera animation"); ui.finishCameraEdit();
  const camera = defaultCamera();
  camera.position = [0, 0, 0]; camera.target = [0, 0, -1];
  track.camera = cloneCamera(camera);
  track.keyframes = [{ frame: 0, camera: cloneCamera(camera), interpolation: "ease" }];
  ui.state.active_camera_id = track.id; ui.state.camera = cloneCamera(camera); ui.state.keyframes = track.keyframes;
  ui.camera = cloneCamera(camera); ui.frame = 0; ui.selectedEntity = "camera"; ui.selectedObjectId = null;
  ui.selectedKeyFrame = 0; ui.editingKeyFrame = null; ui.cameraEditKey = null; ui.cameraEditActive = false;
  ui.cameraPreviewSignature = "";
  refreshAfterReset(ui); ui.refreshCameraSelectors(); ui.setStatus(t(`${track.name} animation reset`));
}

export function resetObjectAnimation(ui, id) {
  const object = ui.state.objects.find((item) => item.id === id);
  if (!object) return;
  ui.checkpoint("Reset object animation");
  object.keyframes = []; object.position = [0, 0, 0]; object.rotation = [0, 0, 0];
  ui.frame = 0; ui.selectedEntity = "object"; ui.selectedObjectId = object.id;
  ui.selectedKeyFrame = null; ui.editingKeyFrame = null;
  refreshAfterReset(ui); ui.setStatus(t(`${object.name || object.type} animation reset`));
}
